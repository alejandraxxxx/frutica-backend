import { Factura } from "src/factura/entities/factura.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";


@Entity()
export class Empleado {
    @PrimaryGeneratedColumn()
    empleado_k: number;

    @Column({ default: 0 })
    tipo_persona: number;

    @Column({ nullable: true })
    genero: number;

    @Column({ nullable: true, length: 50 })
    estado_civil: string;

    @Column({ length: 100 })
    nombre: string;

    @Column({ length: 100 })
    apellido_paterno: string;

    @Column({ length: 100 })
    apellido_materno: string;

    @Column({ length: 20 })
    rfc: string;

    @Column({ nullable: true, length: 50 })
    curp: string;

    @Column({ nullable: true, length: 100 })
    alias: string;

    @Column({ nullable: true, length: 100 })
    contacto_emergencia: string;

    @Column({ nullable: true, length: 300 })
    razon_social: string;

    @Column({ nullable: true, length: 10 })
    regimen_fiscal: string;

    @Column({ length: 100 })
    email: string;

    @Column({ nullable: true, length: 100 })
    foto: string;

    @Column({ nullable: true, length: 5 })
    uso_factura: string;

    @Column({ length: 45 })
    area_a_cargo: string;

    @Column({ default: false })
    es_operador_transporte: boolean;

    @Column({ type: "date", nullable: true })
    fecha_empresa_ingreso: Date;

    @Column({ type: "date", nullable: true })
    fecha_empresa_baja: Date;

    @Column({ type: "date", nullable: true })
    fecha_cambio_area_cargo: Date;

    @Column({ type: "date", nullable: true })
    fecha_nacimiento: Date;

    @Column({ nullable: true })
    edad: number;

    @Column({ length: 100 })
    mes_cumpleaños: string;

    @Column({ nullable: true })
    numero_seguro_social: number;

    @Column()
    tipo_empleado: number;

    @Column()
    usuario_creacion: number;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    fecha_creacion: Date;

    @Column({ default: 0 })
    num_comentarios: number;

    @Column({ nullable: true })
    usuario_modificacion_k: number;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    fecha_ultima_modificacion: Date;

    @Column({ default: 1 })
    estatus: number;

    @Column()
    activo: boolean;
   
    @OneToMany(() => Factura, factura => factura.empleado)
facturas: Factura[];
    
}