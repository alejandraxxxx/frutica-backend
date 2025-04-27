import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UserRole } from './entities/usuario.entity';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }

  @Post('registro')
  async crearUsuario(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  // . Obtener todos los usuarios
  @Get()
   @Roles(UserRole.ADMIN)
  async getAllUsers() {
    return await this.usuariosService.findAll();
  }

  @Get('mi-perfil')
  async obtenerMiPerfil(@Req() req: any) {
    const usuarioId = req.user.id;
    const usuario = await this.usuariosService.findById(usuarioId);

    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    return {
      nombre: usuario.nombre,
      apellido_paterno: usuario.apellido_paterno,
      apellido_materno: usuario.apellido_materno,
      telefono: usuario.telefono,
      sexo: usuario.sexo,
    };
  }
  
  //  Obtener un usuario por ID
  @Get(':id')
   @Roles(UserRole.ADMIN)
  async getUserById(@Param('id') id: number) {
    return await this.usuariosService.findOne(id);
  }

  @Patch('mi-perfil')
@UseGuards(JwtAuthGuard)
async actualizarMiPerfil(@Req() req: any, @Body() body: any) {
  const usuarioId = req.user.id;
  return this.usuariosService.update(usuarioId, body);
}

  // Actualizar usuario por ID
  @Put(':id')
   @Roles(UserRole.ADMIN)
  async updateUser(@Param('id') id: number, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return await this.usuariosService.update(id, updateUsuarioDto);
  }

  // Eliminar usuario por ID
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async deleteUser(@Param('id') id: number) {
    return await this.usuariosService.remove(id);
  }
}
