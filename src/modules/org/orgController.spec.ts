import { Test, TestingModule } from '@nestjs/testing';
import { OrgController } from './orgController';
import { OrgService } from './orgService';

describe('OrgController', () => {
  let orgController: OrgController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [OrgController],
      providers: [OrgService]
    }).compile();

    orgController = app.get<OrgController>(OrgController);
  });

  describe('org', () => {
    it('should return xyz', () => {
      expect(orgController.org({ id: 1 })).toBe({});
    });
  });
});
