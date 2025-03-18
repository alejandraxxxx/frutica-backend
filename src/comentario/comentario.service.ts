import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comentario } from './entities/comentario.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ComentarioService {
  constructor(
    @InjectRepository(Comentario)
    private readonly comentarioRepository: Repository<Comentario>,
) {}

async create(createComentarioDto: CreateComentarioDto): Promise<Comentario> {
    const nuevoComentario = this.comentarioRepository.create(createComentarioDto);
    return await this.comentarioRepository.save(nuevoComentario);
}

async findAll(): Promise<Comentario[]> {
    return await this.comentarioRepository.find();
}

async findOne(id: number): Promise<Comentario> {
    const comentario = await this.comentarioRepository.findOne({ where: { comentario_k: id } });
    if (!comentario) {
        throw new NotFoundException(`Comentario con ID ${id} no encontrado`);
    }
    return comentario;
}

async update(id: number, updateComentarioDto: UpdateComentarioDto): Promise<Comentario> {
    await this.comentarioRepository.update(id, updateComentarioDto);
    return this.findOne(id);
}

async remove(id: number): Promise<void> {
    const comentario = await this.findOne(id);
    await this.comentarioRepository.remove(comentario);
}
}
