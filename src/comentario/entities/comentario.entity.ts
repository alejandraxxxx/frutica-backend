import { Pedido } from "src/pedidos/entities/pedidos.entity";
import { Usuario } from "src/usuarios/entities/usuario.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";

@Entity()
export class Comentario {
    @PrimaryGeneratedColumn('increment')
    comentario_k: number;

    @ManyToOne(() => Comentario, comentario => comentario.respuestas, { nullable: true })
    comentario_padre: Comentario;

    @Column({ length: 45 })
    tabla: string;

    @Column({ length: 45, nullable: true })
    titulo: string;

    @Column({ type: "text", nullable: true })
    descripcion: string;

    @Column({ length: 45, nullable: true })
    comentarioscol: string;

    @Column({ length: 45, nullable: true })
    email: string;

    @Column({ length: 100, nullable: true })
    web: string;

    @Column({ type: 'boolean' })
    estatus: boolean;

    @Column({ nullable: true, type: 'boolean' })
    tiene_respuestas: boolean;

    @Column({ default: 0 })
    megusta: number;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    timestamp: Date;


    @ManyToOne(() => Usuario, usuario => usuario.clientes)
    usuario: Usuario;

    @OneToMany(() => Comentario, comentario => comentario.comentario_padre)
    respuestas: Comentario[];

    @OneToMany(() => Pedido, pedido => pedido.comentario)
    pedidos: Pedido[];

}