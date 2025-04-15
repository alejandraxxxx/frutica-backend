// src/oferta/entities/oferta.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Producto } from 'src/productos/entities/productos.entity';

@Entity()
export class Oferta {
  @PrimaryGeneratedColumn()
  oferta_k: number;

  @ManyToOne(() => Producto, producto => producto.ofertas, { onDelete: 'CASCADE' })
  producto: Producto;

  @Column({ type: 'float' })
  precio_oferta: number;

  @Column({ type: 'float', nullable: true })
  porcentaje_descuento: number;

  @Column({ type: 'timestamp' })
  inicio: Date;
  @Column({ type: 'timestamp', nullable: true }) 
  fin: Date;

  @Column({ default: true })
  activa: boolean;

  @Column({ length: 200, nullable: true })
  descripcion: string;
}
