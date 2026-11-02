import type { Command } from '../Command.js';
import { CommandArguments } from '../CommandArguments.js';
import type { CommandContext } from '../CommandContext.js';

export class RedoCommand implements Command {
  public execute(context: CommandContext, args: string[]): string[] {
    CommandArguments.exact(args, 0, 'redo');
    return context.history.redo(context.requireDocument());
  }
}
