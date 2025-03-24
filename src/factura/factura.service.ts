import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Factura } from './entities/factura.entity';
import { Repository } from 'typeorm';
import { Pedido } from 'src/pedidos/entities/pedidos.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { FormaPago } from 'src/forma-pago/entities/forma-pago.entity';

@Injectable()
export class FacturaService {
    constructor(
        @InjectRepository(Factura)
        private readonly facturaRepository: Repository<Factura>,
        @InjectRepository(Pedido)
        private readonly pedidoRepository: Repository<Pedido>,
        @InjectRepository(Cliente)
        private readonly clienteRepository: Repository<Cliente>,
        @InjectRepository(FormaPago)
        private readonly formaPagoRepository: Repository<FormaPago>,
    ) {}

    async create(createFacturaDto: CreateFacturaDto): Promise<Factura> {
        const pedido = await this.pedidoRepository.findOne({ where: { pedido_k: createFacturaDto.pedidoPedidoK} });
        if (!pedido) {
            throw new NotFoundException(`Pedido con ID ${createFacturaDto.pedidoPedidoK} no encontrado`);
        }

        const cliente = await this.clienteRepository.findOne({ where: { cliente_k: createFacturaDto.clienteClientek } });
        if (!cliente) {
            throw new NotFoundException(`Cliente con ID ${createFacturaDto.clienteClientek} no encontrado`);
        }

        const formaPago = await this.formaPagoRepository.findOne({ where: { forma_k: createFacturaDto.formaPagoFormaK } });
        if (!formaPago) {
            throw new NotFoundException(`Forma de pago con ID ${createFacturaDto.formaPagoFormaK} no encontrada`);
        }

        const nuevaFactura = this.facturaRepository.create({
            ...createFacturaDto,
            pedido,
            cliente,
            formaPago,
        });

        return await this.facturaRepository.save(nuevaFactura);
    }

    async findAll(): Promise<Factura[]> {
        return await this.facturaRepository.find({ relations: ['pedido', 'cliente', 'formaPago', 'detallesFactura'] });
    }

    async findOne(id: number): Promise<Factura> {
        const factura = await this.facturaRepository.findOne({ where: { factura_k: id }, relations: ['pedido', 'cliente', 'formaPago', 'detallesFactura'] });
        if (!factura) {
            throw new NotFoundException(`Factura con ID ${id} no encontrada`);
        }
        return factura;
    }

    async update(id: number, updateFacturaDto: UpdateFacturaDto): Promise<Factura> {
        const factura = await this.findOne(id);
        Object.assign(factura, updateFacturaDto);
        return await this.facturaRepository.save(factura);
    }

    async remove(id: number): Promise<void> {
        const factura = await this.findOne(id);
        await this.facturaRepository.remove(factura);
    }
}
