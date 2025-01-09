import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

const parties = new Map();

wss.on('connection', ws => {
  ws.on('error', console.error);

  ws.on('message', message => {
    const txt = message.toString('utf8');

    // Connects two parties.
    if (txt.startsWith('code:')) {
      const code = txt.slice(4);

      parties.set(ws, code);

      // If there is already another party connected with the same code
      // a confirmation is sent.
      for (const client of wss.clients.keys()) {
        if (client !== ws && client.readyState === ws.OPEN && parties.get(client) === code) {
          client.send('connected');
          ws.send('connected');

          return;
        }
      }
    // Sends a message to the other party.
    } else {
      const code1 = parties.get(ws);

      if (code1) {
        for (const [client, code2] of parties) {
          if (client !== ws && code1 === code2) {
            client.send(message);

            return;
          }
        }
      }
    }
  });
});
