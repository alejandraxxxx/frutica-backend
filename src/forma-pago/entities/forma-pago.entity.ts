import { Factura } from "src/factura/entities/factura.entity";
import { Pago } from "src/pagos/entities/pago.entity";
import { Pedido } from "src/pedidos/entities/pedidos.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";

@Entity()
export class FormaPago {
    @PrimaryGeneratedColumn()
    forma_k: number;

    @Column()
    nombre_forma: string;

    @Column({ default: false })
    requiere_terminacion: boolean;

    @Column({ default: false })
    is_internet: boolean;

    @Column({ nullable: true })
    logo: string;

    @Column()
    activo: boolean;
  
    @OneToMany(() => Factura, factura => factura.formaPago)
    facturas: Factura[];

    @OneToMany(() => Pedido, pedido => pedido.formaPago)
    pedidos: Pedido[];

    @OneToMany(() => Pago, pago => pago.formaPago)
    pagos: Pago[]; // Relación con la tabla Pago
}
