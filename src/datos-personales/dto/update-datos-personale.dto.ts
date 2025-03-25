import { PartialType } from '@nestjs/mapped-types';
import { CreateDatosPersonaleDto } from './create-datos-personale.dto';

export class UpdateDatosPersonaleDto extends PartialType(CreateDatosPersonaleDto) {}
