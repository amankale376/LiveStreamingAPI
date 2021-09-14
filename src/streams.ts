// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import * as NodeMediaServer from 'node-media-server';
import { WebsocketGateway } from './websocket/websocket.gateway';
import { getRepository } from 'typeorm';
import { Stream, User } from './user/user.entity';
const config = {
  auth: {
    api: true,
    api_user: 'admin',
    api_pass: 'password',
    secret: process.env.STREAM_SECRET,
  },
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 3,
    ping_timeout: 60,
  },
  http: {
    port: 8000,
    mediaroot: './media',
    allow_origin: '*',
  },
};
const web = new WebsocketGateway();
export async function abc() {
  const nms = new NodeMediaServer(config);
  nms.run();
  nms.on('prePublish', async (id, StreamPath, args) => {
    const key = StreamPath.split('/').pop();

    try {
      const user = await getRepository(User).findOne({
        where: { pass_key: key },
      });

      const newStream = new Stream();
      newStream.email = user.email;
      newStream.stream_name = StreamPath;
      newStream.startAt = new Date().toString();
      newStream.endAt = 'NOT_ENDED';
      newStream.stream_id = id;
      await getRepository(Stream).save(newStream);
    } catch (error) {
      console.log(error);
      const session = nms.getSession(id);
      session.reject();
    }
  });
  nms.on('donePublish', async (id, StreamPath, args) => {
    try {
      const findStream = await getRepository(Stream).findOne({
        where: { stream_id: id },
      });
      findStream.endAt = new Date().toString();
      await getRepository(Stream).save(findStream);
    } catch (error) {
      console.log(error);
      const session = nms.getSession(id);
      session.reject();
    }
  });
}
