import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FormaPagoService } from './forma-pago.service';
import { CreateFormaPagoDto } from './dto/create-forma-pago.dto';
import { UpdateFormaPagoDto } from './dto/update-forma-pago.dto';

@Controller('forma-pago')
export class FormaPagoController {
  constructor(private readonly formaPagoService: FormaPagoService) {}

  @Post()
  create(@Body() createFormaPagoDto: CreateFormaPagoDto) {
    return this.formaPagoService.create(createFormaPagoDto);
  }

  @Get()
  findAll() {
    return this.formaPagoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formaPagoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFormaPagoDto: UpdateFormaPagoDto) {
    return this.formaPagoService.update(+id, updateFormaPagoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.formaPagoService.remove(+id);
  }
}
