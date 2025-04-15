import { Module } from '@nestjs/common';
import { ListaDeseosService } from './lista-deseos.service';
import { ListaDeseosController } from './lista-deseos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListaDeseos } from './entities/lista-deseo.entity';
import { Producto } from 'src/productos/entities/productos.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Module({
  controllers: [ListaDeseosController],
  providers: [ListaDeseosService],
    imports: [TypeOrmModule.forFeature([ListaDeseos, Producto, Usuario])], // Registra las entidades
  
})
export class ListaDeseosModule {}
