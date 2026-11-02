import { Circle } from './Circle.js';
import { Ellipse } from './Ellipse.js';
import { Group } from './Group.js';
import { Line } from './Line.js';
import { Rect } from './Rect.js';
import { Shape, type ShapeData } from './Shape.js';
import { Text } from './Text.js';

export class ShapeFactory {
  public static supports(type: string): boolean {
    return ['rect', 'circle', 'ellipse', 'line', 'text', 'g'].includes(type);
  }

  public static create(type: string, id: string, args: string[]): Shape {
    switch (type) {
      case 'rect':
        this.expectArity(args, 4, 5, 'create rect <id> <x> <y> <w> <h> [fill] [in <containerId>]');
        return new Rect(id, this.number(args[0]), this.number(args[1]), this.number(args[2]), this.number(args[3]), { fill: args[4] });
      case 'circle':
        this.expectArity(args, 3, 4, 'create circle <id> <cx> <cy> <r> [fill] [in <containerId>]');
        return new Circle(id, this.number(args[0]), this.number(args[1]), this.number(args[2]), { fill: args[3] });
      case 'ellipse':
        this.expectArity(args, 4, 5, 'create ellipse <id> <cx> <cy> <rx> <ry> [fill] [in <containerId>]');
        return new Ellipse(id, this.number(args[0]), this.number(args[1]), this.number(args[2]), this.number(args[3]), { fill: args[4] });
      case 'line':
        this.expectArity(args, 4, 5, 'create line <id> <x1> <y1> <x2> <y2> [stroke] [in <containerId>]');
        return new Line(id, this.number(args[0]), this.number(args[1]), this.number(args[2]), this.number(args[3]), { stroke: args[4] });
      case 'text':
        this.expectArity(args, 3, 3, 'create text <id> <x> <y> "content" [in <containerId>]');
        return new Text(id, this.number(args[0]), this.number(args[1]), args[2]);
      case 'g':
        this.expectArity(args, 0, 0, 'create g <id> [in <containerId>]');
        return new Group(id);
      default:
        throw new Error(`unknown shape type: ${type} (is the plugin loaded?)`);
    }
  }

  public static fromData(data: ShapeData): Shape {
    const a = data.attributes;
    let shape: Shape;
    switch (data.tag) {
      case 'rect':
        shape = new Rect(data.id, this.attributeNumber(a.x), this.attributeNumber(a.y), this.attributeNumber(a.width), this.attributeNumber(a.height));
        break;
      case 'circle':
        shape = new Circle(data.id, this.attributeNumber(a.cx), this.attributeNumber(a.cy), this.attributeNumber(a.r));
        break;
      case 'ellipse':
        shape = new Ellipse(data.id, this.attributeNumber(a.cx), this.attributeNumber(a.cy), this.attributeNumber(a.rx), this.attributeNumber(a.ry));
        break;
      case 'line':
        shape = new Line(data.id, this.attributeNumber(a.x1), this.attributeNumber(a.y1), this.attributeNumber(a.x2), this.attributeNumber(a.y2));
        break;
      case 'text':
        shape = new Text(data.id, this.attributeNumber(a.x), this.attributeNumber(a.y), data.text ?? '');
        break;
      case 'g':
        shape = new Group(data.id);
        for (const child of data.children ?? []) (shape as Group).append(this.fromData(child));
        break;
      default:
        throw new Error(`unknown shape type: ${data.tag} (is the plugin loaded?)`);
    }
    for (const [name, value] of Object.entries(a)) {
      if (name === 'id') continue;
      try {
        shape.getAttribute(name);
        shape.setAttribute(name, value);
      } catch (error) {
        if (error instanceof Error && error.message === `unknown attribute: ${name}`) {
          shape.preserveAttribute(name, value);
        } else {
          throw error;
        }
      }
    }
    return shape;
  }

  private static attributeNumber(value: string | undefined): number {
    return value === undefined ? 0 : this.number(value);
  }

  private static number(value: string | undefined): number {
    const parsed = Number(value);
    if (value === undefined || value.trim() === '' || !Number.isFinite(parsed)) {
      throw new Error(`invalid number: ${value ?? ''}`);
    }
    return parsed;
  }

  private static expectArity(args: string[], min: number, max: number, usage: string): void {
    if (args.length < min || args.length > max) throw new Error(`invalid arguments. usage: ${usage}`);
  }
}
