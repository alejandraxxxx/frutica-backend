import { Injectable } from '@nestjs/common';
import { CreateTipoEntregaDto } from './dto/create-tipo-entrega.dto';
import { UpdateTipoEntregaDto } from './dto/update-tipo-entrega.dto';

@Injectable()
export class TipoEntregaService {
  create(createTipoEntregaDto: CreateTipoEntregaDto) {
    return 'This action adds a new tipoEntrega';
  }

  findAll() {
    return `This action returns all tipoEntrega`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tipoEntrega`;
  }

  update(id: number, updateTipoEntregaDto: UpdateTipoEntregaDto) {
    return `This action updates a #${id} tipoEntrega`;
  }

  remove(id: number) {
    return `This action removes a #${id} tipoEntrega`;
  }
}
