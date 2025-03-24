import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDetalleFacturaDto } from './dto/create-detalle-factura.dto';
import { UpdateDetalleFacturaDto } from './dto/update-detalle-factura.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DetalleFactura } from './entities/detalle-factura.entity';
import { Repository } from 'typeorm';
import { Factura } from 'src/factura/entities/factura.entity';
import { Producto } from 'src/productos/entities/productos.entity';

@Injectable()
export class DetalleFacturaService {
    constructor(
        @InjectRepository(DetalleFactura)
        private readonly detalleFacturaRepository: Repository<DetalleFactura>,
        @InjectRepository(Factura)
        private readonly facturaRepository: Repository<Factura>,
        @InjectRepository(Producto)
        private readonly productoRepository: Repository<Producto>,
    ) {}

    async create(createDetalleFacturaDto: CreateDetalleFacturaDto): Promise<DetalleFactura> {
        const factura = await this.facturaRepository.findOne({ where: { factura_k: createDetalleFacturaDto.facturaFacturaK} });
        if (!factura) {
            throw new NotFoundException(`Factura con ID ${createDetalleFacturaDto.facturaFacturaK} no encontrada`);
        }

        const producto = await this.productoRepository.findOne({ where: { producto_k: createDetalleFacturaDto.productoProductoK } });
        if (!producto) {
            throw new NotFoundException(`Producto con ID ${createDetalleFacturaDto.productoProductoK} no encontrado`);
        }

        const nuevoDetalle = this.detalleFacturaRepository.create({
            ...createDetalleFacturaDto,
            factura,
            producto,
        });

        return await this.detalleFacturaRepository.save(nuevoDetalle);
    }

    async findAll(): Promise<DetalleFactura[]> {
        return await this.detalleFacturaRepository.find({ relations: ['factura', 'producto'] });
    }

    async findOne(id: number): Promise<DetalleFactura> {
        const detalle = await this.detalleFacturaRepository.findOne({ where: { detalle_k: id }, relations: ['factura', 'producto'] });
        if (!detalle) {
            throw new NotFoundException(`Detalle de Factura con ID ${id} no encontrado`);
        }
        return detalle;
    }

    async update(id: number, updateDetalleFacturaDto: UpdateDetalleFacturaDto): Promise<DetalleFactura> {
        const detalle = await this.findOne(id);
        Object.assign(detalle, updateDetalleFacturaDto);
        return await this.detalleFacturaRepository.save(detalle);
    }

    async remove(id: number): Promise<void> {
        const detalle = await this.findOne(id);
        await this.detalleFacturaRepository.remove(detalle);
    }
}
