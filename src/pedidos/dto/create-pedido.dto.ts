import { IsString, IsEnum, IsOptional, IsInt, IsDecimal, MaxLength, IsNumber } from 'class-validator';

export class CreatePedidoDto {
    @IsEnum(['Entrega a domicilio', 'Pasar a recoger'])
    tipo_entrega: 'Entrega a domicilio' | 'Pasar a recoger';
  
    @IsNumber()
    formaPagoId: number;
  
    @IsOptional()
    @IsNumber()
    direccionId?: number;

    @IsOptional()
    @IsNumber()
    usuarioId?: number;
  
    @IsOptional()
    @IsString()
    comentario?: string;
  
    @IsString()
    fecha_entrega: string;
  
    @IsString()
    horario_entrega: string;
  
    @IsNumber()
    costo_envio: number;
  
  }
  