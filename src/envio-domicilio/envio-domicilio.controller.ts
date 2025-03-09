import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EnvioDomicilioService } from './envio-domicilio.service';
import { CreateEnvioDomicilioDto } from './dto/create-envio-domicilio.dto';
import { UpdateEnvioDomicilioDto } from './dto/update-envio-domicilio.dto';

@Controller('envio-domicilio')
export class EnvioDomicilioController {
  constructor(private readonly envioDomicilioService: EnvioDomicilioService) {}

  @Post()
  create(@Body() createEnvioDomicilioDto: CreateEnvioDomicilioDto) {
    return this.envioDomicilioService.create(createEnvioDomicilioDto);
  }

  @Get()
  findAll() {
    return this.envioDomicilioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.envioDomicilioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEnvioDomicilioDto: UpdateEnvioDomicilioDto) {
    return this.envioDomicilioService.update(+id, updateEnvioDomicilioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.envioDomicilioService.remove(+id);
  }
}
