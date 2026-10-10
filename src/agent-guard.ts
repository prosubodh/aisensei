import path from 'node:path';

export interface GuardDecision {
  allowed: boolean;
  reason?: string;
  source?: 'spoonfeed' | 'prerequisite' | 'score' | 'command';
}

export interface ToolEnvelope {
  tool_name?: string;
  tool_input?: Record<string, unknown>;
}

export interface GuardOptions {
  workspaceRoot?: string;
  minMasteryThreshold?: number;
}

export function parseEnvelope(raw: string): ToolEnvelope | null {
  try {
    const trimmed = raw.trim();
    if (!trimmed.startsWith('{')) return null;
    return JSON.parse(trimmed) as ToolEnvelope;
  } catch {
    return null;
  }
}

function extractKey(input: Record<string, unknown>, keys: readonly string[]): string | undefined {
  for (const k of keys) {
    if (typeof input[k] === 'string') return input[k];
  }
  return undefined;
}

export function inspectFileWrite(filePath: string, content: string): GuardDecision {
  const normalized = filePath.replace(/\\/g, '/');

  // Anti-spoonfeeding guard on exercises
  if (normalized.includes('/exercises/') || normalized.startsWith('exercises/')) {
    // If agent writes a complete solution file without TODO or test assertions:
    const isExerciseTest = normalized.includes('.test.') || normalized.includes('_test.');
    const hasTodoOrStub =
      /TODO|throw new Error\(['"]not implemented['"]\)|pass|unimplemented!/i.test(content);
    const hasTestAssertions =
      /expect\(|assert|assertEquals|test\(|it\(/i.test(content);

    // If writing an implementation file with no stubs and no test framework:
    if (!isExerciseTest && !hasTodoOrStub && !hasTestAssertions && content.length > 300) {
      // Check if it looks like a dumped finished solution
      if (/export (function|class|const)/.test(content) && !/TODO/.test(content)) {
        return {
          allowed: false,
          reason:
            "Anti-Spoonfeeding Guard: AI tutor attempted to write a finished solution into exercises/ without student stubs or TODOs. Scaffold a starter template with failing tests instead.",
          source: 'spoonfeed'
        };
      }
    }
  }

  // Curriculum safety guard
  if (normalized.endsWith('curriculum.json') || normalized.includes('.tutor/curriculum.json')) {
    try {
      const data = JSON.parse(content);
      if (data.scores) {
        for (const [key, score] of Object.entries(data.scores)) {
          if (typeof score === 'number' && (score < 0 || score > 10)) {
            return {
              allowed: false,
              reason: `Pedagogical Guard: Score for '${key}' is ${score}. Scores must be on the strict 0-10 calibrated scale.`,
              source: 'score'
            };
          }
        }
      }
    } catch {
      // Invalid JSON will be caught by parser
    }
  }

  return { allowed: true };
}

export function inspectCommand(cmd: string): GuardDecision {
  const trimmed = cmd.trim();

  // Block destructive commands or test bypasses
  if (/\brm\s+-rf\s+(\/|~|\.tutor|\.agents)/.test(trimmed)) {
    return {
      allowed: false,
      reason: 'Safety Guard: Blocked destructive deletion of learning governance directories.',
      source: 'command'
    };
  }

  return { allowed: true };
}

export function inspectPreTool(envelope: ToolEnvelope | string): GuardDecision {
  const env: ToolEnvelope | null =
    typeof envelope === 'string' ? parseEnvelope(envelope) : envelope;
  if (!env || !env.tool_name || !env.tool_input) {
    return { allowed: true };
  }

  const name = env.tool_name.toLowerCase();
  const input = env.tool_input;

  if (name.includes('run_command') || name === 'bash' || name === 'terminal') {
    const cmd = extractKey(input, ['CommandLine', 'command', 'cmd']);
    if (cmd) {
      return inspectCommand(cmd);
    }
  }

  if (
    name.includes('write_to_file') ||
    name.includes('replace_file_content') ||
    name.includes('create_file')
  ) {
    const filePath = extractKey(input, ['TargetFile', 'file_path', 'path', 'filePath']);
    const content =
      typeof input.CodeContent === 'string'
        ? input.CodeContent
        : typeof input.content === 'string'
          ? input.content
          : typeof input.ReplacementContent === 'string'
            ? input.ReplacementContent
            : '';

    if (filePath) {
      return inspectFileWrite(filePath, content);
    }
  }

  return { allowed: true };
}

export default {
  inspectFileWrite,
  inspectCommand,
  inspectPreTool,
  parseEnvelope
};
