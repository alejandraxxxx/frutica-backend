import { Cliente } from "src/clientes/entities/cliente.entity";
import { DetalleFactura } from "src/detalle-factura/entities/detalle-factura.entity";
import { FormaPago } from "src/forma-pago/entities/forma-pago.entity";
import { Pedido } from "src/pedidos/entities/pedidos.entity";
import { Usuario } from "src/usuarios/entities/usuario.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";

@Entity()
export class Factura {
    @PrimaryGeneratedColumn()
    factura_k: number;

    @ManyToOne(() => Pedido, pedido => pedido.facturas)
    pedido: Pedido;

    @ManyToOne(() => Cliente, cliente => cliente.facturas)
    cliente: Cliente;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    fecha_emision: Date;

    @Column({ type: "decimal" })
    total: number;

    @ManyToOne(() => FormaPago, formaPago => formaPago.facturas)
    formaPago: FormaPago;

    @Column({ type: "enum", enum: ['emitida', 'pagada', 'cancelada'], default: 'emitida' })
    estado: string;

    @OneToMany(() => DetalleFactura, detalle => detalle.factura)
    detallesFactura: DetalleFactura[];
}