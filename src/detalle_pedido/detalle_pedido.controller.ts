import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DetallePedidoService } from './detalle_pedido.service';
import { CreateDetallePedidoDto } from './dto/create-detalle_pedido.dto';
import { UpdateDetallePedidoDto } from './dto/update-detalle_pedido.dto';
import { UserRole } from 'src/usuarios/entities/usuario.entity';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('detallepedido')
export class DetallePedidoController {
  constructor(private readonly detallePedidoService: DetallePedidoService) {}

  @Post()
   @Roles( UserRole.USER)
  create(@Body() createDetallePedidoDto: CreateDetallePedidoDto) {
    return this.detallePedidoService.create(createDetallePedidoDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.detallePedidoService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.USER)
  findOne(@Param('id') id: string) {
    return this.detallePedidoService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  update(@Param('id') id: string, @Body() updateDetallePedidoDto: UpdateDetallePedidoDto) {
    return this.detallePedidoService.update(+id, updateDetallePedidoDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  remove(@Param('id') id: string) {
    return this.detallePedidoService.remove(+id);
  }
}
