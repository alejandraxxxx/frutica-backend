import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private categoriaRepo: Repository<Categoria>,
  ) {}

  /**
   * 🛠 Crear una categoría
   */
  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    const categoria = this.categoriaRepo.create(createCategoriaDto);
    return this.categoriaRepo.save(categoria);
  }

  /**
   * 📦 Obtener todas las categorías activas
   */
  async findAll(): Promise<Categoria[]> {
    return this.categoriaRepo.find({ where: { activo: true } });
  }

  /**
   * 🔍 Buscar una categoría por ID
   */
  async findOne(id: number): Promise<Categoria> {
    const categoria = await this.categoriaRepo.findOne({ where: { categoria_k: id } });
    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return categoria;
  }

  /**
   * 📝 Actualizar una categoría
   */
  async update(id: number, updateCategoriaDto: UpdateCategoriaDto): Promise<Categoria> {
    const categoria = await this.findOne(id);
    Object.assign(categoria, updateCategoriaDto);
    return this.categoriaRepo.save(categoria);
  }

  /**
   * 🗑 Eliminar una categoría (Soft delete, cambia `activo` a false)
   */
  async remove(id: number): Promise<Categoria> {
    const categoria = await this.findOne(id);
    categoria.activo = false;
    return this.categoriaRepo.save(categoria);
  }
}
