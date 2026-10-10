import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
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

  it('throws on path escaping parent directory with default and custom message', () => {
    expect(() => assertInside(process.cwd(), '../../escaped.txt')).toThrow('E_PATH_ESCAPE');
    expect(() => assertInside(process.cwd(), '../../escaped.txt', 'Custom escape error')).toThrow('Custom escape error');
  });

  it('identifies system root or home as protected target', () => {
    const root = path.parse(process.cwd()).root;
    expect(isProtectedTarget(root)).toBe(true);

    const home = os.homedir();
    if (home) {
      expect(isProtectedTarget(home)).toBe(true);
      const parent = path.dirname(path.resolve(home));
      expect(isProtectedTarget(parent)).toBe(true);
    }
  });

  it('identifies template ancestor as protected target', () => {
    const templateDir = getTemplateDir();
    const ancestor = path.dirname(templateDir);
    expect(isProtectedTarget(ancestor, templateDir)).toBe(true);
  });

  it('handles realpathSync resolving to root or home or throwing', () => {
    const safeDir = path.join(process.cwd(), 'src');
    const origRealpathSync = fs.realpathSync;

    // 1. realpathSync throws
    try {
      (fs as any).realpathSync = () => {
        throw new Error('realpath error');
      };
      expect(isProtectedTarget(safeDir)).toBe(false);
    } finally {
      (fs as any).realpathSync = origRealpathSync;
    }

    // 2. realpathSync resolves to root
    try {
      (fs as any).realpathSync = () => path.parse(process.cwd()).root;
      expect(isProtectedTarget(safeDir)).toBe(true);
    } finally {
      (fs as any).realpathSync = origRealpathSync;
    }

    // 3. realpathSync resolves to home
    const home = os.homedir();
    if (home) {
      try {
        (fs as any).realpathSync = () => home;
        expect(isProtectedTarget(safeDir)).toBe(true);
      } finally {
        (fs as any).realpathSync = origRealpathSync;
      }
    }
  });

  it('handles os.homedir exceptions gracefully', () => {
    const origHomedir = os.homedir;
    try {
      os.homedir = () => {
        throw new Error('homedir unavailable');
      };
      expect(isProtectedTarget(path.join(process.cwd(), 'src'))).toBe(false);
    } finally {
      os.homedir = origHomedir;
    }
  });

  it('normalizes paths across platforms (win32 and posix)', () => {
    const origPlatform = process.platform;
    try {
      Object.defineProperty(process, 'platform', { value: 'linux', configurable: true });
      expect(normalizeForComparison('/Test/Path')).toBe(path.resolve('/Test/Path'));

      Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });
      expect(normalizeForComparison('C:\\Test\\Path')).toBe(path.resolve('C:\\Test\\Path').toLowerCase());
    } finally {
      Object.defineProperty(process, 'platform', { value: origPlatform, configurable: true });
    }
  });

  it('resolves template directory', () => {
    const dir = getTemplateDir();
    expect(typeof dir).toBe('string');
    expect(dir.length).toBeGreaterThan(0);
  });
});
