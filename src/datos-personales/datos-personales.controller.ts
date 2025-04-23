import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DatosPersonalesService } from './datos-personales.service';
import { CreateDatosPersonaleDto } from './dto/create-datos-personale.dto';
import { UpdateDatosPersonaleDto } from './dto/update-datos-personale.dto';
import { UserRole } from 'src/usuarios/entities/usuario.entity';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';


@UseGuards(JwtAuthGuard, RolesGuard)

@Controller('datos-personales')
export class DatosPersonalesController {
  constructor(private readonly datosPersonalesService: DatosPersonalesService) {}

  @Post()
   @Roles(UserRole.ADMIN, UserRole.USER)
  create(@Body() createDatosPersonaleDto: CreateDatosPersonaleDto) {
    return this.datosPersonalesService.create(createDatosPersonaleDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.datosPersonalesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  findOne(@Param('id') id: string) {
    return this.datosPersonalesService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  update(@Param('id') id: string, @Body() updateDatosPersonaleDto: UpdateDatosPersonaleDto) {
    return this.datosPersonalesService.update(+id, updateDatosPersonaleDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  remove(@Param('id') id: string) {
    return this.datosPersonalesService.remove(+id);
  }
}
