import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InventarioMovimientoService } from './inventario-movimiento.service';
import { CreateInventarioMovimientoDto } from './dto/create-inventario-movimiento.dto';
import { UpdateInventarioMovimientoDto } from './dto/update-inventario-movimiento.dto';

@Controller('inventario-movimiento')
export class InventarioMovimientoController {
  constructor(private readonly inventarioMovimientoService: InventarioMovimientoService) {}

  @Post()
  create(@Body() createInventarioMovimientoDto: CreateInventarioMovimientoDto) {
    return this.inventarioMovimientoService.create(createInventarioMovimientoDto);
  }

  @Get()
  findAll() {
    return this.inventarioMovimientoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventarioMovimientoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInventarioMovimientoDto: UpdateInventarioMovimientoDto) {
    return this.inventarioMovimientoService.update(+id, updateInventarioMovimientoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventarioMovimientoService.remove(+id);
  }
}
