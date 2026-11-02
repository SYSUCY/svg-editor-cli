import type { ShapeData } from '../model/Shape.js';
import type { SvgDocument } from '../model/SvgDocument.js';

export class SvgSerializer {
  public serialize(document: SvgDocument): string {
    const lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<svg xmlns="http://www.w3.org/2000/svg" width="${document.width}" height="${document.height}" viewBox="0 0 ${document.width} ${document.height}">`,
    ];
    for (const shape of document.children) lines.push(...this.shapeLines(shape.toData(), 1));
    lines.push('</svg>', '');
    return lines.join('\n');
  }

  private shapeLines(shape: ShapeData, depth: number): string[] {
    const indent = '  '.repeat(depth);
    const attributes = Object.entries(shape.attributes)
      .map(([name, value]) => ` ${name}="${SvgSerializer.escapeAttribute(value)}"`)
      .join('');
    if (shape.children !== undefined) {
      const lines = [`${indent}<${shape.tag}${attributes}>`];
      for (const child of shape.children) lines.push(...this.shapeLines(child, depth + 1));
      lines.push(`${indent}</${shape.tag}>`);
      return lines;
    }
    if (shape.text !== undefined) {
      return [`${indent}<${shape.tag}${attributes}>${SvgSerializer.escapeText(shape.text)}</${shape.tag}>`];
    }
    return [`${indent}<${shape.tag}${attributes}/>`];
  }

  private static escapeAttribute(value: string): string {
    return SvgSerializer.escapeText(value).replaceAll('"', '&quot;');
  }

  private static escapeText(value: string): string {
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  }
}
