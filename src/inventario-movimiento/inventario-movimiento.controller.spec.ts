import { Test, TestingModule } from '@nestjs/testing';
import { InventarioMovimientoController } from './inventario-movimiento.controller';
import { InventarioMovimientoService } from './inventario-movimiento.service';

describe('InventarioMovimientoController', () => {
  let controller: InventarioMovimientoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventarioMovimientoController],
      providers: [InventarioMovimientoService],
    }).compile();

    controller = module.get<InventarioMovimientoController>(InventarioMovimientoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
