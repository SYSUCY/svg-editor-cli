import type { SvgDocument } from '../model/SvgDocument.js';
import type { HistoryManager } from './HistoryManager.js';

export interface ReadDocumentResult {
  document: SvgDocument;
  warnings: string[];
}

export interface CommandContext {
  readonly document: SvgDocument | undefined;
  readonly history: HistoryManager;
  requireDocument(): SvgDocument;
  replaceDocument(document: SvgDocument): void;
  readDocument(path: string): ReadDocumentResult;
  writeDocument(document: SvgDocument, path: string): void;
  completeIo(): void;
}
