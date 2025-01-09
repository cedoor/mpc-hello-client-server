import AsyncQueue from './AsyncQueue';
import assert from './assert';
import generateProtocol from './generateProtocol';

export default class App {
  socket?: WebSocket;
  party?: 'alice' | 'bob';
  msgQueue = new AsyncQueue<unknown>();

  generateJoiningCode() {
    // 128 bits of entropy
    return [
      Math.random().toString(36).substring(2, 12),
      Math.random().toString(36).substring(2, 12),
      Math.random().toString(36).substring(2, 7),
    ].join('');
  }

  async connect(code: string, party: 'alice' | 'bob') {
    this.party = party;
    const socket = new WebSocket('ws://localhost:8080');
    this.socket = socket;

    await new Promise<void>((resolve, reject) => {
      socket.addEventListener('open', () => {
        socket.send(`code:${code}`);

        socket.addEventListener('message', (event: MessageEvent) => {
          if (event.data === 'connected') {
            resolve();
          }
        }, { once: true });
      }, { once: true });
      socket.addEventListener('error', reject, { once: true });
    });

    socket.addEventListener('message', async (event: MessageEvent) => {
      // Using a message queue instead of passing messages directly to the MPC
      // protocol ensures that we don't miss anything sent before we begin.
      const message = new Uint8Array(await event.data.arrayBuffer());

      this.msgQueue.push(message);
    });
  }

  async mpcLargest(value: number): Promise<number> {
    const { party, socket } = this;

    assert(party !== undefined, 'Party must be set');
    assert(socket !== undefined, 'Socket must be set');

    const input = party === 'alice' ? { a: value } : { b: value };
    const otherParty = party === 'alice' ? 'bob' : 'alice';

    const protocol = await generateProtocol();

    const session = protocol.join(
      party,
      input,
      (to, msg) => {
        assert(to === otherParty, 'Unexpected party');
        socket.send(msg);
      },
    );

    this.msgQueue.stream((msg: unknown) => {
      if (!(msg instanceof Uint8Array)) {
        throw new Error('Unexpected message type');
      }

      session.handleMessage(otherParty, msg);
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
