import type { CommandContext, ReadDocumentResult } from '../command/CommandContext.js';
import { HistoryManager } from '../command/HistoryManager.js';
import { SvgFileStore } from '../io/SvgFileStore.js';
import type { SvgDocument } from '../model/SvgDocument.js';

export class EditorSession implements CommandContext {
  public readonly history = new HistoryManager();
  private currentDocument: SvgDocument | undefined;

  public constructor(private readonly files: SvgFileStore = new SvgFileStore()) {}

  public get document(): SvgDocument | undefined { return this.currentDocument; }

  public requireDocument(): SvgDocument {
    if (!this.currentDocument) throw new Error("no document. use 'init' or 'read' first");
    return this.currentDocument;
  }

  public replaceDocument(document: SvgDocument): void { this.currentDocument = document; }
  public readDocument(path: string): ReadDocumentResult { return this.files.read(path); }
  public writeDocument(document: SvgDocument, path: string): void { this.files.write(document, path); }
  public completeIo(): void { this.history.blockAndClear(); }
}
