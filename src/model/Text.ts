import { Shape, type ShapeData, type ShapeStyle } from './Shape.js';

export class Text extends Shape {
  public readonly tag = 'text';

  public constructor(
    id: string,
    private x: number,
    private y: number,
    private text: string,
    style: ShapeStyle = {},
  ) {
    super(id, style.fill, style.stroke, style.strokeWidth);
  }

  public move(dx: number, dy: number): void { this.x += dx; this.y += dy; }
  public scale(factor: number): void { this.x *= factor; this.y *= factor; }
  public positionDescription(): string { return `(${this.x},${this.y})`; }
  public treeDetails(): string { return `(${this.x},${this.y}) "${this.text}"${this.styleSuffix()}`; }
  public showDetails(): string[] { return [`x=${this.x} y=${this.y}`, `text="${this.text}"`, ...this.styleDetailLines()]; }
  public toData(): ShapeData { return this.data(); }

  protected override ownAttributes(): Record<string, string> { return { x: `${this.x}`, y: `${this.y}` }; }
  protected override textContent(): string { return this.text; }

  protected override setOwnAttribute(attribute: string, value: string): void {
    if (attribute === 'text') { this.text = value; return; }
    const number = Shape.number(value);
    switch (attribute) {
      case 'x': this.x = number; return;
      case 'y': this.y = number; return;
      default: throw new Error(`unknown attribute: ${attribute}`);
    }
  }

  protected override getOwnAttribute(attribute: string): string | undefined {
    switch (attribute) {
      case 'x': return `${this.x}`;
      case 'y': return `${this.y}`;
      case 'text': return this.text;
      default: throw new Error(`unknown attribute: ${attribute}`);
    }
  }
}
