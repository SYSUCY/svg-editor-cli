import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { SvgParser } from '../src/io/SvgParser.js';
import { SvgSerializer } from '../src/io/SvgSerializer.js';
import { Text } from '../src/model/Text.js';
import { SvgDocument } from '../src/model/SvgDocument.js';

const fixture = fileURLToPath(new URL('./fixtures/other.svg', import.meta.url));

describe('SVG IO', () => {
  it('reads the supplied external SVG and assigns missing ids', () => {
    const result = new SvgParser().parse(readFileSync(fixture, 'utf8'), fixture);
    expect(result.document.elementCount).toBe(7);
    expect(result.document.width).toBe(400);
    expect(result.document.find('rect1')).toBeDefined();
    expect(result.warnings).toEqual(['warning: assigned id rect1 to unnamed <rect>']);
  });

  it('round-trips nested shapes, text escaping, and presentation attributes', () => {
    const document = new SvgDocument(400, 200);
    const text = new Text('t', 1.5, 2.5, 'A & <B> "quoted"');
    text.preserveAttribute('font-size', '16');
    document.add(text);
    const xml = new SvgSerializer().serialize(document);
    expect(xml).toContain('A &amp; &lt;B&gt; "quoted"');
    expect(xml).toContain('font-size="16"');
    const restored = new SvgParser().parse(xml).document;
    const restoredText = restored.require('t').toData();
    expect(restoredText.text).toBe('A & <B> "quoted"');
    expect(restoredText.attributes['font-size']).toBe('16');
  });

  it('avoids explicit ids that appear later when assigning automatic ids', () => {
    const xml = '<svg width="10" height="10"><rect/><rect id="rect1"/></svg>';
    const result = new SvgParser().parse(xml);
    expect(result.warnings).toEqual(['warning: assigned id rect2 to unnamed <rect>']);
    expect(result.document.elementCount).toBe(2);
  });

  it('rejects duplicate ids during import', () => {
    const xml = '<svg width="10" height="10"><rect id="x"/><circle id="x"/></svg>';
    expect(() => new SvgParser().parse(xml)).toThrow('id already exists: x');
  });
});
