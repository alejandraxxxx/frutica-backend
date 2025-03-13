import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/productos.entity';
import { CategoriaModule } from 'src/categoria/categoria.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto]),
    CategoriaModule, // Importar el módulo de Categorías
    CloudinaryModule, // Importar Cloudinary para la subida de imágenes
  ], // Asegura que este import esté presente

  controllers: [ProductosController],
  providers: [ProductosService],
  exports: [ProductosService], // Si necesitas usarlo en otros módulos

})
export class ProductosModule {}
