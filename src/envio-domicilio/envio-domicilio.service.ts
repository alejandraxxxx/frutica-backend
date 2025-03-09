import { Injectable } from '@nestjs/common';
import { CreateEnvioDomicilioDto } from './dto/create-envio-domicilio.dto';
import { UpdateEnvioDomicilioDto } from './dto/update-envio-domicilio.dto';

@Injectable()
export class EnvioDomicilioService {
  create(createEnvioDomicilioDto: CreateEnvioDomicilioDto) {
    return 'This action adds a new envioDomicilio';
  }

  findAll() {
    return `This action returns all envioDomicilio`;
  }

  findOne(id: number) {
    return `This action returns a #${id} envioDomicilio`;
  }

  update(id: number, updateEnvioDomicilioDto: UpdateEnvioDomicilioDto) {
    return `This action updates a #${id} envioDomicilio`;
  }

  remove(id: number) {
    return `This action removes a #${id} envioDomicilio`;
  }
}
