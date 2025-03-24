import { Test, TestingModule } from '@nestjs/testing';
import { TipoEntregaService } from './tipo-entrega.service';

describe('TipoEntregaService', () => {
  let service: TipoEntregaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipoEntregaService],
    }).compile();

    service = module.get<TipoEntregaService>(TipoEntregaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
