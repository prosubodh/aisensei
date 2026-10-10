import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { scaffold, validateTarget } from '../src/scaffold.js';

describe('Scaffolding Engine', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aisensei-scaffold-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('scaffolds successfully in dryRun mode', () => {
    const res = scaffold({
      targetDir: tmpDir,
      dryRun: true,
      noGit: true
    });
    expect(res.success).toBe(true);
    expect(res.dryRun).toBe(true);
  });

  it('scaffolds directory structure and files in real mode', () => {
    const res = scaffold({
      targetDir: tmpDir,
      force: true,
      noGit: true,
      silent: true
    });
    expect(res.success).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'AGENTS.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'memory.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'docs', 'rules'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.tutor', 'curriculum.json'))).toBe(true);
  });

  it('scaffolds with custom topic seeding', () => {
    const res = scaffold({
      targetDir: tmpDir,
      topic: 'Distributed Systems',
      force: true,
      noGit: true,
      silent: true
    });
    expect(res.success).toBe(true);
    const curr = JSON.parse(
      fs.readFileSync(path.join(tmpDir, '.tutor', 'curriculum.json'), 'utf-8')
    );
    expect(curr.activeTopic).toBe('Distributed Systems');
  });

  it('throws when target is identical to templateDir', () => {
    expect(() =>
      validateTarget(process.cwd(), { templateDir: process.cwd() })
    ).toThrow('E_TARGET_IS_TEMPLATE');
  });

  it('throws when target is not empty without force', () => {
    fs.writeFileSync(path.join(tmpDir, 'somefile.txt'), 'hello', 'utf-8');
    expect(() => validateTarget(tmpDir, { force: false })).toThrow('E_TARGET_NOT_EMPTY');
  });
});
