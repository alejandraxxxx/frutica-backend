import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateListaDeseoDto } from './dto/create-lista-deseo.dto';
import { UpdateListaDeseoDto } from './dto/update-lista-deseo.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ListaDeseos } from './entities/lista-deseo.entity';
import { Producto } from 'src/productos/entities/productos.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

// lista-deseos.service.ts
@Injectable()
export class ListaDeseosService {
  constructor(
    @InjectRepository(ListaDeseos)
    private listaRepo: Repository<ListaDeseos>,
    @InjectRepository(Producto)
    private productoRepo: Repository<Producto>,
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
  ) {}

  async agregar(usuarioId: number, productoId: number) {
    const existe = await this.listaRepo.findOne({ where: { usuario: { usuario_k: usuarioId }, producto: { producto_k: productoId } } });
    if (existe) throw new BadRequestException('Ya está en tu lista');

    const usuario = await this.usuarioRepo.findOne({ where: { usuario_k: usuarioId } });
    const producto = await this.productoRepo.findOne({ where: { producto_k: productoId } });

    const item = this.listaRepo.create({ usuario, producto });
    return this.listaRepo.save(item);
  }

  async quitar(usuarioId: number, productoId: number) {
    const item = await this.listaRepo.findOne({
      where: {
        usuario: { usuario_k: usuarioId },
        producto: { producto_k: productoId },
      },
    });
    if (!item) throw new NotFoundException('No existe en tu lista');
    return this.listaRepo.remove(item);
  }

  async obtenerPorUsuario(usuarioId: number) {
    return this.listaRepo.find({
      where: { usuario: { usuario_k: usuarioId } },
      relations: ['producto'],
    });
  }
}
