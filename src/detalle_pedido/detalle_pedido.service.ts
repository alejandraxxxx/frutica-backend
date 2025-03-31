import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDetallePedidoDto } from './dto/create-detalle_pedido.dto';
import { UpdateDetallePedidoDto } from './dto/update-detalle_pedido.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DetallePedido } from './entities/detalle_pedido.entity';
import { Repository } from 'typeorm';
import { Pedido } from 'src/pedidos/entities/pedidos.entity';

@Injectable()
export class DetallePedidoService {
  constructor(
      @InjectRepository(DetallePedido)
      private readonly detallePedidoRepository: Repository<DetallePedido>,
      @InjectRepository(Pedido)
      private readonly pedidoRepository: Repository<Pedido>,
  ) {}

  async create(createDetallePedidoDto: CreateDetallePedidoDto): Promise<DetallePedido> {
      const pedido = await this.pedidoRepository.findOne({ where: { pedido_k: createDetallePedidoDto.pedidoPedidoK } });
      if (!pedido) {
          throw new NotFoundException(`Pedido con ID ${createDetallePedidoDto.pedidoPedidoK} no encontrado`);
      }

      const nuevoDetalle = this.detallePedidoRepository.create({
          ...createDetallePedidoDto,
          pedido,
      });

      return await this.detallePedidoRepository.save(nuevoDetalle);
  }

  async findAll(): Promise<DetallePedido[]> {
      return await this.detallePedidoRepository.find({ relations: ['pedido'] });
  }

  async findOne(id: number): Promise<DetallePedido> {
      const detalle = await this.detallePedidoRepository.findOne({ where: { detalle_pedido_k: id }, relations: ['pedido'] });
      if (!detalle) {
          throw new NotFoundException(`Detalle de Pedido con ID ${id} no encontrado`);
      }
      return detalle;
  }

  async update(id: number, updateDetallePedidoDto: UpdateDetallePedidoDto): Promise<DetallePedido> {
      const detalle = await this.findOne(id);
      Object.assign(detalle, updateDetallePedidoDto);
      return await this.detallePedidoRepository.save(detalle);
  }

  async remove(id: number): Promise<void> {
      const detalle = await this.findOne(id);
      await this.detallePedidoRepository.remove(detalle);
  }
}