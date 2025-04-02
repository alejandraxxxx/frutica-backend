import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FormaPagoService } from './forma-pago.service';
import { CreateFormaPagoDto } from './dto/create-forma-pago.dto';
import { UpdateFormaPagoDto } from './dto/update-forma-pago.dto';
import { UserRole } from 'src/usuarios/entities/usuario.entity';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('forma-pago')
export class FormaPagoController {
  constructor(private readonly formaPagoService: FormaPagoService) {}

  @Post()
   @Roles(UserRole.ADMIN)
  create(@Body() createFormaPagoDto: CreateFormaPagoDto) {
    return this.formaPagoService.create(createFormaPagoDto);
  }

  @Get()
   @Roles(UserRole.ADMIN, UserRole.USER)
  findAll() {
    return this.formaPagoService.findAll();
  }

  @Get(':id')
   @Roles(UserRole.ADMIN, UserRole.USER)
  findOne(@Param('id') id: string) {
    return this.formaPagoService.findOne(+id);
  }

  @Patch(':id')
   @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateFormaPagoDto: UpdateFormaPagoDto) {
    return this.formaPagoService.update(+id, updateFormaPagoDto);
  }

  @Delete(':id')
   @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.formaPagoService.remove(+id);
  }
  @Get('activos')
   @Roles(UserRole.ADMIN)
    async getActivePayments() {
    return await this.formaPagoService.getActivePaymentMethods();
    }

}
