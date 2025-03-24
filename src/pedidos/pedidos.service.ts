import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pedido } from './entities/pedidos.entity';
import { Repository } from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { FormaPago } from 'src/forma-pago/entities/forma-pago.entity';
import { TipoEntrega } from 'src/tipo-entrega/entities/tipo-entrega.entity';

@Injectable()
export class PedidosService {
    constructor(
        @InjectRepository(Pedido)
        private readonly pedidoRepository: Repository<Pedido>,
        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,
        @InjectRepository(Cliente)
        private readonly clienteRepository: Repository<Cliente>,
        @InjectRepository(FormaPago)
        private readonly formaPagoRepository: Repository<FormaPago>,
        @InjectRepository(TipoEntrega)
        private readonly tipoEntregaRepository: Repository<TipoEntrega>,
    ) {}

    async create(createPedidoDto: CreatePedidoDto): Promise<Pedido> {
        const usuario = await this.usuarioRepository.findOne({ where: { usuario_k: createPedidoDto.usuarioUsuarioK } });
        if (!usuario) {
            throw new NotFoundException(`Usuario con ID ${createPedidoDto.usuarioUsuarioK} no encontrado`);
        }

        const nuevoPedido = this.pedidoRepository.create({
            ...createPedidoDto,
            usuario,
        });

        return await this.pedidoRepository.save(nuevoPedido);
    }

    async findAll(): Promise<Pedido[]> {
        return await this.pedidoRepository.find({ relations: ['usuario', 'cliente', 'formaPago', 'tipoEntrega'] });
    }

    async findOne(id: number): Promise<Pedido> {
        const pedido = await this.pedidoRepository.findOne({ where: { pedido_k: id }, relations: ['usuario', 'cliente', 'formaPago', 'tipoEntrega'] });
        if (!pedido) {
            throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
        }
        return pedido;
    }

    async update(id: number, updatePedidoDto: UpdatePedidoDto): Promise<Pedido> {
        const pedido = await this.findOne(id);
        Object.assign(pedido, updatePedidoDto);
        return await this.pedidoRepository.save(pedido);
    }

    async remove(id: number): Promise<void> {
        const pedido = await this.findOne(id);
        await this.pedidoRepository.remove(pedido);
    }
  }