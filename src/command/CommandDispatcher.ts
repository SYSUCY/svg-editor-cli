import { CommandLineTokenizer } from '../cli/CommandLineTokenizer.js';
import type { CommandContext } from './CommandContext.js';
import type { Command } from './Command.js';
import { AddToCommand } from './commands/AddToCommand.js';
import { BackCommand } from './commands/BackCommand.js';
import { CanvasCommand } from './commands/CanvasCommand.js';
import { CreateCommand } from './commands/CreateCommand.js';
import { DeleteCommand } from './commands/DeleteCommand.js';
import { FrontCommand } from './commands/FrontCommand.js';
import { GroupCommand } from './commands/GroupCommand.js';
import { HelpCommand } from './commands/HelpCommand.js';
import { InitCommand } from './commands/InitCommand.js';
import { MoveCommand } from './commands/MoveCommand.js';
import { ReadCommand } from './commands/ReadCommand.js';
import { RedoCommand } from './commands/RedoCommand.js';
import { SaveCommand } from './commands/SaveCommand.js';
import { ScaleCommand } from './commands/ScaleCommand.js';
import { SetCommand } from './commands/SetCommand.js';
import { ShowCommand } from './commands/ShowCommand.js';
import { TreeCommand } from './commands/TreeCommand.js';
import { UndoCommand } from './commands/UndoCommand.js';
import { UngroupCommand } from './commands/UngroupCommand.js';

export class CommandDispatcher {
  private readonly commands = new Map<string, Command>();
  private readonly tokenizer = new CommandLineTokenizer();

  public constructor(private readonly context: CommandContext) {
    const commands: [string, Command][] = [
      ['init', new InitCommand()], ['read', new ReadCommand()], ['save', new SaveCommand()],
      ['canvas', new CanvasCommand()], ['create', new CreateCommand()], ['delete', new DeleteCommand()],
      ['move', new MoveCommand()], ['scale', new ScaleCommand()], ['set', new SetCommand()],
      ['group', new GroupCommand()], ['ungroup', new UngroupCommand()], ['addto', new AddToCommand()],
      ['front', new FrontCommand()], ['back', new BackCommand()], ['tree', new TreeCommand()],
      ['show', new ShowCommand()], ['help', new HelpCommand()], ['undo', new UndoCommand()],
      ['redo', new RedoCommand()],
    ];
    for (const [name, command] of commands) this.commands.set(name, command);
  }

  public execute(line: string): string[] {
    try {
      const tokens = this.tokenizer.tokenize(line);
      if (!tokens || tokens.length === 0) return [];
      const [name, ...args] = tokens;
      const command = this.commands.get(name);
      if (!command) throw new Error(`unknown command: ${name}`);
      return command.execute(this.context, args);
    } catch (error) {
      return [`error: ${error instanceof Error ? error.message : 'unknown error'}`];
    }
  }
}
