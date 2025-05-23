import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Producto } from "src/productos/entities/productos.entity";
import { Carrito } from "src/carrito/entities/carrito.entity";

@Entity()
export class CarritoItem {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Carrito, carrito => carrito.items)
    carrito: Carrito;

    @ManyToOne(() => Producto)
    producto: Producto;

    @Column()
    cantidad: number;

    @Column({ type: "enum", enum: ["kg", "pieza"] })
    tipo_medida: "kg" | "pieza";
    

    @Column({ type: "float" })
    precio_total: number;
    
    @Column({ type: 'float', nullable: true })
    peso_seleccionado: number; // Peso total en KG (si aplica)

    @Column({ type: "enum", enum: ["Chico", "Mediano", "Grande"], nullable: true })
    tamano: 'Chico' | 'Mediano' | 'Grande';

    
}
