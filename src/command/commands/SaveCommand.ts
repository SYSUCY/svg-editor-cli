import type { Command } from '../Command.js';
import { CommandArguments } from '../CommandArguments.js';
import type { CommandContext } from '../CommandContext.js';

export class SaveCommand implements Command {
  public execute(context: CommandContext, args: string[]): string[] {
    CommandArguments.range(args, 0, 1, 'save [file.svg]');
    const document = context.requireDocument();
    const path = args[0] ?? document.sourcePath;
    if (!path) throw new Error('no file path. usage: save <file.svg>');
    context.writeDocument(document, path);
    document.sourcePath = path;
    context.completeIo();
    return [`saved to ${path} (${document.elementCount} elements)`];
  }
}
