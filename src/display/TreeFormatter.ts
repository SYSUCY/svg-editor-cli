import { Group } from '../model/Group.js';
import type { Shape } from '../model/Shape.js';
import type { SvgDocument } from '../model/SvgDocument.js';

export class TreeFormatter {
  public format(document: SvgDocument, id?: string): string[] {
    if (id !== undefined) {
      const root = document.require(id);
      const lines = [this.label(root)];
      if (root instanceof Group) this.appendChildren(root.children, '', lines);
      return lines;
    }
    const lines = [`svg (${document.width}x${document.height})`];
    this.appendChildren(document.children, '', lines);
    return lines;
  }

  private appendChildren(children: readonly Shape[], prefix: string, lines: string[]): void {
    children.forEach((shape, index) => {
      const last = index === children.length - 1;
      lines.push(`${prefix}${last ? '└── ' : '├── '}${this.label(shape)}`);
      if (shape instanceof Group) {
        this.appendChildren(shape.children, `${prefix}${last ? '    ' : '│   '}`, lines);
      }
    });
  }

  private label(shape: Shape): string {
    const name = `${shape.tag}#${shape.id}`;
    const details = shape.treeDetails();
    return details ? `${name.padEnd(15)}${details}` : name;
  }
}
