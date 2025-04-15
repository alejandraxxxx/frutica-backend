// src/notificaciones/notificaciones.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class NotificacionesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const usuarioId = client.handshake.query.usuarioId;
    if (usuarioId) {
      client.join(`usuario_${usuarioId}`);
      console.log(`Usuario ${usuarioId} conectado a sala usuario_${usuarioId}`);
    }
  }

  handleDisconnect(client: Socket) {
    const usuarioId = client.handshake.query.usuarioId;
    console.log(`Usuario ${usuarioId} desconectado`);
  }

  enviarNotificacion(usuarioId: number, data: any) {
    this.server.to(`usuario_${usuarioId}`).emit('notificacion', data);
  }
}
