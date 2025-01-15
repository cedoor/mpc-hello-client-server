import { WebSocketServer } from 'ws';
import generateProtocol from '../utils/generateProtocol';
import assert from '../utils/assert';
import { readFileSync } from 'fs';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', async ws => {
  ws.on('error', console.error);

  let session;

  const protocol = await generateProtocol('./src/circuit/main.ts', (filePath: string) => readFileSync(filePath, 'utf8'));

  ws.on('message', (msg: Buffer) => {
    if (!session) {
      session = protocol.join(
        'bob',
        { b: 4 },
        (to, msg) => {
          assert(to === 'alice', 'Unexpected party');

          ws.send(msg);
        },
      );

      session.output().then(console.log);
    }

    session.handleMessage('alice', new Uint8Array(msg));
  });
});
