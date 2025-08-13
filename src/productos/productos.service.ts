import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Producto } from './entities/productos.entity';
import { Categoria } from '../categoria/entities/categoria.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Injectable()
export class ProductosService {
    constructor(
        @InjectRepository(Producto)
        private productoRepo: Repository<Producto>,

        @InjectRepository(Categoria)
        private categoriaRepo: Repository<Categoria>,

        private readonly cloudinaryService: CloudinaryService,
    ) { }

    /**
     * Crear un producto y subir imagen a Cloudinary
     */
async create(
    createProductoDto: CreateProductoDto,
    user: { id: number; role?: string },
    files?: Express.Multer.File[],
): Promise<Producto> {
    const userId = user.id;

    const {
        categoriaCategoriaK,
        unidad_venta = 'kg',
        usa_tamano = false,
        peso_estimado,
        peso_chico,
        peso_mediano,
        peso_grande,
        total_existencias = 0,
        activo = true,
        requiere_pesaje = false,
        variaciones_precio = false,
        ...rest
    } = createProductoDto;

    // Buscar la categoría
    let categoria = null;
    if (categoriaCategoriaK) {
        categoria = await this.categoriaRepo.findOne({
            where: { categoria_k: categoriaCategoriaK },
        });
        if (!categoria) throw new NotFoundException('Categoría no encontrada');
    }

    // Subir imágenes a Cloudinary
    let imageUrls: string[] = [];
    if (files && files.length > 0) {
        if (files.length > 10) throw new BadRequestException('Máximo 10 imágenes');
        const uploads = await this.cloudinaryService.uploadImages(files, 'productos');
        imageUrls = uploads.map(img => img.secure_url);
    }

    // Validaciones de peso según configuración
    if (!usa_tamano) {
        // Si no usa tamaño, requiere peso_estimado
        if (!peso_estimado || peso_estimado <= 0) {
            throw new BadRequestException('Debe proporcionar un peso estimado válido para este producto.');
        }
    } else {
        // Si usa tamaño, validar que tenga los pesos por tamaño
        if (!peso_chico || peso_chico <= 0) {
            throw new BadRequestException('Debe proporcionar un peso válido para tamaño chico.');
        }
        if (!peso_mediano || peso_mediano <= 0) {
            throw new BadRequestException('Debe proporcionar un peso válido para tamaño mediano.');
        }
        if (!peso_grande || peso_grande <= 0) {
            throw new BadRequestException('Debe proporcionar un peso válido para tamaño grande.');
        }
    }

    // Validar que tenga al menos un precio
    if (!rest.precio_por_kg && !rest.precio_por_pieza) {
        throw new BadRequestException('Debe proporcionar al menos precio por kg o precio por pieza.');
    }

    // Crear el producto (solo campos que existen en la entidad)
    const producto = this.productoRepo.create({
        ...rest, // descripcion, precio_por_kg, precio_por_pieza, temporada, proveedor
        unidad_venta,
        categoria,
        foto: imageUrls,
        usa_tamano,
        peso_estimado: usa_tamano ? null : peso_estimado, // Solo se usa cuando NO usa tamaño
        peso_total: usa_tamano ? null : peso_estimado, // Solo se calcula cuando NO usa tamaño
        peso_chico: usa_tamano ? peso_chico : null,
        peso_mediano: usa_tamano ? peso_mediano : null,
        peso_grande: usa_tamano ? peso_grande : null,
        total_existencias,
        activo,
        requiere_pesaje,
        // Campos que existen en la entidad
        fecha_actualizacion: new Date(),
        num_comentarios: 0,
        numero_ventas: 0,
        // Nota: variaciones_precio no existe en la entidad, se omite
    });

    try {
        const productoGuardado = await this.productoRepo.save(producto);
        console.log('✅ Producto creado exitosamente:', productoGuardado.producto_k);
        return productoGuardado;
    } catch (error) {
        console.error('❌ Error al guardar producto:', error);
        throw new BadRequestException('Error al crear el producto');
    }
}

    /**
     * Obtener todos los productos disponibles
     */
    async findAll() {
        const ahora = new Date();
    
        const productos = await this.productoRepo.find({
          where: { activo: true },
          relations: ['categoria', 'ofertas'],
        });
    
        const productosConOferta = productos.map(producto => {
          const ofertaActiva = producto.ofertas?.find(oferta =>
            oferta.activa &&
            new Date(oferta.inicio) <= ahora &&
            new Date(oferta.fin) >= ahora
          );
    
          const precioBase = producto.precio_por_kg ?? producto.precio_por_pieza ?? 0;
          const precioFinal = ofertaActiva ? ofertaActiva.precio_oferta : precioBase;
    
          return {
            ...producto,
            precio_final: precioFinal,
            oferta: ofertaActiva ?? null,
          };
        });
    
        return productosConOferta;
      }
    

    /**
     * Buscar un producto por ID
     */
    async findOne(id: number) {
        const producto = await this.productoRepo.findOne({
            where: { producto_k: id, activo: true },
        });
        if (!producto) {
            throw new NotFoundException('Producto no encontrado');
        }
        return producto;
    }


    /**
     *  Actualizar datos del producto
     */
    async update(id: number, updateProductoDto: UpdateProductoDto): Promise<Producto> {
        const producto = await this.findOne(id);
        if (!producto) {
            throw new NotFoundException('Producto no encontrado');
        }

        const { categoriaCategoriaK, ...rest } = updateProductoDto;

        if (categoriaCategoriaK) {
            const categoria = await this.categoriaRepo.findOne({ where: { categoria_k: categoriaCategoriaK } });
            if (!categoria) {
                throw new NotFoundException('Categoría no encontrada');
            }
            producto.categoria = categoria;
        }

        Object.assign(producto, rest);

        return this.productoRepo.save(producto);
    }

    /**
     * 🗑 Desactivar un producto en lugar de eliminarlo
     */
    async remove(id: number) {
        const producto = await this.findOne(id);
        if (!producto) {
            throw new NotFoundException('Producto no encontrado');
        }

        producto.activo = false; // Desactivamos el producto
        return this.productoRepo.save(producto);
    }

    /**
     * Buscar productos por nombre
     */
async buscar(termino: string) {
  if (!termino || typeof termino !== 'string' || termino.trim() === '') {
    return [];
  }

  const terminoBusqueda = `%${termino.trim()}%`;
       
  try {
    return await this.productoRepo
      .createQueryBuilder('producto')
      .where('producto.nombre LIKE :nombre', { nombre: terminoBusqueda })
      .andWhere('producto.activo = :activo', { activo: true })
      .select([
        'producto.producto_k',
        'producto.nombre',
        'producto.descripcion', 
        'producto.foto',
        'producto.precio_por_kg',
        'producto.precio_por_pieza',
        'producto.unidad_venta'
      ])
      .limit(10)
      .getMany(); // Cambia getRawMany() por getMany()
  } catch (error) {
    console.error('Error en búsqueda:', error);
    throw new Error('Error al buscar productos');
  }
}

    async updateImage(id: number, file: Express.Multer.File): Promise<Producto> {
        const producto = await this.findOne(id);
        if (!producto) {
            throw new NotFoundException('Producto no encontrado');
        }

        if (!file) {
            throw new BadRequestException('No se recibió un archivo');
        }

        const uploadResult = await this.cloudinaryService.uploadImage(file);
        const imageUrl = uploadResult.secure_url; // Extraemos solo la URL

        producto.foto = [imageUrl]; // Guardamos la nueva URL

        return this.productoRepo.save(producto); // Guardamos el producto actualizado
    }
}
