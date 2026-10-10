import fs from 'node:fs';
import path from 'node:path';

/**
 * Options configuring symlink and pointer creation.
 */
export interface EnsureSymlinkOptions {
  /** Target directory containing the link */
  targetDir: string;
  /** Name of the link file to create */
  linkName: string;
  /** Name of the referenced target file */
  targetFileName: string;
  /** If true, simulates operation without writing */
  dryRun?: boolean;
}

interface BothEntriesExistOptions {
  targetDir: string;
  linkName: string;
  targetFileName: string;
  entries: readonly string[];
}

function namesDifferOnlyByCase(linkName: string, targetFileName: string): boolean {
  if (linkName.toLowerCase() !== targetFileName.toLowerCase()) return false;
  return linkName !== targetFileName;
}

function readDirEntries(targetDir: string): string[] | null {
  try {
    return fs.readdirSync(targetDir);
  } catch {
    return null;
  }
}

function bothEntriesExist(options: BothEntriesExistOptions): boolean {
  const { targetDir, linkName, targetFileName, entries } = options;
  if (!entries.includes(targetFileName) || !entries.includes(linkName)) return false;
  try {
    fs.lstatSync(path.join(targetDir, targetFileName));
    fs.lstatSync(path.join(targetDir, linkName));
    return true;
  } catch {
    return false;
  }
}

function accessiblePair(targetPath: string, linkPath: string): boolean {
  if (!fs.existsSync(targetPath) || !fs.existsSync(linkPath)) return false;
  try {
    fs.lstatSync(targetPath);
    fs.lstatSync(linkPath);
    return true;
  } catch {
    return false;
  }
}

function removeIfExists(linkPath: string): void {
  try {
    fs.lstatSync(linkPath);
    fs.rmSync(linkPath, { force: true });
  } catch {
    // Path does not exist, proceed
  }
}

function copyFallback(targetDir: string, linkName: string, targetFileName: string): void {
  const sourceFile = path.resolve(targetDir, targetFileName);
  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, path.join(targetDir, linkName));
  }
}

/**
 * Accurately determines if two filenames collide on a case-insensitive file system
 * (e.g. AGENTS.md vs agents.md on Windows/macOS) while preventing self-deletion.
 *
 * @param targetDir - Directory containing the files
 * @param linkName - Candidate link filename
 * @param targetFileName - Target source filename
 * @returns True if both filenames identify the same underlying file entity
 */
export function isSameCaseInsensitiveFile(
  targetDir: string,
  linkName: string,
  targetFileName: string
): boolean {
  if (linkName === targetFileName) return true;
  if (!namesDifferOnlyByCase(linkName, targetFileName)) return false;
  const entries = readDirEntries(targetDir);
  if (entries === null) return false;
  if (bothEntriesExist({ targetDir, linkName, targetFileName, entries })) {
    return !fs.lstatSync(path.join(targetDir, linkName)).isSymbolicLink();
  }
  const targetPath = path.join(targetDir, targetFileName);
  const linkPath = path.join(targetDir, linkName);
  return accessiblePair(targetPath, linkPath);
}

/**
 * Creates a symbolic link for an AI agent harness alias (e.g. CLAUDE.md -\> AGENTS.md),
 * automatically replacing stale links and falling back to byte-identical file copy
 * if symlink creation is not permitted by host OS privileges.
 *
 * @param options - Link configuration options
 * @returns True if link or fallback was established
 */
export function ensureSymlink(options: EnsureSymlinkOptions): boolean {
  const { targetDir, linkName, targetFileName, dryRun = false } = options;
  if (dryRun) return true;
  if (isSameCaseInsensitiveFile(targetDir, linkName, targetFileName)) return true;
  const linkPath = path.join(targetDir, linkName);
  removeIfExists(linkPath);
  try {
    fs.symlinkSync(targetFileName, linkPath, 'file');
    return true;
  } catch {
    copyFallback(targetDir, linkName, targetFileName);
    return true;
  }
}

/**
 * Creates a symbolic link or falls back to writing a clean text pointer file
 * referencing targetFileName if symlink operations fail.
 *
 * @param options - Link configuration options
 * @returns True if symlink or text pointer is active
 */
export function ensureSymlinkOrPointer(options: EnsureSymlinkOptions): boolean {
  const { targetDir, linkName, targetFileName, dryRun = false } = options;
  if (dryRun) return true;
  const linkPath = path.join(targetDir, linkName);
  try {
    try {
      fs.lstatSync(linkPath);
      const existing = fs.existsSync(linkPath) ? fs.readFileSync(linkPath, 'utf-8') : '';
      if (existing.trim() === targetFileName) return true;
      fs.rmSync(linkPath, { force: true });
    } catch {
      // Path does not exist, proceed
    }
    fs.symlinkSync(targetFileName, linkPath, 'file');
    return true;
  } catch {
    fs.writeFileSync(linkPath, `${targetFileName}\n`, 'utf-8');
    return true;
  }
}

/** Default cross-platform symlink and pointer link module exports. */
export default {
  isSameCaseInsensitiveFile,
  ensureSymlink,
  ensureSymlinkOrPointer
};
