import { WebSocketServer } from 'ws';
import generateProtocol from '../utils/generateProtocol';
import assert from '../utils/assert';
import { readFileSync } from 'fs';
import { Session } from 'mpc-framework';

// Bob's circuit input.
const NUMBER = 4;

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', async ws => {
  ws.on('error', console.error);

  const protocol = await generateProtocol('./src/circuit/main.ts', (filePath: string) => readFileSync(filePath, 'utf8'));

  let session: Session;

  ws.on('message', (msg: Buffer) => {
    if (!session) {
      session = protocol.join(
        'bob',
        { b: NUMBER },
        (to, msg) => {
          assert(to === 'alice', 'Unexpected party');

          ws.send(msg);
        },
      );

      session.output().then(({ main }) => {
        console.log(`Result: ${main}`);
      });
    }

    session.handleMessage('alice', new Uint8Array(msg));
  });
});
