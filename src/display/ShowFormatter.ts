import type { SvgDocument } from '../model/SvgDocument.js';

export class ShowFormatter {
  public format(document: SvgDocument, id: string): string[] {
    const location = document.location(id);
    if (!location) throw new Error(`no such shape: ${id}`);
    const parent = location.parent ? `g#${location.parent.id}` : 'canvas';
    return [
      `${location.shape.tag}#${location.shape.id}  parent=${parent}`,
      ...location.shape.showDetails().map((line) => `  ${line}`),
    ];
  }
}
