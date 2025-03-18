import { Cliente } from "src/clientes/entities/cliente.entity";
import { Pedido } from "src/pedidos/entities/pedidos.entity";
import { Usuario } from "src/usuarios/entities/usuario.entity";
import { Producto } from "src/productos/entities/productos.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";

@Entity()
export class Venta {
    @PrimaryGeneratedColumn()
    venta_k: number;

    @ManyToOne(() => Producto, producto => producto.ventas)
    producto: Producto;

    @ManyToOne(() => Usuario, usuario => usuario.ventas, { nullable: true })
    usuario: Usuario;

    @ManyToOne(() => Cliente, cliente => cliente.ventas, { nullable: true })
    cliente: Cliente;

    @ManyToOne(() => Pedido, pedido => pedido.ventas)
    pedido: Pedido;

    @Column({ length: 60, default: "Tienda fisica" })
    forma_entrega_k: string;

    @Column({ type: "datetime", nullable: true })
    fecha_envio: Date;

    @Column({ type: "datetime", nullable: true })
    fecha_entregado: Date;

    @Column({ type: "float", nullable: true })
    costo_envio: number;

    @Column({ length: 100, nullable: true })
    quien_recibe: string;

    @Column({ length: 100, nullable: true })
    firma_url: string;

    @Column({ length: 45, default: "Efectivo" })
    forma_pago_k: string;

    @Column({ length: 100, nullable: true })
    url_comprobante: string;

    @Column({ length: 20 })
    status_pago: string;

    @Column({ type: "double" })
    monto_iva: number;

    @Column({ type: "int", default: 0 })
    porcentaje_descuento_aplicado: number;

    @Column({ type: "int", default: 0 })
    facturada: number;

    @Column({ type: "int", default: 0 })
    num_comentarios: number;

    @Column({ type: "float", default: 0 })
    monto_venta_unitario: number;

    @Column({ type: "double" })
    cantidad_pago: number;

    @Column({ type: "int" })
    cantidad_productos: number;

    @Column({ type: "date" })
    fecha: Date;

    @Column({ type: "datetime" })
    timestamp: Date;

    @Column({ type: "int", default: 1 })
    estatus: number;

    @Column({ type: "tinyint", default: 1 })
    activo: boolean;
}