import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Stream, User, Viewer } from '../user/user.entity';
import { getRepository } from 'typeorm';
import * as bcrypt from 'bcrypt';
@WebSocketGateway()
export class WebsocketGateway implements OnGatewayConnection {
  @WebSocketServer() wss: Server;
  currentStatus: boolean;

  handleConnection(client: Socket) {
    client.on('login', async (data) => {
      try {
        const user = await getRepository(User).findOne({
          where: { email: data.email },
        });
        const issPass = await bcrypt.compare(data.password, user.password);
        if (issPass) {
          client.emit('loginTrue', true);
        }
        if (data.stream_path) {
          const stream_id = await getRepository(Stream).findOne({
            where: { stream_name: data.stream_path, endAt: 'NOT_ENDED' },
            select: ['stream_id'],
          });
          const ViewerAvail = await getRepository(Viewer).findOne({
            where: { email: data.email, stream_id: stream_id.stream_id },
          });
          if (ViewerAvail) {
            console.log('viewer already there')
          } else {
            const newViewer = new Viewer();
            newViewer.email = data.email;
            newViewer.joined_at = new Date().toString();
            newViewer.stream_path = data.stream_path;
            newViewer.stream_id = stream_id.stream_id;
            await getRepository(Viewer).save(newViewer);
          }
        }
      } catch (error) {
        client.emit('loginTrue', false);
      }
    });
    client.on('isAvail', async (email) => {
      try {
        const user = await getRepository(Stream).findOne({
          where: { email: email.email, endAt: 'NOT_ENDED' },
        });
        client.emit('confirm', { Stream: true });
      } catch (error) {
        client.emit('confirm', { Stream: false });
      }
    });
    client.on('views', async (path) => {
      const stream = await getRepository(Stream).findOne({
        where: { stream_name: path.stream_path },
        select: ['stream_id'],
      });
      setInterval(async () => {
        const total = await getRepository(Viewer).find({
          where: { stream_id: stream.stream_id },
          select: ['id'],
          order: { id: 'ASC' },
        });
        client.emit('total', total.length);
      }, 2000);
    });
    client.on('closePlayer', async (clientEmail) => {
      console.log('this was hit')
      await getRepository(Viewer).delete({ email: clientEmail });
    });
  }
}
