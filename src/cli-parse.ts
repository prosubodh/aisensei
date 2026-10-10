/**
 * Command names supported by the aisensei CLI router.
 */
export type CliCommand = 'scaffold' | 'check' | 'dashboard' | 'quiz' | 'dag';

/**
 * Result structure produced by parseArgs containing command, options, and terminal actions.
 */
export interface CliParsedOptions {
  /** Selected subcommand */
  command: CliCommand;
  /** Explicit destination directory or null */
  targetDir: string | null;
  /** Seed topic for curriculum */
  topic?: string;
  /** Overwrite existing targets if true */
  force: boolean;
  /** Skip git initialization if true */
  noGit: boolean;
  /** Dry-run execution if true */
  dryRun: boolean;
  /** Silence output if true */
  silent: boolean;
  /** Terminal action flag (help, version, syntax error) or null */
  terminal: 'help' | 'version' | 'unknown-flag' | 'extra-arg' | null;
  /** Diagnostic error message if terminal action triggered */
  message?: string;
}

/**
 * Valid boolean flag keys configurable via command-line arguments.
 */
export type BooleanFlagKey = 'force' | 'noGit' | 'dryRun' | 'silent';

/**
 * Aliases for architectural validation check command.
 */
export const CHECK_COMMANDS: ReadonlySet<string> = new Set(['check', 'validate', 'verify', 'audit']);

/**
 * Aliases for learning telemetry dashboard command.
 */
export const DASHBOARD_COMMANDS: ReadonlySet<string> = new Set(['dashboard', 'dash', 'status', 'metrics']);

/**
 * Aliases for spontaneous active recall quiz command.
 */
export const QUIZ_COMMANDS: ReadonlySet<string> = new Set(['quiz', 'popquiz', 'test', 'recall']);

/**
 * Aliases for prerequisite dependency DAG inspect command.
 */
export const DAG_COMMANDS: ReadonlySet<string> = new Set(['dag', 'prerequisites', 'graph', 'tree']);

/**
 * Map of command-line flag strings to CliParsedOptions boolean property keys.
 */
export const BOOLEAN_FLAGS: ReadonlyMap<string, BooleanFlagKey> = new Map<string, BooleanFlagKey>([
  ['-f', 'force'],
  ['--force', 'force'],
  ['--no-git', 'noGit'],
  ['-d', 'dryRun'],
  ['--dry-run', 'dryRun'],
  ['-s', 'silent'],
  ['--silent', 'silent']
]);

/**
 * Table-driven parser for aisensei command-line arguments.
 *
 * @param argv - Argument array (typically process.argv.slice(2))
 * @returns Structured CliParsedOptions representation
 */
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
    } else {
      result.terminal = 'extra-arg';
      return result;
    }

    i++;
  }

  return result;
}

/** Default CLI parsing module exports. */
export default { parseArgs };
