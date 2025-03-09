import { IsString, IsEnum, IsOptional, MaxLength, IsInt } from 'class-validator';

export class CreateNotificacioneDto {
    @IsString()
    @MaxLength(100)
    titulo: string;

    @IsString()
    mensaje: string;

    @IsEnum(['info', 'exito', 'error', 'advertencia'])
    tipo: 'info' | 'exito' | 'error' | 'advertencia';

    @IsOptional()
    @IsString()
    @MaxLength(100)
    icono?: string;

    @IsString()
    @MaxLength(45)
    boton_texto: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    boton_accion?: string;

    @IsEnum(['pendiente', 'visto', 'descartado'])
    estatus: 'pendiente' | 'visto' | 'descartado';

    @IsOptional()
    @IsInt()
    usuarioUsuarioK?: number;
}

