import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { isInsideGitWorkTree, initGit } from '../src/repo.js';

describe('Repository & Worktree Management', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aisensei-repo-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('detects git worktree correctly in workspace', () => {
    expect(isInsideGitWorkTree(process.cwd())).toBe(true);
  });

  it('returns false for initGit with noGit or dryRun', () => {
    expect(initGit(tmpDir, { noGit: true })).toBe(false);
    expect(initGit(tmpDir, { dryRun: true })).toBe(false);
  });

  it('initializes git repository in fresh directory', () => {
    const initialized = initGit(tmpDir);
    expect(initialized).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.git'))).toBe(true);
  });
});
