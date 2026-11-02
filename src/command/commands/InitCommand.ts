import { SvgDocument } from '../../model/SvgDocument.js';
import type { Command } from '../Command.js';
import { CommandArguments } from '../CommandArguments.js';
import type { CommandContext } from '../CommandContext.js';

export class InitCommand implements Command {
  public execute(context: CommandContext, args: string[]): string[] {
    if (args.length !== 0 && args.length !== 2) throw new Error('invalid arguments. usage: init [w] [h]');
    const width = args.length === 2 ? CommandArguments.positive(args[0]) : 800;
    const height = args.length === 2 ? CommandArguments.positive(args[1]) : 600;
    context.replaceDocument(new SvgDocument(width, height));
    context.completeIo();
    return [`canvas ${width}x${height} created`];
  }
}
