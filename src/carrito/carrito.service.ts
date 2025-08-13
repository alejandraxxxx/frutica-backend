import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Carrito } from './entities/carrito.entity';
import { CarritoItem } from 'src/carrito-item/entities/carrito-item.entity';
import { Producto } from 'src/productos/entities/productos.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { CreateCarritoDto } from './dto/create-carrito.dto';
import { ListaDeseos } from 'src/lista-deseos/entities/lista-deseo.entity';

@Injectable()
export class CarritoService {
  constructor(
    @InjectRepository(Carrito) private carritoRepo: Repository<Carrito>,
    @InjectRepository(CarritoItem) private carritoItemRepo: Repository<CarritoItem>,
    @InjectRepository(Producto) private productoRepo: Repository<Producto>,
    @InjectRepository(Usuario) private usuarioRepo: Repository<Usuario>,
    @InjectRepository(ListaDeseos) private listaRepo: Repository<ListaDeseos>,

  ) {}

private calcularPrecioUnitario(producto: Producto, tipo_medida: 'kg' | 'pieza', tamano?: 'Chico' | 'Mediano' | 'Grande'): number {
  // 1. Productos SIN tamaño
  if (!producto.usa_tamano) {
    return tipo_medida === 'kg' ? producto.precio_por_kg : producto.precio_por_pieza;
  }

  // 2. Lógica para productos CON tamaño
  const pesosGramos = { // Asumimos que los pesos están en GRAMOS
    'Chico': producto.peso_chico,
    'Mediano': producto.peso_mediano,
    'Grande': producto.peso_grande
  };

  // Regla de oro: 
  // - Si precio_por_pieza existe → Producto pre-empaquetado (precio FIJO)
  // - Si no → Producto por peso (cálculo dinámico)
  return producto.precio_por_pieza 
    ? producto.precio_por_pieza // Precio FIJO para papaya
    : (pesosGramos[tamano] / 1000) * producto.precio_por_kg; // Para sandía
}

  async obtenerCarrito(usuarioId: number) {
    const usuario = await this.usuarioRepo.findOne({ where: { usuario_k: usuarioId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
  
    const carrito = await this.carritoRepo.findOne({
      where: { usuario },
      relations: ['items', 'items.producto'],
    });
  
    if (!carrito) throw new NotFoundException('Carrito no encontrado');
  
    // Cargar todos los productos del carrito con sus ofertas activas
    const productosIds = carrito.items.map(item => item.producto.producto_k);
    const productosConOfertas = await this.productoRepo.find({
      where: { producto_k: In(productosIds) },
      relations: ['ofertas'],
    });
  
    // Crear un mapa de productos con ofertas activas
    const productoMap = new Map<number, Producto>();
    productosConOfertas.forEach(p => productoMap.set(p.producto_k, p));
  
    const itemsProcesados = carrito.items.map(item => {
      const producto = productoMap.get(item.producto.producto_k)!;
      const precioUnitario = this.calcularPrecioConOferta(producto, item.tipo_medida, item.tamano);
  
      return {
        id: item.id,
        cantidad: item.cantidad,
        tipo_medida: item.tipo_medida,
        tamano: item.tamano,
        precio_total: item.cantidad * precioUnitario,
        peso_seleccionado: item.peso_seleccionado,
        producto: {
          producto_k: producto.producto_k,
          codigo_producto: producto.codigo_producto,
          nombre: producto.nombre,
          precio_estimado: precioUnitario,
          unidad_venta: producto.unidad_venta,
          requiere_pesaje: producto.requiere_pesaje,
          usa_tamano: producto.usa_tamano,
          peso_total: producto.peso_total,
        }
      };
    });
  
    const totalCompra = itemsProcesados.reduce((total, item) => total + item.precio_total, 0);
  
    return {
      id: carrito.id,
      total_compra: totalCompra,
      items: itemsProcesados
    };
  }
  
async agregarProducto(data: CreateCarritoDto) {
  const { usuarioId, productoId, cantidad, tipo_medida, tamano, peso_personalizado } = data;

  console.log('🛒 AGREGAR PRODUCTO - Datos recibidos:', {
    usuarioId,
    productoId,
    cantidad,
    tipo_medida,
    tamano,
    peso_personalizado
  });

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

  const producto = await this.productoRepo.findOne({
    where: { producto_k: productoId },
    relations: ['ofertas'],
  });

  if (!producto) throw new NotFoundException('Producto no encontrado');

  console.log('Producto encontrado:', {
    producto_k: producto.producto_k,
    nombre: producto.nombre,
    usa_tamano: producto.usa_tamano,
    requiere_pesaje: producto.requiere_pesaje,
    precio_por_kg: producto.precio_por_kg,
    precio_por_pieza: producto.precio_por_pieza,
    peso_chico: producto.peso_chico,
    peso_mediano: producto.peso_mediano,
    peso_grande: producto.peso_grande
  });

  // Validación de tamaño
  if (producto.usa_tamano && !tamano) {
    throw new BadRequestException('Debe seleccionar un tamaño para este producto que usa tamaños');
  }

  const precioUnitario = this.calcularPrecioConOferta(producto, tipo_medida, tamano);
  console.log('💰 Precio unitario calculado:', precioUnitario);

  if (precioUnitario <= 0) {
    throw new BadRequestException('No se pudo calcular el precio para este producto');
  }

  // Calcular peso
  const pesoCalculado = producto.requiere_pesaje
    ? peso_personalizado ?? (
        producto.usa_tamano && tamano
          ? tamano === 'Chico' ? producto.peso_chico :
            tamano === 'Mediano' ? producto.peso_mediano :
            producto.peso_grande
          : tipo_medida === 'kg' ? cantidad * 1000 : cantidad // en gramos
      )
    : null;

  console.log(' Peso calculado:', pesoCalculado);

  // Validación opcional
  if (producto.requiere_pesaje && !pesoCalculado && !producto.usa_tamano) {
    throw new BadRequestException('Peso personalizado requerido para este producto');
  }

  let item = carrito.items.find(i =>
    i.producto.producto_k === productoId &&
    i.tipo_medida === tipo_medida &&
    ((i.tamano === tamano) || (i.tamano == null && tamano == null))
  );

  const precioTotal = producto.requiere_pesaje
    ? (pesoCalculado / 1000) * precioUnitario
    : cantidad * precioUnitario;

  console.log('Precio total calculado:', precioTotal);

  if (item) {
    console.log('Actualizando item existente');
    item.cantidad += cantidad;
    item.peso_seleccionado = pesoCalculado;
    item.precio_total = producto.requiere_pesaje
      ? (pesoCalculado / 1000) * precioUnitario
      : item.cantidad * precioUnitario;
  } else {
    console.log('➕ Creando nuevo item');
    item = this.carritoItemRepo.create({
      carrito,
      producto,
      cantidad,
      tipo_medida,
      tamano,
      peso_seleccionado: pesoCalculado,
      precio_total: precioTotal,
    });
    carrito.items.push(item);
  }

  await this.carritoItemRepo.save(item);
  await this.carritoRepo.save(carrito);

  console.log('Item guardado correctamente:', {
    id: item.id,
    cantidad: item.cantidad,
    precio_total: item.precio_total,
    peso_seleccionado: item.peso_seleccionado,
    tipo_medida: item.tipo_medida,
    tamano: item.tamano
  });

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
  console.log('🔍 SERVICE - Parámetros recibidos:', {
    usuarioId,
    productoId,
    nuevaCantidad,
    tipo_medida,
    tamano,
    peso_personalizado
  });
  
const carrito = await this.carritoRepo.findOne({
    where: { usuario: { usuario_k: usuarioId } },
    relations: ['items', 'items.producto'],
  });

  if (!carrito) throw new NotFoundException('Carrito no encontrado');

  // 🔍 DEBUG: Mostrar todos los items del carrito
  console.log('📦 Items en carrito:', carrito.items.map(i => ({
    id: i.id,
    producto_k: i.producto.producto_k,
    nombre: i.producto.nombre,
    tipo_medida: i.tipo_medida,
    tamano: i.tamano,
    cantidad: i.cantidad
  })));

  const item = carrito.items.find(i =>
    i.producto.producto_k === productoId &&
    i.tipo_medida === tipo_medida &&
    ((i.tamano === tamano) || (i.tamano == null && tamano == null))
  );

  console.log('🎯 Item encontrado:', item ? 'SÍ' : 'NO');
  
  if (!item) {
    console.log('❌ Criterios de búsqueda:');
    console.log('   - Producto ID:', productoId);
    console.log('   - Tipo medida:', tipo_medida);
    console.log('   - Tamaño:', tamano);
    throw new NotFoundException('Producto no encontrado en el carrito');
  }
  const producto = await this.productoRepo.findOne({
    where: { producto_k: productoId },
    relations: ['ofertas'],
  });

  if (!producto) throw new NotFoundException('Producto no encontrado');

  if (producto.usa_tamano && !tamano) {
    throw new Error('Debe seleccionar un tamaño para este producto');
  }

  item.cantidad = nuevaCantidad;
  item.tipo_medida = tipo_medida;
  item.tamano = tamano;

  const precioUnitario = this.calcularPrecioConOferta(producto, tipo_medida, tamano);

  const pesoCalculado = producto.requiere_pesaje
    ? peso_personalizado ?? (
        producto.usa_tamano && tamano
          ? tamano === 'Chico' ? producto.peso_chico :
            tamano === 'Mediano' ? producto.peso_mediano :
            producto.peso_grande
          : tipo_medida === 'kg' ? nuevaCantidad * 1000 : nuevaCantidad
      )
    : null;

  if (producto.requiere_pesaje && !pesoCalculado && !producto.usa_tamano) {
    throw new BadRequestException('Peso personalizado requerido para este producto');
  }

  item.peso_seleccionado = pesoCalculado;

  item.precio_total = producto.requiere_pesaje
    ? (pesoCalculado / 1000) * precioUnitario
    : nuevaCantidad * precioUnitario;

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

  

async eliminarProducto(usuarioId: number, productoId: number, tipo_medida: 'kg' | 'pieza') {
  const carrito = await this.carritoRepo.findOne({
    where: { usuario: { usuario_k: usuarioId } },
    relations: ['items', 'items.producto'],
  });

  if (!carrito) {
    throw new NotFoundException('No se encontró el carrito del usuario.');
  }

  const item = carrito.items.find(i => i.producto.producto_k === productoId && i.tipo_medida === tipo_medida);
  if (!item) {
    throw new NotFoundException('Producto no encontrado en el carrito.');
  }

  await this.carritoItemRepo.remove(item);
  return { mensaje: 'Producto eliminado del carrito' }; // <-- respuesta JSON
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
  
  private calcularPrecioConOferta(
    producto: Producto,
    tipo_medida: 'kg' | 'pieza',
    tamano?: 'Chico' | 'Mediano' | 'Grande'
  ): number {
    const ahora = new Date();
  
    const ofertaActiva = producto.ofertas?.find(o =>
      o.activa && new Date(o.inicio) <= ahora && new Date(o.fin) >= ahora
    );
  
    if (ofertaActiva) {
      return ofertaActiva.precio_oferta;
    }
  
    return this.calcularPrecioUnitario(producto, tipo_medida, tamano);
  }
  
  async agregarTodosDesdeListaDeseos(usuarioId: number) {
    const deseos = await this.listaRepo.find({
      where: { usuario: { usuario_k: usuarioId } },
      relations: ['producto'],
    });
  
    if (!deseos.length) throw new NotFoundException('Tu lista de deseos está vacía');
  
    for (const deseo of deseos) {
      const producto = deseo.producto;
  
      const tipo_medida = producto.precio_por_kg ? 'kg' : 'pieza';
      const tamano = producto.usa_tamano ? 'Mediano' : undefined;
  
      await this.agregarProducto({
        usuarioId,
        productoId: producto.producto_k,
        cantidad: 1,
        tipo_medida,
        tamano,
      });
    }
  
    await this.listaRepo.remove(deseos);
  
    return { mensaje: 'Todos los productos fueron agregados al carrito' };
  }
  
  
}
