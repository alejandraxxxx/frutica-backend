import { Module } from '@nestjs/common';
import { CredencialesService } from './credenciales.service';
import { CredencialesController } from './credenciales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Module({
  controllers: [CredencialesController],
  providers: [CredencialesService],
  imports: [TypeOrmModule.forFeature([Usuario])],
})
export class CredencialesModule {}