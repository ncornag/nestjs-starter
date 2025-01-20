import { Module } from '@nestjs/common';
import { Collection, Db, MongoClient } from 'mongodb';
import { red, green, yellow, bold } from 'kolorist';
import { PinoLogger } from 'nestjs-pino';
import { EnvService } from './env/envService';
import { EnvModule } from './env/envModule';
import { ID } from 'src/appModule.interfaces';

export interface DB {
  client: MongoClient;
  getDb: (projectId?: string) => Db;
  getCol: <T>(projectId: string, entity: string, catalogId?: string) => Collection<T>;
  colName: (projectId: string, entity: string, catalogId?: string) => string;
}

export type Entity = {
  id: ID;
  [key: string]: any;
};

export type DbEntity<T extends Entity> = Omit<T, 'id'> & {
  _id?: T['id'];
};

export const toEntity = <T extends Entity>(dbEntity: DbEntity<T>): T | undefined => {
  if (dbEntity == undefined) return undefined;
  const { _id, ...remainder } = dbEntity;
  return {
    id: _id,
    ...remainder
  } as T;
};

export const toDbEntity = <T extends Entity>({ id, ...remainder }): DbEntity<T> =>
  Object.assign(remainder, id && { _id: id }) as DbEntity<T>;

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: 'DB',
      inject: [EnvService, PinoLogger],
      useFactory: async (config: EnvService, logger): Promise<DB> => {
        const dbs = new Map<string, Db>();
        const dbOut = bold(yellow('→')) + yellow('DB ');
        const dbIn = bold(yellow('←')) + yellow('DB ');
        const ignoredCommandsForLogging = [
          'createIndexes',
          'listCollections',
          'currentOp',
          'drop'
        ];
        // Iterceptor targets
        const createTargets: string[] = ['insertOne'];
        const updateTargets: string[] = ['updateOne', 'updateMany', 'bulkWrite'];
        // Interceptors NegativeFilter
        const negativeFilterInterceptor: Record<string, boolean> = {
          _Events: true
        };

        try {
          // Connect
          const url = config.get('MONGO_URL');
          const client = await MongoClient.connect(url, {
            monitorCommands: true
          });

          const getDb = (dbId: string): Db => {
            if (!dbId) return client.db();
            const db = dbs.get(dbId);
            if (db) return db;
            const newDb = client.db(dbId);
            dbs.set(dbId, newDb);
            return newDb;
          };

          const getCol = <T>(
            projectId: string,
            entity: string,
            catalogId?: string
          ): Collection<T> =>
            getDb(projectId).collection<T>(colName(projectId, entity, catalogId));

          const colName = (projectId: string, entity: string, catalogId?: string) =>
            `${entity}${catalogId ? `_${catalogId}` : ''}`;

          // Loggers
          client.on('commandStarted', (event) => {
            if (ignoredCommandsForLogging.includes(event.commandName)) return;
            if (logger.level === 'debug')
              logger.debug(
                `${dbOut} ${event.requestId} ${green(JSON.stringify(event.command))}`
              );
          });
          client.on('commandSucceeded', (event) => {
            if (ignoredCommandsForLogging.includes(event.commandName)) return;
            if (logger.level === 'debug')
              logger.debug(`${dbIn} ${event.requestId} ${green(JSON.stringify(event.reply))}`);
          });
          client.on('commandFailed', (event) =>
            logger.warn(`${dbIn} ${event.requestId} ${red(JSON.stringify(event, null, 2))}`)
          );

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
          const updateOne = function (
            this: any,
            collectionName: string,
            filter: any,
            update: any
          ) {
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
                      updateOne: updateOne(
                        collectionName,
                        a.updateOne.filter,
                        a.updateOne.update
                      )
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
          createTargets.forEach((m: string) =>
            createInterceptor(Collection, (Collection.prototype as any)[m], m)
          );
          updateTargets.forEach((m: string) =>
            updateInterceptor(Collection, (Collection.prototype as any)[m], m)
          );

          logger.info(`${yellow('MongoDB')} ${green('starting in')} [${url}]`);
          return { client, getDb, getCol, colName };
        } catch (e) {
          throw e;
        }
      }
    }
  ],
  exports: ['DB']
})
export class DatabaseModule {}
