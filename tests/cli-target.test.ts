import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import readline from 'node:readline';
import { Readable, Writable } from 'node:stream';
import { jest } from '@jest/globals';
import { askQuestion, resolveTargetDir, ensureWritableTarget } from '../src/cli-target.js';

describe('CLI Target Resolution & Interactive Prompts', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aisensei-target-test-'));
  });

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('resolves target directory accurately', () => {
    expect(resolveTargetDir(null)).toBe(process.cwd());
    expect(resolveTargetDir('.')).toBe(process.cwd());
    expect(resolveTargetDir('custom-dir')).toBe(path.resolve(process.cwd(), 'custom-dir'));
  });

  it('checks target writability in existing and non-existent directories', () => {
    expect(ensureWritableTarget(tmpDir)).toBe(true);

    const nonExistent = path.join(tmpDir, 'new_folder');
    expect(ensureWritableTarget(nonExistent)).toBe(true);

    // Mock writeFileSync throwing to test catch block
    const origWrite = fs.writeFileSync;
    try {
      (fs as any).writeFileSync = () => {
        throw new Error('read only');
      };
      expect(ensureWritableTarget(tmpDir)).toBe(false);
    } finally {
      fs.writeFileSync = origWrite;
    }
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

  it('prompts question using default readline interface when none provided', async () => {
    const origCreateInterface = readline.createInterface;
    let closed = false;
    try {
      (readline as any).createInterface = () => ({
        question: (query: string, cb: (ans: string) => void) => cb('Machine Learning\n'),
        close: () => {
          closed = true;
        }
      });

      const answer = await askQuestion('Topic: ');
      expect(answer).toBe('Machine Learning');
      expect(closed).toBe(true);
    } finally {
      (readline as any).createInterface = origCreateInterface;
    }
  });
});
