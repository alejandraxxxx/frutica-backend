import { Test, TestingModule } from '@nestjs/testing';
import { CarritoItemController } from './carrito-item.controller';
import { CarritoItemService } from './carrito-item.service';

describe('CarritoItemController', () => {
  let controller: CarritoItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarritoItemController],
      providers: [CarritoItemService],
    }).compile();

    controller = module.get<CarritoItemController>(CarritoItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
