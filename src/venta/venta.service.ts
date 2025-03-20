import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Venta } from './entities/venta.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VentaService {
    constructor(
        @InjectRepository(Venta)
        private readonly ventaRepository: Repository<Venta>,
    ) {}

    async create(createVentaDto: CreateVentaDto): Promise<Venta> {
        const nuevaVenta = this.ventaRepository.create(createVentaDto);
        return await this.ventaRepository.save(nuevaVenta);
    }

    async findAll(): Promise<Venta[]> {
        return await this.ventaRepository.find();
    }

    async findOne(id: number): Promise<Venta> {
        const venta = await this.ventaRepository.findOne({ where: { venta_k: id } });
        if (!venta) {
            throw new NotFoundException(`Venta con ID ${id} no encontrada`);
        }
        return venta;
    }

    async update(id: number, updateVentaDto: UpdateVentaDto): Promise<Venta> {
        const venta = await this.findOne(id);
        Object.assign(venta, updateVentaDto);
        return await this.ventaRepository.save(venta);
    }

    async remove(id: number): Promise<void> {
        const venta = await this.findOne(id);
        await this.ventaRepository.remove(venta);
    }
}

