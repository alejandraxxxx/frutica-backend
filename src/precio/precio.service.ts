import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePrecioDto } from './dto/create-precio.dto';
import { UpdatePrecioDto } from './dto/update-precio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Precio } from './entities/precio.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PrecioService {
    constructor(
        @InjectRepository(Precio)
        private readonly precioRepository: Repository<Precio>,
    ) {}

    async create(createPrecioDto: CreatePrecioDto): Promise<Precio> {
        const nuevoPrecio = this.precioRepository.create(createPrecioDto);
        return await this.precioRepository.save(nuevoPrecio);
    }

    async findAll(): Promise<Precio[]> {
        return await this.precioRepository.find({ relations: ['productos'] });
    }

    async findOne(id: number): Promise<Precio> {
        const precio = await this.precioRepository.findOne({ where: { precio_k: id }, relations: ['productos'] });
        if (!precio) {
            throw new NotFoundException(`Precio con ID ${id} no encontrado`);
        }
        return precio;
    }

    async update(id: number, updatePrecioDto: UpdatePrecioDto): Promise<Precio> {
        const precio = await this.findOne(id);
        Object.assign(precio, updatePrecioDto);
        return await this.precioRepository.save(precio);
    }

    async remove(id: number): Promise<void> {
        const precio = await this.findOne(id);
        await this.precioRepository.remove(precio);
    }
}
