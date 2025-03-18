import { Controller, Post, Get, Body, Param, Delete, Patch, Put, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  /**
   * 🛠 Crear un producto con imagen
   */
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createProductoDto: CreateProductoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productosService.create(createProductoDto, file);
  }

  /**
   * 📦 Obtener todos los productos
   */
  @Get()
  async findAll() {
    return this.productosService.findAll();
  }

  /**
   * 🔍 Obtener un producto por ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productosService.findOne(+id);
  }

  /**
   * 🖼 Subir una nueva imagen a un producto
   */
  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productosService.updateImage(+id, file);
  }

  /**
   * 📝 Actualizar producto
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProductoDto: UpdateProductoDto) {
    return this.productosService.update(+id, updateProductoDto);
  }

  /**
   * 🗑 Eliminar un producto
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.productosService.remove(+id);
  }

  @Patch(':id/imagen')
@UseInterceptors(FileInterceptor('file'))
updateImage(@Param('id') id: number, @UploadedFile() file: Express.Multer.File) {
    return this.productosService.updateImage(id, file);
}
}
