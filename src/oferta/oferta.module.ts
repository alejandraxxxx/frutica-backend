import { forwardRef, Module } from '@nestjs/common';
import { OfertaService } from './oferta.service';
import { OfertaController } from './oferta.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Oferta } from './entities/oferta.entity';
import { Producto } from 'src/productos/entities/productos.entity';
import { ProductosModule } from 'src/productos/productos.module';

@Module({
  controllers: [OfertaController],
  providers: [OfertaService],
  imports: [TypeOrmModule.forFeature([Oferta, Producto]), forwardRef(() => ProductosModule)],
  exports: [OfertaService]
  
})
export class OfertaModule {}
