import { Module } from '@nestjs/common';
import { PrecioService } from './precio.service';
import { PrecioController } from './precio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Precio } from './entities/precio.entity';

@Module({
  controllers: [PrecioController],
  providers: [PrecioService],
  imports: [TypeOrmModule.forFeature([Precio])],
  exports: [TypeOrmModule]
})
export class PrecioModule {}
