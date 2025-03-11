import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { JwtModule } from '@nestjs/jwt';
import { Credencial } from 'src/credenciales/entities/credencial.entity';
import { CredencialesModule } from 'src/credenciales/credenciales.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Credencial]),
    CredencialesModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',// Cambiar por una variable de entorno en producción
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}