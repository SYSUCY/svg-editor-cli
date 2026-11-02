import { describe, expect, it } from 'vitest';
import { Circle } from '../src/model/Circle.js';
import { Group } from '../src/model/Group.js';
import { Rect } from '../src/model/Rect.js';
import { Text } from '../src/model/Text.js';
import { SvgDocument } from '../src/model/SvgDocument.js';

describe('SVG domain model', () => {
  it('moves and scales a group recursively', () => {
    const group = new Group('node');
    const rect = new Rect('box', 10, 20, 100, 50);
    const text = new Text('label', 20, 40, 'hello');
    group.append(rect);
    group.append(text);
    group.move(5, -10);
    group.scale(2);
    expect(rect.toData().attributes).toMatchObject({ x: '30', y: '20', width: '200', height: '100' });
    expect(text.toData().attributes).toMatchObject({ x: '50', y: '60' });
  });

  it('uses case-sensitive globally unique ids', () => {
    const document = new SvgDocument(800, 600);
    document.add(new Rect('r1', 0, 0, 10, 10));
    document.add(new Rect('R1', 0, 0, 10, 10));
    expect(document.elementCount).toBe(2);
    expect(() => document.add(new Circle('r1', 0, 0, 1))).toThrow('id already exists: r1');
  });

  it('rejects attributes outside the polymorphic whitelist', () => {
    const rect = new Rect('r', 0, 0, 10, 10);
    rect.setAttribute('fill', 'red');
    rect.setAttribute('width', '20.5');
    expect(rect.getAttribute('fill')).toBe('red');
    expect(rect.toData().attributes.width).toBe('20.5');
    expect(() => rect.setAttribute('r', '2')).toThrow('unknown attribute: r');
  });

  it('restores a complete snapshot', () => {
    const document = new SvgDocument(800, 600);
    document.add(new Rect('r', 1, 2, 3, 4));
    const snapshot = document.snapshot();
    document.require('r').move(10, 20);
    document.restore(snapshot);
    expect(document.require('r').toData().attributes).toMatchObject({ x: '1', y: '2' });
  });
});
