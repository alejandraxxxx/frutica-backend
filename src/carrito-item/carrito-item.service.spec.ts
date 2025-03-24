import { Test, TestingModule } from '@nestjs/testing';
import { CarritoItemService } from './carrito-item.service';

describe('CarritoItemService', () => {
  let service: CarritoItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarritoItemService],
    }).compile();

    service = module.get<CarritoItemService>(CarritoItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
