// src/usuarios/usuarios.service.ts
import {  Injectable, ConflictException,  NotFoundException,} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UserRole, Usuario } from './entities/usuario.entity';
import { Credencial } from '../credenciales/entities/credencial.entity';
import { EmailService } from 'src/email/email.service';
import { DataSource } from 'typeorm';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Credencial)
    private readonly credencialRepository: Repository<Credencial>,

    private readonly emailService: EmailService,
    private readonly dataSource: DataSource,
  ) {}

  // Buscar por ID con credenciales
  async findById(id: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { usuario_k: id },
      relations: ['credenciales'],
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return usuario;
  }

  // Buscar por email en la tabla Credencial (útil para login)
  async findByEmail(email: string) {
    return this.credencialRepository.findOne({
      where: { email },
      relations: ['usuario'],
    });
  }

  // Crear usuario + credencial
  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const {
      nombre,
      apellido_paterno,
      apellido_materno,
      telefono,
      correo_electronico,
      contrasena,
      role,
    } = createUsuarioDto;

    // Validar correo único (en Credencial)
    const existeCorreo = await this.credencialRepository.findOne({
      where: { email: correo_electronico },
    });
    if (existeCorreo) {
      throw new ConflictException('El correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Crear usuario
    const nuevoUsuario = this.usuarioRepository.create({
      nombre,
      apellido_paterno,
      apellido_materno,
      telefono,
      role: role ? UserRole[role.toUpperCase()] : UserRole.USER,
      user_verificado:true,
    });
    await this.usuarioRepository.save(nuevoUsuario);

    // Crear credencial
    const nuevaCredencial = this.credencialRepository.create({
      email: correo_electronico,
      password_hash: hashedPassword,
      usuario: nuevoUsuario,
    });
    await this.credencialRepository.save(nuevaCredencial);

    // Correo de bienvenida
    await this.emailService.enviarBienvenida(correo_electronico, nombre);

    return nuevoUsuario;
  }

  // Actualizar datos del usuario
  async update(id: number, updateUsuarioDto: Partial<CreateUsuarioDto>) {
    const usuario = await this.findById(id);
    // Evita sobreescribir campos que no pertenecen a Usuario (ej. correo_electronico va en Credencial)
    const {
      correo_electronico, // ignorado aquí
      contrasena, // ignorado aquí
      ...soloUsuario
    } = updateUsuarioDto;

    Object.assign(usuario, soloUsuario);
    return await this.usuarioRepository.save(usuario);
  }

  // Actualizar contraseña (y notificar por email)
  async updatePassword(usuarioId: number, newPassword: string) {
    // Buscar credencial por usuario
    const cred = await this.credencialRepository.findOne({
      where: { usuario: { usuario_k: usuarioId } },
      relations: ['usuario'],
    });
    if (!cred) {
      throw new NotFoundException('No se encontró la credencial del usuario.');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    cred.password_hash = hashed;
    await this.credencialRepository.save(cred);

    // Notificar cambio de contraseña (si tenemos email)
    if (cred.email) {
      await this.emailService.enviarCambioContrasena(
        cred.email,
        cred.usuario?.nombre ?? 'usuario',
      );
    }

    return { message: 'Contraseña actualizada correctamente' };
  }

  // Activar/desactivar cuenta (by admin) + correo
  async toggleVerificado(id: number, verificado: boolean) {
    const user = await this.usuarioRepository.findOne({
      where: { usuario_k: id },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.user_verificado = verificado;
    await this.usuarioRepository.save(user);

    // Obtener email desde Credencial (si no está en Usuario)
    let email: string | null = (user as any).email ?? null;
    if (!email) {
      const cred = await this.credencialRepository.findOne({
        where: { usuario: { usuario_k: id } },
        relations: ['usuario'],
      });
      email = cred?.email ?? null; // OJO: el campo correcto es 'email'
    }

    if (email) {
      await this.emailService.enviarEstadoCuenta(
        email,
        user.nombre ?? 'usuario',
        verificado,
        //'https://frutica.app/ayuda', // soporte_url (si quieres)
      );
    }

    return { ok: true, user_verificado: user.user_verificado };
  }

  // Eliminar usuario
  async remove(id: number) {
    await this.findById(id); // valida existencia
    await this.usuarioRepository.delete(id);
    return { message: 'Usuario eliminado correctamente' };
  }

  // Listar todos
  async findAll() {
    return await this.usuarioRepository.find({ relations: ['credenciales'] });
  }

  // Obtener uno
  async findOne(id: number) {
    return this.findById(id);
  }

  // (Si quieres mantener un setter simple)
  async setVerificado(id: number, verificado: boolean): Promise<Usuario> {
    const usuario = await this.findById(id);
    usuario.user_verificado = verificado;
    return this.usuarioRepository.save(usuario);
  }
}
