import { IsEnum, IsOptional } from 'class-validator';
import { EstadoPedido } from '../pedido-estado.enum';

export class CambiarEstadoPedidoDto {
  @IsEnum(EstadoPedido)
  nuevoEstado: EstadoPedido;

  @IsOptional()
  comentario?: string;
}
