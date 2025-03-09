import { IsString, IsInt, IsOptional, IsDecimal, MaxLength } from 'class-validator';

export class CreateDireccionDto {
    @IsString()
    @MaxLength(1000)
    calle: string;

    @IsString()
    @MaxLength(200)
    colonia: string;

    @IsString()
    @MaxLength(200)
    ciudad: string;

    @IsString()
    @MaxLength(200)
    estado: string;

    @IsString()
    @MaxLength(5)
    cp: string;

    @IsString()
    @MaxLength(200)
    pais: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    numExterior?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    numInterior?: string;

    @IsString()
    @MaxLength(200)
    referencia: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    localidad?: string;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    localidad_k?: string;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    colonia_k?: string;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    municipio_k?: string;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    estado_k?: string;

    @IsInt()
    usuario_creacion: number;

    @IsOptional()
    @IsInt()
    usuario_actualizacion?: number;

    @IsInt()
    activo: number;

    @IsString()
    @MaxLength(100)
    maps_url: string;

    @IsDecimal()
    latitud: number;

    @IsDecimal()
    longitud: number;

    @IsOptional()
    @IsInt()
    clienteClienteK?: number;

    @IsInt()
    usuarioUsuarioK: number;
}
