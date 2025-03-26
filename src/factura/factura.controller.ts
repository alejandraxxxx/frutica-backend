import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, Res } from '@nestjs/common';
import { FacturaService } from './factura.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { isValidRFC } from 'src/utils/rfc-validator';
import { Response } from 'express';


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
  generarPDF(@Param('id') id: number, @Res() res: Response) {
    return this.facturaService.generarFacturaDesdeBD(id, res);
  }
  
  
  @Post()
  create(@Body() createFacturaDto: CreateFacturaDto) {
    return this.facturaService.create(createFacturaDto);
  }

  @Get()
  findAll() {
    return this.facturaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facturaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFacturaDto: UpdateFacturaDto) {
    return this.facturaService.update(+id, updateFacturaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.facturaService.remove(+id);
  }
}
