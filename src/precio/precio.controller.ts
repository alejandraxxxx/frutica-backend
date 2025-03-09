import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PrecioService } from './precio.service';
import { CreatePrecioDto } from './dto/create-precio.dto';
import { UpdatePrecioDto } from './dto/update-precio.dto';

@Controller('precio')
export class PrecioController {
  constructor(private readonly precioService: PrecioService) {}

  @Post()
  create(@Body() createPrecioDto: CreatePrecioDto) {
    return this.precioService.create(createPrecioDto);
  }

  @Get()
  findAll() {
    return this.precioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.precioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePrecioDto: UpdatePrecioDto) {
    return this.precioService.update(+id, updatePrecioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.precioService.remove(+id);
  }
}
