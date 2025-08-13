import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, NotFoundException, BadRequestException } from '@nestjs/common';
import { CredencialesService } from './credenciales.service';
import { CreateCredencialeDto } from './dto/create-credenciale.dto';
import { UpdateCredencialeDto } from './dto/update-credenciale.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('credenciales')
export class CredencialesController {
  credencialRepository: any;
  constructor(private readonly credencialesService: CredencialesService) { }

  @Post()
  create(@Body() createCredencialeDto: CreateCredencialeDto) {
    return this.credencialesService.create(createCredencialeDto);
  }

  @Get()
  findAll() {
    return this.credencialesService.findAll();
  }

  @Get('mi-perfil')
  async obtenerMiPerfil(@Req() req: any) {
    const usuarioId = req.user.id;
    const credencial = await this.credencialesService.findByUsuarioId(usuarioId);

    if (!credencial) throw new NotFoundException('Credencial no encontrada');

    return {
      correo_electronico: credencial.email,
    };
  }

  @Patch('actualizar-password')
  @UseGuards(JwtAuthGuard)
  actualizarPassword(
    @Req() req: any,
    @Body() body: { currentPassword: string; newPassword: string }
  ) {
    const { currentPassword, newPassword } = body;
    const usuarioId = req.user.id;

    if (!currentPassword || !newPassword) {
      throw new BadRequestException('Debes proporcionar la contraseña actual y la nueva');
    }

    return this.credencialesService.actualizarPassword(usuarioId, currentPassword, newPassword);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.credencialesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCredencialeDto: UpdateCredencialeDto) {
    return this.credencialesService.update(+id, updateCredencialeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.credencialesService.remove(+id);
  }

  @Get('buscar-por-correo/:correo')
async buscarPorCorreo(@Param('correo') correo: string) {
  const credencial = await this.credencialRepository.findOne({ where: { email: correo } });

  if (!credencial) {
    throw new NotFoundException('No se encontró correo');
  }

  return { message: 'Correo encontrado' };
}

}
