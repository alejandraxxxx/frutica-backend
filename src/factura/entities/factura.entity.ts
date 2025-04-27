import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { DatosPersonales } from "src/datos-personales/entities/datos-personale.entity";
import { DetalleFactura } from "src/detalle-factura/entities/detalle-factura.entity";
import { FormaPago } from "src/forma-pago/entities/forma-pago.entity";
import { Pedido } from "src/pedidos/entities/pedidos.entity";

@Entity()
export class Factura {
    @PrimaryGeneratedColumn()
    factura_k: number;

    @ManyToOne(() => Pedido, pedido => pedido.facturas)
    pedido: Pedido;

    @ManyToOne(() => DatosPersonales, cliente => cliente.facturas, { eager: true })
    cliente: DatosPersonales;

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
