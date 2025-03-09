import { Categoria } from "src/categoria/entities/categoria.entity";
import { DetalleFactura } from "src/detalle-factura/entities/detalle-factura.entity";
import { InventarioMovimiento } from "src/inventario-movimiento/entities/inventario-movimiento.entity";
import { Precio } from "src/precio/entities/precio.entity";
import { Venta } from "src/venta/entities/venta.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";

@Entity()
export class Producto {
    @PrimaryGeneratedColumn()
    producto_k: number;

    @Column({ length: 50 })
    codigo_producto: string;

    @Column({ length: 200 })
    nombre: string;

    @Column()
    texto_plano: boolean;

    @Column()
    seccion: number;

    @Column({ length: 200, nullable: true })
    foto: string;

    @Column({ length: 30 })
    disponibilidad: string;

    @Column({ length: 100, nullable: true })
    temporada: string;

    @Column({ length: 100, nullable: true })
    clave: string;

    @Column({ length: 45, nullable: true })
    color: string;

    @Column({ length: 45 })
    proveedor: string;

    @Column({ length: 45, nullable: true })
    tamano: string;

    @Column({ length: 45 })
    tipo: string;

    @Column({ length: 45 })
    unidad_medida: string;

    @Column()
    total_existencias: number;

    @Column()
    estatus: number;

    @Column({ nullable: true })
    requiere_pesaje: boolean;

    @Column({ nullable: true })
    num_lotes: number;

    @Column({ type: "date", nullable: true })
    fecha_ultima_venta: Date;

    @Column({ type: "date", nullable: true })
    fecha_ultima_compra: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    fecha_actualizacion: Date;

    @Column()
    num_comentarios: number;

    @Column()
    numero_ventas: number;

    @Column()
    numero_compras: number;

    @ManyToOne(() => Precio, precio => precio.productos)
    precio: Precio;

    @ManyToOne(() => Categoria, categoria => categoria.productos)
    categoria: Categoria;

    @Column({ default: 0 })
    mayoreo: boolean;

    @Column({ nullable: true })
    piezas_minimas: number;

    @OneToMany(() => Venta, venta => venta.producto)
    ventas: Venta[];

    @OneToMany(() => DetalleFactura, detalle => detalle.producto)
    detallesFactura: DetalleFactura[];

    @OneToMany(() => InventarioMovimiento, movimiento => movimiento.producto)
    movimientosInventario: InventarioMovimiento[];
}