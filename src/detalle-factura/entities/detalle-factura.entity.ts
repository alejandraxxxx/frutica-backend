import { Factura } from "src/factura/entities/factura.entity";
import { Producto } from "src/productos/entities/productos.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";

@Entity()
export class DetalleFactura {
    @PrimaryGeneratedColumn()
    detalle_k: number;

    @ManyToOne(() => Factura, factura => factura.detallesFactura)
    factura: Factura;

    @ManyToOne(() => Producto, producto => producto.detallesFactura)
    producto: Producto;

    @Column()
    cantidad: number;

    @Column({ type: "decimal" })
    precio_unitario: number;

    @Column({ type: "decimal" })
    subtotal: number;
}
