import type { DocumentSnapshot, SvgDocument } from '../model/SvgDocument.js';

export interface HistoryEntry {
  before: DocumentSnapshot;
  after: DocumentSnapshot;
  undoMessage: string;
  redoMessage: string;
}

export class HistoryManager {
  private readonly undoStack: HistoryEntry[] = [];
  private readonly redoStack: HistoryEntry[] = [];
  private blocked = false;

  public record(entry: HistoryEntry): void {
    this.blocked = false;
    this.undoStack.push(entry);
    this.redoStack.length = 0;
  }

  public blockAndClear(): void {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    this.blocked = true;
  }

  public undo(document: SvgDocument): string[] {
    if (this.blocked) throw new Error('undo not allowed after io command');
    const entry = this.undoStack.pop();
    if (!entry) throw new Error('nothing to undo');
    document.restore(entry.before);
    this.redoStack.push(entry);
    return [entry.undoMessage];
  }

  public redo(document: SvgDocument): string[] {
    if (this.blocked) throw new Error('redo not allowed after io command');
    const entry = this.redoStack.pop();
    if (!entry) throw new Error('nothing to redo');
    document.restore(entry.after);
    this.undoStack.push(entry);
    return [entry.redoMessage];
  }
}
