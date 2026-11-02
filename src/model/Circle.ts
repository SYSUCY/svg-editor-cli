import { Shape, type ShapeData, type ShapeStyle } from './Shape.js';

export class Circle extends Shape {
  public readonly tag = 'circle';

  public constructor(
    id: string,
    private cx: number,
    private cy: number,
    private radius: number,
    style: ShapeStyle = {},
  ) {
    super(id, style.fill, style.stroke, style.strokeWidth);
  }

  public move(dx: number, dy: number): void { this.cx += dx; this.cy += dy; }
  public scale(factor: number): void { this.cx *= factor; this.cy *= factor; this.radius *= factor; }
  public positionDescription(): string { return `(${this.cx},${this.cy})`; }
  public treeDetails(): string { return `cx=${this.cx} cy=${this.cy} r=${this.radius}${this.styleSuffix()}`; }
  public showDetails(): string[] { return [`cx=${this.cx} cy=${this.cy} r=${this.radius}`, ...this.styleDetailLines()]; }
  public toData(): ShapeData { return this.data(); }

  protected override ownAttributes(): Record<string, string> {
    return { cx: `${this.cx}`, cy: `${this.cy}`, r: `${this.radius}` };
  }

  protected override setOwnAttribute(attribute: string, value: string): void {
    const number = Shape.number(value);
    switch (attribute) {
      case 'cx': this.cx = number; return;
      case 'cy': this.cy = number; return;
      case 'r': this.radius = number; return;
      default: throw new Error(`unknown attribute: ${attribute}`);
    }
  }

  protected override getOwnAttribute(attribute: string): string | undefined {
    switch (attribute) {
      case 'cx': return `${this.cx}`;
      case 'cy': return `${this.cy}`;
      case 'r': return `${this.radius}`;
      default: throw new Error(`unknown attribute: ${attribute}`);
    }
  }
}
