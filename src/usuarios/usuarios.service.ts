import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole, Usuario } from './entities/usuario.entity';
import { Credencial } from '../credenciales/entities/credencial.entity';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,

    @InjectRepository(Credencial)
    private credencialRepository: Repository<Credencial>,
    private readonly emailService: EmailService,
  ) { }

  // 🧩 Buscar por ID
  async findById(id: number) {
    const usuario = await this.usuarioRepository.findOne({ where: { usuario_k: id }, relations: ['credenciales'] });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return usuario;
  }

  // 🧩 Buscar por correo (útil para login después)
  async findByEmail(email: string) {
    return this.credencialRepository.findOne({ where: { email }, relations: ['usuario'] });
  }

  // 🔥 Crear usuario y credencial
  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const { nombre, apellido_paterno, apellido_materno, telefono, correo_electronico, contrasena, role } = createUsuarioDto;

    // Validar si el correo ya existe
    const existeCorreo = await this.credencialRepository.findOne({ where: { email: correo_electronico } });
    if (existeCorreo) {
      throw new ConflictException('El correo ya está registrado');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

    // Crear usuario
    const nuevoUsuario = this.usuarioRepository.create({
      nombre,
      apellido_paterno,
      apellido_materno,
      telefono,
      role: role ? UserRole[role.toUpperCase()] : UserRole.USER
    });

    await this.usuarioRepository.save(nuevoUsuario);

    // Crear credencial
    const nuevaCredencial = this.credencialRepository.create({
      email: correo_electronico,
      password_hash: hashedPassword,
      usuario: nuevoUsuario,
    });

    await this.credencialRepository.save(nuevaCredencial);

    //Enviar correo de bienvenida
    await this.emailService.enviarBienvenida(correo_electronico, nombre);

    return nuevoUsuario;
  }

  // 🛠 Actualizar datos del usuario
  async update(id: number, updateUsuarioDto: Partial<CreateUsuarioDto>) {
    const usuario = await this.findById(id);

    Object.assign(usuario, updateUsuarioDto);
    return await this.usuarioRepository.save(usuario);
  }

  // 🛠 Actualizar contraseña
  async updatePassword(usuarioId: number, newPassword: string) {
    const usuario = await this.findById(usuarioId);

    if (!usuario.credenciales || usuario.credenciales.length === 0) {
      throw new NotFoundException('No se encontró la credencial del usuario.');
    }

    const credencial = usuario.credenciales[0];

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    credencial.password_hash = hashedPassword;
    await this.credencialRepository.save(credencial);

    return { message: 'Contraseña actualizada correctamente' };
  }

  //Activar/desactivar cuenta by admin
  async setVerificado(id: number, verificado: boolean): Promise<Usuario> {
  const usuario = await this.findById(id);
  usuario.user_verificado = verificado;
  return this.usuarioRepository.save(usuario);
}


  // 🗑 Eliminar usuario
  async remove(id: number) {
    const usuario = await this.findById(id);
    await this.usuarioRepository.delete(id);
    return { message: 'Usuario eliminado correctamente' };
  }

  // 🔎 Obtener todos los usuarios
  async findAll() {
    return await this.usuarioRepository.find({ relations: ['credenciales'] });
  }

  // 🔎 Obtener uno
  async findOne(id: number) {
    return this.findById(id);
  }
}