import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { Group } from '../model/Group.js';
import type { ShapeData } from '../model/Shape.js';
import { ShapeFactory } from '../model/ShapeFactory.js';
import { SvgDocument } from '../model/SvgDocument.js';

interface XmlNode {
  [key: string]: unknown;
}

export interface SvgParseResult {
  document: SvgDocument;
  warnings: string[];
}

export class SvgParser {
  private readonly warnings: string[] = [];
  private readonly usedIds = new Set<string>();
  private readonly counters = new Map<string, number>();

  public parse(xml: string, sourcePath?: string): SvgParseResult {
    if (/<!DOCTYPE/i.test(xml)) throw new Error('invalid SVG: DOCTYPE is not supported');
    const validation = XMLValidator.validate(xml);
    if (validation !== true) throw new Error(`invalid SVG: ${validation.err.msg}`);
    const parser = new XMLParser({
      preserveOrder: true,
      ignoreAttributes: false,
      attributeNamePrefix: '',
      textNodeName: '#text',
      parseAttributeValue: false,
      parseTagValue: false,
      trimValues: false,
    });
    const parsed = parser.parse(xml) as XmlNode[];
    const root = parsed.find((node) => Object.hasOwn(node, 'svg'));
    if (!root) throw new Error('invalid SVG: missing <svg> root');
    const rootAttributes = this.attributes(root);
    const width = this.dimension(rootAttributes.width, 'width');
    const height = this.dimension(rootAttributes.height, 'height');
    const document = new SvgDocument(width, height, sourcePath);
    for (const child of this.elementNodes(root.svg)) {
      const shape = this.parseShape(child);
      document.add(shape);
    }
    return { document, warnings: [...this.warnings] };
  }

  private parseShape(node: XmlNode): ReturnType<typeof ShapeFactory.fromData> {
    const tag = this.tag(node);
    if (!ShapeFactory.supports(tag)) throw new Error(`unknown shape type: ${tag} (is the plugin loaded?)`);
    const attributes = { ...this.attributes(node) };
    const id = attributes.id ?? this.assignId(tag);
    if (this.usedIds.has(id)) throw new Error(`id already exists: ${id}`);
    this.usedIds.add(id);
    attributes.id = id;
    const content = node[tag];
    const children: ShapeData[] = [];
    if (tag === 'g') {
      for (const child of this.elementNodes(content)) {
        children.push(this.parseShape(child).toData());
      }
    }
    const data: ShapeData = { tag, id, attributes };
    if (tag === 'text') data.text = this.text(content);
    if (tag === 'g') data.children = children;
    return ShapeFactory.fromData(data);
  }

  private assignId(tag: string): string {
    let counter = this.counters.get(tag) ?? 1;
    let id = `${tag}${counter}`;
    while (this.usedIds.has(id)) {
      counter += 1;
      id = `${tag}${counter}`;
    }
    this.counters.set(tag, counter + 1);
    this.warnings.push(`warning: assigned id ${id} to unnamed <${tag}>`);
    return id;
  }

  private elementNodes(value: unknown): XmlNode[] {
    if (!Array.isArray(value)) return [];
    return value.filter((node): node is XmlNode => {
      if (typeof node !== 'object' || node === null) return false;
      return Object.keys(node).some((key) => !['#text', ':@'].includes(key));
    });
  }

  private text(value: unknown): string {
    if (!Array.isArray(value)) return '';
    return value.map((node) => {
      if (typeof node === 'object' && node !== null && '#text' in node) return String(node['#text']);
      return '';
    }).join('');
  }

  private tag(node: XmlNode): string {
    const tag = Object.keys(node).find((key) => !['#text', ':@'].includes(key));
    if (!tag) throw new Error('invalid SVG: empty element');
    return tag;
  }

  private attributes(node: XmlNode): Record<string, string> {
    const attributes = node[':@'];
    if (typeof attributes !== 'object' || attributes === null) return {};
    return Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key, String(value)]));
  }

  private dimension(value: string | undefined, name: string): number {
    const parsed = Number(value);
    if (value === undefined || !Number.isFinite(parsed) || parsed <= 0) {
      throw new Error(`invalid SVG canvas ${name}: ${value ?? ''}`);
    }
    return parsed;
  }
}
