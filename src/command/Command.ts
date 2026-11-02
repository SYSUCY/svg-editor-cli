import type { CommandContext } from './CommandContext.js';

export interface Command {
  execute(context: CommandContext, args: string[]): string[];
}
