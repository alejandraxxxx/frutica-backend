import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credencial } from './entities/credencial.entity';
import { CreateCredencialeDto } from './dto/create-credenciale.dto';
import { UpdateCredencialeDto } from './dto/update-credenciale.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CredencialesService {
  constructor(
    @InjectRepository(Credencial)
    private readonly credencialesRepository: Repository<Credencial>,
  ) {}

  async create(createCredencialeDto: CreateCredencialeDto): Promise<Credencial> {
    const nuevaCredencial = this.credencialesRepository.create(createCredencialeDto);
    return await this.credencialesRepository.save(nuevaCredencial);
  }

  async findAll(): Promise<Credencial[]> {
    return await this.credencialesRepository.find();
  }

  async findOne(id: number): Promise<Credencial> {
    const credencial = await this.credencialesRepository.findOne({ where: { credential_k: id } });
    if (!credencial) {
      throw new NotFoundException(`Credencial con ID ${id} no encontrada`);
    }
    return credencial;
  }

  async update(id: number, updateCredencialeDto: UpdateCredencialeDto): Promise<Credencial> {
    const credencial = await this.findOne(id);
    Object.assign(credencial, updateCredencialeDto);
    return await this.credencialesRepository.save(credencial);
  }

  async remove(id: number): Promise<void> {
    const credencial = await this.findOne(id);
    await this.credencialesRepository.remove(credencial);
  }

  // 🔥 Función extra: buscar por usuarioId
  async findByUsuarioId(usuarioId: number): Promise<Credencial> {
    return await this.credencialesRepository.findOne({
      where: { usuario: { usuario_k: usuarioId } },
      relations: ['usuario'],
    });
  }

  // 🔥 Función extra: actualizar contraseña segura
  async actualizarPassword(usuarioId: number, currentPassword: string, newPassword: string) {
    const credencial = await this.credencialesRepository.findOne({
      where: { usuario: { usuario_k: usuarioId } },
      relations: ['usuario'],
    });

    if (!credencial) {
      throw new NotFoundException('Credencial no encontrada');
    }

    const passwordValida = await bcrypt.compare(currentPassword, credencial.password_hash);
    if (!passwordValida) {
      throw new BadRequestException('La contraseña actual no es correcta');
    }

    const salt = await bcrypt.genSalt();
    const nuevaPasswordHasheada = await bcrypt.hash(newPassword, salt);

    credencial.password_hash = nuevaPasswordHasheada;
    await this.credencialesRepository.save(credencial);

    return { message: 'Contraseña actualizada exitosamente' };
  }
}
