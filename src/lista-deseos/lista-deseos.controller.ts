import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ListaDeseosService } from './lista-deseos.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/usuarios/entities/usuario.entity';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';

@Controller('lista-deseos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ListaDeseosController {
  constructor(private readonly listaService: ListaDeseosService) {}

  @Post(':productoId')
  @Roles(UserRole.USER, UserRole.ADMIN)
  agregar(@Param('productoId') productoId: number, @Req() req: RequestWithUser) {
    return this.listaService.agregar(req.user.id, productoId);
  }

  @Delete(':productoId')
  @Roles(UserRole.USER, UserRole.ADMIN)
  quitar(@Param('productoId') productoId: number, @Req() req: RequestWithUser) {
    return this.listaService.quitar(req.user.id, productoId);
  }

  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN)
  obtener(@Req() req: RequestWithUser) {
    return this.listaService.obtenerPorUsuario(req.user.id);
  }
}
