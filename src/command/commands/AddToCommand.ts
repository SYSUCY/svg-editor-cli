import { Group } from '../../model/Group.js';
import type { SvgDocument } from '../../model/SvgDocument.js';
import { CommandArguments } from '../CommandArguments.js';
import type { CommandContext } from '../CommandContext.js';
import { EditCommand, type EditOutcome } from '../EditCommand.js';

export class AddToCommand extends EditCommand {
  protected perform(_context: CommandContext, document: SvgDocument, args: string[]): EditOutcome {
    CommandArguments.exact(args, 2, 'addto <gid> <id>');
    const container = document.find(args[0]);
    if (!container) throw new Error(`no such container: ${args[0]}`);
    if (!(container instanceof Group)) throw new Error(`not a container: ${args[0]}`);
    const shape = document.require(args[1]);
    if (shape === container || document.isAncestor(shape, container)) {
      throw new Error(`cannot move a container into its own descendant: ${shape.id}`);
    }
    document.detach(shape.id);
    container.append(shape);
    return {
      message: `${shape.tag}#${shape.id} added to g#${container.id}`,
      undoMessage: `${shape.tag}#${shape.id} removed from g#${container.id}`,
    };
  }
}
