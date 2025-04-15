import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, Res, UseGuards } from '@nestjs/common';
import { FacturaService } from './factura.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { isValidRFC } from 'src/utils/rfc-validator';
import { Response } from 'express';
import { UserRole } from 'src/usuarios/entities/usuario.entity';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('factura')
export class FacturaController {
  constructor(private readonly facturaService: FacturaService) { }

  //para validar rfc
  @Post('validar-rfc')
  validarRFC(@Body('rfc') rfc: string) {
    if (!isValidRFC(rfc)) {
      throw new BadRequestException('RFC inválido');
    }
    return { mensaje: 'RFC válido' };
  }

  @Get('pdf/:id')
   @Roles(UserRole.ADMIN)
  generarPDF(@Param('id') id: number, @Res() res: Response) {
    return this.facturaService.generarFacturaDesdeBD(id, res);
  }
  
  
  @Post()
  @Roles(UserRole.ADMIN, UserRole.USER)
  create(@Body() createFacturaDto: CreateFacturaDto) {
    return this.facturaService.create(createFacturaDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.facturaService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  findOne(@Param('id') id: string) {
    return this.facturaService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  update(@Param('id') id: string, @Body() updateFacturaDto: UpdateFacturaDto) {
    return this.facturaService.update(+id, updateFacturaDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  remove(@Param('id') id: string) {
    return this.facturaService.remove(+id);
  }
}
