import { WebSocketServer } from 'ws';
import generateProtocol from '../utils/generateProtocol';
import assert from '../utils/assert';
import { getCircuitFiles } from './getCircuitFiles';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', async ws => {
  ws.on('error', console.error);

  const protocol = await generateProtocol('src/circuit/main.ts', await getCircuitFiles('./src/circuit'));

  const session = protocol.join(
    'server',
    { b: 4 },
    (to, msg) => {
      assert(to === 'client', 'Unexpected party');

      ws.send(msg);
    },
  );

  ws.on('message', (message: Buffer) => {
    session.handleMessage('client', new Uint8Array(message));
  });
});
