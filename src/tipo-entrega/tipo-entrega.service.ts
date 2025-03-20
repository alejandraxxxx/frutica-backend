import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTipoEntregaDto } from './dto/create-tipo-entrega.dto';
import { UpdateTipoEntregaDto } from './dto/update-tipo-entrega.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TipoEntrega } from './entities/tipo-entrega.entity';
import { Direccion } from 'src/direccion/entities/direccion.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TipoEntregaService {
    constructor(
        @InjectRepository(TipoEntrega)
        private readonly tipoEntregaRepository: Repository<TipoEntrega>,
        @InjectRepository(Direccion)
        private readonly direccionRepository: Repository<Direccion>,
    ) {}

    async create(createTipoEntregaDto: CreateTipoEntregaDto): Promise<TipoEntrega> {
        let direccion = null;
        if (createTipoEntregaDto.direccionId) {
            direccion = await this.direccionRepository.findOne({ where: { direccion_k: createTipoEntregaDto.direccionId } });
            if (!direccion) {
                throw new NotFoundException(`Dirección con ID ${createTipoEntregaDto.direccionId} no encontrada`);
            }
        }

        const nuevoTipoEntrega = this.tipoEntregaRepository.create({
            ...createTipoEntregaDto,
            direccion,
        });

        return await this.tipoEntregaRepository.save(nuevoTipoEntrega);
    }

    async findAll(): Promise<TipoEntrega[]> {
        return await this.tipoEntregaRepository.find({ relations: ['direccion'] });
    }

    async findOne(id: number): Promise<TipoEntrega> {
        const tipoEntrega = await this.tipoEntregaRepository.findOne({ where: { envio_k: id }, relations: ['direccion'] });
        if (!tipoEntrega) {
            throw new NotFoundException(`Tipo de entrega con ID ${id} no encontrado`);
        }
        return tipoEntrega;
    }

    async update(id: number, updateTipoEntregaDto: UpdateTipoEntregaDto): Promise<TipoEntrega> {
        const tipoEntrega = await this.findOne(id);
        Object.assign(tipoEntrega, updateTipoEntregaDto);
        return await this.tipoEntregaRepository.save(tipoEntrega);
    }

    async remove(id: number): Promise<void> {
        const tipoEntrega = await this.findOne(id);
        await this.tipoEntregaRepository.remove(tipoEntrega);
    }
}
