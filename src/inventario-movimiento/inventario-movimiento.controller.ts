import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InventarioMovimientoService } from './inventario-movimiento.service';
import { CreateInventarioMovimientoDto } from './dto/create-inventario-movimiento.dto';
import { UpdateInventarioMovimientoDto } from './dto/update-inventario-movimiento.dto';
import { UserRole } from 'src/usuarios/entities/usuario.entity';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('inventario-mov')
export class InventarioMovimientoController {
  constructor(private readonly inventarioMovimientoService: InventarioMovimientoService) {}

  @Post()
   @Roles(UserRole.ADMIN)
  create(@Body() createInventarioMovimientoDto: CreateInventarioMovimientoDto) {
    return this.inventarioMovimientoService.create(createInventarioMovimientoDto);
  }

  @Get()
   @Roles(UserRole.ADMIN)
  findAll() {
    return this.inventarioMovimientoService.findAll();
  }

  @Get(':id')
   @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.inventarioMovimientoService.findOne(+id);
  }

  @Patch(':id')
   @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateInventarioMovimientoDto: UpdateInventarioMovimientoDto) {
    return this.inventarioMovimientoService.update(+id, updateInventarioMovimientoDto);
  }

  @Delete(':id')
   @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.inventarioMovimientoService.remove(+id);
  }
}
