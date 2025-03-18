import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoEntregaDto } from './create-tipo-entrega.dto';

export class UpdateTipoEntregaDto extends PartialType(CreateTipoEntregaDto) {}
