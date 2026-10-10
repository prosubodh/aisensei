import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { validate, createSilentReporter, createConsoleReporter } from '../src/validate.js';

describe('Validation Engine', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aisensei-val-test-'));
  });

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('validates workspace successfully with 0 errors', () => {
    const reporter = createSilentReporter();
    const result = validate(process.cwd(), reporter);

    expect(result.errors).toBe(0);
    expect(result.validatedRules).toBeGreaterThanOrEqual(10);
    expect(result.validatedSkills).toBeGreaterThanOrEqual(1);
  });

  it('runs with console reporter without crashing', () => {
    const reporter = createConsoleReporter();
    const result = validate(process.cwd(), reporter);
    expect(typeof result.errors).toBe('number');
  });

  it('runs with default arguments (workspaceRoot and reporter)', () => {
    const result = validate();
    expect(result.errors).toBe(0);
  });

  it('reports missing AGENTS.md, harnesses, rules, skills, memory, and curriculum', () => {
    const reporter = createSilentReporter();
    // In empty tmpDir: missing AGENTS.md, docs/rules, memory.md
    const result = validate(tmpDir, reporter);
    expect(result.errors).toBeGreaterThan(0);
    expect(result.warnings).toBeGreaterThan(0);
  });

  it('reports warning when docs/rules has fewer than 10 rules', () => {
    const reporter = createSilentReporter();
    fs.writeFileSync(path.join(tmpDir, 'AGENTS.md'), '# Agents');
    const rulesDir = path.join(tmpDir, 'docs', 'rules');
    fs.mkdirSync(rulesDir, { recursive: true });
    fs.writeFileSync(path.join(rulesDir, 'rule1.md'), '# Rule 1');

    const result = validate(tmpDir, reporter);
    expect(result.validatedRules).toBe(1);
  });

  it('reports warning when skill directory is missing SKILL.md', () => {
    const reporter = createSilentReporter();
    const skillsDir = path.join(tmpDir, '.agents', 'skills', 'empty-skill');
    fs.mkdirSync(skillsDir, { recursive: true });

    const result = validate(tmpDir, reporter);
    expect(result.warnings).toBeGreaterThan(0);
  });

  it('reports warning when memory.md is missing H1 header', () => {
    const reporter = createSilentReporter();
    fs.writeFileSync(path.join(tmpDir, 'memory.md'), 'no header here');

    const result = validate(tmpDir, reporter);
    expect(result.warnings).toBeGreaterThan(0);
  });

  it('detects invalid curriculum JSON, out-of-bound scores, and cycles', () => {
    const reporter = createSilentReporter();
    const tutorDir = path.join(tmpDir, '.tutor');
    fs.mkdirSync(tutorDir, { recursive: true });

    // Invalid JSON
    fs.writeFileSync(path.join(tutorDir, 'curriculum.json'), '{ broken');
    let res = validate(tmpDir, reporter);
    expect(res.errors).toBeGreaterThan(0);

    // Invalid score
    fs.writeFileSync(
      path.join(tutorDir, 'curriculum.json'),
      JSON.stringify({
        scores: { test_concept: 15 },
        prerequisites: [
          { name: 'A', prerequisites: ['B'] },
          { name: 'B', prerequisites: ['A'] }
        ]
      })
    );
    res = validate(tmpDir, reporter);
    expect(res.errors).toBeGreaterThan(0);
  });
});
