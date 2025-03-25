import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './entities/pedidos.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { FormaPago } from 'src/forma-pago/entities/forma-pago.entity';
import { TipoEntrega } from 'src/tipo-entrega/entities/tipo-entrega.entity';
import { DatosPersonales } from 'src/datos-personales/entities/datos-personale.entity';

@Injectable()
export class PedidosService {
    constructor(
        @InjectRepository(Pedido)
        private readonly pedidoRepository: Repository<Pedido>,
        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,
        @InjectRepository(DatosPersonales)
        private readonly datosRepository: Repository<DatosPersonales>,
        @InjectRepository(FormaPago)
        private readonly formaPagoRepository: Repository<FormaPago>,
        @InjectRepository(TipoEntrega)
        private readonly tipoEntregaRepository: Repository<TipoEntrega>,
    ) { }

    async create(createPedidoDto: CreatePedidoDto): Promise<Pedido> {
        const {
            usuarioUsuarioK,
            clienteClienteK,
            formaPagoFormaK,
            tipoEntregaEnvioK,
            ...resto
        } = createPedidoDto;

        const usuario = await this.usuarioRepository.findOne({
            where: { usuario_k: usuarioUsuarioK },
        });
        if (!usuario) {
            throw new NotFoundException(`Usuario con ID ${usuarioUsuarioK} no encontrado`);
        }

        const cliente = await this.datosRepository.findOne({
            where: { cliente_k: clienteClienteK },
        });
        if (!cliente) {
            throw new NotFoundException(`Cliente con ID ${clienteClienteK} no encontrado`);
        }

        const formaPago = await this.formaPagoRepository.findOne({
            where: { forma_k: formaPagoFormaK },
        });
        if (!formaPago) {
            throw new NotFoundException(`Forma de pago con ID ${formaPagoFormaK} no encontrada`);
        }

        const tipoEntrega = await this.tipoEntregaRepository.findOne({
            where: { envio_k: tipoEntregaEnvioK },
        });
        if (!tipoEntrega) {
            throw new NotFoundException(`Tipo de entrega con ID ${tipoEntregaEnvioK} no encontrado`);
        }

        const nuevoPedido = this.pedidoRepository.create({
            ...resto,
            usuario,
            cliente,
            formaPago,
            tipo_entrega: tipoEntrega,
        });

        return await this.pedidoRepository.save(nuevoPedido);
    }

    async findAll(): Promise<Pedido[]> {
        return await this.pedidoRepository.find({
            relations: ['usuario', 'cliente', 'formaPago', 'tipo_entrega'],
        });
    }

    async findOne(id: number): Promise<Pedido> {
        const pedido = await this.pedidoRepository.findOne({
            where: { pedido_k: id },
            relations: ['usuario', 'cliente', 'formaPago', 'tipo_entrega'],
        });
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
