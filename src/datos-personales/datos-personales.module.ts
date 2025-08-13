import { Module } from '@nestjs/common';
import { DatosPersonalesService } from './datos-personales.service';
import { DatosPersonalesController } from './datos-personales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatosPersonales } from './entities/datos-personale.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Module({
  controllers: [DatosPersonalesController],
  providers: [DatosPersonalesService],
  imports: [TypeOrmModule.forFeature([DatosPersonales, Usuario])],
  
  })

export class DatosPersonalesModule {}


