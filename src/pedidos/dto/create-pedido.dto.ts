import { IsString, IsEnum, IsOptional, IsInt, IsDecimal, MaxLength } from 'class-validator';

export class CreatePedidoDto {
    @IsDecimal()
    total: number;


    @IsString()
    @MaxLength(20)
    estado: string;

    @IsString()
    @MaxLength(15)
    registrado_desde: string;

    @IsOptional()
    @IsInt()
    usuarioUsuarioK?: number;

    @IsOptional()
    @IsInt()
    formaPagoFormaK?: number;

    @IsOptional()
    @IsInt()
    clienteClienteK?: number;

    @IsOptional()
    @IsInt()
    envioDomicilioEnvioK?: number;
    
    @IsOptional()
    @IsInt()
    tipoEntregaEnvioK?: number;

    @IsOptional()
    @IsInt()
    comentarioComentarioK?: number;
}
