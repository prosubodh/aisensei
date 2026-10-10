import os from 'node:os';
import path from 'node:path';
import {
  assertInside,
  isProtectedTarget,
  normalizeForComparison,
  getTemplateDir
} from '../src/guards.js';

describe('Guards & Target Safety', () => {
  it('allows candidate strictly inside root', () => {
    expect(() => assertInside(process.cwd(), 'src/index.ts')).not.toThrow();
  });

  it('throws on path escaping parent directory', () => {
    expect(() => assertInside(process.cwd(), '../../escaped.txt')).toThrow();
  });

  it('identifies system root or home as protected target', () => {
    const root = path.parse(process.cwd()).root;
    expect(isProtectedTarget(root)).toBe(true);

    const home = os.homedir();
    if (home) {
      expect(isProtectedTarget(home)).toBe(true);
    }
  });

  it('normalizes paths for comparison', () => {
    const p = normalizeForComparison('foo/bar');
    expect(typeof p).toBe('string');
  });

  it('resolves template directory', () => {
    const dir = getTemplateDir();
    expect(typeof dir).toBe('string');
    expect(dir.length).toBeGreaterThan(0);
  });
});
