import cp from 'node:child_process';
import { ScaffoldError, ERROR_CODES } from './errors.js';

export const GIT_ALLOWED_SUBCOMMANDS = new Set([
  'rev-parse',
  'init',
  'branch',
  'add',
  'commit',
  'status',
  'log'
]);

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

export default { GIT_ALLOWED_SUBCOMMANDS, runGit };
