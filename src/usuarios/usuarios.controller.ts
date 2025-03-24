import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }

  @Post('registro')
  async crearUsuario(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  // . Obtener todos los usuarios
  @Get()
  async getAllUsers() {
    return await this.usuariosService.findAll();
  }

  //  Obtener un usuario por ID
  @Get(':id')
  async getUserById(@Param('id') id: number) {
    return await this.usuariosService.findOne(id);
  }

  // Actualizar usuario por ID
  @Put(':id')
  async updateUser(@Param('id') id: number, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return await this.usuariosService.update(id, updateUsuarioDto);
  }

  // Eliminar usuario por ID
  @Delete(':id')
  async deleteUser(@Param('id') id: number) {
    return await this.usuariosService.remove(id);
  }
}
