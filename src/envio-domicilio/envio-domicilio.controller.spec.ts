import { Test, TestingModule } from '@nestjs/testing';
import { EnvioDomicilioController } from './envio-domicilio.controller';
import { EnvioDomicilioService } from './envio-domicilio.service';

describe('EnvioDomicilioController', () => {
  let controller: EnvioDomicilioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnvioDomicilioController],
      providers: [EnvioDomicilioService],
    }).compile();

    controller = module.get<EnvioDomicilioController>(EnvioDomicilioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
