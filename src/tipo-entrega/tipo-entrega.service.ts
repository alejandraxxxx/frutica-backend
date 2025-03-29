import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoEntrega } from './entities/tipo-entrega.entity';
import { Direccion } from 'src/direccion/entities/direccion.entity';
import { CreateTipoEntregaDto } from './dto/create-tipo-entrega.dto';
import { UpdateTipoEntregaDto } from './dto/update-tipo-entrega.dto';

@Injectable()
export class TipoEntregaService {
  constructor(
    @InjectRepository(TipoEntrega)
    private readonly tipoEntregaRepository: Repository<TipoEntrega>,
    @InjectRepository(Direccion)
    private readonly direccionRepository: Repository<Direccion>,
  ) {}

  async create(dto: CreateTipoEntregaDto): Promise<TipoEntrega> {
    const direccion = await this.direccionRepository.findOne({
      where: { direccion_k: dto.direccionId },
    });

    if (!direccion) {
      throw new NotFoundException(`Dirección con ID ${dto.direccionId} no encontrada`);
    }

    const tipoEntrega = this.tipoEntregaRepository.create({
      metodo_entrega: dto.metodo_entrega,
      direccion,
      repartidor: dto.repartidor ?? null,
      fecha_creacion_envio: new Date(),
      fecha_estimada_entrega: dto.fecha_estimada_entrega,
      hora_estimada_entrega: dto.hora_estimada_entrega,
      costo_envio: dto.costo_envio,
      estado: dto.estado ?? 'pendiente',
    });

    return this.tipoEntregaRepository.save(tipoEntrega);
  }

  async findAll(): Promise<TipoEntrega[]> {
    return this.tipoEntregaRepository.find({ relations: ['direccion'] });
  }

  async findOne(id: number): Promise<TipoEntrega> {
    const tipoEntrega = await this.tipoEntregaRepository.findOne({
      where: { envio_k: id },
      relations: ['direccion'],
    });

    if (!tipoEntrega) {
      throw new NotFoundException(`Tipo de entrega con ID ${id} no encontrado`);
    }

    return tipoEntrega;
  }

  async update(id: number, dto: UpdateTipoEntregaDto): Promise<TipoEntrega> {
    const tipoEntrega = await this.findOne(id);

    if (dto.direccionId) {
      const direccion = await this.direccionRepository.findOne({
        where: { direccion_k: dto.direccionId },
      });
      if (!direccion) throw new NotFoundException('Dirección no encontrada');
      tipoEntrega.direccion = direccion;
    }

    tipoEntrega.metodo_entrega = dto.metodo_entrega ?? tipoEntrega.metodo_entrega;
    tipoEntrega.repartidor = dto.repartidor ?? tipoEntrega.repartidor;
    tipoEntrega.fecha_estimada_entrega = dto.fecha_estimada_entrega
    ? new Date(dto.fecha_estimada_entrega)
    : tipoEntrega.fecha_estimada_entrega;
      tipoEntrega.hora_estimada_entrega = dto.hora_estimada_entrega ?? tipoEntrega.hora_estimada_entrega;
    tipoEntrega.costo_envio = dto.costo_envio ?? tipoEntrega.costo_envio;
    tipoEntrega.estado = dto.estado ?? tipoEntrega.estado;

    return this.tipoEntregaRepository.save(tipoEntrega);
  }

  async remove(id: number): Promise<void> {
    const tipoEntrega = await this.findOne(id);
    await this.tipoEntregaRepository.remove(tipoEntrega);
  }
}
