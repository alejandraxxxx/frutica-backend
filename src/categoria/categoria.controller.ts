import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/usuarios/entities/usuario.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categoria')
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

  /** Crear una nueva categoría
   */
  @Post()
   @Roles(UserRole.ADMIN)
  async create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return this.categoriaService.create(createCategoriaDto);
  }

  /**
   * Obtener todas las categorías activas
   */
  @Get()
   @Roles(UserRole.ADMIN, UserRole.USER)
  async findAll() {
    return this.categoriaService.findAll();
  }

  /**
   * Obtener una categoría por ID
   */
  @Get(':id')
   @Roles(UserRole.ADMIN, UserRole.USER)
  async findOne(@Param('id') id: string) {
    return this.categoriaService.findOne(+id);
  }

  /**
   * Actualizar una categoría
   */
  @Patch(':id')
   @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateCategoriaDto: UpdateCategoriaDto) {
    return this.categoriaService.update(+id, updateCategoriaDto);
  }

  /**
   * 🗑 Eliminar una categoría (Soft delete)
   */
  @Delete(':id')
   @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.categoriaService.remove(+id);
  }
}