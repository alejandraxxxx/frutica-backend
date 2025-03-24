import { Injectable } from '@nestjs/common';
import { CreateCarritoItemDto } from './dto/create-carrito-item.dto';
import { UpdateCarritoItemDto } from './dto/update-carrito-item.dto';

@Injectable()
export class CarritoItemService {
  create(createCarritoItemDto: CreateCarritoItemDto) {
    return 'This action adds a new carritoItem';
  }

  findAll() {
    return `This action returns all carritoItem`;
  }

  findOne(id: number) {
    return `This action returns a #${id} carritoItem`;
  }

  update(id: number, updateCarritoItemDto: UpdateCarritoItemDto) {
    return `This action updates a #${id} carritoItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} carritoItem`;
  }
}
