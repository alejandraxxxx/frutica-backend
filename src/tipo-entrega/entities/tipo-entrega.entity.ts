import { Direccion } from "src/direccion/entities/direccion.entity";
import { Pedido } from "src/pedidos/entities/pedidos.entity";
import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TipoEntrega {
  @PrimaryGeneratedColumn()
  envio_k: number;

  @Column({ type: "enum", enum: ["Entrega a domicilio", "Pasar a recoger"] })
  metodo_entrega: "Entrega a domicilio" | "Pasar a recoger";

  @ManyToOne(() => Direccion, direccion => direccion.envios)
  direccion: Direccion;

  @Column({ length: 100, nullable: true })
  repartidor?: string;

  @Column({ type: "datetime" })
  fecha_creacion_envio: Date;

  @Column({ type: "date" })
  fecha_estimada_entrega: Date;

  @Column({ type: "time" })
  hora_estimada_entrega: string;

  @Column({ type: "decimal", default: 0.0 })
  costo_envio: number;

  @Column({ type: "enum", enum: ["pendiente", "en camino", "entregado", "cancelado"], default: "pendiente" })
  estado: "pendiente" | "en camino" | "entregado" | "cancelado";

  @OneToMany(() => Pedido, pedido => pedido.tipoEntrega)
  pedidos: Pedido[];
}
