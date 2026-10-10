import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import childProcess from 'node:child_process';
import { isInsideGitWorkTree, initGit } from '../src/repo.js';

describe('Repository & Worktree Management', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aisensei-repo-test-'));
  });

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('detects git worktree correctly in workspace and handles non-existent dirs', () => {
    expect(isInsideGitWorkTree(process.cwd())).toBe(true);
    expect(isInsideGitWorkTree(tmpDir)).toBe(false);

    const nonExistent = path.join(tmpDir, 'deep', 'does-not-exist');
    expect(isInsideGitWorkTree(nonExistent)).toBe(false);

    const origExec = childProcess.execFileSync;
    try {
      childProcess.execFileSync = () => {
        throw new Error('git fail');
      };
      expect(isInsideGitWorkTree(process.cwd())).toBe(false);
    } finally {
      childProcess.execFileSync = origExec;
    }
  });

  it('skips or simulates initialization with options', () => {
    expect(initGit(tmpDir, { noGit: true })).toBe(false);
    expect(initGit(tmpDir, { dryRun: true })).toBe(true);

    fs.mkdirSync(path.join(tmpDir, '.git'));
    expect(initGit(tmpDir)).toBe(false);
  });

  it('returns false when target is already inside git worktree', () => {
    expect(initGit(process.cwd())).toBe(false);
    expect(initGit(path.join(process.cwd(), 'src'))).toBe(false);
  });

  it('initializes git repository in fresh directory', () => {
    const initialized = initGit(tmpDir);
    expect(initialized).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.git'))).toBe(true);
  });

  it('handles child_process failures in initGit', () => {
    const origExec = childProcess.execFileSync;
    try {
      childProcess.execFileSync = () => {
        throw new Error('git failed');
      };
      expect(initGit(tmpDir)).toBe(false);
    } finally {
      childProcess.execFileSync = origExec;
    }
  });

  it('handles branch rename fallbacks and commit fallbacks', () => {
    const origExec = childProcess.execFileSync;
    const commandsRun: string[] = [];

    try {
      (childProcess as any).execFileSync = (file: any, args: any, opts: any) => {
        commandsRun.push(`${file} ${(args || []).join(' ')}`);
        const cmd = (args || []).join(' ');
        if (args && args[0] === 'rev-parse') return 'false\n';
        if (cmd.startsWith('init -b main')) throw new Error('option -b not supported');
        if (cmd.startsWith('branch -m main')) throw new Error('branch rename failed');
        if (cmd.startsWith('commit')) {
          if (opts && opts.env && opts.env.GIT_AUTHOR_NAME === 'aisensei[bot]') {
            return '';
          }
          throw new Error('author unknown');
        }
        return '';
      };

      const result = initGit(tmpDir);
      expect(result).toBe(true);
      expect(commandsRun.some((c) => c.includes('init -q'))).toBe(true);
      expect(commandsRun.some((c) => c.includes('branch -m main'))).toBe(true);
      expect(commandsRun.some((c) => c.includes('commit'))).toBe(true);
    } finally {
      childProcess.execFileSync = origExec;
    }
  });
});
