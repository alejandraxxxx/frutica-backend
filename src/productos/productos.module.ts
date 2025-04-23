import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/productos.entity';
import { CategoriaModule } from 'src/categoria/categoria.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { Oferta } from 'src/oferta/entities/oferta.entity';
import { OfertaModule } from 'src/oferta/oferta.module';
import { ListaDeseos } from 'src/lista-deseos/entities/lista-deseo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto, Oferta]),
    CategoriaModule, // Importar el módulo de Categorías
    CloudinaryModule, // Importar Cloudinary para la subida de imágenes
    OfertaModule,
    ListaDeseos
  ], // Asegura que este import esté presente

  controllers: [ProductosController],
  providers: [ProductosService],
  exports: [ProductosService], // Si necesitas usarlo en otros módulos

})
export class ProductosModule {}
