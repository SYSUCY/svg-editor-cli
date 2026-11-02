import { Shape, type ShapeData, type ShapeStyle } from './Shape.js';

export class Group extends Shape {
  public readonly tag = 'g';
  private readonly childShapes: Shape[] = [];

  public constructor(id: string, style: ShapeStyle = {}) {
    super(id, style.fill, style.stroke, style.strokeWidth);
  }

  public get children(): readonly Shape[] { return this.childShapes; }

  public append(child: Shape): void { this.childShapes.push(child); }

  public insert(index: number, child: Shape): void {
    if (index < 0 || index > this.childShapes.length) throw new Error(`invalid child index: ${index}`);
    this.childShapes.splice(index, 0, child);
  }

  public remove(child: Shape): number {
    const index = this.childShapes.indexOf(child);
    if (index < 0) throw new Error(`shape is not a child: ${child.id}`);
    this.childShapes.splice(index, 1);
    return index;
  }

  public move(dx: number, dy: number): void {
    for (const child of this.childShapes) child.move(dx, dy);
  }

  public scale(factor: number): void {
    for (const child of this.childShapes) child.scale(factor);
  }

  public positionDescription(): undefined { return undefined; }
  public treeDetails(): string { return this.styleSuffix().trimStart(); }
  public showDetails(): string[] { return [`children=${this.childShapes.length}`, ...this.styleDetailLines()]; }
  public toData(): ShapeData { return this.data(); }
  protected override childrenData(): ShapeData[] { return this.childShapes.map((child) => child.toData()); }
}
