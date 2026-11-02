import { Shape, type ShapeData, type ShapeStyle } from './Shape.js';

export class Line extends Shape {
  public readonly tag = 'line';

  public constructor(
    id: string,
    private x1: number,
    private y1: number,
    private x2: number,
    private y2: number,
    style: ShapeStyle = {},
  ) {
    super(id, style.fill, style.stroke, style.strokeWidth);
  }

  public move(dx: number, dy: number): void { this.x1 += dx; this.y1 += dy; this.x2 += dx; this.y2 += dy; }
  public scale(factor: number): void {
    this.x1 *= factor; this.y1 *= factor; this.x2 *= factor; this.y2 *= factor;
  }
  public positionDescription(): string { return `(${this.x1},${this.y1})`; }
  public treeDetails(): string { return `(${this.x1},${this.y1}) -> (${this.x2},${this.y2})${this.styleSuffix()}`; }
  public showDetails(): string[] { return [`x1=${this.x1} y1=${this.y1} x2=${this.x2} y2=${this.y2}`, ...this.styleDetailLines()]; }
  public toData(): ShapeData { return this.data(); }

  protected override ownAttributes(): Record<string, string> {
    return { x1: `${this.x1}`, y1: `${this.y1}`, x2: `${this.x2}`, y2: `${this.y2}` };
  }

  protected override setOwnAttribute(attribute: string, value: string): void {
    const number = Shape.number(value);
    switch (attribute) {
      case 'x1': this.x1 = number; return;
      case 'y1': this.y1 = number; return;
      case 'x2': this.x2 = number; return;
      case 'y2': this.y2 = number; return;
      default: throw new Error(`unknown attribute: ${attribute}`);
    }
  }

  protected override getOwnAttribute(attribute: string): string | undefined {
    switch (attribute) {
      case 'x1': return `${this.x1}`;
      case 'y1': return `${this.y1}`;
      case 'x2': return `${this.x2}`;
      case 'y2': return `${this.y2}`;
      default: throw new Error(`unknown attribute: ${attribute}`);
    }
  }
}
