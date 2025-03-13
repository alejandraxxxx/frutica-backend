import { Module } from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CategoriaController } from './categoria.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';

@Module({

  imports: [TypeOrmModule.forFeature([Categoria])], // Asegura que este import esté presente
  
  controllers: [CategoriaController],
  providers: [CategoriaService],
  exports: [CategoriaService, TypeOrmModule], // Si necesitas usarlo en otros módulos
  
})
export class CategoriaModule {}
