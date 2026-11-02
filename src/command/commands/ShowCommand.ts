import { ShowFormatter } from '../../display/ShowFormatter.js';
import type { Command } from '../Command.js';
import { CommandArguments } from '../CommandArguments.js';
import type { CommandContext } from '../CommandContext.js';

export class ShowCommand implements Command {
  public constructor(private readonly formatter = new ShowFormatter()) {}
  public execute(context: CommandContext, args: string[]): string[] {
    CommandArguments.exact(args, 1, 'show <id>');
    return this.formatter.format(context.requireDocument(), args[0]);
  }
}
