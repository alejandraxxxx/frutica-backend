import { FormaPago } from "src/forma-pago/entities/forma-pago.entity";
import { Pedido } from "src/pedidos/entities/pedidos.entity";
import { Usuario } from "src/usuarios/entities/usuario.entity";
import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { PagoState } from "../pagos-estado.enum";
import { Carrito } from "src/carrito/entities/carrito.entity";

@Entity()
export class Pago {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: PagoState, default: PagoState.PENDIENTE })
    estado: string; // Estado del pago

    @Column()
    metodo: string; // Tarjeta, SPEI o efectivo

    @Column({ type: 'timestamp' })
    fecha_pago: Date;

    @Column({ nullable: true })
    external_transaction_id: string; // ID de la transacción en Stripe (solo para tarjeta y SPEI)
    
    @OneToOne(() => Pedido, pedido => pedido.pago)
    pedido: Pedido;

    @ManyToOne(() => FormaPago, formaPago => formaPago.pagos, { nullable: true })
    formaPago: FormaPago; // Esta es la relación correcta

    @ManyToOne(() => Usuario, usuario => usuario.pagos, { nullable: true }) 
    usuario: Usuario; // Relación con la tabla users

    @ManyToOne(() => Carrito, carrito => carrito.id) 
    carrito: Carrito; // Relación con el carrito
    
    @Column({ nullable: true })
    clientSecret: string;  // Guardar el clientSecret de Stripe

    @Column({ nullable: true }) // 🔹 Nuevo campo para guardar la URL del comprobante
    comprobante_url: string;
}
