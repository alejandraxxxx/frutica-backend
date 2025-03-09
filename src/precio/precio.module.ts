import { Module } from '@nestjs/common';
import { PrecioService } from './precio.service';
import { PrecioController } from './precio.controller';

@Module({
  controllers: [PrecioController],
  providers: [PrecioService],
})
export class PrecioModule {}
