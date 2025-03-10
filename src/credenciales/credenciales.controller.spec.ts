import { Test, TestingModule } from '@nestjs/testing';
import { CredencialesController } from './credenciales.controller';
import { CredencialesService } from './credenciales.service';

describe('CredencialesController', () => {
  let controller: CredencialesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CredencialesController],
      providers: [CredencialesService],
    }).compile();

    controller = module.get<CredencialesController>(CredencialesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
