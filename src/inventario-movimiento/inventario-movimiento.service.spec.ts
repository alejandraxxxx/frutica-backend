import { Test, TestingModule } from '@nestjs/testing';
import { InventarioMovimientoService } from './inventario-movimiento.service';

describe('InventarioMovimientoService', () => {
  let service: InventarioMovimientoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InventarioMovimientoService],
    }).compile();

    service = module.get<InventarioMovimientoService>(InventarioMovimientoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
