import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInventarioMovimientoDto } from './dto/create-inventario-movimiento.dto';
import { UpdateInventarioMovimientoDto } from './dto/update-inventario-movimiento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { InventarioMovimiento } from './entities/inventario-movimiento.entity';
import { Repository } from 'typeorm';
import { Producto } from 'src/productos/entities/productos.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Injectable()
export class InventarioMovimientoService {
    constructor(
        @InjectRepository(InventarioMovimiento)
        private readonly inventarioMovimientoRepository: Repository<InventarioMovimiento>,
        @InjectRepository(Producto)
        private readonly productoRepository: Repository<Producto>,
        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,
    ) {}

    async create(createInventarioMovimientoDto: CreateInventarioMovimientoDto): Promise<InventarioMovimiento> {
        const producto = await this.productoRepository.findOne({ where: {producto_k: createInventarioMovimientoDto.productoId } });
        if (!producto) {
          throw new NotFoundException(`Producto con ID ${createInventarioMovimientoDto.productoId } no encontrado`);
        }

        const usuario = await this.usuarioRepository.findOne({ where: { usuario_k: createInventarioMovimientoDto.usuarioId } });
        if (!usuario) {
            throw new NotFoundException(`Usuario con ID ${createInventarioMovimientoDto.usuarioId} no encontrado`);
        }

        const nuevoMovimiento = this.inventarioMovimientoRepository.create({
            ...createInventarioMovimientoDto,
            producto,
            usuario,
        });

        return await this.inventarioMovimientoRepository.save(nuevoMovimiento);
    }

    async findAll(): Promise<InventarioMovimiento[]> {
        return await this.inventarioMovimientoRepository.find({ relations: ['producto', 'usuario'] });
    }

    async findOne(id: number): Promise<InventarioMovimiento> {
        const movimiento = await this.inventarioMovimientoRepository.findOne({ where: { movimiento_k: id }, relations: ['producto', 'usuario'] });
        if (!movimiento) {
            throw new NotFoundException(`Movimiento con ID ${id} no encontrado`);
        }
        return movimiento;
    }

    async update(id: number, updateInventarioMovimientoDto: UpdateInventarioMovimientoDto): Promise<InventarioMovimiento> {
        const movimiento = await this.findOne(id);
        Object.assign(movimiento, updateInventarioMovimientoDto);
        return await this.inventarioMovimientoRepository.save(movimiento);
    }

    async remove(id: number): Promise<void> {
        const movimiento = await this.findOne(id);
        await this.inventarioMovimientoRepository.remove(movimiento);
    }
}