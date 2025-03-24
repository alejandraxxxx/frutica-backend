import { Module } from '@nestjs/common';
import { DetalleFacturaService } from './detalle-factura.service';
import { DetalleFacturaController } from './detalle-factura.controller';
import { DetalleFactura } from './entities/detalle-factura.entity';
import { Factura } from 'src/factura/entities/factura.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from 'src/productos/entities/productos.entity';

@Module({
  controllers: [DetalleFacturaController],
  providers: [DetalleFacturaService],
  imports: [TypeOrmModule.forFeature([DetalleFactura, Factura,  Producto])],
  exports: [TypeOrmModule]
})
export class DetalleFacturaModule {}
