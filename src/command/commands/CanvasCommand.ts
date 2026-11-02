import type { Command } from '../Command.js';
import { CommandArguments } from '../CommandArguments.js';
import type { CommandContext } from '../CommandContext.js';

export class CanvasCommand implements Command {
  public execute(context: CommandContext, args: string[]): string[] {
    const document = context.requireDocument();
    if (args.length === 0) return [`canvas ${document.width}x${document.height}`];
    CommandArguments.exact(args, 2, 'canvas [w] [h]');
    const width = CommandArguments.positive(args[0]);
    const height = CommandArguments.positive(args[1]);
    document.resize(width, height);
    context.completeIo();
    return [`canvas resized to ${width}x${height}`];
  }
}
