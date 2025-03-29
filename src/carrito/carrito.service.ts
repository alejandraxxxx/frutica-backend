import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carrito } from './entities/carrito.entity';
import { CarritoItem } from 'src/carrito-item/entities/carrito-item.entity';
import { Producto } from 'src/productos/entities/productos.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { CreateCarritoDto } from './dto/create-carrito.dto';

@Injectable()
export class CarritoService {
  constructor(
    @InjectRepository(Carrito) private carritoRepo: Repository<Carrito>,
    @InjectRepository(CarritoItem) private carritoItemRepo: Repository<CarritoItem>,
    @InjectRepository(Producto) private productoRepo: Repository<Producto>,
    @InjectRepository(Usuario) private usuarioRepo: Repository<Usuario>,
  ) {}

  private calcularPrecioUnitario(producto: Producto, tipo_medida: 'kg' | 'pieza', tamano?: 'Chico' | 'Mediano' | 'Grande'): number {
    if (producto.usa_tamano && tamano) {
      const peso =
        tamano === 'Chico' ? producto.peso_chico :
        tamano === 'Mediano' ? producto.peso_mediano :
        producto.peso_grande;
  
      return peso && producto.precio_por_kg
        ? (peso / 1000) * producto.precio_por_kg
        : 0;
    }
  
    if (tipo_medida === 'kg' && producto.precio_por_kg) {
      return producto.precio_por_kg;
    }
  
    if (tipo_medida === 'pieza' && producto.precio_por_pieza) {
      return producto.precio_por_pieza;
    }
  
    return 0;
  }
  

  async obtenerCarrito(usuarioId: number) {
    const usuario = await this.usuarioRepo.findOne({ where: { usuario_k: usuarioId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
  
    const carrito = await this.carritoRepo.findOne({
      where: { usuario },
      relations: ['items', 'items.producto'],
    });
  
    if (!carrito) throw new NotFoundException('Carrito no encontrado');
  
    const totalCompra = carrito.items.reduce((total, item) => {
      const unitPrice = this.calcularPrecioUnitario(item.producto, item.tipo_medida, item.tamano);
      return total + item.cantidad * unitPrice;
    }, 0);
  
    return {
      id: carrito.id,
      total_compra: totalCompra,
      items: carrito.items.map(item => {
        const precioUnitario = this.calcularPrecioUnitario(item.producto, item.tipo_medida, item.tamano);
        return {
          id: item.id,
          cantidad: item.cantidad,
          tipo_medida: item.tipo_medida,
          tamano: item.tamano,
          precio_total: item.cantidad * precioUnitario,
          peso_seleccionado: item.peso_seleccionado,
          producto: {
            producto_k: item.producto.producto_k,
            codigo_producto: item.producto.codigo_producto,
            nombre: item.producto.nombre,
            precio_estimado: precioUnitario,
            unidad_venta: item.producto.unidad_venta,
            requiere_pesaje: item.producto.requiere_pesaje,
            usa_tamano: item.producto.usa_tamano,
            peso_total: item.producto.peso_total,
          }
        };
      })
    };
  }
  

  async agregarProducto(data: CreateCarritoDto) {
    const { usuarioId, productoId, cantidad, tipo_medida, tamano, peso_personalizado } = data;
  
    const usuario = await this.usuarioRepo.findOne({ where: { usuario_k: usuarioId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
  
    let carrito = await this.carritoRepo.findOne({
      where: { usuario },
      relations: ['items', 'items.producto']
    });
  
    if (!carrito) {
      carrito = this.carritoRepo.create({ usuario, items: [] });
      await this.carritoRepo.save(carrito);
    }
  
    const producto = await this.productoRepo.findOne({ where: { producto_k: productoId } });
    if (!producto) throw new NotFoundException('Producto no encontrado');
  
    // Calcular el precio unitario según medida y tamaño
    const precioUnitario = this.calcularPrecioUnitario(producto, tipo_medida, tamano);
  
    // Calcular peso si requiere pesaje
    const pesoCalculado = producto.requiere_pesaje
      ? peso_personalizado ??
        (producto.usa_tamano && tamano
          ? tamano === 'Chico' ? producto.peso_chico :
            tamano === 'Mediano' ? producto.peso_mediano :
            producto.peso_grande
          : tipo_medida === 'kg' ? cantidad * 1000 : cantidad)
      : null;
  
    // 🔎 Buscar si ya hay un item con el mismo producto + medida + tamaño
    let item = carrito.items.find(i =>
      i.producto.producto_k === productoId &&
      i.tipo_medida === tipo_medida &&
      ((i.tamano === tamano) || (i.tamano == null && tamano == null))
    );
  
    if (item) {
      item.cantidad += cantidad;
      item.peso_seleccionado = pesoCalculado;
      item.precio_total = item.cantidad * precioUnitario;
    } else {
      item = this.carritoItemRepo.create({
        carrito,
        producto,
        cantidad,
        tipo_medida,
        tamano,
        peso_seleccionado: pesoCalculado,
        precio_total: cantidad * precioUnitario,
      });
      carrito.items.push(item);
    }
  
    await this.carritoItemRepo.save(item);
    await this.carritoRepo.save(carrito);
  
    return {
      id: carrito.id,
      items: carrito.items.map(item => ({
        id: item.id,
        cantidad: item.cantidad,
        peso_seleccionado: item.peso_seleccionado,
        tipo_medida: item.tipo_medida,
        tamano: item.tamano,
        precio_total: item.precio_total,
        producto: {
          producto_k: item.producto.producto_k,
          nombre: item.producto.nombre,
          codigo_producto: item.producto.codigo_producto,
          precio_estimado: this.calcularPrecioUnitario(item.producto, item.tipo_medida, item.tamano),
          unidad_venta: item.producto.unidad_venta,
          requiere_pesaje: item.producto.requiere_pesaje,
          usa_tamano: item.producto.usa_tamano,
          peso_total: item.producto.peso_total
        }
      }))
    };
  }
  

  async editarProducto(
    usuarioId: number,
    productoId: number,
    nuevaCantidad: number,
    tipo_medida: 'kg' | 'pieza',
    tamano?: 'Chico' | 'Mediano' | 'Grande',
    peso_personalizado?: number
  ) {
    const carrito = await this.carritoRepo.findOne({
      where: { usuario: { usuario_k: usuarioId } },
      relations: ['items', 'items.producto'],
    });
  
    if (!carrito) throw new NotFoundException('Carrito no encontrado');
  
    const item = carrito.items.find(i => i.producto.producto_k === productoId);
    if (!item) throw new NotFoundException('Producto no encontrado en el carrito');
  
    const producto = item.producto;
  
    // Validación si el producto usa tamaño
    if (producto.usa_tamano && !tamano) {
      throw new Error('Debe seleccionar un tamaño para este producto');
    }
  
    item.cantidad = nuevaCantidad;
    item.tipo_medida = tipo_medida;
    item.tamano = tamano;
  
    const precioUnitario = this.calcularPrecioUnitario(producto, tipo_medida, tamano);
  
    item.peso_seleccionado = producto.requiere_pesaje
      ? peso_personalizado ??
        (producto.usa_tamano && tamano
          ? tamano === 'Chico' ? producto.peso_chico :
            tamano === 'Mediano' ? producto.peso_mediano :
            producto.peso_grande
          : tipo_medida === 'kg' ? nuevaCantidad * 1000 : nuevaCantidad)
      : null;
  
    item.precio_total = nuevaCantidad * precioUnitario;
  
    await this.carritoItemRepo.save(item);
  
    return {
      message: 'Producto actualizado en el carrito',
      item: {
        id: item.id,
        cantidad: item.cantidad,
        tipo_medida: item.tipo_medida,
        peso_seleccionado: item.peso_seleccionado,
        precio_total: item.precio_total,
        tamano: item.tamano,
        producto: {
          producto_k: producto.producto_k,
          nombre: producto.nombre,
          codigo_producto: producto.codigo_producto,
          unidad_venta: producto.unidad_venta,
          requiere_pesaje: producto.requiere_pesaje
        }
      }
    };
  }
  

  async eliminarProducto(usuarioId: number, productoId: number) {
    const carrito = await this.carritoRepo.findOne({
      where: { usuario: { usuario_k: usuarioId } },
      relations: ['items', 'items.producto'],
    });

    if (!carrito) {
      throw new NotFoundException('Carrito no encontrado');
    }

    carrito.items = carrito.items.filter(item => item.producto.producto_k !== productoId);

    if (carrito.items.length === 0) {
      await this.carritoRepo.remove(carrito);
      return { message: 'Carrito eliminado' };
    }

    await this.carritoRepo.save(carrito);
    return { message: 'Producto eliminado del carrito', carrito };
  }


  async vaciarCarrito(usuarioId: number) {
    const carrito = await this.carritoRepo.findOne({
      where: { usuario: { usuario_k: usuarioId } },
      relations: ['items'],
    });
  
    if (!carrito) {
      throw new NotFoundException('Carrito no encontrado');
    }
  
    // Elimina todos los items del carrito
    await this.carritoItemRepo.remove(carrito.items);
  
    // El carrito queda vacío pero sigue existiendo
    return { message: 'Carrito vaciado exitosamente (carrito conservado)' };
  }
  
  
  
}
