import { WebSocketServer } from 'ws';
import generateProtocol from '../utils/generateProtocol';
import assert from '../utils/assert';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', async ws => {
  ws.on('error', console.error);

  let session;

  const protocol = await generateProtocol('./src/circuit/main.ts');

  ws.on('message', (msg: Buffer) => {
    console.log('server received', msg);

    if (!session) {
      session = protocol.join(
        'bob',
        { b: 4 },
        (to, msg) => {
          assert(to === 'alice', 'Unexpected party');

          console.log('server sent', msg);

          ws.send(msg);
        },
      );

      session.output(console.log);
    }

    session.handleMessage('alice', new Uint8Array(msg));
  });
});
