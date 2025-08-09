import { Carrito } from "src/carrito/entities/carrito.entity";
import { Credencial } from "src/credenciales/entities/credencial.entity";
import { DatosPersonales } from "src/datos-personales/entities/datos-personale.entity";
import { Direccion } from "src/direccion/entities/direccion.entity";
import { InventarioMovimiento } from "src/inventario-movimiento/entities/inventario-movimiento.entity";
import { ListaDeseos } from "src/lista-deseos/entities/lista-deseo.entity";
import { Notificacion } from "src/notificaciones/entities/notificacion.entity";
import { Pago } from "src/pagos/entities/pago.entity";
import { Pedido } from "src/pedidos/entities/pedidos.entity";
import { Venta } from "src/venta/entities/venta.entity";
import { Entity, Unique, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable, OneToOne, JoinColumn } from "typeorm";

//exportamos un ENUM
export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

@Entity()
export class Usuario {
    @PrimaryGeneratedColumn()
    usuario_k: number;

    @Column({ length: 100 })
    nombre: string;

    @Column({ length: 45 })
    apellido_paterno: string;

    @Column({ length: 45, nullable: true })
    apellido_materno: string;

    @Column({ length: 10 })
    sexo: string;

    @Column({ length: 10, nullable: true })
    telefono: string;

    @Column({ default: false })
    login_facebook: boolean;

    @Column({ default: false })
    login_google: boolean;

    @Column({ default: false })
    login_normal: boolean;

    //columna de role
    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @Column({ length: 45, default: 'activo' })
    estado_ENUM: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    fecha_registro: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    fecha_ultima_modificacion: Date;

    @Column({ length: 15, default: "aplicacion" })
    registrado_desde: string;

    @Column()
    pago_habitual: boolean;

    @Column()
    entrega_habitual: boolean;

    @Column({ default: false, name: 'user_verificado', type: 'boolean' })
    user_verificado: boolean;

    @OneToMany(() => Direccion, direccion => direccion.usuario)
    direcciones: Direccion[];

    @OneToMany(() => Notificacion, notificacion => notificacion.usuario)
    notificaciones: Notificacion[];

    @OneToMany(() => Pedido, pedido => pedido.usuario)
    pedidos: Pedido[];

    @OneToMany(() => Venta, venta => venta.usuario)
    ventas: Venta[];

    @OneToMany(() => InventarioMovimiento, movimiento => movimiento.usuario)
    movimientosInventario: InventarioMovimiento[];

    @OneToMany(() => Carrito, carrito => carrito.usuario)
    carrito: Carrito[];

    @OneToMany(() => Pago, pago => pago.usuario)
    pagos: Pago[]; // Relación con la tabla Pago

    @OneToOne(() => Credencial, credencial => credencial.usuario)
    credenciales: Credencial;

    @OneToMany(() => DatosPersonales, (datos) => datos.usuario)
    datos: DatosPersonales[];

    @OneToMany(() => ListaDeseos, lista => lista.usuario)
    listaDeseos: ListaDeseos[];

    
}


