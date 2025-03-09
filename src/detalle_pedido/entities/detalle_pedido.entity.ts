import { Pedido } from "src/pedidos/entities/pedidos.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";

@Entity()
export class DetallePedido {
    @PrimaryGeneratedColumn()
    detalle_k: number;

    @Column()
    cantidad: number;

    @Column({ type: "decimal" })
    precio_unitario: number;

    @Column({ type: "decimal" })
    subtotal: number;

    @Column({ length: 45, default: 'pendiente' })
    estado: string;

    @ManyToOne(() => Pedido, pedido => pedido.detalles)
    pedido: Pedido;
}