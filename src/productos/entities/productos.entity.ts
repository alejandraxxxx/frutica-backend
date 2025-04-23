import { Type } from "class-transformer";
import { IsNumber } from "class-validator";
import { Categoria } from "src/categoria/entities/categoria.entity";
import { DetalleFactura } from "src/detalle-factura/entities/detalle-factura.entity";
import { InventarioMovimiento } from "src/inventario-movimiento/entities/inventario-movimiento.entity";
import { ListaDeseos } from "src/lista-deseos/entities/lista-deseo.entity";
import { Oferta } from "src/oferta/entities/oferta.entity";
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
    descripcion: string;

    @Column('simple-array',{nullable: true })
    foto: string[];

    @Column({ type: "float", nullable: true })
    precio_por_kg: number;

    @Column({ type: "float", nullable: true })
    precio_por_pieza: number;

    @Column({ type: "enum", enum: ["kg", "pieza"], default: "kg" })
    unidad_venta: "kg" | "pieza"; // sugerencia por defecto

    @Column({ type: "float", nullable: true })
    peso_promedio: number; // usado para estimar precio por pieza si se vende por peso

    @Column({ type: 'float', nullable: true })
    peso_total: number;

    @Column()
    total_existencias: number;

    @Column({ type: "boolean", default: true })
    activo: boolean;

    @Column({ type: "boolean", default: true })
    requiere_pesaje: boolean;

    /** Hook que desactiva el producto si se queda sin existencias */
    /*@BeforeInsert()
    @BeforeUpdate()
    checkExistencias() {
        this.activo = this.total_existencias > 0;
    }

    // Hook que actualiza automáticamente el campo `activo`
    @BeforeInsert()
    @BeforeUpdate()
    actualizarEstadoActivo() {
        this.activo = this.total_existencias > 0;
    }*/

    
    @Column({ type: "boolean", default: false })
    usa_tamano: boolean;


    @Column({ type: "float", nullable: true })
    peso_estimado: number; // según tamaño, útil si no se pesa individualmente

    @Column({ type: "enum", enum: ["kg", "g"], default: "kg" })
    unidad_peso: string;

    @Column({ length: 100, nullable: true })
    temporada: string;

    @Column({ length: 45 })
    proveedor: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    fecha_actualizacion: Date;

    @Column({ default: 0 })
    num_comentarios: number;

    @Column({ default: 0 })
    numero_ventas: number;


    @ManyToOne(() => Categoria, categoria => categoria.productos)
    categoria: Categoria;

    @OneToMany(() => DetalleFactura, detalle => detalle.producto)
    detallesFactura: DetalleFactura[];

    @OneToMany(() => InventarioMovimiento, movimiento => movimiento.producto)
    movimientosInventario: InventarioMovimiento[];

    @Column({ type: 'float', nullable: true })
    peso_chico: number;

    @Column({ type: 'float', nullable: true })
    peso_mediano: number;

    @Column({ type: 'float', nullable: true })
    peso_grande: number;

    @OneToMany(() => Oferta, oferta => oferta.producto)
    ofertas: Oferta[];

    @OneToMany(() => ListaDeseos, lista => lista.producto)
    listaDeseos: ListaDeseos[];

}

