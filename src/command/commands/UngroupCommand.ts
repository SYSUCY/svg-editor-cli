import { Group } from '../../model/Group.js';
import type { SvgDocument } from '../../model/SvgDocument.js';
import { CommandArguments } from '../CommandArguments.js';
import type { CommandContext } from '../CommandContext.js';
import { EditCommand, type EditOutcome } from '../EditCommand.js';

export class UngroupCommand extends EditCommand {
  protected perform(_context: CommandContext, document: SvgDocument, args: string[]): EditOutcome {
    CommandArguments.exact(args, 1, 'ungroup <gid>');
    const location = document.location(args[0]);
    if (!location) throw new Error(`no such shape: ${args[0]}`);
    if (!(location.shape instanceof Group)) throw new Error(`not a container: ${args[0]}`);
    if (!location.parent) throw new Error(`cannot ungroup top-level container: ${args[0]}`);
    const children = [...location.shape.children];
    const parent = location.parent;
    document.detach(location.shape.id);
    children.forEach((child, offset) => document.insert(child, parent, location.index + offset));
    return {
      message: `g#${location.shape.id} ungrouped (${children.length} children promoted)`,
      undoMessage: `g#${location.shape.id} restored with ${children.length} children`,
    };
  }
}
