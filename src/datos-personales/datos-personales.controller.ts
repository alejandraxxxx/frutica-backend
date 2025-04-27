import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { DatosPersonalesService } from './datos-personales.service';
import { CreateDatosPersonaleDto } from './dto/create-datos-personale.dto';
import { UpdateDatosPersonaleDto } from './dto/update-datos-personale.dto';
import { UserRole } from 'src/usuarios/entities/usuario.entity';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('datos-personales')
export class DatosPersonalesController {
  credencialesService: any;
  
  constructor(private readonly datosPersonalesService: DatosPersonalesService) {}

  // Crear normalmente (usado por admins probablemente)
  @Post()
  @Roles(UserRole.ADMIN, UserRole.USER)
  create(@Body() createDatosPersonaleDto: CreateDatosPersonaleDto) {
    return this.datosPersonalesService.create(createDatosPersonaleDto);
  }

  // Obtener datos de facturación del usuario actual
  @Get('mi-perfil')
  async obtenerMiPerfil(@Req() req: any) {
    const usuarioId = req.user.id;
    const datos = await this.datosPersonalesService.findByUsuarioId(usuarioId);

    if (!datos) {
      return null; // El frontend sabrá que no hay datos de facturación aún
    }

    return {
      rfc: datos.rfc,
      razon_social: datos.razon_social,
      uso_factura: datos.uso_factura,
      tipo_persona: datos.tipo_persona === 1 ? "FISICA" : "MORAL",
    };
  }

  // Crear o actualizar datos de facturación de usuario actual
  @Post('guardar-facturacion')
  @UseGuards(JwtAuthGuard)
  async guardarDatosFacturacion(
    @Req() req: any,
    @Body() { rfc, razon_social, uso_factura, tipo_persona }: { rfc: string, razon_social: string, uso_factura: string, tipo_persona: string }
  ) {
    const usuarioId = req.user.id;
    return this.datosPersonalesService.crearOActualizar(usuarioId, { rfc, razon_social, uso_factura, tipo_persona });
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.datosPersonalesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  findOne(@Param('id') id: string) {
    return this.datosPersonalesService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  update(@Param('id') id: string, @Body() updateDatosPersonaleDto: UpdateDatosPersonaleDto) {
    return this.datosPersonalesService.update(+id, updateDatosPersonaleDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  remove(@Param('id') id: string) {
    return this.datosPersonalesService.remove(+id);
  }
}
