import { PartialType } from '@nestjs/mapped-types';
import { CreateDetalleFacturaDto } from './create-detalle-factura.dto';

export class UpdateDetalleFacturaDto extends PartialType(CreateDetalleFacturaDto) {}
