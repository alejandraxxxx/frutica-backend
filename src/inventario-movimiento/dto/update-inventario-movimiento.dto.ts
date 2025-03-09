import { PartialType } from '@nestjs/mapped-types';
import { CreateInventarioMovimientoDto } from './create-inventario-movimiento.dto';

export class UpdateInventarioMovimientoDto extends PartialType(CreateInventarioMovimientoDto) {}
