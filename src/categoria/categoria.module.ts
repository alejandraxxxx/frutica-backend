import { Module } from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CategoriaController } from './categoria.controller';

import { Categoria } from './entities/categoria.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
      TypeOrmModule.forFeature([Categoria]) // Asegurar que se registre aquí
    ],
  controllers: [CategoriaController],
  providers: [CategoriaService],
  exports: [TypeOrmModule],

})
export class CategoriaModule {}
