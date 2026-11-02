import type { SvgDocument } from '../../model/SvgDocument.js';
import { CommandArguments } from '../CommandArguments.js';
import type { CommandContext } from '../CommandContext.js';
import { EditCommand, type EditOutcome } from '../EditCommand.js';

export class SetCommand extends EditCommand {
  protected perform(_context: CommandContext, document: SvgDocument, args: string[]): EditOutcome {
    CommandArguments.exact(args, 3, 'set <id> <attr> <value>');
    const shape = document.require(args[0]);
    const attribute = args[1];
    const value = args[2];
    const oldValue = shape.getAttribute(attribute);
    shape.setAttribute(attribute, value);
    const format = (item: string): string => attribute === 'text' ? `"${item}"` : item;
    return {
      message: `${shape.tag}#${shape.id} updated: ${attribute}=${format(value)}`,
      undoMessage: oldValue === undefined
        ? `${shape.tag}#${shape.id} updated: ${attribute} removed`
        : `${shape.tag}#${shape.id} updated: ${attribute}=${format(oldValue)}`,
    };
  }
}
