export interface ShapeStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface ShapeData {
  tag: string;
  id: string;
  attributes: Record<string, string>;
  text?: string;
  children?: ShapeData[];
}

export abstract class Shape {
  public abstract readonly tag: string;
  private readonly preservedAttributes = new Map<string, string>();

  public constructor(
    public readonly id: string,
    private fill?: string,
    private stroke?: string,
    private strokeWidth?: number,
  ) {
    if (id.length === 0) {
      throw new Error('shape id must not be empty');
    }
  }

  public abstract move(dx: number, dy: number): void;
  public abstract scale(factor: number): void;
  public abstract positionDescription(): string | undefined;
  public abstract treeDetails(): string;
  public abstract showDetails(): string[];
  public abstract toData(): ShapeData;

  public setAttribute(attribute: string, value: string): void {
    switch (attribute) {
      case 'fill':
        this.fill = value;
        return;
      case 'stroke':
        this.stroke = value;
        return;
      case 'stroke-width':
        this.strokeWidth = Shape.number(value);
        return;
      default:
        this.setOwnAttribute(attribute, value);
    }
  }

  public getAttribute(attribute: string): string | undefined {
    switch (attribute) {
      case 'fill':
        return this.fill;
      case 'stroke':
        return this.stroke;
      case 'stroke-width':
        return this.strokeWidth?.toString();
      default:
        return this.getOwnAttribute(attribute);
    }
  }

  public preserveAttribute(attribute: string, value: string): void {
    this.preservedAttributes.set(attribute, value);
  }

  protected setOwnAttribute(attribute: string, _value: string): void {
    throw new Error(`unknown attribute: ${attribute}`);
  }

  protected getOwnAttribute(attribute: string): string | undefined {
    throw new Error(`unknown attribute: ${attribute}`);
  }

  protected ownAttributes(): Record<string, string> {
    return {};
  }

  protected textContent(): string | undefined {
    return undefined;
  }

  protected childrenData(): ShapeData[] | undefined {
    return undefined;
  }

  protected data(): ShapeData {
    const result: ShapeData = {
      tag: this.tag,
      id: this.id,
      attributes: {
        id: this.id,
        ...this.ownAttributes(),
        ...this.styleAttributes(),
        ...Object.fromEntries(this.preservedAttributes),
      },
    };
    const text = this.textContent();
    const children = this.childrenData();
    if (text !== undefined) result.text = text;
    if (children !== undefined) result.children = children;
    return result;
  }

  protected styleAttributes(): Record<string, string> {
    const attributes: Record<string, string> = {};
    if (this.fill !== undefined) attributes.fill = this.fill;
    if (this.stroke !== undefined) attributes.stroke = this.stroke;
    if (this.strokeWidth !== undefined) attributes['stroke-width'] = this.strokeWidth.toString();
    return attributes;
  }

  protected styleSuffix(): string {
    return Object.entries(this.styleAttributes())
      .map(([name, value]) => ` ${name}=${value}`)
      .join('');
  }

  protected styleDetailLines(): string[] {
    return Object.entries(this.styleAttributes()).map(([name, value]) => `${name}=${value}`);
  }

  protected static number(value: string): number {
    const parsed = Number(value);
    if (value.trim() === '' || !Number.isFinite(parsed)) {
      throw new Error(`invalid number: ${value}`);
    }
    return parsed;
  }
}
