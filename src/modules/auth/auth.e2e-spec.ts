import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ClsModule } from 'nestjs-cls';
import { DatabaseModule } from 'src/infrastructure/db/dbModule';
import { AuthModule } from 'src/modules/auth/authModule';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DbService } from 'src/infrastructure/db/dbService';
import { JwtService } from '@nestjs/jwt';
import { ADMIN_CLAIMS } from '../user/userService';
import { HttpStatus } from '@nestjs/common';

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
  let token_iss: string;
  let token_aud: string;
  let token_exp: number;

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
  });

  afterAll(async () => {
    await clearCollections(dbService);
    await app.close();
  });

  afterEach(async () => {});

  // TESTS
  const userData = {
    username: 'test@gmail.com',
    password: 'changeme'
  };
  let createdIdData: any;

  describe('signUp', () => {
    it('should create a user', async () => {
      const result = await app.inject({
        method: 'POST',
        url: '/auth/signup',
        body: userData
      });
      expect(result.statusCode).toEqual(HttpStatus.CREATED);
      createdIdData = result.json();
    });

    it('should return error if username already exists', async () => {
      const result = await app.inject({
        method: 'POST',
        url: '/auth/signup',
        body: userData
      });
      expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST);
    });

    it('should be in the database', async () => {
      const record = await dbService.client
        .db()
        .collection('users')
        .findOne({ _id: createdIdData.id });
      expect({
        id: record._id,
        version: record.version,
        username: record.username
      }).toEqual({
        id: createdIdData.id,
        version: createdIdData.version,
        username: userData.username
      });
    });
  });

  describe('login', () => {
    let token: string;
    it('should login a user', async () => {
      const result = await app.inject({
        method: 'POST',
        url: '/auth/login',
        body: userData
      });
      expect(result.statusCode).toEqual(HttpStatus.OK);
      token = result.json().access_token;
      const decodedToken = jwtService.decode(token);
      expect(decodedToken).toEqual({
        sub: createdIdData.id,
        iss: token_iss,
        aud: token_aud,
        claims: ADMIN_CLAIMS,
        iat: expect.any(Number),
        exp: decodedToken.iat + token_exp
      });
    });

    it('should return error on incorrect password', async () => {
      const result = await app.inject({
        method: 'POST',
        url: '/auth/login',
        body: { ...userData, password: '' }
      });
      expect(result.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('should be able to access the profile', async () => {
      const result = await app.inject({
        method: 'GET',
        url: '/auth/profile',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(result.statusCode).toEqual(HttpStatus.OK);
      expect(result.json()).toEqual({
        id: createdIdData.id,
        claims: ADMIN_CLAIMS
      });
    });
  });
});
