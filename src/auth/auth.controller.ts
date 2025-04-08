import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUsuarioDto } from 'src/usuarios/dto/create-usuario.dto';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { UpdateUsuarioDto } from 'src/usuarios/dto/update-usuario.dto';

@Controller('auth')  // <-- Ruta base "/auth"
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usuariosService: UsuariosService
  ) { }



  // 🔹 Registro de usuario con email y contraseña
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


  //  Endpoint de Login Normal (Email & Contraseña)
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  
  // Login con Google
  @Post('google-login')
  async googleLogin(@Body() userData: CreateUsuarioDto) {
    return await this.authService.handleGoogleLogin(userData);
  }
  
 
}