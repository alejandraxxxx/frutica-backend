import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Cliente } from './entities/cliente.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  // Crear un cliente
  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    const nuevoCliente = this.clienteRepository.create(CreateClienteDto);
    return await this.clienteRepository.save(nuevoCliente);
  }

  // Obtener todos los clientes
  async findAll(): Promise<Cliente[]> {
    return await this.clienteRepository.find();
  }

  // Obtener un cliente por ID
  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({ where: { cliente_k: id } });
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    return cliente;
  }

  // Actualizar un cliente por ID
  async update(id: number, updateClienteDto: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.findOne(id);
    Object.assign(cliente, updateClienteDto);
    return await this.clienteRepository.save(cliente);
  }

  // Eliminar un cliente por ID
  async remove(id: number): Promise<string> {
    const cliente = await this.findOne(id);
    await this.clienteRepository.remove(cliente);
    return `Cliente con ID ${id} eliminado correctamente`;
  }
}
