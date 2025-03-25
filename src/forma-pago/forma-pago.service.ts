import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFormaPagoDto } from './dto/create-forma-pago.dto';
import { UpdateFormaPagoDto } from './dto/update-forma-pago.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FormaPago } from './entities/forma-pago.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FormaPagoService {
    constructor(
        @InjectRepository(FormaPago)
        private readonly formaPagoRepository: Repository<FormaPago>,
    ) { }

    /** ✅ Crear una nueva forma de pago */
    async create(createFormaPagoDto: CreateFormaPagoDto): Promise<FormaPago> {
        const nuevaFormaPago = this.formaPagoRepository.create(createFormaPagoDto);
        return await this.formaPagoRepository.save(nuevaFormaPago);
    }

    /** ✅ Obtener todas las formas de pago */
    async findAll(): Promise<FormaPago[]> {
        return await this.formaPagoRepository.find();
    }

    /** ✅ Obtener una forma de pago por ID */
    async findOne(id: number): Promise<FormaPago> {
        const formaPago = await this.formaPagoRepository.findOne({
            where: { forma_k: id },
        });
        if (!formaPago) {
            throw new NotFoundException(`Forma de Pago con ID ${id} no encontrada`);
        }
        return formaPago;
    }

    /** ✅ Obtener solo las formas de pago activas */
    async getActivePaymentMethods(): Promise<FormaPago[]> {
        return await this.formaPagoRepository.find({ where: { activo: true } });
    }

    /** ✅ Actualizar una forma de pago */
    async update(id: number, updateFormaPagoDto: UpdateFormaPagoDto): Promise<FormaPago> {
        const formaPago = await this.findOne(id);
        Object.assign(formaPago, updateFormaPagoDto);
        return await this.formaPagoRepository.save(formaPago);
    }

    /** ✅ Eliminar una forma de pago */
    async remove(id: number): Promise<void> {
        const formaPago = await this.findOne(id);
        await this.formaPagoRepository.remove(formaPago);
    }
}
