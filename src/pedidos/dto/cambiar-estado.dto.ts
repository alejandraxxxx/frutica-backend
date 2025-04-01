import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EstadoPedido } from '../pedido-estado.enum';

export class CambiarEstadoPedidoDto {
  @IsEnum(EstadoPedido)
  nuevoEstado: EstadoPedido;

  @IsOptional()
  @IsString()
  comentario?: string;
}
