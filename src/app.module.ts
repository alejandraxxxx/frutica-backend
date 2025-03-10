import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Usuario } from './usuarios/entities/usuario.entity';
import { Empleado } from './empleados/entities/empleado.entity';
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
import { EnvioDomicilio } from './envio-domicilio/entities/envio-domicilio.entity';
import { DetalleFactura } from './detalle-factura/entities/detalle-factura.entity';
import { Notificacion } from './notificaciones//entities/notificacion.entity';
import { Credencial } from './credenciales/entities/credencial.entity';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsuariosModule } from './usuarios/usuarios.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { ClientesModule } from './clientes/clientes.module';
import { CategoriaModule } from './categoria/categoria.module';
import { ProductosModule } from './productos/productos.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { DetallePedidoModule } from './detalle_pedido/detalle_pedido.module';
import { FacturaModule } from './factura/factura.module';
import { FormaPagoModule } from './forma-pago/forma-pago.module';
import { ComentarioModule } from './comentario/comentario.module';
import { InventarioMovimientoModule } from './inventario-movimiento/inventario-movimiento.module';
import { DireccionModule } from './direccion/direccion.module';
import { VentaModule } from './venta/venta.module';
import { PrecioModule } from './precio/precio.module';
import { EnvioDomicilioModule } from './envio-domicilio/envio-domicilio.module';
import { DetalleFacturaModule } from './detalle-factura/detalle-factura.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { AuthModule } from './auth/auth.module';
import { CredencialesModule } from './credenciales/credenciales.module';



@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost', // O la IP del servidor donde está phpMyAdmin
      port: 3306, // Puerto predeterminado de MySQL
      username: 'root', // Usuario de la base de datos
      password: '', // Contraseña de MySQL (deja vacío si no tiene)
      database: 'frutica-app1', // Nombre de la base de datos en phpMyAdmin
      entities: [Usuario, Empleado, Cliente, Categoria, Producto, Pedido, DetallePedido, Factura, FormaPago, Comentario, InventarioMovimiento,
        Direccion, Venta, Precio, EnvioDomicilio, DetalleFactura, Notificacion, Credencial ],
      synchronize: true, // ⚠️ Solo en desarrollo, en producción usa migraciones
    }),
    UsuariosModule, EmpleadosModule, ClientesModule, CategoriaModule, ProductosModule, PedidosModule, DetallePedidoModule,
    FacturaModule, FormaPagoModule, ComentarioModule, InventarioMovimientoModule, DireccionModule, VentaModule,
    PrecioModule, EnvioDomicilioModule, DetalleFacturaModule, NotificacionesModule, AuthModule, CredencialesModule, ],
    
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
