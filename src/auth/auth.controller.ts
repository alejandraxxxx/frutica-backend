import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

import { CreateUsuarioDto } from 'src/usuarios/dto/create-usuario.dto';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Controller('auth')  // <-- Esto define la ruta base "/auth"
export class AuthController {
  constructor(
  private readonly authService: AuthService,
  private readonly usuariosService: UsuariosService
  ){ }

  @Post('registro')
  async registro(@Body() createUsuarioDto: CreateUsuarioDto) {
      //  Crear usuario en la base de datos
      const usuarioCreado = await this.usuariosService.create(createUsuarioDto);

      //  Llamar al servicio de login para generar los tokens automáticamente
      const authResponse = await this.authService.login(createUsuarioDto.correo_electronico, createUsuarioDto.contrasena);

      //  Retornar la respuesta combinada (Usuario + Tokens)
      return {
          message: 'Registro y login exitosos',
          usuario: usuarioCreado,
          firebaseToken: authResponse.firebaseToken,
          jwtToken: authResponse.jwtToken,
      };
  }
}


