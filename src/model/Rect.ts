import { Shape, type ShapeData, type ShapeStyle } from './Shape.js';

export class Rect extends Shape {
  public readonly tag = 'rect';

  public constructor(
    id: string,
    private x: number,
    private y: number,
    private width: number,
    private height: number,
    style: ShapeStyle = {},
  ) {
    super(id, style.fill, style.stroke, style.strokeWidth);
  }

  public move(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  public scale(factor: number): void {
    this.x *= factor;
    this.y *= factor;
    this.width *= factor;
    this.height *= factor;
  }

  public positionDescription(): string {
    return `(${this.x},${this.y})`;
  }

  public treeDetails(): string {
    return `x=${this.x} y=${this.y} w=${this.width} h=${this.height}${this.styleSuffix()}`;
  }

  public showDetails(): string[] {
    return [`x=${this.x} y=${this.y} width=${this.width} height=${this.height}`, ...this.styleDetailLines()];
  }

  public toData(): ShapeData {
    return this.data();
  }

  protected override ownAttributes(): Record<string, string> {
    return { x: `${this.x}`, y: `${this.y}`, width: `${this.width}`, height: `${this.height}` };
  }

  protected override setOwnAttribute(attribute: string, value: string): void {
    const number = Shape.number(value);
    switch (attribute) {
      case 'x': this.x = number; return;
      case 'y': this.y = number; return;
      case 'width': this.width = number; return;
      case 'height': this.height = number; return;
      default: throw new Error(`unknown attribute: ${attribute}`);
    }
  }

  protected override getOwnAttribute(attribute: string): string | undefined {
    switch (attribute) {
      case 'x': return `${this.x}`;
      case 'y': return `${this.y}`;
      case 'width': return `${this.width}`;
      case 'height': return `${this.height}`;
      default: throw new Error(`unknown attribute: ${attribute}`);
    }
  }
}
