import { Cliente } from "src/clientes/entities/cliente.entity";
import { Credencial } from "src/credenciales/entities/credencial.entity";
import { Direccion } from "src/direccion/entities/direccion.entity";
import { InventarioMovimiento } from "src/inventario-movimiento/entities/inventario-movimiento.entity";
import { Notificacion } from "src/notificaciones/entities/notificacion.entity";
import { Pedido } from "src/pedidos/entities/pedidos.entity";
import { Venta } from "src/venta/entities/venta.entity";
import { Entity, Unique, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";


@Entity()
@Unique(["username"])
@Unique(["sucursal_k"])
export class Usuario {
    @PrimaryGeneratedColumn()
    usuario_k: number;

    @Column({ length: 100 })
    nombre: string;

    @Column({ length: 45 })
    apellido_paterno: string;

    @Column({ length: 45, nullable: true })
    apellido_materno: string;

    @Column({ length: 10, nullable: true })
    telefono: string;

    @Column({ length: 45 })
    username: string;

    @Column({ default: false })
    login_facebook: boolean;

    @Column({ default: false })
    login_google: boolean;

    @Column({ default: false })
    login_normal: boolean;


    @Column({ length: 45, default: 'cliente' })
    rol_ENUM: string;

    @Column({ length: 45, default: 'activo' })
    estado_ENUM: string;

    @Column()
    sucursal_k: number;

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

    @Column()
    user_verificado: boolean;

    @OneToMany(() => Cliente, cliente => cliente.usuario)
    clientes: Cliente[];

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

    @OneToMany(() => Credencial, credencial => credencial.usuario)
    credenciales: Credencial[];
}
