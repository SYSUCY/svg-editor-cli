import { Group } from './Group.js';
import { Shape, type ShapeData } from './Shape.js';
import { ShapeFactory } from './ShapeFactory.js';

export interface ShapeLocation {
  shape: Shape;
  parent: Group | null;
  index: number;
}

export interface DocumentSnapshot {
  width: number;
  height: number;
  shapes: ShapeData[];
}

export class SvgDocument {
  private rootShapes: Shape[] = [];

  public constructor(
    public width: number,
    public height: number,
    private filePath?: string,
  ) {
    SvgDocument.validateDimension(width);
    SvgDocument.validateDimension(height);
  }

  public get children(): readonly Shape[] { return this.rootShapes; }
  public get sourcePath(): string | undefined { return this.filePath; }
  public set sourcePath(path: string | undefined) { this.filePath = path; }
  public get elementCount(): number { return this.allShapes().length; }

  public find(id: string): Shape | undefined {
    return this.location(id)?.shape;
  }

  public require(id: string): Shape {
    const shape = this.find(id);
    if (!shape) throw new Error(`no such shape: ${id}`);
    return shape;
  }

  public location(id: string): ShapeLocation | undefined {
    const visit = (shapes: readonly Shape[], parent: Group | null): ShapeLocation | undefined => {
      for (let index = 0; index < shapes.length; index += 1) {
        const shape = shapes[index];
        if (shape.id === id) return { shape, parent, index };
        if (shape instanceof Group) {
          const found = visit(shape.children, shape);
          if (found) return found;
        }
      }
      return undefined;
    };
    return visit(this.rootShapes, null);
  }

  public allShapes(): Shape[] {
    const result: Shape[] = [];
    const visit = (shape: Shape): void => {
      result.push(shape);
      if (shape instanceof Group) for (const child of shape.children) visit(child);
    };
    for (const shape of this.rootShapes) visit(shape);
    return result;
  }

  public add(shape: Shape, containerId?: string): void {
    let parent: Group | null = null;
    if (containerId !== undefined) {
      const container = this.find(containerId);
      if (!container) throw new Error(`no such container: ${containerId}`);
      if (!(container instanceof Group)) throw new Error(`not a container: ${containerId}`);
      parent = container;
    }
    this.assertNewSubtree(shape);
    if (parent) parent.append(shape);
    else this.rootShapes.push(shape);
  }

  public insert(shape: Shape, parent: Group | null, index: number): void {
    this.assertNewSubtree(shape);
    if (parent) parent.insert(index, shape);
    else {
      if (index < 0 || index > this.rootShapes.length) throw new Error(`invalid child index: ${index}`);
      this.rootShapes.splice(index, 0, shape);
    }
  }

  public detach(id: string): ShapeLocation {
    const location = this.location(id);
    if (!location) throw new Error(`no such shape: ${id}`);
    if (location.parent) location.parent.remove(location.shape);
    else this.rootShapes.splice(location.index, 1);
    return location;
  }

  public isAncestor(ancestor: Shape, possibleDescendant: Shape): boolean {
    if (!(ancestor instanceof Group)) return false;
    const visit = (shape: Shape): boolean => {
      if (shape === possibleDescendant) return true;
      return shape instanceof Group && shape.children.some(visit);
    };
    return ancestor.children.some(visit);
  }

  public resize(width: number, height: number): void {
    SvgDocument.validateDimension(width);
    SvgDocument.validateDimension(height);
    this.width = width;
    this.height = height;
  }

  public snapshot(): DocumentSnapshot {
    return { width: this.width, height: this.height, shapes: this.rootShapes.map((shape) => shape.toData()) };
  }

  public restore(snapshot: DocumentSnapshot): void {
    const restored = snapshot.shapes.map((shape) => ShapeFactory.fromData(shape));
    const ids = new Set<string>();
    for (const shape of restored) {
      for (const item of SvgDocument.subtree(shape)) {
        if (ids.has(item.id)) throw new Error(`id already exists: ${item.id}`);
        ids.add(item.id);
      }
    }
    this.width = snapshot.width;
    this.height = snapshot.height;
    this.rootShapes = restored;
  }

  private assertNewSubtree(shape: Shape): void {
    for (const item of SvgDocument.subtree(shape)) {
      if (this.find(item.id)) throw new Error(`id already exists: ${item.id}`);
    }
    const ids = new Set<string>();
    for (const item of SvgDocument.subtree(shape)) {
      if (ids.has(item.id)) throw new Error(`id already exists: ${item.id}`);
      ids.add(item.id);
    }
  }

  private static *subtree(shape: Shape): IterableIterator<Shape> {
    yield shape;
    if (shape instanceof Group) for (const child of shape.children) yield* SvgDocument.subtree(child);
  }

  private static validateDimension(value: number): void {
    if (!Number.isFinite(value) || value <= 0) throw new Error(`canvas dimension must be positive: ${value}`);
  }
}
