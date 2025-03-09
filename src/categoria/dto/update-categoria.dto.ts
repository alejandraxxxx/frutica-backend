import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaDto } from './create-categoria.dto';

import {
    IsString,
    IsOptional,
    IsInt,
    IsBoolean,
    MaxLength
} from 'class-validator';

export class UpdateCategoriaDto {
    @IsOptional()
    @IsString()
    @MaxLength(45)
    nombre?: string;

    @IsOptional()
    @IsString()
    @MaxLength(45)
    tabla?: string;

    @IsOptional()
    @IsInt()
    orden?: number;

    @IsOptional()
    @IsString()
    @MaxLength(45)
    descripcion?: string;

    @IsOptional()
    @IsInt()
    clave?: number;

    @IsOptional()
    @IsBoolean()
    activo?: boolean;
}
