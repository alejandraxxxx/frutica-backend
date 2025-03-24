import { Module } from '@nestjs/common';
import { CarritoItemService } from './carrito-item.service';
import { CarritoItemController } from './carrito-item.controller';

@Module({
  controllers: [CarritoItemController],
  providers: [CarritoItemService],
})
export class CarritoItemModule {}
