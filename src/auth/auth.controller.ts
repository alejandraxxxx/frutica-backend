import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

import { CreateUsuarioDto } from 'src/usuarios/dto/create-usuario.dto';

@Controller('auth')  // <-- Esto define la ruta base "/auth"
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.authService.register(createUsuarioDto);
  }

  @Post('login')
  async login(@Body() { email, password }: { email: string; password: string }) {
    return this.authService.login(email, password);
  }
}