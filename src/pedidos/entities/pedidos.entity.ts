import { Comentario } from "src/comentario/entities/comentario.entity";
import { Venta } from "src/venta/entities/venta.entity";
import { FormaPago } from "src/forma-pago/entities/forma-pago.entity";
import { Usuario } from "src/usuarios/entities/usuario.entity";
import { Factura } from "src/factura/entities/factura.entity";
import { DetallePedido } from "src/detalle_pedido/entities/detalle_pedido.entity";

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable, OneToOne, JoinColumn } from "typeorm";
import { Pago } from "src/pagos/entities/pago.entity";
import { Direccion } from "src/direccion/entities/direccion.entity";
import { TipoEntrega } from "src/tipo-entrega/entities/tipo-entrega.entity";
import { EstadoPedido } from "../pedido-estado.enum";

@Entity()
export class Pedido {
    @PrimaryGeneratedColumn()
    pedido_k: number;

    @ManyToOne(() => Usuario, usuario => usuario.pedidos)
    usuario: Usuario;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    fecha_pedido: Date;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    subtotal: number; // Se agregó para separar impuestos y total final

    @Column({ type: "decimal", precision: 10, scale: 2 })
    total: number;

    @Column({ type: 'enum', enum: EstadoPedido, default: EstadoPedido.SOLICITADO })
    estado: EstadoPedido;

    @ManyToOne(() => FormaPago, formaPago => formaPago.pedidos)
    formaPago: FormaPago;

    @ManyToOne(() => Comentario, comentario => comentario.pedido) 
    comentario: Comentario;

    @OneToMany(() => Factura, factura => factura.pedido)
    facturas: Factura[];

    @OneToMany(() => DetallePedido, detalle => detalle.pedido)
    detalles: DetallePedido[];

    @OneToMany(() => Pago, pago => pago.pedido)
    pagos: Pago[];

    @ManyToOne(() => TipoEntrega, tipo => tipo.pedidos)
    tipoEntrega: TipoEntrega;

}