import { Module } from '@nestjs/common';
import { CredencialesService } from './credenciales.service';
import { CredencialesController } from './credenciales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Credencial } from './entities/credencial.entity';

@Module({
  controllers: [CredencialesController],
  providers: [CredencialesService],
  imports: [TypeOrmModule.forFeature([Credencial])],
  exports: [TypeOrmModule],
})
export class CredencialesModule {}