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
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('ensureSymlink and ensureSymlinkOrPointer return true immediately on dryRun', () => {
    expect(
      ensureSymlink({
        targetDir: tmpDir,
        linkName: 'CLAUDE.md',
        targetFileName: 'AGENTS.md',
        dryRun: true
      })
    ).toBe(true);

    expect(
      ensureSymlinkOrPointer({
        targetDir: tmpDir,
        linkName: 'CLAUDE.md',
        targetFileName: 'AGENTS.md',
        dryRun: true
      })
    ).toBe(true);
  });

  it('isSameCaseInsensitiveFile accurately distinguishes files and edge cases', () => {
    expect(isSameCaseInsensitiveFile(tmpDir, 'AGENTS.md', 'AGENTS.md')).toBe(true);
    expect(isSameCaseInsensitiveFile(tmpDir, 'CLAUDE.md', 'AGENTS.md')).toBe(false);
    expect(isSameCaseInsensitiveFile(tmpDir, 'agents.md', 'AGENTS.md')).toBe(false);

    fs.writeFileSync(path.join(tmpDir, 'AGENTS.md'), '# Target');
    const isCaseInsensitiveFs = fs.existsSync(path.join(tmpDir, 'agents.md'));
    expect(isSameCaseInsensitiveFile(tmpDir, 'agents.md', 'AGENTS.md')).toBe(
      isCaseInsensitiveFs
    );

    // Error in readdirSync returns false
    const origReaddirSync = fs.readdirSync;
    try {
      (fs as any).readdirSync = () => {
        throw new Error('disk read error');
      };
      expect(isSameCaseInsensitiveFile(tmpDir, 'agents.md', 'AGENTS.md')).toBe(false);
    } finally {
      (fs as any).readdirSync = origReaddirSync;
    }

    // Error in lstatSync
    const origLstatSync = fs.lstatSync;
    try {
      (fs as any).lstatSync = () => {
        throw new Error('lstat error');
      };
      expect(isSameCaseInsensitiveFile(tmpDir, 'agents.md', 'AGENTS.md')).toBe(false);
    } finally {
      (fs as any).lstatSync = origLstatSync;
    }
  });

  it('isSameCaseInsensitiveFile covers bothEntriesExist and accessiblePair edge cases', () => {
    const origReaddir = fs.readdirSync;
    const origLstat = fs.lstatSync;
    const origExists = fs.existsSync;

    // bothEntriesExist with non-symlink
    try {
      (fs as any).readdirSync = () => ['AGENTS.md', 'agents.md'];
      (fs as any).lstatSync = () => ({ isSymbolicLink: () => false });
      expect(isSameCaseInsensitiveFile(tmpDir, 'agents.md', 'AGENTS.md')).toBe(true);
    } finally {
      (fs as any).readdirSync = origReaddir;
      (fs as any).lstatSync = origLstat;
    }

    // bothEntriesExist with symlink
    try {
      (fs as any).readdirSync = () => ['AGENTS.md', 'agents.md'];
      (fs as any).lstatSync = () => ({ isSymbolicLink: () => true });
      expect(isSameCaseInsensitiveFile(tmpDir, 'agents.md', 'AGENTS.md')).toBe(false);
    } finally {
      (fs as any).readdirSync = origReaddir;
      (fs as any).lstatSync = origLstat;
    }

    // bothEntriesExist throws lstat error
    try {
      let callCount = 0;
      (fs as any).readdirSync = () => ['AGENTS.md', 'agents.md'];
      (fs as any).lstatSync = () => {
        callCount++;
        if (callCount >= 1) throw new Error('lstat failed in bothEntriesExist');
        return { isSymbolicLink: () => false };
      };
      (fs as any).existsSync = () => false;
      expect(isSameCaseInsensitiveFile(tmpDir, 'agents.md', 'AGENTS.md')).toBe(false);
    } finally {
      (fs as any).readdirSync = origReaddir;
      (fs as any).lstatSync = origLstat;
      (fs as any).existsSync = origExists;
    }

    // accessiblePair succeeds deterministically on all platforms
    try {
      (fs as any).readdirSync = () => ['AGENTS.md'];
      (fs as any).existsSync = () => true;
      (fs as any).lstatSync = () => ({ isSymbolicLink: () => false });
      expect(isSameCaseInsensitiveFile(tmpDir, 'agents.md', 'AGENTS.md')).toBe(true);
    } finally {
      (fs as any).readdirSync = origReaddir;
      (fs as any).existsSync = origExists;
      (fs as any).lstatSync = origLstat;
    }

    // accessiblePair when existsSync returns false
    try {
      (fs as any).readdirSync = () => ['AGENTS.md'];
      (fs as any).existsSync = () => false;
      expect(isSameCaseInsensitiveFile(tmpDir, 'agents.md', 'AGENTS.md')).toBe(false);
    } finally {
      (fs as any).readdirSync = origReaddir;
      (fs as any).existsSync = origExists;
    }

    // accessiblePair exists but lstat throws
    try {
      (fs as any).readdirSync = () => ['AGENTS.md'];
      (fs as any).existsSync = () => true;
      (fs as any).lstatSync = () => {
        throw new Error('lstat failed in accessiblePair');
      };
      expect(isSameCaseInsensitiveFile(tmpDir, 'agents.md', 'AGENTS.md')).toBe(false);
    } finally {
      (fs as any).readdirSync = origReaddir;
      (fs as any).existsSync = origExists;
      (fs as any).lstatSync = origLstat;
    }
  });

  it('ensureSymlink replaces existing symlinks and falls back to copy on failure', () => {
    fs.writeFileSync(path.join(tmpDir, 'AGENTS.md'), '# Test Target');
    expect(
      ensureSymlink({
        targetDir: tmpDir,
        linkName: 'CLAUDE.md',
        targetFileName: 'AGENTS.md'
      })
    ).toBe(true);

    // Call again to verify replace
    expect(
      ensureSymlink({
        targetDir: tmpDir,
        linkName: 'CLAUDE.md',
        targetFileName: 'AGENTS.md'
      })
    ).toBe(true);

    // Preserves existing target file when isSameCaseInsensitiveFile is true
    expect(
      ensureSymlink({
        targetDir: tmpDir,
        linkName: 'AGENTS.md',
        targetFileName: 'AGENTS.md'
      })
    ).toBe(true);

    // Fallback when symlinkSync fails and sourceFile exists
    const origSymlinkSync = fs.symlinkSync;
    try {
      (fs as any).symlinkSync = () => {
        throw new Error('EPERM');
      };
      expect(
        ensureSymlink({
          targetDir: tmpDir,
          linkName: 'GEMINI.md',
          targetFileName: 'AGENTS.md'
        })
      ).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, 'GEMINI.md'))).toBe(true);
    } finally {
      (fs as any).symlinkSync = origSymlinkSync;
    }

    // Fallback when symlinkSync fails and sourceFile does NOT exist
    try {
      (fs as any).symlinkSync = () => {
        throw new Error('EPERM');
      };
      expect(
        ensureSymlink({
          targetDir: tmpDir,
          linkName: 'NONEXISTENT.md',
          targetFileName: 'GHOST.md'
        })
      ).toBe(true);
    } finally {
      (fs as any).symlinkSync = origSymlinkSync;
    }

    // Success branch when symlinkSync succeeds
    try {
      (fs as any).symlinkSync = () => {};
      expect(
        ensureSymlink({
          targetDir: tmpDir,
          linkName: 'SUCCEED.md',
          targetFileName: 'AGENTS.md'
        })
      ).toBe(true);
    } finally {
      (fs as any).symlinkSync = origSymlinkSync;
    }
  });

  it('ensureSymlinkOrPointer handles existing pointers, replacements, dangling links, and fallback', () => {
    const pointerFile = path.join(tmpDir, 'pointer.txt');
    fs.writeFileSync(pointerFile, 'AGENTS.md\n', 'utf-8');

    // Existing pointer already matches targetFileName
    expect(
      ensureSymlinkOrPointer({
        targetDir: tmpDir,
        linkName: 'pointer.txt',
        targetFileName: 'AGENTS.md'
      })
    ).toBe(true);

    // Existing pointer has different content
    fs.writeFileSync(pointerFile, 'OLD_TARGET.md\n', 'utf-8');
    const origSymlinkSync = fs.symlinkSync;
    try {
      (fs as any).symlinkSync = () => {
        throw new Error('symlink failed');
      };
      expect(
        ensureSymlinkOrPointer({
          targetDir: tmpDir,
          linkName: 'pointer.txt',
          targetFileName: 'AGENTS.md'
        })
      ).toBe(true);
      expect(fs.readFileSync(pointerFile, 'utf-8')).toBe('AGENTS.md\n');
    } finally {
      (fs as any).symlinkSync = origSymlinkSync;
    }

    // Dangling symlink probe: lstat succeeds, existsSync returns false
    const origExists = fs.existsSync;
    const origLstat = fs.lstatSync;
    try {
      (fs as any).lstatSync = () => ({ isSymbolicLink: () => true });
      (fs as any).existsSync = () => false;
      (fs as any).symlinkSync = () => {};
      expect(
        ensureSymlinkOrPointer({
          targetDir: tmpDir,
          linkName: 'dangling.txt',
          targetFileName: 'AGENTS.md'
        })
      ).toBe(true);
    } finally {
      (fs as any).lstatSync = origLstat;
      (fs as any).existsSync = origExists;
    }
  });
});
