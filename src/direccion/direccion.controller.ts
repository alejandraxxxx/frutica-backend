import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DireccionesService } from './direccion.service';
import { CreateDireccionDto } from './dto/create-direccion.dto';

@Controller('direcciones')
export class DireccionesController {
    constructor(private readonly direccionesService: DireccionesService) {}

    @Post()
    async create(@Body() createDireccionDto: CreateDireccionDto) {
        return await this.direccionesService.create(createDireccionDto);
    }

    @Get()
    async findAll() {
        return await this.direccionesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.direccionesService.findOne(+id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateDireccionDto: Partial<CreateDireccionDto>) {
        return await this.direccionesService.update(+id, updateDireccionDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return await this.direccionesService.remove(+id);
    }
}
