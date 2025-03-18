import { Cliente } from "src/clientes/entities/cliente.entity";
import { Comentario } from "src/comentario/entities/comentario.entity";
import { Venta } from "src/venta/entities/venta.entity";
import { FormaPago } from "src/forma-pago/entities/forma-pago.entity";
import { Usuario } from "src/usuarios/entities/usuario.entity";
import { Factura } from "src/factura/entities/factura.entity";
import { DetallePedido } from "src/detalle_pedido/entities/detalle_pedido.entity";

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { TipoEntrega } from "src/tipo-entrega/entities/tipo-entrega.entity";

@Entity()
export class Pedido {
    @PrimaryGeneratedColumn()
    pedido_k: number;

    @ManyToOne(() => Usuario, usuario => usuario.pedidos)
    usuario: Usuario;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    fecha_pedido: Date;

    @Column({ type: "decimal" })
    total: number;

    @Column({ length: 20, default: 'pendiente' })
    estado: string;

    @Column({ type: "datetime" })
    fecha_hora_entregado: Date;

    @ManyToOne(() => FormaPago, formaPago => formaPago.pedidos)
    formaPago: FormaPago;

    @Column({ length: 15, default: "aplicacion" })
    registrado_desde: string;

    @ManyToOne(() => Cliente, cliente => cliente.pedidos)
    cliente: Cliente;
    
      // Relación Many-to-One con TipoEntrega
    @ManyToOne(() => TipoEntrega, (tipoEntrega) => tipoEntrega.pedidos, { eager: true })
    tipoEntrega: TipoEntrega;

    @ManyToOne(() => Comentario, comentario => comentario.pedidos)
    comentario: Comentario;

    @OneToMany(() => Factura, factura => factura.pedido)
    facturas: Factura[];

    @OneToMany(() => DetallePedido, detalle => detalle.pedido)
    detalles: DetallePedido[];

    @OneToMany(() => Venta, venta => venta.pedido)
    ventas: Venta[];

}