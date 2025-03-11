import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { Credencial } from 'src/credenciales/entities/credencial.entity';


@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,

    @InjectRepository(Credencial)
    private credencialRepository: Repository<Credencial>,
  ) {}

  async findAll() {
    return this.usuarioRepository.find({ relations: ['credencial'] });
  }

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const { nombre, apellido_paterno, apellido_materno, telefono, correo_electronico, contrasena } = createUsuarioDto;

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Crear la credencial
    const nuevaCredencial = this.credencialRepository.create({
      email: correo_electronico,
      password_hash: hashedPassword,
    });
    const credencialGuardada = await this.credencialRepository.save(nuevaCredencial);

    // Crear el usuario
    const nuevoUsuario = this.usuarioRepository.create({
      nombre,
      apellido_paterno,
      apellido_materno,
      telefono,
      credencial: credencialGuardada,
    });

    return this.usuarioRepository.save(nuevoUsuario);
  }


  findOne(id: number) {
    return this.usuarioRepository.findOne({ where: { usuario_k: id }, relations: ['credencial'] });
  }

  async update(id: number, updateUsuarioDto: Partial<CreateUsuarioDto>) {
    await this.usuarioRepository.update(id, updateUsuarioDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const usuario = await this.findOne(id);
    if (usuario) {
      await this.usuarioRepository.delete(id);
      return { message: 'Usuario eliminado' };
    }
    return { message: 'Usuario no encontrado' };
  }

  /*create(createUsuarioDto: CreateUsuarioDto) {
    return 'This action adds a new usuario';
  }

  findAll() {
    return `This action returns all usuarios`;
  }

  findOne(id: number) {
    return `This action returns a #${id} usuario`;
  }

  update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    return `This action updates a #${id} usuario`;
  }

  remove(id: number) {
    return `This action removes a #${id} usuario`;
  }*/
}
