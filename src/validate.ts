import fs from 'node:fs';
import path from 'node:path';
import { detectPrerequisiteCycles } from './dag.js';
import type { ConceptGraph } from './dag.js';

/**
 * Aggregate metrics and error counts from architectural validation.
 */
export interface ValidationResult {
  /** Count of critical pedagogical invariant errors */
  errors: number;
  /** Count of non-fatal warnings */
  warnings: number;
  /** Count of validated progressive disclosure rules */
  validatedRules: number;
  /** Count of validated specialized mentorship skills */
  validatedSkills: number;
  /** Total count of checked links and references */
  totalLinks: number;
  /** List of broken file paths or markdown links */
  brokenLinks: string[];
}

/**
 * Interface for reporting validation progress and diagnostic messages.
 */
export interface ValidationReporter {
  /** Report a successful invariant check */
  pass: (msg: string) => void;
  /** Report a non-fatal warning */
  warn: (msg: string) => void;
  /** Report an invariant failure */
  fail: (msg: string) => void;
  /** General informational log message */
  log: (msg: string) => void;
  /** Section heading message */
  heading: (msg: string) => void;
}

/**
 * Creates an interactive console reporter that writes formatted emoji badges to standard output.
 *
 * @returns ValidationReporter instance writing to console.log
 */
export function createConsoleReporter(): ValidationReporter {
  return {
    pass: (msg: string) => console.log(`  ✅ PASS: ${msg}`),
    warn: (msg: string) => console.log(`  ⚠️  WARN: ${msg}`),
    fail: (msg: string) => console.log(`  ❌ FAIL: ${msg}`),
    log: (msg: string) => console.log(msg),
    heading: (msg: string) => console.log(`\n📌 ${msg}`)
  };
}

/**
 * Creates a silent reporter that suppresses all console output during testing or programmatic runs.
 *
 * @returns No-op ValidationReporter
 */
export function createSilentReporter(): ValidationReporter {
  const noop = (): void => {};
  return { pass: noop, warn: noop, fail: noop, log: noop, heading: noop };
}

/**
 * Validates the 5 pedagogical and architectural invariants of an aisensei workspace:
 * 1. Root configuration & harness aliases (AGENTS.md, CLAUDE.md, etc.)
 * 2. Progressive disclosure rules in docs/rules/
 * 3. Mentorship skills in .agents/skills/
 * 4. Learning Mastery Ledger in memory.md
 * 5. Curriculum prerequisite DAG in .tutor/curriculum.json
 *
 * @param workspaceRoot - Absolute path to workspace root
 * @param reporter - Progress reporter
 * @returns ValidationResult with error and warning totals
 */
export function validate(
  workspaceRoot: string = process.cwd(),
  reporter: ValidationReporter = createConsoleReporter()
): ValidationResult {
  let errors = 0;
  let warnings = 0;
  let validatedRules = 0;
  let validatedSkills = 0;
  let totalLinks = 0;
  const brokenLinks: string[] = [];

  const pass = (msg: string): void => reporter.pass(msg);
  const warn = (msg: string): void => {
    warnings += 1;
    reporter.warn(msg);
  };
  const fail = (msg: string): void => {
    errors += 1;
    reporter.fail(msg);
  };

  reporter.log(`🔍 Validating aisensei Pedagogical Architecture in: ${workspaceRoot}`);
  reporter.log('--------------------------------------------------------------');

  // 1. Root Config & Harness Parity
  reporter.heading('1. Root Configuration & Multi-Agent Harness Parity');
  const agentsFile = path.join(workspaceRoot, 'AGENTS.md');
  if (!fs.existsSync(agentsFile)) {
    fail('Missing root AGENTS.md');
  } else {
    pass('AGENTS.md exists and is readable.');
  }

  const harnesses = ['CLAUDE.md', 'GEMINI.md', '.cursorrules', '.windsurfrules'];
  for (const h of harnesses) {
    const p = path.join(workspaceRoot, h);
    if (!fs.existsSync(p)) {
      warn(`Agent harness alias '${h}' is missing.`);
    } else {
      pass(`Agent harness '${h}' verified.`);
    }
  }

  // 2. Progressive Disclosure Rules (docs/rules)
  reporter.heading('2. Progressive Disclosure Pedagogical Rules');
  const rulesDir = path.join(workspaceRoot, 'docs', 'rules');
  if (fs.existsSync(rulesDir)) {
    const rules = fs.readdirSync(rulesDir).filter((f) => f.endsWith('.md'));
    validatedRules = rules.length;
    if (rules.length >= 10) {
      pass(`Found ${rules.length} pedagogical rules in docs/rules/.`);
    } else {
      warn(`Only ${rules.length} rules found in docs/rules/ (recommend >= 10).`);
    }
  } else {
    fail('Missing docs/rules/ directory.');
  }

  // 3. Mentorship Skills (.agents/skills or .agent/skills)
  reporter.heading('3. Specialized Mentorship Skills');
  const skillsDirA = path.join(workspaceRoot, '.agents', 'skills');
  const skillsDirB = path.join(workspaceRoot, '.agent', 'skills');
  const skillsDir = fs.existsSync(skillsDirA) ? skillsDirA : skillsDirB;

  if (fs.existsSync(skillsDir)) {
    const skills = fs
      .readdirSync(skillsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    validatedSkills = skills.length;
    for (const skill of skills) {
      const skillMd = path.join(skillsDir, skill, 'SKILL.md');
      if (fs.existsSync(skillMd)) {
        pass(`Skill verified: ${skill}`);
      } else {
        warn(`Skill directory '${skill}' is missing SKILL.md`);
      }
    }
  } else {
    warn('No skills directory found at .agents/skills/ or .agent/skills/');
  }

  // 4. Memory & Learning Mastery Ledger (memory.md)
  reporter.heading('4. Memory & Learning Mastery Records (LMR)');
  const memoryFile = path.join(workspaceRoot, 'memory.md');
  if (fs.existsSync(memoryFile)) {
    const memContent = fs.readFileSync(memoryFile, 'utf-8');
    if (/^# /m.test(memContent)) {
      pass('memory.md header and ledger format verified.');
    } else {
      warn('memory.md missing top-level H1 header.');
    }
  } else {
    fail('Missing memory.md Learning Mastery Ledger.');
  }

  // 5. Curriculum Integrity & DAG Cycle Detection (.tutor/curriculum.json)
  reporter.heading('5. Curriculum Integrity & Prerequisite DAG');
  const currFile = path.join(workspaceRoot, '.tutor', 'curriculum.json');
  if (fs.existsSync(currFile)) {
    try {
      const curr = JSON.parse(fs.readFileSync(currFile, 'utf-8'));
      pass(`Active topic: ${curr.activeTopic || 'Unspecified'}`);

      // Check scores
      if (curr.scores) {
        let invalidScore = false;
        for (const [key, sc] of Object.entries(curr.scores)) {
          if (typeof sc !== 'number' || sc < 0 || sc > 10) {
            fail(`Invalid score for ${key}: ${sc} (must be 0-10)`);
            invalidScore = true;
          }
        }
        if (!invalidScore) {
          pass('All calibrated scores adhere to 0-10 bounds.');
        }
      }

      // Check prerequisite DAG if nodes present
      if (curr.prerequisites && Array.isArray(curr.prerequisites)) {
        const graph: ConceptGraph = {};
        for (const p of curr.prerequisites) {
          if (p.name) {
            graph[p.name] = {
              id: p.name,
              name: p.name,
              prerequisites: p.prerequisites || []
            };
          }
        }
        const cycle = detectPrerequisiteCycles(graph);
        if (cycle) {
          fail(`Prerequisite cycle detected: ${cycle.join(' -> ')}`);
        } else {
          pass('Prerequisite dependency graph is strictly acyclic (DAG verified).');
        }
      }
    } catch {
      fail('.tutor/curriculum.json contains invalid JSON.');
    }
  } else {
    warn('No .tutor/curriculum.json found.');
  }

  reporter.log('');
  reporter.log('--------------------------------------------------------------');
  if (errors === 0) {
    reporter.log(`🎉 SUCCESS: All pedagogical invariants are healthy! (${warnings} warnings)`);
  } else {
    reporter.log(`🚨 FAILURE: Detected ${errors} error(s) and ${warnings} warning(s).`);
  }

  return {
    errors,
    warnings,
    validatedRules,
    validatedSkills,
    totalLinks,
    brokenLinks
  };
}

/** Default pedagogical validation engine module exports. */
export default { validate, createConsoleReporter, createSilentReporter };
