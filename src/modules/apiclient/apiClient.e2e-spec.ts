import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ClsModule } from 'nestjs-cls';
import { DatabaseModule, DbEntity } from 'src/infrastructure/db/dbModule';
import { AuthModule } from 'src/modules/auth/authModule';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DbService } from 'src/infrastructure/db/dbService';
import { JwtService } from '@nestjs/jwt';
import { ADMIN_CLAIMS } from '../user/userService';
import { HttpStatus } from '@nestjs/common';
import { ApiClientModule } from './apiClientModule';
import { ProjectModule } from '../project/projectModule';
import { UserModule } from '../user/userModule';
import { OrgModule } from '../org/orgModule';
import { OrgModel } from '../org/orgModel';
import { ProjectState } from '../project/projectModel';
import { ID, IDWithVersion } from 'src/appModule.interfaces';

const clearCollections = async (dbService: DbService) => {
  const collections = await dbService.client.db().listCollections().toArray();
  await Promise.all(
    collections.map(async (col) => {
      const result = await dbService.client.db().collection(col.name).deleteMany({});
    })
  );
};

describe('AuthController (e2e)', () => {
  // CONFIG
  let app: NestFastifyApplication;
  let dbService: DbService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let token: string;
  let token_iss: string;
  let token_aud: string;
  let token_exp: number;

  const userData = {
    username: 'test@gmail.com',
    password: 'changeme'
  } as any;
  let userIdData;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        LoggerModule.forRoot({
          useExisting: true,
          pinoHttp: { level: process.env.LOG_LEVEL || 'warn' }
        }),
        ClsModule.forRoot({ global: true, middleware: { mount: true } }),
        DatabaseModule,
        AuthModule
      ],
      exports: [DatabaseModule]
    }).compile();

    app = module.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({
        logger: false
      })
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    configService = app.get<ConfigService>(ConfigService);
    jwtService = app.get<JwtService>(JwtService);
    dbService = app.get<DbService>('DbService');

    await clearCollections(dbService);

    token_iss = configService.get<string>('TOKEN_ISS');
    token_aud = configService.get<string>('TOKEN_AUD');
    token_exp = configService.get<number>('TOKEN_EXP');

    // Create user
    const createResult = await app.inject({
      method: 'POST',
      url: '/auth/signup',
      body: userData
    });
    expect(createResult.statusCode).toEqual(HttpStatus.CREATED);
    userIdData = createResult.json();

    // Login user
    const loginResult = await app.inject({
      method: 'POST',
      url: '/auth/login',
      body: userData
    });
    expect(loginResult.statusCode).toEqual(HttpStatus.OK);
    token = loginResult.json().access_token;
  });

  afterAll(async () => {
    await clearCollections(dbService);
    await app.close();
  });

  afterEach(async () => {});

  // TESTS
  const orgData = {
    version: 0,
    name: 'Org Name',
    createdAt: new Date().toISOString(),
    projects: []
  } as any;
  const projectData = {
    key: 'myproject',
    state: 'online'
  } as any;
  let orgIdData: any;
  let projectIdData: any;
  let createdApiClient: any;

  describe('create ApiClient', () => {
    it('should create an apiClient', async () => {
      orgData.ownerId = userIdData.id;
      orgIdData = await dbService.client.db().collection('orgs').insertOne(orgData);
      projectData.orgId = orgIdData.insertedId;
      projectData.ownerId = userIdData.id;
      projectIdData = await dbService.client.db().collection('projects').insertOne(projectData);
      const apiClientData = { name: 'test', scopes: [] };
      const result = await app.inject({
        method: 'POST',
        url: `/${projectData.key}/api-clients`,
        headers: { authorization: `Bearer ${token}` },
        body: apiClientData
      });
      expect(result.statusCode).toEqual(HttpStatus.CREATED);
      createdApiClient = result.json();
      expect(createdApiClient).toEqual({
        name: apiClientData.name,
        scopes: [`project:${projectData.key}`],
        clientId: expect.any(String),
        clientSecret: expect.any(String),
        isActive: true
      });

      const record = await dbService.client
        .db()
        .collection('apiClients')
        .findOne({ name: createdApiClient.name });

      expect({ ...record, createdAt: new Date(record.createdAt) }).toEqual({
        ...createdApiClient,
        _id: expect.any(String),
        version: 0,
        clientSecret: expect.any(String),
        createdAt: expect.any(Date)
      });
    });
  });
});
