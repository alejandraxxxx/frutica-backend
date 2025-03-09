import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateComentarioDto {
    @IsString()
    @MaxLength(45)
    tabla: string;

    @IsOptional()
    @IsString()
    @MaxLength(45)
    titulo?: string;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsOptional()
    @IsString()
    @MaxLength(45)
    comentarioscol?: string;

    @IsOptional()
    @IsString()
    @MaxLength(45)
    email?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    web?: string;

    @IsInt()
    estatus: number;

    @IsOptional()
    @IsInt()
    tiene_respuestas?: number;

    @IsOptional()
    @IsInt()
    megusta?: number;

    @IsOptional()
    timestamp?: Date;

    @IsInt()
    activo: number;

    @IsOptional()
    @IsInt()
    comentarioPadreComentarioK?: number;

    @IsInt()
    usuarioUsuarioK: number;
}
