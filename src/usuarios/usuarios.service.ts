import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole, Usuario } from './entities/usuario.entity';
import { Credencial } from '../credenciales/entities/credencial.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,

    @InjectRepository(Credencial)
    private credencialRepository: Repository<Credencial>,
  ) {}

  // Obtener todos los usuarios con credenciales
  async findAll() {
    return this.usuarioRepository.find({ relations: ['credenciales'] });
  }

  // Buscar un usuario por ID
  async findOne(id: number) {
    const usuario = await this.usuarioRepository.findOne({ where: { usuario_k: id }, relations: ['credenciales'] });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return usuario;
  }

  //  Actualizar usuario
  async update(id: number, updateUsuarioDto: Partial<CreateUsuarioDto>) {
    const usuario = await this.findOne(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.usuarioRepository.update(id, updateUsuarioDto);
    return this.findOne(id);
  }

  // Eliminar usuario
  async remove(id: number) {
    const usuario = await this.findOne(id);
    if (usuario) {
      await this.usuarioRepository.delete(id);
      return { message: 'Usuario eliminado' };
    }
    throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
  }

  //Crear un usuario y su credencial
  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    console.log(' DTO recibido:', createUsuarioDto);

    const { nombre, apellido_paterno, apellido_materno, telefono, correo_electronico, contrasena, role } = createUsuarioDto;

    // 1️Verificar si el correo ya está registrado
    const existeCorreo = await this.credencialRepository.findOne({ where: { email: correo_electronico } });
    if (existeCorreo) {
      throw new ConflictException('El correo ya está registrado');
    }

    //  Hashear la contraseña antes de guardarla
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

    // 3️Crear usuario en la tabla `usuarios`
    const nuevoUsuario = this.usuarioRepository.create({
      nombre,
      apellido_paterno,
      apellido_materno,
      telefono,
      role: role ? UserRole[role.toUpperCase()] : UserRole.USER
    });

    await this.usuarioRepository.save(nuevoUsuario);

    // Crear credencial con email y contraseña hasheada
    const nuevaCredencial = this.credencialRepository.create({
      email: correo_electronico,
      password_hash: hashedPassword,
      usuario: nuevoUsuario, // Se asocia directamente con el usuario
    });

    await this.credencialRepository.save(nuevaCredencial);

    return nuevoUsuario;
  }
}
