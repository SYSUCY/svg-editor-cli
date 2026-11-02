import type { Command } from '../Command.js';
import { CommandArguments } from '../CommandArguments.js';
import type { CommandContext } from '../CommandContext.js';

export class HelpCommand implements Command {
  public execute(_context: CommandContext, args: string[]): string[] {
    CommandArguments.exact(args, 0, 'help');
    return [
      'Document commands:',
      '  init [w] [h]                         create an empty canvas',
      '  read <file.svg>                      read an SVG document',
      '  save [file.svg]                      save the current document',
      '  canvas [w] [h]                       show or resize the canvas',
      'Edit commands (undoable):',
      '  create <type> <id> [params…] [in <containerId>]',
      '  delete <id>                          delete a shape or subtree',
      '  move <id> <dx> <dy>                  translate a shape or subtree',
      '  scale <id> <factor>                  scale all geometry uniformly',
      '  set <id> <attr> <value>              set a whitelisted attribute',
      '  group <newGid> <id1> <id2>…          group existing shapes',
      '  ungroup <gid>                        dissolve a nested container',
      '  addto <gid> <id>                     append a shape to a container',
      '  front <id> / back <id>               change sibling z-order',
      'Display and history:',
      '  tree [id]                            show the document tree',
      '  show <id>                            show shape attributes',
      '  undo / redo                          undo or redo an edit',
      '  help                                 show this help',
      'Shape types: rect circle ellipse line text g',
    ];
  }
}
