import { Type } from "class-transformer";
import { IsNumber } from "class-validator";
import { Categoria } from "src/categoria/entities/categoria.entity";
import { DetalleFactura } from "src/detalle-factura/entities/detalle-factura.entity";
import { InventarioMovimiento } from "src/inventario-movimiento/entities/inventario-movimiento.entity";
import { Precio } from "src/precio/entities/precio.entity";
import { Venta } from "src/venta/entities/venta.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, BeforeInsert, BeforeUpdate } from "typeorm";
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Producto {
    @PrimaryGeneratedColumn()
    producto_k: number;

    @Column({ length: 50, nullable: true, unique: true })
    codigo_producto: string;

    @BeforeInsert()
    asignarCodigo() {
        if (!this.codigo_producto) {
            this.codigo_producto = `PROD-${uuidv4().split('-')[0].toUpperCase()}`;
        }
    }

    @Column({ length: 200 })
    nombre: string;

    @Column({ length: 500, nullable: true })
    descripcion: string; // Descripción del producto

    @Column('simple-array')
    foto: string[];

    @Type(() => Number)
    @IsNumber()
    precio_estimado: number; // Precio base por unidad o kg

    @Column({ type: "enum", enum: ["kg", "unidad"], default: "kg" })
    unidad_venta: "kg" | "unidad"; // Si el precio es por KG o unidad

    @Column({ type: "float", nullable: true })
    peso_promedio: number; // Peso promedio de una unidad (Ej: 200g por mandarina)

    @Column()
    total_existencias: number; // Cantidad disponible en stock (kg o unidades)

    @Column({ type: "boolean", default: true })
    activo: boolean; // Si el producto está disponible

    /** ✅ Hook que desactiva el producto si se queda sin existencias */
    @BeforeInsert()
    @BeforeUpdate()
    checkExistencias() {
        this.activo = this.total_existencias > 0;
    }

    // ✅ Hook que actualiza automáticamente el campo `activo`
    @BeforeInsert()
    @BeforeUpdate()
    actualizarEstadoActivo() {
        this.activo = this.total_existencias > 0;
    }

    
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

    @Column({ length: 45 })
    proveedor: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    fecha_actualizacion: Date;

    @Column()
    num_comentarios: number;

    @Column()
    numero_ventas: number;

    @ManyToOne(() => Precio, precio => precio.productos)
    precio: Precio;

    @ManyToOne(() => Categoria, categoria => categoria.productos)
    categoria: Categoria;

    @OneToMany(() => DetalleFactura, detalle => detalle.producto)
    detallesFactura: DetalleFactura[];

    @OneToMany(() => InventarioMovimiento, movimiento => movimiento.producto)
    movimientosInventario: InventarioMovimiento[];
}

