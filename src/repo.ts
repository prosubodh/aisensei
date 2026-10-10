import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { runGit } from './git.js';

const INITIAL_COMMIT_MESSAGE = 'chore: initial scaffold from aisensei template';

export interface InitGitOptions {
  noGit?: boolean;
  dryRun?: boolean;
}

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

export function initGit(targetDir: string, options: InitGitOptions = {}): boolean {
  const { noGit = false, dryRun = false } = options;
  if (noGit || dryRun) return false;
  const gitDir = path.join(targetDir, '.git');
  if (fs.existsSync(gitDir)) return false;
  if (isInsideGitWorkTree(targetDir)) return false;

  try {
    initRepository(targetDir);
    initialCommit(targetDir);
    return true;
  } catch {
    return false;
  }
}

export default { isInsideGitWorkTree, initGit };
