import type { SvgDocument } from '../../model/SvgDocument.js';
import { CommandArguments } from '../CommandArguments.js';
import type { CommandContext } from '../CommandContext.js';
import { EditCommand, type EditOutcome } from '../EditCommand.js';

export class DeleteCommand extends EditCommand {
  protected perform(_context: CommandContext, document: SvgDocument, args: string[]): EditOutcome {
    CommandArguments.exact(args, 1, 'delete <id>');
    const location = document.location(args[0]);
    if (!location) throw new Error(`no such shape: ${args[0]}`);
    const { shape, parent } = location;
    document.detach(shape.id);
    const destination = parent ? ` into g#${parent.id}` : ' at canvas root';
    return {
      message: `${shape.tag}#${shape.id} deleted`,
      undoMessage: `${shape.tag}#${shape.id} restored${destination}`,
    };
  }
}
