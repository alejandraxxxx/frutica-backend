// src/oferta/oferta.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Oferta } from './entities/oferta.entity';
import { CreateOfertaDto } from './dto/create-oferta.dto';
import { UpdateOfertaDto } from './dto/update-oferta.dto';
import { Producto } from 'src/productos/entities/productos.entity';

@Injectable()
export class OfertaService {
  constructor(
    @InjectRepository(Oferta) private ofertaRepo: Repository<Oferta>,
    @InjectRepository(Producto) private productoRepo: Repository<Producto>
  ) {}

  async create(createOfertaDto: CreateOfertaDto) {
    const producto = await this.productoRepo.findOne({
      where: { producto_k: createOfertaDto.productoId }
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');

    const oferta = this.ofertaRepo.create({
      ...createOfertaDto,
      producto
    });

    return this.ofertaRepo.save(oferta);
  }

  findAll() {
    return this.ofertaRepo.find({ relations: ['producto'] });
  }

  findOne(id: number) {
    return this.ofertaRepo.findOne({
      where: { oferta_k: id },
      relations: ['producto'],
    });
  }

  update(id: number, updateOfertaDto: UpdateOfertaDto) {
    return this.ofertaRepo.update(id, updateOfertaDto);
  }

  async remove(id: number) {
    const oferta = await this.findOne(id);
    if (!oferta) throw new NotFoundException('Oferta no encontrada');
    return this.ofertaRepo.remove(oferta);
  }

  // Ofertas activas actuales
// src/oferta/oferta.service.ts

async findOfertasActivas() {
  const now = new Date();
  return this.ofertaRepo.find({
    where: {
      activa: true,
      inicio: LessThanOrEqual(now),  // Comparación de fecha de inicio
      fin: MoreThanOrEqual(now),     // Comparación de fecha de fin
    },
    relations: ['producto'], // Relación con productos
  });
}

}
