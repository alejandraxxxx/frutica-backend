import { Module } from '@nestjs/common';
import { DatosPersonalesService } from './datos-personales.service';
import { DatosPersonalesController } from './datos-personales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatosPersonales } from './entities/datos-personale.entity';

@Module({
  controllers: [DatosPersonalesController],
  providers: [DatosPersonalesService],
  imports: [TypeOrmModule.forFeature([DatosPersonales])],
    exports: [TypeOrmModule],
  })

export class DatosPersonalesModule {}

