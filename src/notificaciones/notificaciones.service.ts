import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificacioneDto } from './dto/create-notificacione.dto';
import { UpdateNotificacioneDto } from './dto/update-notificacione.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Notificacion } from './entities/notificacion.entity';
import { Repository } from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Injectable()
export class NotificacionService {
    constructor(
        @InjectRepository(Notificacion)
        private readonly notificacionRepository: Repository<Notificacion>,
        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,
    ) {}

    async create(createNotificacionDto: CreateNotificacioneDto): Promise<Notificacion> {
        const usuario = await this.usuarioRepository.findOne({ where: { usuario_k: createNotificacionDto.usuarioUsuarioK } });
        if (!usuario) {
            throw new NotFoundException(`Usuario con ID ${createNotificacionDto.usuarioUsuarioK} no encontrado`);
        }

        const nuevaNotificacion = this.notificacionRepository.create({
            ...createNotificacionDto,
            usuario,
        });

        return await this.notificacionRepository.save(nuevaNotificacion);
    }

    async findAll(): Promise<Notificacion[]> {
        return await this.notificacionRepository.find({ relations: ['usuario'] });
    }

    async findOne(id: number): Promise<Notificacion> {
        const notificacion = await this.notificacionRepository.findOne({ where: { notificacion_k: id }, relations: ['usuario'] });
        if (!notificacion) {
            throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
        }
        return notificacion;
    }

    async update(id: number, updateNotificacionDto: UpdateNotificacioneDto): Promise<Notificacion> {
        const notificacion = await this.findOne(id);
        Object.assign(notificacion, updateNotificacionDto);
        return await this.notificacionRepository.save(notificacion);
    }

    async remove(id: number): Promise<void> {
        const notificacion = await this.findOne(id);
        await this.notificacionRepository.remove(notificacion);
    }
}
