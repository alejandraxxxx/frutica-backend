import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class CreateFormaPagoDto {
    @IsString()
    @MaxLength(255)
    nombre_forma: string;

    @IsBoolean()
    requiere_terminacion: boolean;

    @IsBoolean()
    is_internet: boolean;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    logo?: string;

    @IsBoolean()
    activo: boolean;
}

