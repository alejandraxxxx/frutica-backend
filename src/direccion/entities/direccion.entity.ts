import { Cliente } from "src/clientes/entities/cliente.entity";
import { EnvioDomicilio } from "src/envio-domicilio/entities/envio-domicilio.entity";
import { Usuario } from "src/usuarios/entities/usuario.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";

@Entity()
export class Direccion {
    @PrimaryGeneratedColumn()
    direccion_k: number;

    @Column({ length: 1000 })
    calle: string;

    @Column({ length: 200 })
    colonia: string;

    @Column({ length: 200 })
    ciudad: string;

    @Column({ length: 200 })
    estado: string;

    @Column({ length: 5 })
    cp: string;

    @Column({ length: 200 })
    pais: string;

    @Column({ length: 50, nullable: true })
    numExterior: string;

    @Column({ length: 50, nullable: true })
    numInterior: string;

    @Column({ length: 200 })
    referencia: string;

    @Column({ length: 50, nullable: true })
    localidad: string;

    @Column({ length: 10, nullable: true })
    localidad_k: string;

    @Column({ length: 10, nullable: true })
    colonia_k: string;

    @Column({ length: 10, nullable: true })
    municipio_k: string;

    @Column({ length: 10, nullable: true })
    estado_k: string;

    @Column({ type: "datetime" })
    fecha_creacion: Date;

    @Column()
    usuario_creacion: number;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    fecha_actualizacion: Date;

    @Column({ nullable: true })
    usuario_actualizacion: number;

    @Column()
    activo: boolean;

    @Column({ length: 100 })
    maps_url: string;

    @Column({ type: "decimal", precision: 9, scale: 6 })
    latitud: number;

    @Column({ type: "decimal", precision: 9, scale: 6 })
    longitud: number;

    @ManyToOne(() => Cliente, cliente => cliente.direcciones)
    cliente: Cliente;

    @ManyToOne(() => Usuario, usuario => usuario.direcciones)
    usuario: Usuario;

    @OneToMany(() => EnvioDomicilio, envio => envio.direccion)
    envios: EnvioDomicilio[];
   
}