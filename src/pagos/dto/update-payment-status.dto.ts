import { IsEnum } from 'class-validator';
import { PagoState } from '../pagos-estado.enum';

export class UpdatePaymentStatusDto {
  @IsEnum(PagoState, { message: 'Estado de pago no válido' })
  state: PagoState;
}