import type { SvgDocument } from '../../model/SvgDocument.js';
import { CommandArguments } from '../CommandArguments.js';
import type { CommandContext } from '../CommandContext.js';
import { EditCommand, type EditOutcome } from '../EditCommand.js';

export class FrontCommand extends EditCommand {
  protected perform(_context: CommandContext, document: SvgDocument, args: string[]): EditOutcome {
    CommandArguments.exact(args, 1, 'front <id>');
    const location = document.detach(args[0]);
    const index = location.parent ? location.parent.children.length : document.children.length;
    document.insert(location.shape, location.parent, index);
    return {
      message: `${location.shape.tag}#${location.shape.id} moved to front`,
      undoMessage: `${location.shape.tag}#${location.shape.id} z-order restored`,
    };
  }
}
