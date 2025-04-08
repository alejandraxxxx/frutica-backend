import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsInt,
    MaxLength,
    IsBoolean,
    IsNumber,
  } from 'class-validator';
  
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
    @MaxLength(200)
    referencia?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(200)
    municipio?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(200)
    estado?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(50)
    localidad?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(300)
    maps_url?: string;
  
    @IsOptional()
    @IsNumber({}, { message: 'latitud debe ser un número decimal' })
    latitud?: number;
  
    @IsOptional()
    @IsNumber({}, { message: 'longitud debe ser un número decimal' })
    longitud?: number;
  
    @IsOptional()
    @IsBoolean()
    es_publica?: boolean;
  }
  