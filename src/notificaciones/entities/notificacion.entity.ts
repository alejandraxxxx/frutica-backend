import { Usuario } from "src/usuarios/entities/usuario.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";

@Entity()
export class Notificacion {
    @PrimaryGeneratedColumn()
    notificacion_k: number;

    @Column({ length: 100 })
    titulo: string;

    @Column({ type: "text" })
    mensaje: string;

    @Column({ type: "enum", enum: ['info', 'exito', 'error', 'advertencia'] })
    tipo: string;

    @Column({ length: 100, nullable: true })
    icono: string;

    @Column({ length: 45 })
    boton_texto: string;

    @Column({ length: 255, nullable: true })
    boton_accion: string;

    @ManyToOne(() => Usuario, usuario => usuario.notificaciones)
    usuario: Usuario;

    @Column({ type: "enum", enum: ['pendiente', 'visto', 'descartado'], default: 'pendiente' })
    estatus: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    fecha_creacion: Date;

    @Column({ type: "timestamp", nullable: true })
    fecha_visto: Date;
}
