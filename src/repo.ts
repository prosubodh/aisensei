import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { runGit } from './git.js';

const INITIAL_COMMIT_MESSAGE = 'chore: initial scaffold from aisensei template';

/**
 * Options configuring git repository initialization.
 */
export interface InitGitOptions {
  /** If true, skips git repository initialization */
  noGit?: boolean;
  /** If true, simulates initialization without writing files */
  dryRun?: boolean;
}

/**
 * Checks whether targetDir is located inside an existing git work tree.
 *
 * @param targetDir - Directory path to inspect
 * @returns True if directory is inside a git work tree
 */
export function isInsideGitWorkTree(targetDir: string): boolean {
  try {
    const checkDir = fs.existsSync(targetDir) ? targetDir : path.dirname(targetDir);
    const out = runGit(['rev-parse', '--is-inside-work-tree'], {
      cwd: checkDir,
      stdio: ['ignore', 'pipe', 'ignore']
    });
    return String(out).trim() === 'true';
  } catch {
    return false;
  }
}

function renameBranchMain(targetDir: string): void {
  try {
    runGit(['branch', '-m', 'main'], { cwd: targetDir, stdio: 'ignore' });
  } catch {
    // Non-critical if branch rename fails
  }
}

function initRepository(targetDir: string): void {
  try {
    runGit(['init', '-b', 'main', '-q'], { cwd: targetDir, stdio: 'ignore' });
  } catch {
    runGit(['init', '-q'], { cwd: targetDir, stdio: 'ignore' });
    renameBranchMain(targetDir);
  }
}

function commitWithFallbackIdentity(targetDir: string): void {
  const options = { cwd: targetDir, stdio: 'ignore' as const };
  try {
    runGit(['commit', '-q', '-m', INITIAL_COMMIT_MESSAGE], options);
  } catch {
    runGit(['commit', '-q', '-m', INITIAL_COMMIT_MESSAGE], {
      ...options,
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: 'aisensei[bot]',
        GIT_AUTHOR_EMAIL: 'bot@aisensei.internal',
        GIT_COMMITTER_NAME: 'aisensei[bot]',
        GIT_COMMITTER_EMAIL: 'bot@aisensei.internal'
      }
    });
  }
}

function initialCommit(targetDir: string): void {
  try {
    runGit(['add', '-A'], { cwd: targetDir, stdio: 'ignore' });
    commitWithFallbackIdentity(targetDir);
  } catch {
    // Non-critical if initial commit fails (e.g. empty dir)
  }
}

/**
 * Initializes a fresh git repository, sets default branch to main,
 * stages all scaffolded files, and creates an initial commit.
 *
 * @param targetDir - Path to scaffolded workspace directory
 * @param options - Initialization options
 * @returns True if git repository was successfully created and committed
 */
export function initGit(targetDir: string, options: InitGitOptions = {}): boolean {
  const { noGit = false, dryRun = false } = options;
  if (noGit) return false;
  const gitDir = path.join(targetDir, '.git');
  if (fs.existsSync(gitDir)) return false;
  if (isInsideGitWorkTree(targetDir)) return false;
  if (dryRun) return true;

  try {
    initRepository(targetDir);
    initialCommit(targetDir);
    return true;
  } catch {
    return false;
  }
}

/** Default Git repository initialization module exports. */
export default { isInsideGitWorkTree, initGit };
