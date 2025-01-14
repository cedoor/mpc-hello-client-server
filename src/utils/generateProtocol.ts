import * as summon from 'summon-ts';
import { Protocol } from 'mpc-framework';
import { EmpWasmBackend } from 'emp-wasm-backend';

export default async function generateProtocol(mainFile, files?) {
  await summon.init();

  const circuit = summon.compileBoolean(
    mainFile,
    16,
    files,
  );

  const mpcSettings = [
    {
      name: 'alice',
      inputs: ['a'],
      outputs: ['main'],
    },
    {
      name: 'bob',
      inputs: ['b'],
      outputs: ['main'],
    },
  ];

  return new Protocol(circuit, mpcSettings, new EmpWasmBackend());
}
