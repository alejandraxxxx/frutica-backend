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
        user: { id : number; role?: string },
        files?: Express.Multer.File[],
      ): Promise<Producto> {
        const userId = user.id;
      
        const {
          categoriaCategoriaK,
          unidad_venta,
          usa_tamano,
          peso_estimado,
          peso_chico,
          peso_mediano,
          peso_grande,
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
      
        // Peso estimado o cálculo según uso de tamaño
        let pesoCalculado: number | null = null;
      
        if (!usa_tamano) {
          if (peso_estimado == null) {
            throw new BadRequestException('Debe proporcionar un peso estimado para este producto.');
          }
          pesoCalculado = unidad_venta === 'kg'
            ? peso_estimado * 1000
            : peso_estimado;
        }
      
        // Crear el producto
        const producto = this.productoRepo.create({
          ...rest,
          unidad_venta,
          categoria,
          foto: imageUrls,
          usa_tamano,
          peso_estimado: usa_tamano ? pesoCalculado : peso_estimado,
          peso_total: usa_tamano ? null : pesoCalculado,
          peso_chico,
          peso_mediano,
          peso_grande,
          // usuario_creador: await this.usuarioRepo.findOne({ where: { usuario_k: userId } }), // opcional si tienes relación
        });
      
        return this.productoRepo.save(producto);
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
        return this.productoRepo.find({
            where: { nombre: Like(`%${termino}%`), activo: true },
        });
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
