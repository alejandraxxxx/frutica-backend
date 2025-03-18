import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Categoria } from './entities/categoria.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private readonly  categoriaRepo: Repository<Categoria>,
  ) {}

  /**
   * 🛠 Crear una categoría
   */
  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    const nuevaCategoria = this.categoriaRepo.create(createCategoriaDto);
    return await this.categoriaRepo.save(nuevaCategoria);
}

  /**
   *  Obtener todas las categorías activas
   */
  async findAll(): Promise<Categoria[]> {
    return await this.categoriaRepo.find({ relations: ['productos'] });
}
  /**
   *  Buscar una categoría por ID
   */
  async findOne(id: number): Promise<Categoria> {
    const categoria = await this.categoriaRepo.findOne({ where: { categoria_k: id }, relations: ['productos'] });
    if (!categoria) {
        throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return categoria;
}

  /**
   * Actualizar una categoría
   */
  async update(id: number, updateCategoriaDto: UpdateCategoriaDto): Promise<Categoria> {
    const categoria = await this.findOne(id);
    Object.assign(categoria, updateCategoriaDto);
    return await this.categoriaRepo.save(categoria);
}

  /**
   * Eliminar una categoría (Soft delete, cambia `activo` a false)
   */
  async remove(id: number): Promise<void> {
    const categoria = await this.findOne(id);
    await this.categoriaRepo.remove(categoria);
}

}
