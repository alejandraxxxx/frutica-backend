import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TipoEntregaService } from './tipo-entrega.service';
import { CreateTipoEntregaDto } from './dto/create-tipo-entrega.dto';
import { UpdateTipoEntregaDto } from './dto/update-tipo-entrega.dto';
import { UserRole } from 'src/usuarios/entities/usuario.entity';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tipo-entrega')
export class TipoEntregaController {
  constructor(private readonly tipoEntregaService: TipoEntregaService) {}

  @Post()
   @Roles(UserRole.ADMIN, UserRole.USER)
  create(@Body() createTipoEntregaDto: CreateTipoEntregaDto) {
    return this.tipoEntregaService.create(createTipoEntregaDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.USER)
  findAll() {
    return this.tipoEntregaService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  findOne(@Param('id') id: string) {
    return this.tipoEntregaService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateTipoEntregaDto: UpdateTipoEntregaDto) {
    return this.tipoEntregaService.update(+id, updateTipoEntregaDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.tipoEntregaService.remove(+id);
  }
}
