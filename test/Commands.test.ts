import { describe, expect, it, beforeEach } from 'vitest';
import { EditorSession } from '../src/app/EditorSession.js';
import { CommandDispatcher } from '../src/command/CommandDispatcher.js';

let session: EditorSession;
let cli: CommandDispatcher;
let run: (line: string) => string[];

beforeEach(() => {
  session = new EditorSession();
  cli = new CommandDispatcher(session);
  run = (line) => cli.execute(line);
  run('init 800 600');
});

describe('shape commands', () => {
  it('creates all six types including quoted text and in clauses', () => {
    expect(run('create g scene')).toEqual(['g#scene created']);
    expect(run('create rect r 1 2 3 4 #fff in scene')).toEqual(['rect#r created in g#scene']);
    run('create circle c 5 6 7 red in scene');
    run('create ellipse e 1 2 3 4 blue');
    run('create line l 1 2 3 4 black');
    run('create text t 10 20 "hello world" in scene');
    expect(session.document?.elementCount).toBe(6);
    expect(session.document?.require('t').toData().text).toBe('hello world');
    expect(session.document?.location('r')?.parent?.id).toBe('scene');
  });

  it('rejects unknown types, duplicate ids, and invalid containers', () => {
    expect(run('create box n1 1 2 3 4 "title"')[0]).toContain('error: unknown shape type: box');
    run('create rect r 0 0 1 1');
    expect(run('create rect r 0 0 1 1')).toEqual(['error: id already exists: r']);
    expect(run('create rect x 0 0 1 1 in missing')).toEqual(['error: no such container: missing']);
    expect(run('create rect x 0 0 1 1 in r')).toEqual(['error: not a container: r']);
    expect(session.document?.elementCount).toBe(1);
  });

  it('groups, moves, deletes, and restores nested shapes', () => {
    run('create rect r 0 0 10 10');
    run('create circle c 20 20 5');
    expect(run('group g r c')).toEqual(['g#g created with 2 children']);
    expect(run('move g 5 10')).toEqual(['g#g moved by (5,10)']);
    expect(session.document?.require('r').toData().attributes).toMatchObject({ x: '5', y: '10' });
    run('delete g');
    expect(session.document?.elementCount).toBe(0);
    run('undo');
    expect(session.document?.elementCount).toBe(3);
    expect(session.document?.require('c').toData().attributes).toMatchObject({ cx: '25', cy: '30' });
  });

  it('rejects ancestor/descendant grouping atomically', () => {
    run('create g g1');
    run('create rect r 0 0 1 1 in g1');
    const before = JSON.stringify(session.document?.snapshot());
    expect(run('group bad r g1')).toEqual(['error: cannot group a container into its own descendant: g1']);
    expect(JSON.stringify(session.document?.snapshot())).toBe(before);
  });

  it('supports nested ungroup and rejects top-level ungroup', () => {
    run('create g outer');
    run('create g inner in outer');
    run('create rect r 0 0 1 1 in inner');
    expect(run('ungroup inner')[0]).toBe('g#inner ungrouped (1 children promoted)');
    expect(session.document?.location('r')?.parent?.id).toBe('outer');
    expect(run('ungroup outer')).toEqual(['error: cannot ungroup top-level container: outer']);
  });

  it('prevents cyclic addto operations', () => {
    run('create g g1');
    run('create g g2 in g1');
    expect(run('addto g1 g2')[0]).toBe('g#g2 added to g#g1');
    expect(run('addto g2 g1')[0]).toBe('error: cannot move a container into its own descendant: g1');
  });

  it('sets whitelisted attributes and scales geometry', () => {
    run('create rect r 1 2 3 4');
    expect(run('set r fill red')).toEqual(['rect#r updated: fill=red']);
    expect(run('set r r 2')).toEqual(['error: unknown attribute: r']);
    expect(run('scale r 2')[0]).toBe('rect#r scaled by 2');
    expect(session.document?.require('r').toData().attributes).toMatchObject({ x: '2', y: '4', width: '6', height: '8' });
    expect(run('scale r 0')).toEqual(['error: scale factor must be positive']);
  });

  it('changes sibling z-order', () => {
    run('create rect a 0 0 1 1');
    run('create rect b 0 0 1 1');
    run('create rect c 0 0 1 1');
    run('front a');
    expect(session.document?.children.map((shape) => shape.id)).toEqual(['b', 'c', 'a']);
    run('back a');
    expect(session.document?.children.map((shape) => shape.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('display and parsing', () => {
  it('formats tree and show output', () => {
    run('create rect bg 0 0 800 600 #ffffff');
    run('create text title 20 40 "My Diagram"');
    expect(run('tree')).toEqual([
      'svg (800x600)',
      '├── rect#bg        x=0 y=0 w=800 h=600 fill=#ffffff',
      '└── text#title     (20,40) "My Diagram"',
    ]);
    expect(run('show bg')).toEqual([
      'rect#bg  parent=canvas',
      '  x=0 y=0 width=800 height=600',
      '  fill=#ffffff',
    ]);
  });

  it('ignores full-line comments but not hexadecimal colors', () => {
    expect(run('# create rect nope 0 0 1 1')).toEqual([]);
    run('create rect r 0 0 1 1 #fff');
    expect(session.document?.require('r').getAttribute('fill')).toBe('#fff');
  });

  it('reports missing documents and malformed quoting', () => {
    const empty = new CommandDispatcher(new EditorSession());
    expect(empty.execute('tree')).toEqual(["error: no document. use 'init' or 'read' first"]);
    expect(run('create text t 1 2 "unterminated')).toEqual(['error: unterminated quoted argument']);
  });
});
