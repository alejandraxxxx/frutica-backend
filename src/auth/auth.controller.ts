import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

import { CreateUsuarioDto } from 'src/usuarios/dto/create-usuario.dto';

@Controller('auth')  // <-- Esto define la ruta base "/auth"
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body('email') email: string, @Body('password') password: string) {
    return this.authService.login(email, password);
  }

  @Post('hash-password')
  async hashPassword(@Body('password') password: string) {
    return this.authService.hashPassword(password);
  }
}