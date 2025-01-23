import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ClsModule } from 'nestjs-cls';
import { DatabaseModule } from 'src/infrastructure/db/dbModule';
import { AuthModule } from 'src/modules/auth/authModule';
import { OrgModule } from 'src/modules/org/orgModule';
import { ProjectModule } from 'src/modules/project/projectModule';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { JwtAuthGuard } from './jwtAuthGuard';
import { ExecutionContext } from '@nestjs/common';
import { DbService } from 'src/infrastructure/db/dbService';

const HEADERS = {
  'content-type': 'application/json',
  authorization:
    'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJlY29tbS1zdGFydGVyIiwiYXVkIjoiZWNvbW0tYXV0aCIsInN1YiI6IjFGOHdLd2lXQWFCWmlkUFMtQ19YMiIsImNsYWltcyI6WyJyb2xlOmFkbWluIl0sImlhdCI6MTczNzM2ODc1OCwiZXhwIjoxNzY4OTA0NzU4fQ.OREHmU365umuK5FMxGViK7WO8vdHzxAnuolFHUrVwt2MnA27hXW-W9gpiXrqk3IiWE5b7NA_lbacZv6nVBm5QIV1f4ljY4ZgeOB-dvGpryKDp8HeypU8PAiLXExdiqeHwqEj4eZu9jYHSppvwrm8kc7T55jhGUCbaZOMS0ZVUUxZXCP4ro8piQ9pq2TenC4HzoR_Y8fZskcSBHV1Bv9h6zOMEmrQylTOpS7SlrO1BUbSPdl9FU9IJpCLWhRkoaqo8kB8ApYYBV3CeSc5-2ERRwM3u5BXwlV_3lqwiyK5g9kYoBv5EjYJInKG4qv0lV3MElPbHwv2-4DXS21K9fB9uGOAIOVoDJX51QTSrdHSYVXGZpjKNJZL7XG337R_GlUU7xRY9Sr3Mn8hae_W0xHJ0dQP6abR7CQhh7r2xHL6zrRtxCTLVfqH9iVkSJySdPcYBSahGTQrrWjaPRKlxSyqsCEbBC_Od_7KB-Nmf16BGFyCCEkfee4LFg0EsLdFoRy_'
};

const clearCollections = async (dbService: DbService) => {
  const collections = await dbService.client.db().listCollections().toArray();
  collections.forEach(async (col) => {
    await dbService.client.db().collection(col.name).deleteMany({});
  });
};

describe('AuthController (e2e)', () => {
  let app: NestFastifyApplication;
  let dbService: DbService;

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
        AuthModule,
        OrgModule,
        ProjectModule
      ],
      exports: [DatabaseModule]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: 1 };
          return true;
        }
      })
      // .overrideProvider(CatsService)
      // .useValue(catsService).compile();
      .compile();

    app = module.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({
        logger: false
      })
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    dbService = app.get<DbService>('DbService');
    await clearCollections(dbService);
  });

  afterAll(async () => {
    await clearCollections(dbService);
    await app.close();
  });

  afterEach(async () => {});

  describe('signUp', () => {
    // jest.spyOn(catsService, 'findAll').mockImplementation(() => result);
    let userData = {
      username: 'test@gmail.com',
      password: 'changeme'
    };
    let createdIdData: any;

    it(
      'should create a user',
      async () => {
        return app
          .inject({
            method: 'POST',
            url: '/auth/signup',
            body: userData
          })
          .then((result) => {
            expect(result.statusCode).toEqual(201);
            createdIdData = result.json();
          });
      },
      1000 * 5
    );

    it(
      'should return error if username already exists',
      async () => {
        return app
          .inject({
            method: 'POST',
            url: '/auth/signup',
            body: userData
          })
          .then((result) => {
            expect(result.statusCode).toEqual(400);
          });
      },
      1000 * 5
    );

    it(
      'should be in the database',
      async () => {
        console.log('createdIdData', createdIdData);
        const record = await dbService.client
          .db()
          .collection('users')
          .findOne({ _id: createdIdData.id });
        expect({ _id: record._id, version: record.version, username: record.username }).toEqual(
          {
            _id: createdIdData.id,
            version: createdIdData.version,
            username: userData.username
          }
        );
      },
      1000 * 5
    );
  });
});
