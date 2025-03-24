import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TipoEntregaService } from './tipo-entrega.service';
import { CreateTipoEntregaDto } from './dto/create-tipo-entrega.dto';
import { UpdateTipoEntregaDto } from './dto/update-tipo-entrega.dto';

@Controller('tipo-entrega')
export class TipoEntregaController {
  constructor(private readonly tipoEntregaService: TipoEntregaService) {}

  @Post()
  create(@Body() createTipoEntregaDto: CreateTipoEntregaDto) {
    return this.tipoEntregaService.create(createTipoEntregaDto);
  }

  @Get()
  findAll() {
    return this.tipoEntregaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tipoEntregaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTipoEntregaDto: UpdateTipoEntregaDto) {
    return this.tipoEntregaService.update(+id, updateTipoEntregaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tipoEntregaService.remove(+id);
  }
}
