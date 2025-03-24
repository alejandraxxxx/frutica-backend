import { Cliente } from "src/clientes/entities/cliente.entity";
import { Comentario } from "src/comentario/entities/comentario.entity";
import { Venta } from "src/venta/entities/venta.entity";
import { EnvioDomicilio } from "src/envio-domicilio/entities/envio-domicilio.entity";
import { FormaPago } from "src/forma-pago/entities/forma-pago.entity";
import { Usuario } from "src/usuarios/entities/usuario.entity";
import { Factura } from "src/factura/entities/factura.entity";
import { DetallePedido } from "src/detalle_pedido/entities/detalle_pedido.entity";

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { Pago } from "src/pagos/entities/pago.entity";

@Entity()
export class Pedido {
    @PrimaryGeneratedColumn()
    pedido_k: number;

    @ManyToOne(() => Usuario, usuario => usuario.pedidos)
    usuario: Usuario;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    fecha_pedido: Date;

    @Column({ type: "decimal" })
    subtotal: number; // Se agregó para separar impuestos y total final

    @Column({ type: "decimal" })
    total: number;

    @Column({ type: "enum", enum: ['domicilio', 'recoger_en_tienda'] })
    tipo_entrega: string;

    @Column({ type: "enum", enum: ['pendiente', 'en preparación', 'enviado', 'entregado', 'cancelado'] })
    estado: string;

    @Column({ type: "enum", enum: ['pendiente', 'pagado', 'cancelado'] })
    estado_pago: string; // Se agregó para manejar el pago antes de generar la venta

    @ManyToOne(() => FormaPago, formaPago => formaPago.pedidos)
    formaPago: FormaPago;

    @ManyToOne(() => EnvioDomicilio, envio => envio.pedidos, { nullable: true })
    envioDomicilio: EnvioDomicilio;


    @ManyToOne(() => Comentario, comentario => comentario.pedidos)
    comentario: Comentario;

    @OneToMany(() => Factura, factura => factura.pedido)
    facturas: Factura[];

    @OneToMany(() => DetallePedido, detalle => detalle.pedido)
    detalles: DetallePedido[];

    @OneToMany(() => Pago, pago => pago.pedido)
    pagos: Pago[];
}