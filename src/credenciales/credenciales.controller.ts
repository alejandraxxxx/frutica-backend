import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CredencialesService } from './credenciales.service';
import { CreateCredencialeDto } from './dto/create-credenciale.dto';
import { UpdateCredencialeDto } from './dto/update-credenciale.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('credenciales')
export class CredencialesController {
  constructor(private readonly credencialesService: CredencialesService) {}

  @Post()
  create(@Body() createCredencialeDto: CreateCredencialeDto) {
    return this.credencialesService.create(createCredencialeDto);
  }

  @Get()
  findAll() {
    return this.credencialesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.credencialesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCredencialeDto: UpdateCredencialeDto) {
    return this.credencialesService.update(+id, updateCredencialeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.credencialesService.remove(+id);
  }
}
