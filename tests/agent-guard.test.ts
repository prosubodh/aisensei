import {
  inspectFileWrite,
  inspectCommand,
  inspectPreTool,
  parseEnvelope
} from '../src/agent-guard.js';

describe('Agent Guard & Pedagogical Invariants', () => {
  it('parses tool envelope JSON correctly and handles bad JSON', () => {
    const raw = JSON.stringify({
      tool_name: 'run_command',
      tool_input: { CommandLine: 'npm test' }
    });
    const parsed = parseEnvelope(raw);
    expect(parsed?.tool_name).toBe('run_command');
    expect(parsed?.tool_input?.CommandLine).toBe('npm test');

    expect(parseEnvelope('not json')).toBeNull();
    expect(parseEnvelope('{ bad json }')).toBeNull();
  });

  it('blocks finished code solution in exercises without TODO or tests', () => {
    const filePath = 'exercises/math/matrix.ts';
    const finishedSolution = `
      export function multiplyMatrix(a: number[][], b: number[][]): number[][] {
        // Full complete multiplication algorithm with no stubs
        const result: number[][] = [];
        for (let i = 0; i < a.length; i++) {
          result[i] = [];
          for (let j = 0; j < b[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < b.length; k++) {
              sum += a[i][k] * b[k][j];
            }
            result[i][j] = sum;
          }
        }
        return result;
      }
    `;

    const decision = inspectFileWrite(filePath, finishedSolution);
    expect(decision.allowed).toBe(false);
    expect(decision.source).toBe('spoonfeed');
  });

  it('allows exercise files with TODO stubs or test assertions or short length', () => {
    const filePath = 'exercises/math/matrix.ts';
    const stub = `
      export function multiplyMatrix(a: number[][], b: number[][]): number[][] {
        // TODO: Implement matrix multiplication
        throw new Error('not implemented');
      }
    `;
    expect(inspectFileWrite(filePath, stub).allowed).toBe(true);

    // Exercise test file is allowed even without TODO
    expect(inspectFileWrite('exercises/math.test.ts', 'export function testFoo() {}').allowed).toBe(true);

    // Short content (<= 300 chars) is allowed
    expect(inspectFileWrite(filePath, 'export const x = 1;').allowed).toBe(true);

    // Content without export function/class/const
    expect(inspectFileWrite(filePath, '// Just a long comment with no exports '.repeat(20)).allowed).toBe(true);
  });

  it('blocks curriculum updates with scores outside 0-10 or handles non-number/valid scores', () => {
    const filePath = '.tutor/curriculum.json';
    const badCurriculum = JSON.stringify({
      scores: {
        calculus: 15
      }
    });

    const decision = inspectFileWrite(filePath, badCurriculum);
    expect(decision.allowed).toBe(false);
    expect(decision.source).toBe('score');

    // Valid score
    const valid = inspectFileWrite(filePath, JSON.stringify({ scores: { calculus: 9 } }));
    expect(valid.allowed).toBe(true);

    // Non-number score in JSON passes through
    const nonNumber = inspectFileWrite(filePath, JSON.stringify({ scores: { calculus: 'pending' } }));
    expect(nonNumber.allowed).toBe(true);

    // Invalid JSON in curriculum write passes through to standard parser
    const invalidJsonDecision = inspectFileWrite(filePath, '{ invalid json');
    expect(invalidJsonDecision.allowed).toBe(true);
  });

  it('blocks destructive command deletions and allows safe commands', () => {
    const decision = inspectCommand('rm -rf .tutor');
    expect(decision.allowed).toBe(false);
    expect(decision.source).toBe('command');

    const safe = inspectCommand('npm test');
    expect(safe.allowed).toBe(true);
  });

  it('inspectPreTool passes through allowed tools and handles edge cases', () => {
    expect(inspectPreTool('').allowed).toBe(true);
    expect(inspectPreTool({}).allowed).toBe(true);
    expect(inspectPreTool({ tool_name: 'test' }).allowed).toBe(true);
    expect(inspectPreTool({ tool_name: 'unknown_tool', tool_input: {} }).allowed).toBe(true);

    const env = {
      tool_name: 'run_command',
      tool_input: { CommandLine: 'npm test' }
    };
    const decision = inspectPreTool(env);
    expect(decision.allowed).toBe(true);

    // run_command without CommandLine key (extractKey returns undefined)
    expect(inspectPreTool({ tool_name: 'run_command', tool_input: { unknown: 'test' } }).allowed).toBe(true);

    // write_to_file without TargetFile key (extractKey returns undefined)
    expect(inspectPreTool({ tool_name: 'write_to_file', tool_input: { unknown: 'test' } }).allowed).toBe(true);

    // create_file tool with file_path and content
    expect(
      inspectPreTool({
        tool_name: 'create_file',
        tool_input: { file_path: 'notes.txt', content: 'note content' }
      }).allowed
    ).toBe(true);
  });

  it('inspectPreTool intercepts write_to_file and replace_file_content with spoonfeed violation', () => {
    const envWrite = {
      tool_name: 'write_to_file',
      tool_input: {
        TargetFile: 'exercises/algo/binary_search.ts',
        CodeContent: `export function binarySearch(arr: number[], target: number): number {
          let left = 0;
          let right = arr.length - 1;
          while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if (arr[mid] === target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
          }
          return -1;
        }`
      }
    };
    const decWrite = inspectPreTool(envWrite);
    expect(decWrite.allowed).toBe(false);
    expect(decWrite.source).toBe('spoonfeed');

    const envReplace = {
      tool_name: 'replace_file_content',
      tool_input: {
        TargetFile: 'exercises/algo/binary_search.ts',
        ReplacementContent: `export function binarySearch(arr: number[], target: number): number {
          let left = 0;
          let right = arr.length - 1;
          while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if (arr[mid] === target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
          }
          return -1;
        }`
      }
    };
    const decReplace = inspectPreTool(envReplace);
    expect(decReplace.allowed).toBe(false);
    expect(decReplace.source).toBe('spoonfeed');
  });

  it('inspectPreTool intercepts destructive command tool', () => {
    const env = {
      tool_name: 'run_command',
      tool_input: { CommandLine: 'rm -rf .agents' }
    };
    const decision = inspectPreTool(env);
    expect(decision.allowed).toBe(false);
    expect(decision.source).toBe('command');
  });
});
