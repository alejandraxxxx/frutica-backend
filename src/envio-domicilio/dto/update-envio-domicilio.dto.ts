import { PartialType } from '@nestjs/mapped-types';
import { CreateEnvioDomicilioDto } from './create-envio-domicilio.dto';

export class UpdateEnvioDomicilioDto extends PartialType(CreateEnvioDomicilioDto) {}
