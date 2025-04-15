import { Test, TestingModule } from '@nestjs/testing';
import { ListaDeseosController } from './lista-deseos.controller';
import { ListaDeseosService } from './lista-deseos.service';

describe('ListaDeseosController', () => {
  let controller: ListaDeseosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListaDeseosController],
      providers: [ListaDeseosService],
    }).compile();

    controller = module.get<ListaDeseosController>(ListaDeseosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
