import { Producto } from "src/productos/entities/productos.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";

@Entity()
export class Categoria {
    @PrimaryGeneratedColumn()
    categoria_k: number;

    @Column({ nullable: true, length: 45 })
    nombre: string;

    @Column({ length: 45 })
    tabla: string;

    @Column({ default: 0 })
    orden: number;

    @Column({ length: 45 })
    descripcion: string;

    @Column({ nullable: true })
    clave: number;

    @Column({ nullable: true })
    activo: boolean;
  
    @OneToMany(() => Producto, producto => producto.categoria)
  productos: Producto[];
}