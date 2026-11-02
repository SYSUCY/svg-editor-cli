import type { Command } from '../Command.js';
import { CommandArguments } from '../CommandArguments.js';
import type { CommandContext } from '../CommandContext.js';

export class UndoCommand implements Command {
  public execute(context: CommandContext, args: string[]): string[] {
    CommandArguments.exact(args, 0, 'undo');
    return context.history.undo(context.requireDocument());
  }
}
