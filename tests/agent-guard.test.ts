import {
  inspectFileWrite,
  inspectCommand,
  inspectPreTool,
  parseEnvelope
} from '../src/agent-guard.js';

describe('Agent Guard & Pedagogical Invariants', () => {
  it('parses tool envelope JSON correctly', () => {
    const raw = JSON.stringify({
      tool_name: 'run_command',
      tool_input: { CommandLine: 'npm test' }
    });
    const parsed = parseEnvelope(raw);
    expect(parsed?.tool_name).toBe('run_command');
    expect(parsed?.tool_input?.CommandLine).toBe('npm test');
  });

  it('returns null for non-JSON envelope', () => {
    expect(parseEnvelope('not json')).toBeNull();
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

  it('allows exercise files with TODO stubs or test assertions', () => {
    const filePath = 'exercises/math/matrix.ts';
    const stub = `
      export function multiplyMatrix(a: number[][], b: number[][]): number[][] {
        // TODO: Implement matrix multiplication
        throw new Error('not implemented');
      }
    `;

    const decision = inspectFileWrite(filePath, stub);
    expect(decision.allowed).toBe(true);
  });

  it('blocks curriculum updates with scores outside 0-10', () => {
    const filePath = '.tutor/curriculum.json';
    const badCurriculum = JSON.stringify({
      scores: {
        calculus: 15
      }
    });

    const decision = inspectFileWrite(filePath, badCurriculum);
    expect(decision.allowed).toBe(false);
    expect(decision.source).toBe('score');
  });

  it('blocks destructive command deletions', () => {
    const decision = inspectCommand('rm -rf .tutor');
    expect(decision.allowed).toBe(false);
    expect(decision.source).toBe('command');
  });

  it('inspectPreTool passes through allowed tools', () => {
    const env = {
      tool_name: 'run_command',
      tool_input: { CommandLine: 'npm test' }
    };
    const decision = inspectPreTool(env);
    expect(decision.allowed).toBe(true);
  });

  it('inspectPreTool intercepts write_to_file with spoonfeed violation', () => {
    const env = {
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
    const decision = inspectPreTool(env);
    expect(decision.allowed).toBe(false);
    expect(decision.source).toBe('spoonfeed');
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
