export class CreatePagoDto {
    userId: number;
    pedidoId: number;
    metodo: string; // 'card', 'spei', 'efectivo'
}
