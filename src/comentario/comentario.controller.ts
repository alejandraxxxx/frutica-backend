import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ComentarioService } from './comentario.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/usuarios/entities/usuario.entity';

@Controller('comentario')
export class ComentarioController {
  constructor(private readonly comentarioService: ComentarioService) {}

  @Post()
   @Roles(UserRole.ADMIN, UserRole.USER)
  create(@Body() createComentarioDto: CreateComentarioDto) {
    return this.comentarioService.create(createComentarioDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.comentarioService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  findOne(@Param('id') id: string) {
    return this.comentarioService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  update(@Param('id') id: string, @Body() updateComentarioDto: UpdateComentarioDto) {
    return this.comentarioService.update(+id, updateComentarioDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  remove(@Param('id') id: string) {
    return this.comentarioService.remove(+id);
  }
}
