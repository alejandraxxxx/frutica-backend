import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Producto } from './entities/productos.entity';
import { Categoria } from '../categoria/entities/categoria.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ProductosService {
  constructor(
      @InjectRepository(Producto)
      private productoRepo: Repository<Producto>,

      @InjectRepository(Categoria)
      private categoriaRepo: Repository<Categoria>,

      private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * 🛠 Crear un producto y subir imagen a Cloudinary
   */
  async create(createProductoDto: CreateProductoDto, file?: Express.Multer.File): Promise<Producto> {
    const { categoriaCategoriaK, unidad_venta, peso_estimado, usa_tamano, tamano, ...rest } = createProductoDto;

    let categoria = null;
    if (categoriaCategoriaK) {
        categoria = await this.categoriaRepo.findOne({ where: { categoria_k: categoriaCategoriaK } });
        if (!categoria) {
            throw new NotFoundException('Categoría no encontrada');
        }
    }

    let imageUrl = null;
    if (file) {
        const uploadResult = await this.cloudinaryService.uploadImage(file);
        imageUrl = uploadResult.secure_url;
    }

    let pesoFinal = null;
    let pesoEstimado = null;

    if (usa_tamano) {
        if (!tamano) {
            throw new BadRequestException('Debe seleccionar un tamaño (Chico, Mediano, Grande).');
        }

        const pesosEstimados = {
            "Chico": 3000,
            "Mediano": 5000,
            "Grande": 8000
        };

        pesoEstimado = pesosEstimados[tamano];
    } else {
        pesoFinal = unidad_venta === "kg" ? (peso_estimado ?? 0) * 1000 : peso_estimado;
    }

    const producto = this.productoRepo.create({
        ...rest,
        foto: imageUrl,
        categoria,
        usa_tamano,
        tamano: usa_tamano ? tamano : null,
        peso_total: usa_tamano ? null : pesoFinal,
        peso_estimado: usa_tamano ? pesoEstimado : null,
    });

    return this.productoRepo.save(producto);
}

  /**
   * 📋 Obtener todos los productos disponibles
   */
  async findAll() {
      try {
          return this.productoRepo.find({
            where: { activo: true },
          });
      } catch (error) {
          throw new InternalServerErrorException(error);
      }
  }

  /**
   * 🔍 Buscar un producto por ID
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
   * ✏️ Actualizar datos del producto
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
   * 🔎 Buscar productos por nombre
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

    producto.foto = imageUrl; // Guardamos la nueva URL

    return this.productoRepo.save(producto); // Guardamos el producto actualizado
}
}
