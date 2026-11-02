import { Group } from '../../model/Group.js';
import type { SvgDocument } from '../../model/SvgDocument.js';
import { CommandArguments } from '../CommandArguments.js';
import type { CommandContext } from '../CommandContext.js';
import { EditCommand, type EditOutcome } from '../EditCommand.js';

export class GroupCommand extends EditCommand {
  protected perform(_context: CommandContext, document: SvgDocument, args: string[]): EditOutcome {
    CommandArguments.range(args, 3, Number.MAX_SAFE_INTEGER, 'group <newGid> <id1> <id2>…');
    const [newId, ...ids] = args;
    if (document.find(newId)) throw new Error(`id already exists: ${newId}`);
    const duplicate = ids.find((id, index) => ids.indexOf(id) !== index);
    if (duplicate) throw new Error(`duplicate shape id in group: ${duplicate}`);
    const locations = ids.map((id) => {
      const location = document.location(id);
      if (!location) throw new Error(`no such shape: ${id}`);
      return location;
    });
    for (const ancestor of locations) {
      for (const descendant of locations) {
        if (ancestor !== descendant && document.isAncestor(ancestor.shape, descendant.shape)) {
          throw new Error(`cannot group a container into its own descendant: ${ancestor.shape.id}`);
        }
      }
    }
    const first = locations[0];
    const parent = first.parent;
    const removedBefore = locations.filter((item) => item.parent === parent && item.index < first.index).length;
    const insertionIndex = first.index - removedBefore;
    for (const location of locations) document.detach(location.shape.id);
    const group = new Group(newId);
    for (const location of locations) group.append(location.shape);
    document.insert(group, parent, insertionIndex);
    return {
      message: `g#${newId} created with ${locations.length} children`,
      undoMessage: `g#${newId} removed and ${locations.length} children restored`,
    };
  }
}
