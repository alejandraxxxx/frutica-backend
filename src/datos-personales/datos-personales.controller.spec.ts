import { Test, TestingModule } from '@nestjs/testing';
import { DatosPersonalesController } from './datos-personales.controller';
import { DatosPersonalesService } from './datos-personales.service';

describe('DatosPersonalesController', () => {
  let controller: DatosPersonalesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatosPersonalesController],
      providers: [DatosPersonalesService],
    }).compile();

    controller = module.get<DatosPersonalesController>(DatosPersonalesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
