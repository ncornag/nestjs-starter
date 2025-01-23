import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  OnModuleInit
} from '@nestjs/common';
import { EnvService } from 'src/infrastructure/env/envService';
import { PinoLogger } from 'nestjs-pino';
import { green, yellow, bold } from 'kolorist';
import { Collection, Db, MongoClient } from 'mongodb';
import { ID } from 'src/appModule.interfaces';
import { IDbService } from './dbService.interface';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

@Injectable()
export class DbService implements OnModuleInit, OnApplicationShutdown {
  public client: MongoClient;
  private dbs = new Map<string, Db>();
  private dbOut = bold(yellow('→')) + yellow('DB:');
  private dbIn = bold(yellow('←')) + yellow('DB:');
  private ignoredCommandsForLogging = ['createIndexes', 'listCollections', 'currentOp', 'drop'];
  // Iterceptor targets
  private createTargets: string[] = ['insertOne'];
  private updateTargets: string[] = ['updateOne', 'updateMany', 'bulkWrite'];
  // Interceptors NegativeFilter
  private negativeFilterInterceptor: Record<string, boolean> = {
    _Events: true
  };

  constructor(
    private readonly config: EnvService,
    private readonly logger: PinoLogger
  ) {}

  async start(): Promise<IDbService> {
    // Connect
    const url = this.config.get('MONGO_URL');
    this.client = await MongoClient.connect(url, {
      monitorCommands: true
    });

    // Loggers
    this.client.on('commandStarted', (event) => {
      if (this.ignoredCommandsForLogging.includes(event.commandName)) return;
      this.logger.debug('%s %o', this.dbOut, event.command);
    });
    this.client.on('commandSucceeded', (event) => {
      if (this.ignoredCommandsForLogging.includes(event.commandName)) return;
      this.logger.debug('%s %o', this.dbIn, event.reply);
    });
    this.client.on('commandFailed', (event) => this.logger.warn('%s %o', this.dbIn, event));

    const negativeFilterInterceptor = this.negativeFilterInterceptor;

    // Create Interceptor -- Create timestamp / version
    const createOne = function (collectionName: string, data: any) {
      if (negativeFilterInterceptor[collectionName]) return data;
      // Add timestamp
      data.createdAt = new Date().toISOString();
      // Add version
      data.version = 0;
      return data;
    };
    const createInterceptor = function (obj: any, replace, name: string) {
      obj.prototype[name] = function (...args: any[]) {
        createOne((this as Collection).collectionName, args[0]);
        return replace.apply(this, args as any);
      };
    };

    // Update Interceptor -- Update timestamp / version
    const updateOne = function (this: any, collectionName: string, filter: any, update: any) {
      if (negativeFilterInterceptor[collectionName]) return { filter, update };
      const set = update.$set || {};
      const inc = update.$inc || {};
      // Version management
      const setVersion = set.version || 0;
      if (filter.version === undefined) {
        filter.version = setVersion;
      }
      delete set.version;
      // Update Timestamp
      set.lastModifiedAt = new Date().toISOString(); // TODO use server date?
      update.$set = set;
      // Update Version
      inc.version = 1;
      update.$inc = inc;
      return { filter, update };
    };
    const updateInterceptor = function (obj: any, replace, name: string) {
      obj.prototype[name] = function (...args: any[]) {
        const collectionName = (this as Collection).collectionName;
        if (Array.isArray(args[0])) {
          args[0] = args[0].map((a) => {
            if (a.updateOne) {
              return {
                updateOne: updateOne(collectionName, a.updateOne.filter, a.updateOne.update)
              };
            } else if (a.insertOne) {
              return {
                insertOne: {
                  document: createOne(collectionName, a.insertOne.document)
                }
              };
            }
            return a;
          });
        } else {
          updateOne(collectionName, args[0], args[1]);
        }
        return replace.apply(this, args as any);
      };
    };

    // Intercept
    this.createTargets.forEach((m: string) =>
      createInterceptor(Collection, (Collection.prototype as any)[m], m)
    );
    this.updateTargets.forEach((m: string) =>
      updateInterceptor(Collection, (Collection.prototype as any)[m], m)
    );

    this.logger.info(`${yellow('MongoDB')} ${green('starting in')} [${url}]`);

    return this;
  }

  public async onModuleInit(): Promise<IDbService> {
    return await this.start();
  }

  async onApplicationShutdown(signal: string) {
    await this.client.close();
  }

  public colName = (projectId: string, entity: string, catalogId?: string) =>
    `${entity}${catalogId ? `_${catalogId}` : ''}`;

  public getDb = (dbId?: string): Db => {
    if (!dbId) return this.client.db();
    const db = this.dbs.get(dbId);
    if (db) return db;
    const newDb = this.client.db(dbId);
    this.dbs.set(dbId, newDb);
    return newDb;
  };

  public getCol = <T>(projectId: string, entity: string, catalogId?: string): Collection<T> =>
    this.getDb(projectId).collection<T>(this.colName(projectId, entity, catalogId));
}
