import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import readline from 'node:readline';
import { Readable, Writable } from 'node:stream';
import { askQuestion, resolveTargetDir, ensureWritableTarget } from '../src/cli-target.js';

describe('CLI Target Resolution & Interactive Prompts', () => {
  it('resolves target directory accurately', () => {
    expect(resolveTargetDir(null)).toBe(process.cwd());
    expect(resolveTargetDir('.')).toBe(process.cwd());
    expect(resolveTargetDir('custom-dir')).toBe(path.resolve(process.cwd(), 'custom-dir'));
  });

  it('checks target writability in existing directory', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aisensei-write-'));
    expect(ensureWritableTarget(tmp)).toBe(true);
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('prompts question via custom readline interface', async () => {
    const input = new Readable({
      read() {
        this.push('Quantum Computing\n');
        this.push(null);
      }
    });
    const output = new Writable({
      write(chunk, encoding, callback) {
        callback();
      }
    });
    const rl = readline.createInterface({ input, output });
    const answer = await askQuestion('Topic: ', rl);
    expect(answer).toBe('Quantum Computing');
    rl.close();
  });
});
