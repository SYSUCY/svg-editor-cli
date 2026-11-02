import { createInterface } from 'node:readline';
import { EditorSession } from '../app/EditorSession.js';
import { CommandDispatcher } from '../command/CommandDispatcher.js';

const dispatcher = new CommandDispatcher(new EditorSession());
const input = process.stdin;
const output = process.stdout;
const reader = createInterface({ input, output });

output.write("svg-editor 0.1 — type 'help' for commands\n\n");
reader.setPrompt('svg> ');
reader.prompt();

reader.on('line', (line) => {
  for (const message of dispatcher.execute(line)) output.write(`${message}\n`);
  reader.prompt();
});

reader.on('close', () => {
  output.write('\n');
  process.exitCode = 0;
});

reader.on('SIGINT', () => reader.close());
