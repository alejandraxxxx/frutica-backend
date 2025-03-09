import { Producto } from "src/productos/entities/productos.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";

@Entity()
export class Precio {
    @PrimaryGeneratedColumn()
    precio_k: number;

    @Column({ length: 50 })
    nombre: string;

    @Column({ type: "float", nullable: true })
    precio_unit_mayoreo: number;

    @Column({ type: "float", nullable: true })
    precio_unit_menudeo: number;

    @Column({ length: 10, nullable: true })
    orden: string;

    @Column({ default: 0 })
    obligatorio: boolean;

    @Column({ default: 1 })
    activo: boolean;

    @Column({ default: 0 })
    variacion: boolean;

    @Column({ type: "float", nullable: true })
    monto_variacion: number;
    
    @OneToMany(() => Producto, producto => producto.precio)
    productos: Producto[];
 
}