import { Shape, type ShapeData, type ShapeStyle } from './Shape.js';

export class Ellipse extends Shape {
  public readonly tag = 'ellipse';

  public constructor(
    id: string,
    private cx: number,
    private cy: number,
    private rx: number,
    private ry: number,
    style: ShapeStyle = {},
  ) {
    super(id, style.fill, style.stroke, style.strokeWidth);
  }

  public move(dx: number, dy: number): void { this.cx += dx; this.cy += dy; }
  public scale(factor: number): void { this.cx *= factor; this.cy *= factor; this.rx *= factor; this.ry *= factor; }
  public positionDescription(): string { return `(${this.cx},${this.cy})`; }
  public treeDetails(): string { return `cx=${this.cx} cy=${this.cy} rx=${this.rx} ry=${this.ry}${this.styleSuffix()}`; }
  public showDetails(): string[] { return [`cx=${this.cx} cy=${this.cy} rx=${this.rx} ry=${this.ry}`, ...this.styleDetailLines()]; }
  public toData(): ShapeData { return this.data(); }

  protected override ownAttributes(): Record<string, string> {
    return { cx: `${this.cx}`, cy: `${this.cy}`, rx: `${this.rx}`, ry: `${this.ry}` };
  }

  protected override setOwnAttribute(attribute: string, value: string): void {
    const number = Shape.number(value);
    switch (attribute) {
      case 'cx': this.cx = number; return;
      case 'cy': this.cy = number; return;
      case 'rx': this.rx = number; return;
      case 'ry': this.ry = number; return;
      default: throw new Error(`unknown attribute: ${attribute}`);
    }
  }

  protected override getOwnAttribute(attribute: string): string | undefined {
    switch (attribute) {
      case 'cx': return `${this.cx}`;
      case 'cy': return `${this.cy}`;
      case 'rx': return `${this.rx}`;
      case 'ry': return `${this.ry}`;
      default: throw new Error(`unknown attribute: ${attribute}`);
    }
  }
}
