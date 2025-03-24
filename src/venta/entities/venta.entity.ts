import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Usuario } from "src/usuarios/entities/usuario.entity";
import { Cliente } from "src/clientes/entities/cliente.entity";

@Entity()
export class Venta {
    @PrimaryGeneratedColumn()
    venta_k: number;

    @ManyToOne(() => Usuario, usuario => usuario.ventas, { nullable: true })
    usuario: Usuario;

    @ManyToOne(() => Cliente, cliente => cliente.ventas, { nullable: true })
    cliente: Cliente;

    @Column({ type: "decimal" })
    monto_total: number; // ✅ Se agregó para registrar el total de la venta

    @Column({ type: "decimal", nullable: true })
    monto_iva: number;

    @Column({ type: "int", default: 0 })
    porcentaje_descuento_aplicado: number;

    @Column({ type: "enum", enum: ['confirmada', 'fallida', 'reembolsada'] })
    estado_venta: string; // ✅ Se agregó para manejar ventas canceladas o con problemas

    @Column({ length: 45, default: "Efectivo" })
    forma_pago: string;

    @Column({ length: 100, nullable: true })
    url_comprobante: string;

    @Column({ length: 20 })
    status_pago: string;

    @Column({ type: "datetime" })
    fecha: Date;
}
