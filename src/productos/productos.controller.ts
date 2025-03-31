import { Controller, Post, Get, Body, Param, Delete, Patch, Put, UseInterceptors, UploadedFile, UseGuards, Req, ForbiddenException, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserRole, Usuario } from 'src/usuarios/entities/usuario.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';

@Controller('productos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  /** ✅ Crear producto (sin imagen por ahora) */
@Post()
@Roles(UserRole.ADMIN)
@UseInterceptors(FileInterceptor('foto'))
createProduct(
  @UploadedFile() file: Express.Multer.File,
  @Body() createProductoDto: CreateProductoDto,
  @Req() req: RequestWithUser,
) {
  const user = req.user;
  return this.productosService.create(createProductoDto, user, file);
}

  /** ✅ Obtener todos los productos */
  @Get()
  async findAll() {
    return this.productosService.findAll();
  }

  /** ✅ Obtener producto por ID */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productosService.findOne(+id);
  }

  /** ✅ Subir o actualizar imagen de producto */
  @Post(':id/upload')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const productoId = parseInt(id, 10);

    if (isNaN(productoId)) {
      throw new BadRequestException('El ID debe ser un número válido');
    }

    if (!file) {
      throw new BadRequestException('Debes subir un archivo válido');
    }

    return this.productosService.updateImage(productoId, file);
  }

  /** ✅ Actualizar producto */
  @Roles(UserRole.ADMIN)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductoDto: UpdateProductoDto,
  ) {
    return this.productosService.update(+id, updateProductoDto);
  }

  /** ✅ Eliminar producto (soft delete) */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.productosService.remove(+id);
  }
}