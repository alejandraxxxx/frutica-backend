import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCarritoDto } from './dto/create-carrito.dto';
import { UpdateCarritoDto } from './dto/update-carrito.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Carrito } from './entities/carrito.entity';
import { CarritoItem } from 'src/carrito-item/entities/carrito-item.entity';
import { Producto } from 'src/productos/entities/productos.entity';
import { Repository } from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Injectable()
export class CarritoService {

  constructor(
    @InjectRepository(Carrito) private carritoRepo: Repository<Carrito>,
    @InjectRepository(CarritoItem) private carritoItemRepo: Repository<CarritoItem>,
    @InjectRepository(Producto) private productoRepo: Repository<Producto>,
    @InjectRepository(Usuario) private usuarioRepo: Repository<Usuario>,

) {}
async obtenerCarrito(usuarioId: number) {
    const usuario = await this.usuarioRepo.findOne({ where: { usuario_k: usuarioId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
  
    const carrito = await this.carritoRepo.findOne({
        where: { usuario },
        relations: ['items', 'items.producto']
    });
  
    if (!carrito) {
        throw new NotFoundException('Carrito no encontrado');
    }
  
    // Calcular el total de la compra sumando los precios totales de los productos
    const totalCompra = carrito.items.reduce((total, item) => {
        return total + item.cantidad * item.producto.precio_estimado;
    }, 0);
  
    return {
        id: carrito.id,
        total_compra: totalCompra, // Agregamos el total de la compra
        items: carrito.items.map(item => ({
            id: item.id,
            cantidad: item.cantidad,
            tipo_medida: item.tipo_medida,
            precio_total: item.cantidad * item.producto.precio_estimado,
            peso_seleccionado: item.peso_seleccionado,
            producto: {
                producto_k: item.producto.producto_k,
                codigo_producto: item.producto.codigo_producto,
                nombre: item.producto.nombre,
                precio_estimado: item.producto.precio_estimado,
                unidad_venta: item.producto.unidad_venta
            }
        }))
    };
  }
  

async agregarProducto(data: { usuarioId: number, productoId: number, cantidad: number }) {
    const usuario = await this.usuarioRepo.findOne({ where: { usuario_k: data.usuarioId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    let carrito = await this.carritoRepo.findOne({ 
        where: { usuario }, 
        relations: ['items', 'items.producto']
    });

    if (!carrito) {
        carrito = this.carritoRepo.create({ usuario, items: [] });
        await this.carritoRepo.save(carrito);
    }

    const producto = await this.productoRepo.findOne({ where: { producto_k: data.productoId } });
    if (!producto) throw new NotFoundException('Producto no encontrado');

    let item = carrito.items.find(i => i.producto.producto_k === data.productoId);
    if (item) {
        item.cantidad += data.cantidad;
    } else {
        item = this.carritoItemRepo.create({
            carrito,
            producto,
            cantidad: data.cantidad,
            tipo_medida: producto.unidad_venta as "kg" | "piezas",
        });
        carrito.items.push(item);
    }

    // **Aquí calculamos el precio total**
    item.precio_total = item.cantidad * producto.precio_estimado;

    await this.carritoItemRepo.save(item);
    await this.carritoRepo.save(carrito);

  //  Excluir la referencia cíclica del carrito en la respuesta
  return {
      id: carrito.id,
      items: carrito.items.map(item => ({
          id: item.id,
          cantidad: item.cantidad,
          peso_seleccionado: item.peso_seleccionado,
          producto: {
              producto_k: item.producto.producto_k,
              nombre: item.producto.nombre,
              codigo_producto: item.producto.codigo_producto,
              precio_estimado: item.producto.precio_estimado,
              unidad_venta: item.producto.unidad_venta,
              requiere_pesaje: item.producto.requiere_pesaje,
              usa_tamano: item.producto.usa_tamano,
              tamano: item.producto.tamano,
              peso_total: item.producto.peso_total
          }
      }))
  };
}




//  Actualizar cantidad de un producto en el carrito
async editarProducto(usuarioId: number, productoId: number, nuevaCantidad: number) {
  const carrito = await this.carritoRepo.findOne({
      where: { usuario: { usuario_k: usuarioId } },
      relations: ['items', 'items.producto'],
  });

  if (!carrito) {
      throw new NotFoundException('Carrito no encontrado');
  }

  const item = carrito.items.find(i => i.producto.producto_k === productoId);
  if (!item) {
      throw new NotFoundException('Producto no encontrado en el carrito');
  }

  // Actualizar cantidad y peso seleccionado
  item.cantidad = nuevaCantidad;
  item.peso_seleccionado = item.producto.requiere_pesaje 
      ? (item.producto.unidad_peso === 'kg' ? nuevaCantidad * 1000 : nuevaCantidad) 
      : null;

  await this.carritoRepo.save(carrito);
  return { message: 'Cantidad actualizada', carrito };
}


async eliminarProducto(usuarioId: number, productoId: number) {
  const carrito = await this.carritoRepo.findOne({
      where: { usuario: { usuario_k: usuarioId } },
      relations: ['items', 'items.producto'],
  });

  if (!carrito) {
      throw new NotFoundException('Carrito no encontrado');
  }

  // Filtrar productos del carrito
  carrito.items = carrito.items.filter(item => item.producto.producto_k !== productoId);

  // Si el carrito queda vacío, eliminarlo
  if (carrito.items.length === 0) {
      await this.carritoRepo.remove(carrito);
      return { message: 'Carrito eliminado' };
  }

  // Guardar cambios en la BD
  await this.carritoRepo.save(carrito);
  return { message: 'Producto eliminado del carrito', carrito };
}
}