// pedidos/dto/filtrar-pedidos.dto.ts
import { IsEnum } from 'class-validator';
import { EstadoPedido } from '../pedido-estado.enum';


export class FiltrarPedidosDto {
    @IsEnum(EstadoPedido, {
      message: ({ value }) =>
        `El estado '${value}' no es válido. Valores permitidos: ${Object.values(EstadoPedido).join(', ')}`,
    })
    estado: EstadoPedido;
  }