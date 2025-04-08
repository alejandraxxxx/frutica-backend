import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
  } from '@nestjs/common';
  import { DireccionesService } from './direccion.service';
  import { CreateDireccionDto } from './dto/create-direccion.dto';
  import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
  import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/usuarios/entities/usuario.entity';
import { RolesGuard } from 'src/guards/roles.guard';
  
  @Controller('direcciones')
  export class DireccionesController {
    constructor(private readonly direccionesService: DireccionesService) {}
  
    //  Crear dirección
    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() dto: CreateDireccionDto, @Req() req: RequestWithUser) {
      return this.direccionesService.create(dto, req.user.id);
    }
  
    //  Ver tus propias direcciones
    @Get('mis-direcciones')
    @UseGuards(JwtAuthGuard)
    async getMisDirecciones(@Req() req: RequestWithUser) {
      return this.direccionesService.findByUsuario(req.user.id);
    }

    //Muestra todas las direcciones
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard) // 👈 aquí va el RolesGuard explícitamente
    @Roles(UserRole.ADMIN)
    async findAll() {
      return this.direccionesService.findAll();
    }
    
    //Filtrar por municipio
    @Get('publicas/municipio/:municipio')
    async getPublicasPorMunicipio(@Param('municipio') municipio: string) {
    return this.direccionesService.findPublicasPorMunicipio(municipio);
    }

    // Obtener dirección predeterminada
    @Get('predeterminada')
    @UseGuards(JwtAuthGuard)
    async getPredeterminada(@Req() req: RequestWithUser) {
      return this.direccionesService.obtenerPredeterminada(req.user.id);
    }
  
    // Marcar como predeterminada
    @Patch(':id/marcar-predeterminada')
    @UseGuards(JwtAuthGuard)
    async marcarComoPredeterminada(@Param('id') id: string, @Req() req: RequestWithUser) {
      return this.direccionesService.marcarComoPredeterminada(+id, req.user.id);
    }
  
    // Editar dirección (solo si es tuya)
    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async update(
      @Param('id') id: string,
      @Body() dto: Partial<CreateDireccionDto>,
      @Req() req: RequestWithUser,
    ) {
      return this.direccionesService.update(+id, dto, req.user.id);
    }
  
    // Eliminar dirección (solo si es tuya)
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
      return this.direccionesService.remove(+id, req.user.id);
    }
  
    // (opcional) Obtener una dirección por ID (solo para admins o validación interna)
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async findOne(@Param('id') id: string) {
      return this.direccionesService.findOne(+id);
    }

    @Get('publicas')
    async getDireccionesPublicas() {
    return this.direccionesService.findPublicas();
    }

  }
  