import cp from 'node:child_process';
import { ScaffoldError, ERROR_CODES } from './errors.js';

/**
 * Strict allowlist of git subcommands permitted to execute through the aisensei runner.
 */
export const GIT_ALLOWED_SUBCOMMANDS: Set<string> = new Set([
  'rev-parse',
  'init',
  'branch',
  'add',
  'commit',
  'status',
  'log'
]);

/**
 * Executes a git command with strict subcommand allowlisting and non-shell safety.
 *
 * @param args - Command line arguments passed to git (e.g. `['status', '--porcelain']`)
 * @param options - Additional child_process execution options
 * @returns Standard output from the git invocation as a string
 * @throws {ScaffoldError} When args are invalid or subcommand is not in GIT_ALLOWED_SUBCOMMANDS
 */
export function runGit(args: string[], options: cp.ExecFileSyncOptions = {}): string {
  if (!Array.isArray(args) || args.length === 0) {
    throw new ScaffoldError('E_GIT_ARGS_INVALID', ERROR_CODES.GIT_ARGS_INVALID);
  }
  const subcommand = args[0];
  if (!subcommand || !GIT_ALLOWED_SUBCOMMANDS.has(subcommand)) {
    throw new ScaffoldError('E_GIT_BLOCKED', `${ERROR_CODES.GIT_BLOCKED}: ${String(subcommand)}`);
  }
  return cp.execFileSync('git', args, {
    encoding: 'utf-8',
    stdio: 'pipe',
    shell: false,
    ...options
  }) as string;
}

/** Default Git execution module exports. */
export default { GIT_ALLOWED_SUBCOMMANDS, runGit };
