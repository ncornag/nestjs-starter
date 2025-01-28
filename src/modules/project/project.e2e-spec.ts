import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ClsModule, ClsService } from 'nestjs-cls';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DbService } from 'src/infrastructure/db/dbService';
import { JwtService } from '@nestjs/jwt';
import { ADMIN_CLAIMS } from '../user/userService';
import { HttpCode, HttpStatus } from '@nestjs/common';
import { DbEntity, toEntity } from 'src/infrastructure/db/dbModule';
import { OrgModel } from '../org/orgModel';
import { ProjectState } from './projectModel';
import { ProjectModule } from './projectModule';
import { OrgModule } from '../org/orgModule';
import { PROJECT_DUPLICATE_KEY, PROJECT_NOT_FOUND } from './projectExceptions';
import { ORG_NOT_FOUND } from '../org/orgExceptions';
import { NOT_MODIFIED, VALIDATION_FAILED } from 'src/shared/exceptions';

const clearCollections = async (dbService: DbService) => {
  const collections = await dbService.client.db().listCollections().toArray();
  await Promise.all(
    collections.map(async (col) => {
      const result = await dbService.client.db().collection(col.name).deleteMany({});
    })
  );
};

describe('ProjectController (e2e)', () => {
  // CONFIG
  let app: NestFastifyApplication;
  let dbService: DbService;
  let jwtService: JwtService;
  let adminToken: string;
  let noAdminToken: string;
  const user = { id: '1', claims: ADMIN_CLAIMS };
  const org = {
    _id: '1',
    version: 0,
    ownerId: user.id,
    name: 'Org Name',
    createdAt: new Date().toISOString(),
    projects: []
  };
  const org2 = { ...org, _id: '2', ownerId: '2' };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        LoggerModule.forRoot({
          useExisting: true,
          pinoHttp: { level: process.env.LOG_LEVEL || 'debug' }
        }),
        ClsModule.forRoot({ global: true, middleware: { mount: true } }),
        ProjectModule,
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
    await dbService.client.db().collection<DbEntity<OrgModel>>('orgs').insertOne(org);
    await dbService.client.db().collection<DbEntity<OrgModel>>('orgs').insertOne(org2);

    adminToken = jwtService.sign({ claims: user.claims }, { subject: user.id });
    noAdminToken = jwtService.sign({ claims: ['org:read'] }, { subject: user.id });
  });

  afterAll(async () => {
    await clearCollections(dbService);
    await app.close();
  });

  afterEach(async () => {});

  // TESTS
  const projectData = {
    key: 'myproject',
    orgId: org._id,
    state: ProjectState.ONLINE
  };
  let createdIdData: any;

  describe('create', () => {
    it('should create a project', async () => {
      const result = await app.inject({
        method: 'POST',
        url: '/projects',
        body: projectData,
        headers: { authorization: `Bearer ${adminToken}` }
      });
      expect(result.statusCode).toEqual(HttpStatus.CREATED);
      createdIdData = result.json();
      const projectRecord = await dbService.client
        .db()
        .collection('projects')
        .findOne({ _id: createdIdData.id, ownerId: user.id });
      expect({ ...projectRecord, createdAt: new Date(projectRecord.createdAt) }).toEqual({
        _id: createdIdData.id,
        version: createdIdData.version,
        key: projectData.key,
        orgId: projectData.orgId,
        state: projectData.state,
        ownerId: user.id,
        createdAt: expect.any(Date)
      });
      const orgRecord = await dbService.client
        .db()
        .collection('orgs')
        .findOne({ _id: projectData.orgId as any });
      expect(orgRecord.projects).toEqual([createdIdData.id]);
    });

    it('should not allow the creation without proper privileges', async () => {
      const result = await app.inject({
        method: 'POST',
        url: '/projects',
        body: projectData,
        headers: { authorization: `Bearer ${noAdminToken}` }
      });
      expect(result.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('should not allow creation if the key already exists', async () => {
      const result = await app.inject({
        method: 'POST',
        url: '/projects',
        body: { ...projectData },
        headers: { authorization: `Bearer ${adminToken}` }
      });
      expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST);
      expect(result.json().message).toEqual(PROJECT_DUPLICATE_KEY);
    });

    it('should not allow creation if the Org does not exist', async () => {
      const result = await app.inject({
        method: 'POST',
        url: '/projects',
        body: { ...projectData, key: '123', orgId: '3' },
        headers: { authorization: `Bearer ${adminToken}` }
      });
      expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST);
      expect(result.json().message).toEqual(VALIDATION_FAILED);
      expect(result.json().errors).toEqual([{ message: ORG_NOT_FOUND }]);
    });
  });

  describe('find', () => {
    it('should find a project', async () => {
      const result = await app.inject({
        method: 'GET',
        url: `/projects/${createdIdData.id}`,
        headers: { authorization: `Bearer ${adminToken}` }
      });
      expect(result.statusCode).toEqual(HttpStatus.OK);
      const record = result.json();
      expect({ ...record, createdAt: new Date(record.createdAt) }).toEqual({
        id: createdIdData.id,
        version: createdIdData.version,
        key: projectData.key,
        orgId: projectData.orgId,
        state: projectData.state,
        createdAt: expect.any(Date)
      });
    });

    it('should not allow searches without proper privileges', async () => {
      const result = await app.inject({
        method: 'GET',
        url: `/projects/${createdIdData.id}`,
        headers: { authorization: `Bearer ${noAdminToken}` }
      });
      expect(result.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('should not found nonexistent ids', async () => {
      const result = await app.inject({
        method: 'GET',
        url: `/projects/_${createdIdData.id}`,
        headers: { authorization: `Bearer ${adminToken}` }
      });
      expect(result.statusCode).toEqual(HttpStatus.NOT_FOUND);
      expect(result.json().message).toEqual(PROJECT_NOT_FOUND);
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const result = await app.inject({
        method: 'PATCH',
        url: `/projects/${createdIdData.id}`,
        query: { version: createdIdData.version },
        body: { state: ProjectState.OFFLINE },
        headers: { authorization: `Bearer ${adminToken}` }
      });
      expect(result.statusCode).toEqual(HttpStatus.OK);
      const record = result.json();
      expect({ ...record, createdAt: new Date(record.createdAt) }).toEqual({
        id: createdIdData.id,
        version: createdIdData.version + 1,
        key: projectData.key,
        orgId: projectData.orgId,
        state: ProjectState.OFFLINE,
        createdAt: expect.any(Date)
      });
      createdIdData.version++;
    });

    it('should not allow updates without proper privileges', async () => {
      const result = await app.inject({
        method: 'PATCH',
        url: `/projects/${createdIdData.id}`,
        body: { state: ProjectState.ONLINE },
        headers: { authorization: `Bearer ${noAdminToken}` }
      });
      expect(result.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('should not allow update nonexistent ids', async () => {
      const result = await app.inject({
        method: 'PATCH',
        url: `/projects/_`,
        body: { state: ProjectState.ONLINE },
        headers: { authorization: `Bearer ${adminToken}` }
      });
      expect(result.statusCode).toEqual(HttpStatus.NOT_FOUND);
      expect(result.json().message).toEqual(PROJECT_NOT_FOUND);
    });

    it('should not update if nothing changes', async () => {
      const result = await app.inject({
        method: 'PATCH',
        url: `/projects/${createdIdData.id}`,
        query: { version: createdIdData.version },
        body: { state: ProjectState.OFFLINE },
        headers: { authorization: `Bearer ${adminToken}` }
      });
      expect(result.statusCode).toEqual(HttpStatus.NOT_MODIFIED);
      expect(result.json().message).toEqual(NOT_MODIFIED);
    });
  });

  describe('delete', () => {
    it('should not allow deletes without proper privileges', async () => {
      const result = await app.inject({
        method: 'DELETE',
        url: `/projects/${createdIdData.id}`,
        query: { version: createdIdData.version },
        headers: { authorization: `Bearer ${noAdminToken}` }
      });
      expect(result.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('should delete a project', async () => {
      const result = await app.inject({
        method: 'DELETE',
        url: `/projects/${createdIdData.id}`,
        query: { version: createdIdData.version },
        headers: { authorization: `Bearer ${adminToken}` }
      });
      expect(result.statusCode).toEqual(HttpStatus.NO_CONTENT);
      const projectRecord = await dbService.client
        .db()
        .collection('projects')
        .findOne({ _id: createdIdData.id, version: createdIdData.version });
      expect(projectRecord).toBeNull();
      const orgRecord = await dbService.client
        .db()
        .collection('orgs')
        .findOne({ _id: projectData.orgId as any });
      expect(orgRecord.projects).toEqual([]);
    });
  });
});
