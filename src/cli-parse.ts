export type CliCommand = 'scaffold' | 'check' | 'dashboard' | 'quiz' | 'dag';

export interface CliParsedOptions {
  command: CliCommand;
  targetDir: string | null;
  topic?: string;
  force: boolean;
  noGit: boolean;
  dryRun: boolean;
  silent: boolean;
  terminal: 'help' | 'version' | 'unknown-flag' | 'extra-arg' | null;
  message?: string;
}

export type BooleanFlagKey = 'force' | 'noGit' | 'dryRun' | 'silent';

export const CHECK_COMMANDS = new Set(['check', 'validate', 'verify', 'audit']);
export const DASHBOARD_COMMANDS = new Set(['dashboard', 'dash', 'status', 'metrics']);
export const QUIZ_COMMANDS = new Set(['quiz', 'popquiz', 'test', 'recall']);
export const DAG_COMMANDS = new Set(['dag', 'prerequisites', 'graph', 'tree']);

export const BOOLEAN_FLAGS = new Map<string, BooleanFlagKey>([
  ['-f', 'force'],
  ['--force', 'force'],
  ['--no-git', 'noGit'],
  ['-d', 'dryRun'],
  ['--dry-run', 'dryRun'],
  ['-s', 'silent'],
  ['--silent', 'silent']
]);

export function parseArgs(argv: string[]): CliParsedOptions {
  const result: CliParsedOptions = {
    command: 'scaffold',
    targetDir: null,
    force: false,
    noGit: false,
    dryRun: false,
    silent: false,
    terminal: null
  };

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i]!;

    if (arg === '-h' || arg === '--help') {
      result.terminal = 'help';
      return result;
    }
    if (arg === '-v' || arg === '--version') {
      result.terminal = 'version';
      return result;
    }

    if (arg === '--topic') {
      i++;
      if (i < argv.length) {
        result.topic = argv[i];
      }
      i++;
      continue;
    }

    if (BOOLEAN_FLAGS.has(arg)) {
      const key = BOOLEAN_FLAGS.get(arg)!;
      result[key] = true;
      i++;
      continue;
    }

    if (arg.startsWith('-')) {
      result.terminal = 'unknown-flag';
      result.message = `Unknown flag: ${arg}`;
      return result;
    }

    // Commands or Target
    if (CHECK_COMMANDS.has(arg.toLowerCase())) {
      result.command = 'check';
    } else if (DASHBOARD_COMMANDS.has(arg.toLowerCase())) {
      result.command = 'dashboard';
    } else if (QUIZ_COMMANDS.has(arg.toLowerCase())) {
      result.command = 'quiz';
    } else if (DAG_COMMANDS.has(arg.toLowerCase())) {
      result.command = 'dag';
    } else if (!result.targetDir) {
      result.targetDir = arg;
    } else if (!result.topic) {
      // If targetDir is already set, second positional can be topic
      result.topic = arg;
    }

    i++;
  }

  return result;
}

export default { parseArgs };
