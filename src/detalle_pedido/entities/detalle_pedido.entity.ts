import { Pedido } from "src/pedidos/entities/pedidos.entity";
import { Producto } from "src/productos/entities/productos.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";

@Entity()
export class DetallePedido {
    @PrimaryGeneratedColumn()
    detalle_pedido_k: number;

    @Column()
    cantidad: number;

    @Column({ type: "decimal" })
    precio_unitario: number;

    @Column({ type: 'float', default: 0 })
    subtotal: number;

    @Column({ length: 45, default: 'pendiente' })
    estado: string;

    @Column({ type: 'enum', enum: ['kg', 'pieza'] })
    tipo_medida: 'kg' | 'pieza';


    @ManyToOne(() => Pedido, pedido => pedido.detalles)
    pedido: Pedido;


    @ManyToOne(() => Producto, producto => producto.detallesFactura)
    producto: Producto;

    @Column({ type: 'float', nullable: true })
    peso_seleccionado: number;

}