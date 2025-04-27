import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Factura } from './entities/factura.entity';
import { Repository } from 'typeorm';
import { Pedido } from 'src/pedidos/entities/pedidos.entity';
import { FormaPago } from 'src/forma-pago/entities/forma-pago.entity';
import { DatosPersonales } from 'src/datos-personales/entities/datos-personale.entity';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';
import { CreateFacturaDto } from './dto/create-factura.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FacturaService {
    constructor(
        @InjectRepository(Factura)
        private readonly facturaRepository: Repository<Factura>,
        @InjectRepository(Pedido)
        private readonly pedidoRepository: Repository<Pedido>,
        @InjectRepository(DatosPersonales)
        private readonly datosRepository: Repository<DatosPersonales>,
        @InjectRepository(FormaPago)
        private readonly formaPagoRepository: Repository<FormaPago>,
    ) { }

    async create(createFacturaDto: CreateFacturaDto): Promise<Factura> {
        const pedido = await this.pedidoRepository.findOne({ where: { pedido_k: createFacturaDto.pedidoId } });
        if (!pedido) {
            throw new NotFoundException(`Pedido con ID ${createFacturaDto.pedidoId} no encontrado`);
        }

        const cliente = await this.datosRepository.findOne({ where: { cliente_k: createFacturaDto.clienteId } });
        if (!cliente) {
            throw new NotFoundException(`Cliente con ID ${createFacturaDto.clienteId} no encontrado`);
        }

        const formaPago = await this.formaPagoRepository.findOne({ where: { forma_k: createFacturaDto.formaPagoId } });
        if (!formaPago) {
            throw new NotFoundException(`Forma de pago con ID ${createFacturaDto.formaPagoId} no encontrada`);
        }

        const nuevaFactura = this.facturaRepository.create({
            ...createFacturaDto,
            pedido,
            cliente,
            formaPago,
        });

        return await this.facturaRepository.save(nuevaFactura);
    }

    async findAll(): Promise<Factura[]> {
        return await this.facturaRepository.find({ relations: ['pedido', 'cliente', 'formaPago', 'detallesFactura'] });
    }

    async findOne(id: number): Promise<Factura> {
        const factura = await this.facturaRepository.findOne({ where: { factura_k: id }, relations: ['pedido', 'cliente', 'formaPago', 'detallesFactura'] });
        if (!factura) {
            throw new NotFoundException(`Factura con ID ${id} no encontrada`);
        }
        return factura;
    }

    async findByUsuarioId(usuarioId: number) {
        return this.datosRepository.findOne({
            where: { usuario: { usuario_k: usuarioId } },
            relations: ['usuario'], 
        });
    }


    async update(id: number, updateFacturaDto: UpdateFacturaDto): Promise<Factura> {
        const factura = await this.findOne(id);
        Object.assign(factura, updateFacturaDto);
        return await this.facturaRepository.save(factura);
    }

    async remove(id: number): Promise<void> {
        const factura = await this.findOne(id);
        await this.facturaRepository.remove(factura);
    }

    async generarFacturaDesdeBD(idFactura: number, res: Response) {
        const factura = await this.facturaRepository.findOne({
            where: { factura_k: idFactura },
            relations: ['cliente', 'cliente.usuario', 'cliente.usuario.credenciales', 'pedido', 'formaPago', 'detallesFactura', 'detallesFactura.producto'],
        });

        if (!factura) {
            throw new NotFoundException('Factura no encontrada');
        }


        // 🔍 Aquí imprimes todo el objeto
        console.log('Factura completa:', JSON.stringify(factura, null, 2));

        // 🔍 Datos específicos
        console.log('Nombre cliente:', factura.cliente?.usuario?.nombre);
        console.log('Correo cliente:', factura.cliente?.usuario?.credenciales?.email);
        console.log('RFC cliente:', factura.cliente?.rfc);
        console.log('Forma de pago:', factura.formaPago?.nombre_forma);
        console.log('Productos:', factura.detallesFactura);

        // Ruta al logo
        const logoPath = path.join(
            'C:',
            'Users',
            'xagac',
            'Downloads',
            'logofrutica.png'
        );

        // Leer imagen como Buffer
        const logoBuffer = fs.readFileSync(logoPath);

        // Adjuntar el logo al objeto que se pasa al PDF
        (factura as any).logoBuffer = logoBuffer;

        this.generarFacturaPDF(factura, res);
    }

    // ✅ 2. Esta función genera el PDF
    generarFacturaPDF(data: any, res: Response) {
        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="factura.pdf"');

        doc.pipe(res);

        // === LOGO ===
        if (data.logoBuffer) {
            doc.image(data.logoBuffer, 50, 50, { width: 80 });
        }

        // === DATOS EMPRESA ===
        doc
            .fontSize(10)
            .text('Frutica S.A. de C.V.', 400, 50, { align: 'right' })
            .text('Calle Fruta Dulce 123, Ciudad', { align: 'right' })
            .text('Frutal, México', { align: 'right' })
            .text('Tel: (+52) 55 1234 5678', { align: 'right' })
            .text('Email: contacto@frutica.com', { align: 'right' })
            .text('RFC: FRU1234567X9', { align: 'right' });

        // === TÍTULO ===
        doc.moveDown(2);
        doc
            .font('Helvetica-Bold')
            .fontSize(18)
            .text('Factura', { align: 'center' })
            .font('Helvetica');

        // === DATOS FACTURA ===
        doc.moveDown(1);
        const startY = doc.y;

        doc
            .fontSize(12)
            .text(`Folio: ${data.factura_k || 'N/A'}`, 50, startY)
            .text(`Fecha de emisión: ${new Date(data.fecha_emision).toLocaleDateString()}`)
            .text(`Estado: ${data.estado}`);

        doc.moveDown();
        doc
            .text(`Cliente: ${data.cliente?.usuario?.nombre || 'N/A'} ${data.cliente?.usuario?.apellido_paterno || ''}`.trim())
            .text(`Correo: ${data.cliente?.usuario?.credenciales?.email || 'N/A'}`)
            .text(`RFC: ${data.cliente?.rfc || 'N/A'}`);

        doc.moveDown();
        doc.text(`Forma de pago: ${data.formaPago?.nombre_forma || 'N/A'}`);

        // === TABLA DE PRODUCTOS ===
        doc.moveDown().text('Productos:', { underline: true });

        const tableTop = doc.y + 10;
        const itemX = 50;
        const cantidadX = 250;
        const precioX = 320;
        const subtotalX = 430;

        doc
            .font('Helvetica-Bold')
            .fontSize(10)
            .text('Producto', itemX, tableTop)
            .text('Cantidad', cantidadX, tableTop)
            .text('Precio Unitario', precioX, tableTop)
            .text('Subtotal', subtotalX, tableTop);

        doc.font('Helvetica');

        let subtotal = 0;
        let y = tableTop + 20;

        data.detallesFactura?.forEach((item: any, i: number) => {
            const sub = item.cantidad * item.precio_unitario;
            subtotal += sub;

            doc
                .fontSize(10)
                .text(item.nombre_producto || `Producto ${i + 1}`, itemX, y)
                .text(item.cantidad.toString(), cantidadX, y)
                .text(
                    item.precio_unitario.toLocaleString('es-MX', {
                        style: 'currency',
                        currency: 'MXN',
                    }),
                    precioX,
                    y
                )
                .text(
                    sub.toLocaleString('es-MX', {
                        style: 'currency',
                        currency: 'MXN',
                    }),
                    subtotalX,
                    y
                );

            y += 20;
        });

        // === TOTALES ===
        doc.moveDown(2);
        doc
            .fontSize(12)
            .text(`Subtotal: $${subtotal.toFixed(2)}`, { align: 'right' })
            .text(`Total: $${(Number(data.total) || 0).toFixed(2)}`, { align: 'right' });

        // === MARCA DE AGUA ===
        if (data.logoBuffer) {
            const pageWidth = doc.page.width;
            const pageHeight = doc.page.height;

            doc.opacity(0.1).image(data.logoBuffer, pageWidth / 2 - 100, pageHeight / 2 - 100, {
                width: 200,
            });
            doc.opacity(1);
        }

        doc.end();
    }

}
