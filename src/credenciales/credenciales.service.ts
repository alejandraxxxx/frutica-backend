import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credencial } from './entities/credencial.entity';
import { CreateCredencialeDto } from './dto/create-credenciale.dto';
import { UpdateCredencialeDto } from './dto/update-credenciale.dto';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/email/email.service';


@Injectable()
export class CredencialesService {
  emailService: any;
  constructor(
    @InjectRepository(Credencial)
    private readonly credencialesRepository: Repository<Credencial>,
  ) { }

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
  // credenciales.service.ts

  async actualizarPassword(usuarioId: number, currentPassword: string, newPassword: string) {
    const credencial = await this.credencialesRepository.findOne({
      where: { usuario: { usuario_k: usuarioId } },
      relations: ['usuario'],
    });
    if (!credencial) throw new NotFoundException('Credencial no encontrada');

    const ok = await bcrypt.compare(currentPassword, credencial.password_hash);
    if (!ok) throw new BadRequestException('La contraseña actual no es correcta');

    // evita misma contraseña y aplica reglas mínimas
    if (await bcrypt.compare(newPassword, credencial.password_hash)) {
      throw new BadRequestException('La nueva contraseña no puede ser igual a la actual');
    }
    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException('La nueva contraseña debe tener al menos 8 caracteres');
    }

    credencial.password_hash = await bcrypt.hash(newPassword, 10);
    await this.credencialesRepository.save(credencial);

    // enviar correo (sin romper si falla)
    try {
      await this.emailService.enviarCambioContrasena(
        credencial.email,
        credencial.usuario?.nombre ?? 'usuario',
      );
    } catch (e) {
      console.error('No se pudo enviar el correo de cambio de contraseña:', e);
    }

    return { message: 'Contraseña actualizada correctamente' };
  }
} 
