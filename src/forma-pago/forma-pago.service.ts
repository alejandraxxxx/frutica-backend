import { Injectable } from '@nestjs/common';
import { CreateFormaPagoDto } from './dto/create-forma-pago.dto';
import { UpdateFormaPagoDto } from './dto/update-forma-pago.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FormaPago } from './entities/forma-pago.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FormaPagoService {

  constructor(
    @InjectRepository(FormaPago)
    private readonly formaPagoRepository: Repository<FormaPago>){}

    
    async create(createFormaPagoDto: CreateFormaPagoDto): Promise<FormaPago> {
      const nuevaForma = this.formaPagoRepository.create(createFormaPagoDto);
      return await this.formaPagoRepository.save(nuevaForma);
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

  async getActivePaymentMethods() {
    return await this.formaPagoRepository.find({ where: { activo: true } });
}
}
