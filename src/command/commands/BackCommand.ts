import type { SvgDocument } from '../../model/SvgDocument.js';
import { CommandArguments } from '../CommandArguments.js';
import type { CommandContext } from '../CommandContext.js';
import { EditCommand, type EditOutcome } from '../EditCommand.js';

export class BackCommand extends EditCommand {
  protected perform(_context: CommandContext, document: SvgDocument, args: string[]): EditOutcome {
    CommandArguments.exact(args, 1, 'back <id>');
    const location = document.detach(args[0]);
    document.insert(location.shape, location.parent, 0);
    return {
      message: `${location.shape.tag}#${location.shape.id} moved to back`,
      undoMessage: `${location.shape.tag}#${location.shape.id} z-order restored`,
    };
  }
}
