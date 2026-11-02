import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { afterAll, describe, expect, it } from 'vitest';
import { EditorSession } from '../src/app/EditorSession.js';
import { CommandDispatcher } from '../src/command/CommandDispatcher.js';
import { SvgParser } from '../src/io/SvgParser.js';

const temporary = mkdtempSync(join(tmpdir(), 'svg-editor-e2e-'));
const fixture = fileURLToPath(new URL('./fixtures/other.svg', import.meta.url));
const projectRoot = fileURLToPath(new URL('../', import.meta.url));
afterAll(() => rmSync(temporary, { recursive: true, force: true }));

describe('document transcripts', () => {
  it('replays the main transcript including IO history restrictions', () => {
    const session = new EditorSession();
    const cli = new CommandDispatcher(session);
    const run = (line: string): string[] => cli.execute(line);
    run('init 800 600');
    run('create rect bg 0 0 800 600 #ffffff');
    run('create text title 20 40 "My Diagram"');
    run('create circle c1 100 100 20 red');
    run('create rect box 200 80 60 60 #3366ff');
    run('group markers c1 box');
    expect(run('move c1 30 0')).toEqual(['circle#c1 moved to (130,100)']);
    expect(run('undo')).toEqual(['circle#c1 moved back to (100,100)']);
    expect(run('redo')).toEqual(['circle#c1 moved to (130,100)']);
    run('set title text "My Diagram v2"');
    expect(run('undo')).toEqual(['text#title updated: text="My Diagram"']);
    expect(run('group bad c1 markers')).toEqual(['error: cannot group a container into its own descendant: markers']);
    run('delete box');
    expect(run('undo')).toEqual(['rect#box restored into g#markers']);
    const output = join(temporary, 'demo.svg');
    expect(run(`save ${output}`)).toEqual([`saved to ${output} (5 elements)`]);
    expect(run('undo')).toEqual(['error: undo not allowed after io command']);
    expect(run(`read ${fixture}`)).toEqual([
      'warning: assigned id rect1 to unnamed <rect>',
      `read ${fixture} (7 elements)`,
    ]);
    expect(run('tree')[0]).toBe('svg (400x300)');
  });

  it('builds and round-trips the two-node flowchart', () => {
    const session = new EditorSession();
    const cli = new CommandDispatcher(session);
    const commands = [
      'init 800 600',
      'create g flowchart',
      'create g node1 in flowchart',
      'create rect start 120 100 160 60 #4a90d9 in node1',
      'create text start-label 155 135 "开始" in node1',
      'create g node2 in flowchart',
      'create rect process 520 100 160 60 #f5a623 in node2',
      'create text process-label 545 135 "处理数据" in node2',
      'create line arrow1 280 130 520 130 black in flowchart',
      'move node2 0 100',
      'undo',
      'set process-label text "处理数据 v2"',
    ];
    for (const command of commands) expect(cli.execute(command)[0]).not.toMatch(/^error:/);
    const output = join(temporary, 'flowchart.svg');
    expect(cli.execute(`save ${output}`)).toEqual([`saved to ${output} (8 elements)`]);
    const restored = new SvgParser().parse(readFileSync(output, 'utf8')).document;
    expect(restored.elementCount).toBe(8);
    expect(restored.location('process-label')?.parent?.id).toBe('node2');
    expect(restored.require('process-label').toData().text).toBe('处理数据 v2');
  });

  it('runs the real npm CLI entry point as a process', () => {
    const result = spawnSync(process.execPath, ['--import', 'tsx', join(projectRoot, 'src/cli/Main.ts')], {
      cwd: projectRoot,
      input: 'init 100 80\ncreate text t 1 2 "hello world"\ntree\n',
      encoding: 'utf8',
      timeout: 20_000,
    });
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain("svg-editor 0.1 — type 'help' for commands");
    expect(result.stdout).toContain('svg> canvas 100x80 created');
    expect(result.stdout).toContain('text#t');
    expect(result.stdout).toContain('(1,2) "hello world"');
  });
});
