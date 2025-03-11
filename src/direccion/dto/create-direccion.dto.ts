import { IsNotEmpty, IsString, IsOptional, IsInt, IsDecimal, MaxLength } from 'class-validator';

export class CreateDireccionDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    calle: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    numero?: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(200)
    colonia: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(5)
    cp: string;

    @IsNotEmpty()
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

    @IsNotEmpty()
    @IsString()
    @MaxLength(200)
    referencia: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    municipio?: string;  // Se autocompleta con API COPOMEX

    @IsOptional()
    @IsString()
    @MaxLength(200)
    estado?: string;  // Se autocompleta con API COPOMEX

   /* @IsNotEmpty()
    @IsInt()
    usuario_creacion: number;

    @IsOptional()
    @IsInt()
    usuario_actualizacion?: number;

    @IsNotEmpty()
    @IsInt()
    activo: number;*/

    @IsOptional()
    @IsString()
    @MaxLength(100)
    maps_url?: string;  // Se generará con Google Maps API

    @IsOptional()
    @IsDecimal({ decimal_digits: '0,6' })
    latitud?: number;  // Se generará con Google Maps API

    @IsOptional()
    @IsDecimal({ decimal_digits: '0,6' })
    longitud?: number;  // Se generará con Google Maps API
}
