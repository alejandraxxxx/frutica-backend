import { IsOptional } from "class-validator";
import { Direccion } from "src/direccion/entities/direccion.entity";
import { Pedido } from "src/pedidos/entities/pedidos.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class TipoEntrega {@PrimaryGeneratedColumn()
    envio_k: number;

    @Column({ length: 20 })
    metodo_entrega: string;

    @ManyToOne(() => Direccion, direccion => direccion.envios)
    direccion: Direccion;

    @IsOptional()
    @Column({ length: 100 })
    repartidor?: string;

    @Column({ type: "datetime" })
    fecha_envio: Date;

    @Column({ type: "date" })
    fecha_estimada_entrega: Date;

    @Column({ type: "time" })
    hora_estimada_entrega: string;

    @Column({ type: "decimal", default: 0.0 })
    costo_envio: number;

    @Column({ type: "enum", enum: ['pendiente', 'en camino', 'entregado', 'cancelado'], default: 'pendiente' })
    estado: string;

    // Relación con la tabla de pedidos
  @OneToMany(() => Pedido, (pedido) => pedido.tipoEntrega)
  pedidos: Pedido[];
}
