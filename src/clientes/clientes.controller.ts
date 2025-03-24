import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) { }

  //  Crear un nuevo cliente
  @Post()
  async crearCliente(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }

  // Obtener todos los clientes
  @Get()
  async obtenerClientes() {
    return this.clientesService.findAll();
  }

  //  Obtener un cliente por ID
  @Get(':id')
  async obtenerClientePorId(@Param('id') id: number) {
    return this.clientesService.findOne(id);
  }

  // Actualizar un cliente por ID
  @Put(':id')
  async actualizarCliente(@Param('id') id: number, @Body() updateClienteDto: UpdateClienteDto) {
    return this.clientesService.update(id, updateClienteDto);
  }

  //  Eliminar un cliente por ID
  @Delete(':id')
  async eliminarCliente(@Param('id') id: number) {
    return this.clientesService.remove(id);
  }
}
