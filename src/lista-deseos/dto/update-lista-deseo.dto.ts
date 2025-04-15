import { PartialType } from '@nestjs/mapped-types';
import { CreateListaDeseoDto } from './create-lista-deseo.dto';

export class UpdateListaDeseoDto extends PartialType(CreateListaDeseoDto) {}
