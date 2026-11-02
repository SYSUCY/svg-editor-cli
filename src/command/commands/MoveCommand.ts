import { Group } from '../../model/Group.js';
import type { SvgDocument } from '../../model/SvgDocument.js';
import { CommandArguments } from '../CommandArguments.js';
import type { CommandContext } from '../CommandContext.js';
import { EditCommand, type EditOutcome } from '../EditCommand.js';

export class MoveCommand extends EditCommand {
  protected perform(_context: CommandContext, document: SvgDocument, args: string[]): EditOutcome {
    CommandArguments.exact(args, 3, 'move <id> <dx> <dy>');
    const shape = document.require(args[0]);
    const dx = CommandArguments.number(args[1]);
    const dy = CommandArguments.number(args[2]);
    const oldPosition = shape.positionDescription();
    shape.move(dx, dy);
    if (shape instanceof Group) {
      return {
        message: `g#${shape.id} moved by (${dx},${dy})`,
        undoMessage: `g#${shape.id} moved back by (${-dx},${-dy})`,
      };
    }
    return {
      message: `${shape.tag}#${shape.id} moved to ${shape.positionDescription() ?? ''}`,
      undoMessage: `${shape.tag}#${shape.id} moved back to ${oldPosition ?? ''}`,
    };
  }
}
