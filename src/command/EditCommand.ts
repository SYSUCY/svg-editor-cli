import type { DocumentSnapshot, SvgDocument } from '../model/SvgDocument.js';
import type { Command } from './Command.js';
import type { CommandContext } from './CommandContext.js';

export interface EditOutcome {
  message: string;
  undoMessage: string;
}

export abstract class EditCommand implements Command {
  public execute(context: CommandContext, args: string[]): string[] {
    const document = context.requireDocument();
    const before = document.snapshot();
    const outcome = this.perform(context, document, args);
    const after = document.snapshot();
    context.history.record({
      before,
      after,
      undoMessage: outcome.undoMessage,
      redoMessage: outcome.message,
    });
    return [outcome.message];
  }

  protected abstract perform(context: CommandContext, document: SvgDocument, args: string[]): EditOutcome;
}
