import { ShapeFactory } from '../../model/ShapeFactory.js';
import type { EditOutcome } from '../EditCommand.js';
import { EditCommand } from '../EditCommand.js';
import type { CommandContext } from '../CommandContext.js';
import type { SvgDocument } from '../../model/SvgDocument.js';

export class CreateCommand extends EditCommand {
  protected perform(_context: CommandContext, document: SvgDocument, args: string[]): EditOutcome {
    if (args.length < 2) throw new Error('invalid arguments. usage: create <type> <id> [params…] [in <containerId>]');
    let containerId: string | undefined;
    let parameters = args.slice(2);
    if (parameters.length >= 2 && parameters[parameters.length - 2] === 'in') {
      containerId = parameters[parameters.length - 1];
      parameters = parameters.slice(0, -2);
    }
    const shape = ShapeFactory.create(args[0], args[1], parameters);
    document.add(shape, containerId);
    const suffix = containerId ? ` in g#${containerId}` : '';
    return {
      message: `${shape.tag}#${shape.id} created${suffix}`,
      undoMessage: `${shape.tag}#${shape.id} creation undone`,
    };
  }
}
