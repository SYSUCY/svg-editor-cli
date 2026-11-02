import type { Command } from '../Command.js';
import { CommandArguments } from '../CommandArguments.js';
import type { CommandContext } from '../CommandContext.js';

export class ReadCommand implements Command {
  public execute(context: CommandContext, args: string[]): string[] {
    CommandArguments.exact(args, 1, 'read <file.svg>');
    const result = context.readDocument(args[0]);
    context.replaceDocument(result.document);
    context.completeIo();
    return [...result.warnings, `read ${args[0]} (${result.document.elementCount} elements)`];
  }
}
