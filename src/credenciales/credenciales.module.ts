import { Module } from '@nestjs/common';
import { CredencialesService } from './credenciales.service';
import { CredencialesController } from './credenciales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Credencial } from './entities/credencial.entity';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Credencial, Usuario],), EmailModule],
  controllers: [CredencialesController],
  providers: [CredencialesService],
})
export class CredencialesModule {}