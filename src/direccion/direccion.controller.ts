import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DireccionesService } from './direccion.service';
import { CreateDireccionDto } from './dto/create-direccion.dto';
import { UserRole } from 'src/usuarios/entities/usuario.entity';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('direcciones')
export class DireccionesController {
    constructor(private readonly direccionesService: DireccionesService) {}

    @Post()
     @Roles(UserRole.ADMIN, UserRole.USER)
    async create(@Body() createDireccionDto: CreateDireccionDto) {
        return await this.direccionesService.create(createDireccionDto);
    }

    @Get()
    @Roles(UserRole.ADMIN)
    async findAll() {
        return await this.direccionesService.findAll();
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.USER)
    async findOne(@Param('id') id: string) {
        return await this.direccionesService.findOne(+id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.USER)
    async update(@Param('id') id: string, @Body() updateDireccionDto: Partial<CreateDireccionDto>) {
        return await this.direccionesService.update(+id, updateDireccionDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.USER)
    async remove(@Param('id') id: string) {
        return await this.direccionesService.remove(+id);
    }
}
