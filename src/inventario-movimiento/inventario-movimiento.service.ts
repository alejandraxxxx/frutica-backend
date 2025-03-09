import { Injectable } from '@nestjs/common';
import { CreateInventarioMovimientoDto } from './dto/create-inventario-movimiento.dto';
import { UpdateInventarioMovimientoDto } from './dto/update-inventario-movimiento.dto';

@Injectable()
export class InventarioMovimientoService {
  create(createInventarioMovimientoDto: CreateInventarioMovimientoDto) {
    return 'This action adds a new inventarioMovimiento';
  }

  findAll() {
    return `This action returns all inventarioMovimiento`;
  }

  findOne(id: number) {
    return `This action returns a #${id} inventarioMovimiento`;
  }

  update(id: number, updateInventarioMovimientoDto: UpdateInventarioMovimientoDto) {
    return `This action updates a #${id} inventarioMovimiento`;
  }

  remove(id: number) {
    return `This action removes a #${id} inventarioMovimiento`;
  }
}
