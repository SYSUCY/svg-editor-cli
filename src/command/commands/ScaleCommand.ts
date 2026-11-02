import type { SvgDocument } from '../../model/SvgDocument.js';
import { CommandArguments } from '../CommandArguments.js';
import type { CommandContext } from '../CommandContext.js';
import { EditCommand, type EditOutcome } from '../EditCommand.js';

export class ScaleCommand extends EditCommand {
  protected perform(_context: CommandContext, document: SvgDocument, args: string[]): EditOutcome {
    CommandArguments.exact(args, 2, 'scale <id> <factor>');
    const shape = document.require(args[0]);
    const factor = CommandArguments.number(args[1]);
    if (factor <= 0) throw new Error('scale factor must be positive');
    shape.scale(factor);
    return {
      message: `${shape.tag}#${shape.id} scaled by ${factor}`,
      undoMessage: `${shape.tag}#${shape.id} scale restored`,
    };
  }
}
