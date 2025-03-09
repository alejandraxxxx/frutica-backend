import { IsString, IsInt, IsOptional, IsBoolean, MaxLength, IsEmail, IsDate } from 'class-validator';

export class CreateEmpleadoDto {
    @IsInt()
    tipo_persona: number;

    @IsOptional()
    @IsInt()
    genero?: number;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    estado_civil?: string;

    @IsString()
    @MaxLength(100)
    nombre: string;

    @IsString()
    @MaxLength(100)
    apellido_paterno: string;

    @IsString()
    @MaxLength(100)
    apellido_materno: string;

    @IsString()
    @MaxLength(20)
    rfc: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    curp?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    alias?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    contacto_emergencia?: string;

    @IsOptional()
    @IsString()
    @MaxLength(300)
    razon_social?: string;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    regimen_fiscal?: string;

    @IsEmail()
    @MaxLength(100)
    email: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    foto?: string;

    @IsOptional()
    @IsString()
    @MaxLength(5)
    uso_factura?: string;

    @IsString()
    @MaxLength(45)
    area_a_cargo: string;

    @IsBoolean()
    es_operador_transporte: boolean;

    @IsOptional()
    @IsDate()
    fecha_empresa_ingreso?: Date;

    @IsOptional()
    @IsDate()
    fecha_empresa_baja?: Date;

    @IsOptional()
    @IsDate()
    fecha_cambio_area_cargo?: Date;

    @IsOptional()
    @IsDate()
    fecha_nacimiento?: Date;

    @IsOptional()
    @IsInt()
    edad?: number;

    @IsString()
    @MaxLength(100)
    mes_cumpleaños: string;

    @IsOptional()
    @IsInt()
    numero_seguro_social?: number;

    @IsInt()
    tipo_empleado: number;

    @IsInt()
    usuario_creacion: number;

    @IsOptional()
    @IsInt()
    usuario_modificacion_k?: number;

    @IsInt()
    estatus: number;

    @IsBoolean()
    activo: boolean;
}

