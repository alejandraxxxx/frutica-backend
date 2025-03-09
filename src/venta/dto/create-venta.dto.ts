import { IsString, IsOptional, IsInt, IsNumber, MaxLength, IsBoolean, IsDate } from 'class-validator';

export class CreateVentaDto {
    @IsString()
    @MaxLength(60)
    forma_entrega_k: string;

    @IsOptional()
    @IsDate()
    fecha_envio?: Date;

    @IsOptional()
    @IsDate()
    fecha_entregado?: Date;

    @IsOptional()
    @IsNumber()
    costo_envio?: number;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    quien_recibe?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    firma_url?: string;

    @IsString()
    @MaxLength(45)
    forma_pago_k: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    url_comprobante?: string;

    @IsString()
    @MaxLength(20)
    status_pago: string;

    @IsNumber()
    monto_iva: number;

    @IsInt()
    porcentaje_descuento_aplicado: number;

    @IsInt()
    facturada: number;

    @IsInt()
    num_comentarios: number;

    @IsOptional()
    @IsNumber()
    monto_venta_unitario?: number;

    @IsNumber()
    cantidad_pago: number;

    @IsInt()
    cantidad_productos: number;

    @IsDate()
    fecha: Date;

    @IsDate()
    timestamp: Date;

    @IsInt()
    estatus: number;

    @IsBoolean()
    activo: boolean;

    @IsInt()
    productoProductoK: number;

    @IsInt()
    usuarioUsuarioK: number;

    @IsInt()
    clienteClienteK: number;

    @IsInt()
    pedidoPedidoK: number;
}

