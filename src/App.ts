import AsyncQueue from './utils/AsyncQueue';
import assert from './utils/assert';
import generateProtocol from './utils/generateProtocol';
import getCircuitFiles from './utils/getCircuitFiles';

export default class App {
  socket: WebSocket = new WebSocket('ws://localhost:8080');
  msgQueue = new AsyncQueue<unknown>();

  constructor() {
    this.socket.addEventListener('error', console.error, { once: true });

    this.socket.addEventListener('open', () => {
      this.socket.addEventListener('message', async (event: MessageEvent) => {
        const message = new Uint8Array(await event.data.arrayBuffer());

        // Using a message queue instead of passing messages directly to the MPC
        // protocol ensures that we don't miss anything sent before we begin.
        this.msgQueue.push(message);
      });
    }, { once: true });
  }

  async mpcLargest(value: number): Promise<number> {
    const protocol = await generateProtocol('/circuit/main.ts', await getCircuitFiles());

    const session = protocol.join(
      'alice',
      { a: value },
      (to, msg) => {
        assert(to === 'bob', 'Unexpected party');

        console.log('client sent', msg);

        this.socket.send(msg);
      },
    );

    this.msgQueue.stream((msg: unknown) => {
      if (!(msg instanceof Uint8Array)) {
        throw new Error('Unexpected message type');
      }

      console.log('client received', msg);

      session.handleMessage('bob', msg);
    });

    const output = await session.output();

    if (
      output === null
      || typeof output !== 'object'
      || typeof output.main !== 'number'
    ) {
      throw new Error('Unexpected output');
    }

    return output.main;
  }
}
