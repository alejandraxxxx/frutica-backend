import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DatosPersonalesService } from './datos-personales.service';
import { CreateDatosPersonaleDto } from './dto/create-datos-personale.dto';
import { UpdateDatosPersonaleDto } from './dto/update-datos-personale.dto';

@Controller('datos-personales')
export class DatosPersonalesController {
  constructor(private readonly datosPersonalesService: DatosPersonalesService) {}

  @Post()
  create(@Body() createDatosPersonaleDto: CreateDatosPersonaleDto) {
    return this.datosPersonalesService.create(createDatosPersonaleDto);
  }

  @Get()
  findAll() {
    return this.datosPersonalesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.datosPersonalesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDatosPersonaleDto: UpdateDatosPersonaleDto) {
    return this.datosPersonalesService.update(+id, updateDatosPersonaleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.datosPersonalesService.remove(+id);
  }
}
