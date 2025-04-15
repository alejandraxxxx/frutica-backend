import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DetalleFacturaService } from './detalle-factura.service';
import { CreateDetalleFacturaDto } from './dto/create-detalle-factura.dto';
import { UpdateDetalleFacturaDto } from './dto/update-detalle-factura.dto';
import { UserRole } from 'src/usuarios/entities/usuario.entity';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('detalle-fact')
export class DetalleFacturaController {
  constructor(private readonly detalleFacturaService: DetalleFacturaService) { }

  @Post()
   @Roles(UserRole.ADMIN, UserRole.USER)
  create(@Body() createDetalleFacturaDto: CreateDetalleFacturaDto) {
    return this.detalleFacturaService.create(createDetalleFacturaDto);
  }

  @Get()
   @Roles(UserRole.ADMIN)
  findAll() {
    return this.detalleFacturaService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  findOne(@Param('id') id: string) {
    return this.detalleFacturaService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  update(@Param('id') id: string, @Body() updateDetalleFacturaDto: UpdateDetalleFacturaDto) {
    return this.detalleFacturaService.update(+id, updateDetalleFacturaDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  remove(@Param('id') id: string) {
    return this.detalleFacturaService.remove(+id);
  }
}
