import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { EditorSession } from '../src/app/EditorSession.js';
import { CommandDispatcher } from '../src/command/CommandDispatcher.js';

const temporary = mkdtempSync(join(tmpdir(), 'svg-editor-test-'));
afterAll(() => rmSync(temporary, { recursive: true, force: true }));

let session: EditorSession;
let cli: CommandDispatcher;
let run: (line: string) => string[];
beforeEach(() => {
  session = new EditorSession();
  cli = new CommandDispatcher(session);
  run = (line) => cli.execute(line);
  run('init');
});

describe('undo and redo', () => {
  it('undoes and redoes one edit with the specified messages', () => {
    run('create circle c1 100 100 20 red');
    run('move c1 30 0');
    expect(run('undo')).toEqual(['circle#c1 moved back to (100,100)']);
    expect(run('redo')).toEqual(['circle#c1 moved to (130,100)']);
  });

  it('skips display commands in history', () => {
    run('create rect r 0 0 1 1');
    run('tree');
    run('show r');
    run('undo');
    expect(session.document?.find('r')).toBeUndefined();
  });

  it('clears redo after a new edit', () => {
    run('create rect a 0 0 1 1');
    run('create rect b 0 0 1 1');
    run('undo');
    run('create rect c 0 0 1 1');
    expect(run('redo')).toEqual(['error: nothing to redo']);
    expect(session.document?.find('b')).toBeUndefined();
  });

  it('blocks old history after save and starts fresh on the next edit', () => {
    run('create rect a 0 0 1 1');
    run(`save ${join(temporary, 'history.svg')}`);
    expect(run('undo')).toEqual(['error: undo not allowed after io command']);
    run('create rect b 0 0 1 1');
    run('undo');
    expect(session.document?.find('a')).toBeDefined();
    expect(session.document?.find('b')).toBeUndefined();
    expect(run('undo')).toEqual(['error: nothing to undo']);
  });

  it('does not block history for a canvas query but does for resize', () => {
    run('create rect a 0 0 1 1');
    expect(run('canvas')).toEqual(['canvas 800x600']);
    run('undo');
    run('redo');
    run('canvas 400 300');
    expect(run('redo')).toEqual(['error: redo not allowed after io command']);
  });

  it('keeps document and history unchanged after a failed command', () => {
    run('create rect a 0 0 1 1');
    const before = JSON.stringify(session.document?.snapshot());
    expect(run('create rect a 9 9 9 9')).toEqual(['error: id already exists: a']);
    expect(JSON.stringify(session.document?.snapshot())).toBe(before);
    expect(run('undo')).toEqual(['rect#a creation undone']);
  });

  it('keeps the current document after a failed read', () => {
    run('create rect a 0 0 1 1');
    expect(run(`read ${join(temporary, 'missing.svg')}`)[0]).toContain('error: cannot read file:');
    expect(session.document?.find('a')).toBeDefined();
    expect(run('undo')).toEqual(['rect#a creation undone']);
  });
});
