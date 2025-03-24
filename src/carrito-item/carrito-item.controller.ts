import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CarritoItemService } from './carrito-item.service';
import { CreateCarritoItemDto } from './dto/create-carrito-item.dto';
import { UpdateCarritoItemDto } from './dto/update-carrito-item.dto';

@Controller('carrito-item')
export class CarritoItemController {
  constructor(private readonly carritoItemService: CarritoItemService) {}

  @Post()
  create(@Body() createCarritoItemDto: CreateCarritoItemDto) {
    return this.carritoItemService.create(createCarritoItemDto);
  }

  @Get()
  findAll() {
    return this.carritoItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carritoItemService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCarritoItemDto: UpdateCarritoItemDto) {
    return this.carritoItemService.update(+id, updateCarritoItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carritoItemService.remove(+id);
  }
}
