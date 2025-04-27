import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatosPersonales } from './entities/datos-personale.entity';
import { CreateDatosPersonaleDto } from './dto/create-datos-personale.dto';
import { UpdateDatosPersonaleDto } from './dto/update-datos-personale.dto';
import { Usuario } from 'src/usuarios/entities/usuario.entity'; // 🔥 Necesario para relaciones

@Injectable()
export class DatosPersonalesService {
  constructor(
    @InjectRepository(DatosPersonales)
    private readonly datosPersonalesRepository: Repository<DatosPersonales>,

    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>, // 🔥 Añadimos para buscar usuarios
  ) {}

  async create(createDatosPersonaleDto: CreateDatosPersonaleDto) {
    const nuevoDato = this.datosPersonalesRepository.create(createDatosPersonaleDto);
    return await this.datosPersonalesRepository.save(nuevoDato);
  }

  async findAll() {
    return await this.datosPersonalesRepository.find({ relations: ['usuario'] });
  }

  async findOne(id: number) {
    const dato = await this.datosPersonalesRepository.findOne({ 
      where: { cliente_k: id }, 
      relations: ['usuario'] 
    });
    if (!dato) throw new NotFoundException(`DatosPersonales con ID ${id} no encontrados`);
    return dato;
  }

  async update(id: number, updateDatosPersonaleDto: UpdateDatosPersonaleDto) {
    const dato = await this.findOne(id);
    Object.assign(dato, updateDatosPersonaleDto);
    return await this.datosPersonalesRepository.save(dato);
  }

  async remove(id: number) {
    const dato = await this.findOne(id);
    return await this.datosPersonalesRepository.remove(dato);
  }

  async findByUsuarioId(usuarioId: number) {
    return await this.datosPersonalesRepository.findOne({
      where: { usuario: { usuario_k: usuarioId } },
      relations: ['usuario'],
    });
  }

  // 🔥 NUEVO método crearOActualizar
  async crearOActualizar(
    usuarioId: number, 
    { rfc, razon_social, uso_factura, tipo_persona }: { rfc: string, razon_social: string, uso_factura: string, tipo_persona: string }
  ) {
    const usuario = await this.usuariosRepository.findOne({ where: { usuario_k: usuarioId } });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    let datosPersonales = await this.datosPersonalesRepository.findOne({ 
      where: { usuario: { usuario_k: usuarioId } },
      relations: ['usuario']
    });

    if (datosPersonales) {
      // Actualizar existentes
      datosPersonales.rfc = rfc;
      datosPersonales.razon_social = razon_social;
      datosPersonales.uso_factura = uso_factura;
      datosPersonales.tipo_persona = tipo_persona === 'FISICA' ? 1 : 2;
    } else {
      // Crear nuevos si no existen
      datosPersonales = this.datosPersonalesRepository.create({
        rfc,
        razon_social,
        uso_factura,
        tipo_persona: tipo_persona === 'FISICA' ? 1 : 2,
        usuario: usuario,
      });
    }

    return await this.datosPersonalesRepository.save(datosPersonales);
  }
}
