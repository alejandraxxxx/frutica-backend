import { Test, TestingModule } from '@nestjs/testing';
import { ListaDeseosService } from './lista-deseos.service';

describe('ListaDeseosService', () => {
  let service: ListaDeseosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListaDeseosService],
    }).compile();

    service = module.get<ListaDeseosService>(ListaDeseosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
