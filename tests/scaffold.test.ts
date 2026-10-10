import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { scaffold, validateTarget, copyTemplateItem } from '../src/scaffold.js';

describe('Scaffolding Engine', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aisensei-scaffold-test-'));
  });

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
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

  it('scaffolds directory structure, files, and git in real mode', () => {
    const res = scaffold({
      targetDir: tmpDir,
      force: true,
      noGit: false,
      silent: true
    });
    expect(res.success).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'AGENTS.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'memory.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'docs', 'rules'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.tutor', 'curriculum.json'))).toBe(true);
    expect(res.gitInitialized).toBe(true);
  });

  it('scaffolds with custom topic seeding and handles curriculum parsing error', () => {
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

    // Test corrupted curriculum fallback during topic seeding
    const tutorDir = path.join(tmpDir, '.tutor');
    fs.writeFileSync(path.join(tutorDir, 'curriculum.json'), '{ invalid json');
    expect(() =>
      scaffold({
        targetDir: tmpDir,
        topic: 'New Topic',
        force: true,
        noGit: true
      })
    ).not.toThrow();
  });

  it('scaffolds with default options throwing template error', () => {
    expect(() => scaffold()).toThrow('E_TARGET_IS_TEMPLATE');
  });

  it('validates target with default options', () => {
    expect(() => validateTarget(tmpDir)).not.toThrow();
  });

  it('copyTemplateItem returns early when source does not exist', () => {
    const actions: string[] = [];
    copyTemplateItem(path.join(tmpDir, 'nonexistent-source'), tmpDir, false, actions);
    expect(actions.length).toBe(0);
  });

  it('throws when target is identical to templateDir', () => {
    expect(() =>
      validateTarget(process.cwd(), { templateDir: process.cwd() })
    ).toThrow('E_TARGET_IS_TEMPLATE');
  });

  it('throws when target is a protected system directory', () => {
    const root = path.parse(process.cwd()).root;
    expect(() =>
      validateTarget(root, { force: true, allowProtected: false })
    ).toThrow('E_TARGET_IS_PROTECTED');
  });

  it('throws when target is not empty without force', () => {
    fs.writeFileSync(path.join(tmpDir, 'somefile.txt'), 'hello', 'utf-8');
    expect(() => validateTarget(tmpDir, { force: false })).toThrow('E_TARGET_NOT_EMPTY');
  });
});
