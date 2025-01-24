import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ClsModule, ClsService } from 'nestjs-cls';
import { OrgModule } from 'src/modules/org/orgModule';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DbService } from 'src/infrastructure/db/dbService';
import { JwtService } from '@nestjs/jwt';
import { ADMIN_CLAIMS } from '../user/userService';
import { HttpCode, HttpStatus } from '@nestjs/common';

const clearCollections = async (dbService: DbService) => {
  const collections = await dbService.client.db().listCollections().toArray();
  collections.forEach(async (col) => {
    await dbService.client.db().collection(col.name).deleteMany({});
  });
};

describe('OrgController (e2e)', () => {
  // CONFIG
  let app: NestFastifyApplication;
  let dbService: DbService;
  let jwtService: JwtService;
  let adminToken: string;
  let noAdminToken: string;
  const user = { id: '1', claims: ADMIN_CLAIMS };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        LoggerModule.forRoot({
          useExisting: true,
          pinoHttp: { level: process.env.LOG_LEVEL || 'warn' }
        }),
        ClsModule.forRoot({ global: true, middleware: { mount: true } }),
        OrgModule
      ]
    }).compile();

    app = module.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({
        logger: false
      })
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    jwtService = app.get<JwtService>(JwtService);
    dbService = app.get<DbService>('DbService');

    await clearCollections(dbService);

    adminToken = jwtService.sign({ claims: user.claims }, { subject: user.id });
    noAdminToken = jwtService.sign({ claims: ['org:read'] }, { subject: user.id });
  });

  afterAll(async () => {
    await clearCollections(dbService);
    await app.close();
  });

  afterEach(async () => {});

  // TESTS
  const orgData = {
    name: 'Org Name'
  };
  let createdIdData: any;

  describe('create', () => {
    it('should create an organization', async () => {
      const result = await app.inject({
        method: 'POST',
        url: '/orgs',
        body: orgData,
        headers: { authorization: `Bearer ${adminToken}` }
      });
      expect(result.statusCode).toEqual(HttpStatus.CREATED);
      createdIdData = result.json();
    });

    it('should be in the database', async () => {
      const record = await dbService.client
        .db()
        .collection('orgs')
        .findOne({ _id: createdIdData.id, ownerId: user.id });
      expect({ ...record, createdAt: new Date(record.createdAt) }).toEqual({
        _id: createdIdData.id,
        version: createdIdData.version,
        name: orgData.name,
        ownerId: user.id,
        createdAt: expect.any(Date)
      });
    });

    it('should not allow the creation without proper privileges', async () => {
      const result = await app.inject({
        method: 'POST',
        url: '/orgs',
        body: orgData,
        headers: { authorization: `Bearer ${noAdminToken}` }
      });
      expect(result.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('find', () => {
    it('should find an organization', async () => {
      const result = await app.inject({
        method: 'GET',
        url: `/orgs/${createdIdData.id}`,
        headers: { authorization: `Bearer ${adminToken}` }
      });
      expect(result.statusCode).toEqual(HttpStatus.OK);
      const record = result.json();
      expect({ ...record, createdAt: new Date(record.createdAt) }).toEqual({
        id: createdIdData.id,
        version: createdIdData.version,
        name: orgData.name,
        ownerId: user.id,
        createdAt: expect.any(Date),
        projects: []
      });
    });

    it('should not allow searches without proper privileges', async () => {
      const result = await app.inject({
        method: 'GET',
        url: `/orgs/${createdIdData.id}`,
        headers: { authorization: `Bearer ${noAdminToken}` }
      });
      expect(result.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('should not found nonexistent ids', async () => {
      const result = await app.inject({
        method: 'GET',
        url: `/orgs/_${createdIdData.id}`,
        headers: { authorization: `Bearer ${adminToken}` }
      });
      expect(result.statusCode).toEqual(HttpStatus.NOT_FOUND);
    });
  });

  describe('update', () => {
    it('should update an organization', async () => {
      const result = await app.inject({
        method: 'PATCH',
        url: `/orgs/${createdIdData.id}`,
        query: { version: createdIdData.version },
        body: { name: 'New Name' },
        headers: { authorization: `Bearer ${adminToken}` }
      });
      expect(result.statusCode).toEqual(HttpStatus.OK);
      const record = result.json();
      expect({ ...record, createdAt: new Date(record.createdAt) }).toEqual({
        id: createdIdData.id,
        version: createdIdData.version + 1,
        name: 'New Name',
        ownerId: user.id,
        createdAt: expect.any(Date),
        projects: []
      });
      createdIdData.version++;
    });

    it('should not allow updates without proper privileges', async () => {
      const result = await app.inject({
        method: 'PATCH',
        url: `/orgs/${createdIdData.id}`,
        body: { name: 'New Name' },
        headers: { authorization: `Bearer ${noAdminToken}` }
      });
      expect(result.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('should not allow update nonexistent ids', async () => {
      const result = await app.inject({
        method: 'PATCH',
        url: `/orgs/_`,
        body: { name: 'New Name' },
        headers: { authorization: `Bearer ${adminToken}` }
      });
      expect(result.statusCode).toEqual(HttpStatus.NOT_FOUND);
    });

    it('should not update if nothing changes', async () => {
      const result = await app.inject({
        method: 'PATCH',
        url: `/orgs/${createdIdData.id}`,
        query: { version: createdIdData.version },
        body: { name: 'New Name' },
        headers: { authorization: `Bearer ${adminToken}` }
      });
      expect(result.statusCode).toEqual(HttpStatus.NOT_MODIFIED);
    });
  });

  describe('delete', () => {
    it('should not delete an organization with projects', async () => {
      await dbService.client
        .db()
        .collection('orgs')
        .updateOne(
          { _id: createdIdData.id, ownerId: user.id, version: createdIdData.version },
          { $set: { projects: ['1'] } }
        );
      createdIdData.version++;
      const result = await app.inject({
        method: 'DELETE',
        url: `/orgs/${createdIdData.id}`,
        query: { version: createdIdData.version },
        headers: { authorization: `Bearer ${adminToken}` }
      });
      expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST);
      await dbService.client
        .db()
        .collection('orgs')
        .updateOne(
          { _id: createdIdData.id, ownerId: user.id, version: createdIdData.version },
          { $set: { projects: [] } }
        );
      createdIdData.version++;
    });

    it('should not allow deletes without proper privileges', async () => {
      const result = await app.inject({
        method: 'DELETE',
        url: `/orgs/${createdIdData.id}`,
        query: { version: createdIdData.version },
        headers: { authorization: `Bearer ${noAdminToken}` }
      });
      expect(result.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('should delete an organization', async () => {
      const result = await app.inject({
        method: 'DELETE',
        url: `/orgs/${createdIdData.id}`,
        query: { version: createdIdData.version },
        headers: { authorization: `Bearer ${adminToken}` }
      });
      expect(result.statusCode).toEqual(HttpStatus.NO_CONTENT);
    });

    it('should not be in the database', async () => {
      const record = await dbService.client
        .db()
        .collection('orgs')
        .findOne({ _id: createdIdData.id, ownerId: user.id, version: createdIdData.version });
      expect(record).toBeNull();
    });
  });
});
