
import { Factura } from "src/factura/entities/factura.entity";
import { Pedido } from "src/pedidos/entities/pedidos.entity";
import { Usuario } from "src/usuarios/entities/usuario.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";

@Entity()
export class DatosPersonales {

    @PrimaryGeneratedColumn()
    cliente_k: number;

    @Column({ default: 0 })
    tipo_persona: number;

    @Column({ length: 20 })
    rfc: string;

    @Column({ nullable: true, length: 100 })
    alias: string;

    @Column({ nullable: true, length: 300 })
    razon_social: string;

    @Column({ nullable: true, length: 10 })
    regimen_fiscal: string;


    @Column({ nullable: true, length: 45 })
    uso_factura: string;

    @Column({ type: "date", nullable: true })
    fecha_nacimiento: Date;

    @Column({ nullable: true })
    genero: number;

    @Column({ type: "datetime", nullable: true })
    fecha_ultima_venta: Date;

    @Column({ nullable: true, type: "blob" })
    foto: Buffer;

    @Column()
    num_ventas: number;

    @Column({ default: 0 })
    num_comentarios: number;

    @Column({ nullable: true })
    misma_direccion_factura: boolean;

    @Column({ type: "timestamp" })
    fecha_ultima_modificacion: Date;

    @Column({ default: 1 })
    estatus: number;

    @Column({ nullable: true, length: 500 })
    comentarios: string;

    @ManyToOne(() => Usuario, (usuario) => usuario.usuario_k, { eager: true })
    usuario: Usuario;

    // 📄 Un cliente puede tener muchas facturas
    @OneToMany(() => Factura, (factura) => factura.cliente)
    facturas: Factura[];

    // 🧾 Un cliente puede tener muchos pedidos
    @OneToMany(() => Pedido, (pedido) => pedido.pedido_k)
    pedidos: Pedido[]

}
