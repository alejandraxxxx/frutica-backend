import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './usuarios/entities/usuario.entity';
import { Cliente } from './clientes/entities/cliente.entity';
import { Categoria } from './categoria//entities/categoria.entity';
import { Producto } from './productos/entities/productos.entity';
import { Pedido } from './pedidos/entities/pedidos.entity';
import { DetallePedido } from './detalle_pedido//entities/detalle_pedido.entity';
import { Factura } from './factura/entities/factura.entity';
import { FormaPago } from './forma-pago/entities/forma-pago.entity';
import { Comentario } from './comentario/entities/comentario.entity';
import { InventarioMovimiento } from './inventario-movimiento/entities/inventario-movimiento.entity';
import { Direccion } from './direccion/entities/direccion.entity';
import { Venta } from './venta/entities/venta.entity';
import { Precio } from './precio/entities/precio.entity';
import { DetalleFactura } from './detalle-factura/entities/detalle-factura.entity';
import { Notificacion } from './notificaciones//entities/notificacion.entity';
import { Credencial } from './credenciales/entities/credencial.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ClientesModule } from './clientes/clientes.module';
import { CategoriaModule } from './categoria/categoria.module';
import { ProductosModule } from './productos/productos.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { DetallePedidoModule } from './detalle_pedido/detalle_pedido.module';
import { FacturaModule } from './factura/factura.module';
import { FormaPagoModule } from './forma-pago/forma-pago.module';
import { ComentarioModule } from './comentario/comentario.module';
import { InventarioMovimientoModule } from './inventario-movimiento/inventario-movimiento.module';
import { DireccionesModule} from './direccion/direccion.module';
import { VentaModule } from './venta/venta.module';
import { PrecioModule } from './precio/precio.module';
import { DetalleFacturaModule } from './detalle-factura/detalle-factura.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { AuthModule } from './auth/auth.module';
import { CredencialesModule } from './credenciales/credenciales.module';
import { ConfigModule } from '@nestjs/config';
import { TipoEntregaModule } from './tipo-entrega/tipo-entrega.module';
import { TipoEntrega } from './tipo-entrega/entities/tipo-entrega.entity';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CarritoModule } from './carrito/carrito.module';
import { CarritoItemModule } from './carrito-item/carrito-item.module';
import { Carrito } from './carrito/entities/carrito.entity';
import { CarritoItem } from './carrito-item/entities/carrito-item.entity';
import { PagosModule } from './pagos/pagos.module';
import { StripeModule } from './stripe/stripe.module';
import { Pago } from './pagos/entities/pago.entity';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'frutica-bd',
      entities: [
        Usuario, Empleado, Cliente, Categoria, Producto, Pedido, DetallePedido,
        Factura, FormaPago, Comentario, InventarioMovimiento, Direccion, Venta,
        Precio, EnvioDomicilio, DetalleFactura, Notificacion, Credencial,
        Carrito, CarritoItem, Pago
      ],
      synchronize: true,
    }),
    UsuariosModule, EmpleadosModule, ClientesModule, CategoriaModule, ProductosModule, PedidosModule, DetallePedidoModule,
    FacturaModule, FormaPagoModule, ComentarioModule, InventarioMovimientoModule, DireccionesModule, VentaModule,
    PrecioModule, EnvioDomicilioModule, DetalleFacturaModule, NotificacionesModule, AuthModule, CredencialesModule,
    CloudinaryModule, CarritoModule, CarritoItemModule, PagosModule, StripeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
