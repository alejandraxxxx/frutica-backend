import { Module } from '@nestjs/common';
import { CredencialesService } from './credenciales.service';
import { CredencialesController } from './credenciales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Credencial } from './entities/credencial.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Credencial, Usuario])
  ],
  controllers: [CredencialesController],
  providers: [CredencialesService],
})
export class CredencialesModule {}