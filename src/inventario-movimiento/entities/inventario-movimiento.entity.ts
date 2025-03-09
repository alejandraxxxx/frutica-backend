import { Producto } from "src/productos/entities/productos.entity";
import { Usuario } from "src/usuarios/entities/usuario.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";

@Entity()
export class InventarioMovimiento {
    @PrimaryGeneratedColumn()
    movimiento_k: number;

    @ManyToOne(() => Producto, producto => producto.movimientosInventario)
    producto: Producto;

    @Column({ type: "enum", enum: ['entrada', 'salida'] })
    tipo: string;

    @Column()
    cantidad: number;

    @Column({ length: 100 })
    descripcion: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    fecha_movimiento: Date;

    @ManyToOne(() => Usuario, usuario => usuario.movimientosInventario)
    usuario: Usuario;
}
