import { Direccion } from "src/direccion/entities/direccion.entity";
import { Pedido } from "src/pedidos/entities/pedidos.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";

@Entity()
export class EnvioDomicilio {
    @PrimaryGeneratedColumn()
    envio_k: number;

    @ManyToOne(() => Direccion, direccion => direccion.envios)
    direccion: Direccion;

    @Column({ length: 100 })
    repartidor: string;

    @Column({ type: "datetime" })
    fecha_envio: Date;

    @Column({ type: "datetime" })
    fecha_estimada_entrega: Date;

    @Column({ type: "decimal", default: 0.0 })
    costo_envio: number;

    @Column({ type: "enum", enum: ['pendiente', 'en camino', 'entregado', 'cancelado'], default: 'pendiente' })
    estado: string;
  
    @OneToMany(() => Pedido, pedido => pedido.envioDomicilio)
    pedidos: Pedido[];
}
