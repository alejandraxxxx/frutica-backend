import { Injectable } from '@nestjs/common';
import { CreateFormaPagoDto } from './dto/create-forma-pago.dto';
import { UpdateFormaPagoDto } from './dto/update-forma-pago.dto';

@Injectable()
export class FormaPagoService {
  create(createFormaPagoDto: CreateFormaPagoDto) {
    return 'This action adds a new formaPago';
  }

  findAll() {
    return `This action returns all formaPago`;
  }

  findOne(id: number) {
    return `This action returns a #${id} formaPago`;
  }

  update(id: number, updateFormaPagoDto: UpdateFormaPagoDto) {
    return `This action updates a #${id} formaPago`;
  }

  remove(id: number) {
    return `This action removes a #${id} formaPago`;
  }
}
