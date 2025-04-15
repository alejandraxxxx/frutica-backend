import { Test, TestingModule } from '@nestjs/testing';
import { OfertaService } from './oferta.service';

describe('OfertaService', () => {
  let service: OfertaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OfertaService],
    }).compile();

    service = module.get<OfertaService>(OfertaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
