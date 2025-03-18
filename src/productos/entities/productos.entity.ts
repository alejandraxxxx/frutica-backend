import { Categoria } from "src/categoria/entities/categoria.entity";
import { DetalleFactura } from "src/detalle-factura/entities/detalle-factura.entity";
import { InventarioMovimiento } from "src/inventario-movimiento/entities/inventario-movimiento.entity";
import { Precio } from "src/precio/entities/precio.entity";
import { Venta } from "src/venta/entities/venta.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class Producto {
    @PrimaryGeneratedColumn()
    producto_k: number;

    @Column({ length: 50 })
    codigo_producto: string;

    @Column({ length: 200 })
    nombre: string;

    @Column({ length: 500, nullable: true })
    descripcion: string; // Descripción del producto

    @Column({ length: 200, nullable: true })
    foto: string;

    @Column({ type: "float" })
    precio_estimado: number; // Precio base por unidad o kg

    @Column({ type: "enum", enum: ["kg", "unidad"], default: "kg" })
    unidad_venta: "kg" | "unidad"; // Si el precio es por KG o unidad

    @Column({ type: "float", nullable: true })
    peso_promedio: number; // Peso promedio de una unidad (Ej: 200g por mandarina)

    @Column()
    total_existencias: number; // Cantidad disponible en stock (kg o unidades)

    @Column({ type: "boolean", default: true })
    activo: boolean; // Si el producto está disponible

    @Column({ type: "boolean", default: false })
    requiere_pesaje: boolean; // Si el peso exacto se calcula al pesar el producto

    @Column({ type: "boolean", default: false })
    usa_tamano: boolean; // Si el producto usa tamaños (Ej: Sandía Grande, Mediana, Chica)

    @Column({ type: "enum", enum: ["Chico", "Mediano", "Grande"], nullable: true })
    tamano: "Chico" | "Mediano" | "Grande"; // Tamaño del producto si usa_tamano = true

    @Column({ type: "float", nullable: true })
    peso_estimado: number; // Peso estimado en gramos basado en el tamaño

    @Column({ type: "boolean", default: false })
    variaciones_precio: boolean; // Si el producto puede tener variaciones de precio por peso

    @Column({ type: "float", nullable: true })
    peso_total: number; // Peso total en gramos (si aplica)

    @Column({ type: "enum", enum: ["kg", "g"], default: "kg" })
    unidad_peso: string; // Unidad de peso (Kg o gramos)

    @Column({ length: 100, nullable: true })
    temporada: string; 

    @Column({ length: 100, nullable: true })
    clave: string;

    @Column({ length: 45, nullable: true })
    color: string;

    @Column({ length: 45 })
    proveedor: string;

    @Column({ length: 45 })
    tipo: string;

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
