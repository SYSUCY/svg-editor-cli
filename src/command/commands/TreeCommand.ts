import { TreeFormatter } from '../../display/TreeFormatter.js';
import type { Command } from '../Command.js';
import { CommandArguments } from '../CommandArguments.js';
import type { CommandContext } from '../CommandContext.js';

export class TreeCommand implements Command {
  public constructor(private readonly formatter = new TreeFormatter()) {}
  public execute(context: CommandContext, args: string[]): string[] {
    CommandArguments.range(args, 0, 1, 'tree [id]');
    return this.formatter.format(context.requireDocument(), args[0]);
  }
}
