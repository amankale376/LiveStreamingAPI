import { Module } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WebsocketGateway } from './websocket.gateway';

@Module({
  imports: [WebsocketGateway],
})
export class WebsocketModule {
  @WebSocketServer() wss: Server;
}
