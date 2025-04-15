import { Test, TestingModule } from '@nestjs/testing';
import { NotificacionesGateway } from './notificaciones.gateway';

describe('NotificacionesGateway', () => {
  let gateway: NotificacionesGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificacionesGateway],
    }).compile();

    gateway = module.get<NotificacionesGateway>(NotificacionesGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
