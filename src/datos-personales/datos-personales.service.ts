import { Injectable } from '@nestjs/common';
import { CreateDatosPersonaleDto } from './dto/create-datos-personale.dto';
import { UpdateDatosPersonaleDto } from './dto/update-datos-personale.dto';

@Injectable()
export class DatosPersonalesService {
  create(createDatosPersonaleDto: CreateDatosPersonaleDto) {
    return 'This action adds a new datosPersonale';
  }

  findAll() {
    return `This action returns all datosPersonales`;
  }

  findOne(id: number) {
    return `This action returns a #${id} datosPersonale`;
  }

  update(id: number, updateDatosPersonaleDto: UpdateDatosPersonaleDto) {
    return `This action updates a #${id} datosPersonale`;
  }

  remove(id: number) {
    return `This action removes a #${id} datosPersonale`;
  }
}
