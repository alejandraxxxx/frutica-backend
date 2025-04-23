// src/oferta/oferta.controller.ts

import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { OfertaService } from './oferta.service';
import { CreateOfertaDto } from './dto/create-oferta.dto';
import { UpdateOfertaDto } from './dto/update-oferta.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserRole } from 'src/usuarios/entities/usuario.entity';
import { Roles } from 'src/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ofertas')
export class OfertaController {
  constructor(private readonly ofertaService: OfertaService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateOfertaDto) {
    return this.ofertaService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.ofertaService.findAll();
  }

  @Get('activas')
  @Roles(UserRole.USER, UserRole.ADMIN)
  findActivas() {
    return this.ofertaService.findOfertasActivas();
  }

  @Get(':id')
  @Roles(UserRole.USER, UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.ofertaService.findOne(+id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateOfertaDto) {
    return this.ofertaService.update(+id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.ofertaService.remove(+id);
  }
}
