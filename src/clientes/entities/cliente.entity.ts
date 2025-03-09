import { Usuario } from "src/usuarios/entities/usuario.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";

@Entity()
export class Cliente {
    [x: string]: any;
    @PrimaryGeneratedColumn()
    cliente_k: number;

    @Column({ default: 0 })
    tipo_persona: number;

    @Column({ length: 100 })
    nombre: string;

    @Column({ length: 45 })
    apellido_paterno: string;

    @Column({ length: 45 })
    apellido_materno: string;

    @Column({ length: 20 })
    rfc: string;

    @Column({ nullable: true, length: 100 })
    alias: string;

    @Column({ nullable: true, length: 300 })
    razon_social: string;

    @Column({ nullable: true, length: 10 })
    regimen_fiscal: string;

    @Column({ length: 100 })
    email: string;

    @Column({ nullable: true, length: 100 })
    email_alterno: string;

    @Column({ length: 30 })
    tipo_registro: string;

    @Column({ nullable: true, length: 45 })
    uso_factura: string;

    @Column({ type: "date", nullable: true })
    fecha_nacimiento: Date;

    @Column({ nullable: true })
    genero: number;

    @Column({ type: "datetime", nullable: true })
    fecha_ultima_venta: Date;

    @Column({ nullable: true, type: "blob" })
    foto: Buffer;

    @ManyToOne(() => Usuario, usuario => usuario.clientes)
    usuario: Usuario;

    @Column()
    usuario_creacion: number;

    @Column({ type: "date" })
    fecha_creacion: Date;

    @Column()
    sucursal_creacion: number;

    @Column()
    num_ventas: number;

    @Column({ nullable: true, length: 50 })
    num_telefonos: string;

    @Column()
    num_ventas_monto: number;

    @Column({ default: 0 })
    num_comentarios: number;

    @Column({ nullable: true })
    misma_direccion_factura: boolean;

    @Column({ type: "timestamp" })
    fecha_ultima_modificacion: Date;

    @Column({ default: 1 })
    estatus: number;

    @Column({ nullable: true, length: 500 })
    comentarios: string;

    @Column()
    activo: boolean;

    @Column()
    entrega_habitual: boolean;

    @Column()
    pago_habitual: boolean;

    @Column({ default: 0 })
    user_verificado: boolean;

}
