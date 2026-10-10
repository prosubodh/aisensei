import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  isSameCaseInsensitiveFile,
  ensureSymlink,
  ensureSymlinkOrPointer
} from '../src/links.js';

describe('Links & Multi-Agent Harness Parity', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aisensei-links-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('detects case-insensitive identical files', () => {
    expect(isSameCaseInsensitiveFile(tmpDir, 'foo.txt', 'foo.txt')).toBe(true);
  });

  it('ensures symlink or copy fallback', () => {
    const targetFile = path.join(tmpDir, 'source.txt');
    fs.writeFileSync(targetFile, 'content', 'utf-8');

    const ok = ensureSymlink({
      targetDir: tmpDir,
      linkName: 'alias.txt',
      targetFileName: 'source.txt'
    });
    expect(ok).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'alias.txt'))).toBe(true);
  });

  it('ensures pointer fallback when dryRun or symlinks', () => {
    const ok = ensureSymlinkOrPointer({
      targetDir: tmpDir,
      linkName: 'pointer.txt',
      targetFileName: 'source.txt',
      dryRun: false
    });
    expect(ok).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'pointer.txt'))).toBe(true);
  });
});
