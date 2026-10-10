import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { ScaffoldError, ERROR_CODES } from './errors.js';

/**
 * Resolves the root filesystem directory of the aisensei template files.
 *
 * @returns Absolute path to template directory
 */
export function getTemplateDir(): string {
  const currentDir = import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(currentDir, '..');
}

/**
 * Options for configuring protected target verification.
 */
export interface ProtectedTargetOptions {
  /** Template directory to test ancestry against */
  templateDir?: string;
  /** Force overwrite */
  force?: boolean;
  /** Dry-run mode */
  dryRun?: boolean;
  /** Allow protected target override */
  allowProtected?: boolean;
}

/**
 * Filesystem scope guard.
 * Constrains all reads/writes to root, throwing if candidate escapes root.
 *
 * @param root - Boundary directory
 * @param candidate - File path to inspect
 * @param message - Optional custom error message
 * @throws {ScaffoldError} When candidate escapes root directory
 */
export function assertInside(root: string, candidate: string, message?: string): void {
  const resolvedRoot = path.resolve(root);
  const resolvedCandidate = path.resolve(root, candidate);
  const relative = path.relative(resolvedRoot, resolvedCandidate);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new ScaffoldError('E_PATH_ESCAPE', message || `${ERROR_CODES.PATH_ESCAPE}: ${candidate}`);
  }
}

/**
 * Normalizes a path for protected-target comparison across Windows and POSIX.
 *
 * @param p - Path to normalize
 * @returns Case-normalized resolved path string
 */
export function normalizeForComparison(p: string): string {
  const resolved = path.resolve(p);
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

function readHomeDir(): string {
  try {
    return os.homedir();
  } catch {
    return '';
  }
}

function isFilesystemRoot(resolvedTarget: string): boolean {
  return resolvedTarget === path.parse(resolvedTarget).root;
}

function isHomeOrParent(normalizedTarget: string, home: string): boolean {
  if (!home) return false;
  if (normalizedTarget === normalizeForComparison(home)) return true;
  const parent = path.dirname(path.resolve(home));
  return normalizedTarget === normalizeForComparison(parent);
}

function isTemplateAncestor(resolvedTarget: string, templateDir: string): boolean {
  const resolvedTemplate = path.resolve(templateDir);
  const relative = path.relative(resolvedTarget, resolvedTemplate);
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}

function resolvesToProtectedLocation(resolvedTarget: string, home: string): boolean {
  let real = '';
  try {
    if (!fs.existsSync(resolvedTarget)) return false;
    real = fs.realpathSync(resolvedTarget);
  } catch {
    return false;
  }
  if (real === path.parse(real).root) return true;
  return Boolean(home) && normalizeForComparison(real) === normalizeForComparison(home);
}

/**
 * Returns true when targetDir is a location that must never be overwritten:
 * the filesystem root, the user's home directory, the home parent, or template ancestor.
 *
 * @param targetDir - Candidate destination directory
 * @param templateDir - Aisensei template root
 * @returns True if targetDir is a system-protected location
 */
export function isProtectedTarget(targetDir: string, templateDir: string = getTemplateDir()): boolean {
  const resolvedTarget = path.resolve(targetDir);
  const normalizedTarget = normalizeForComparison(resolvedTarget);
  const home = readHomeDir();

  if (isFilesystemRoot(resolvedTarget)) return true;
  if (isHomeOrParent(normalizedTarget, home)) return true;
  if (isTemplateAncestor(resolvedTarget, templateDir)) return true;
  if (resolvesToProtectedLocation(resolvedTarget, home)) return true;

  return false;
}

/** Default safety guards and path boundary module exports. */
export default {
  getTemplateDir,
  assertInside,
  normalizeForComparison,
  isProtectedTarget
};
