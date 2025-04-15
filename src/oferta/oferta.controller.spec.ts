import { Test, TestingModule } from '@nestjs/testing';
import { OfertaController } from './oferta.controller';
import { OfertaService } from './oferta.service';

describe('OfertaController', () => {
  let controller: OfertaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OfertaController],
      providers: [OfertaService],
    }).compile();

    controller = module.get<OfertaController>(OfertaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
