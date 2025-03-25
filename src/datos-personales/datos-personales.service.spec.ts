import { Test, TestingModule } from '@nestjs/testing';
import { DatosPersonalesService } from './datos-personales.service';

describe('DatosPersonalesService', () => {
  let service: DatosPersonalesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatosPersonalesService],
    }).compile();

    service = module.get<DatosPersonalesService>(DatosPersonalesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
