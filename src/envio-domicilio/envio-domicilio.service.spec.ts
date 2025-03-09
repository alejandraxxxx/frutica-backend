import { Test, TestingModule } from '@nestjs/testing';
import { EnvioDomicilioService } from './envio-domicilio.service';

describe('EnvioDomicilioService', () => {
  let service: EnvioDomicilioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnvioDomicilioService],
    }).compile();

    service = module.get<EnvioDomicilioService>(EnvioDomicilioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
