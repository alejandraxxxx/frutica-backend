import { Pedido } from "src/pedidos/entities/pedidos.entity";
import { Usuario } from "src/usuarios/entities/usuario.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable, CreateDateColumn } from "typeorm";

@Entity()
export class Comentario {
  @PrimaryGeneratedColumn()
  comentario_k: number;

  @Column({ type: 'text' })
  texto: string;

  @Column({ default: true })
  estatus: boolean;

  @CreateDateColumn()
  creado_en: Date;

  @ManyToOne(() => Usuario, usuario => usuario.credenciales, { nullable: true })
  usuario: Usuario;

  @ManyToOne(() => Pedido, pedido => pedido.comentario, { nullable: true })
  pedido: Pedido;

  @ManyToOne(() => Comentario, comentario => comentario.respuestas, { nullable: true })
  comentario_padre: Comentario;

    @Column({ length: 100, nullable: true })
    web: string;

    @Column({ nullable: true, type: 'boolean' })
    tiene_respuestas: boolean;

    @Column({ default: 0 })
    megusta: number;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    timestamp: Date;

    @OneToMany(() => Comentario, comentario => comentario.comentario_padre)
    respuestas: Comentario[];

    @OneToMany(() => Pedido, pedido => pedido.comentario)
    pedidos: Pedido[];

}
