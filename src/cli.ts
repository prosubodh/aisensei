import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { scaffold } from './scaffold.js';
import { validate, createSilentReporter } from './validate.js';
import { parseArgs } from './cli-parse.js';
import { resolveTargetDir } from './cli-target.js';
import { renderTerminalDashboard, generateHtmlDashboard, loadCurriculum } from './dashboard.js';
import { detectPrerequisiteCycles, topologicalSort } from './dag.js';
import type { ConceptGraph } from './dag.js';

interface PackageJsonShape {
  version: string;
}

const pkg: PackageJsonShape = JSON.parse(
  fs.readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'package.json'),
    'utf-8'
  )
);

/**
 * Prints the aisensei CLI help banner, command list, options, and usage examples.
 * @param out Output sink function, defaults to `console.log`.
 */
export function printHelp(out: (msg: string) => void = console.log): void {
  out(`
🥋 aisensei v${pkg.version}
Pedagogical Governance Toolkit & Deep Learning Workspace for AI-Assisted Mastery

Usage:
  npx aisensei [directory] [options]
  npx aisensei check [directory]
  npx aisensei dashboard [directory]
  npx aisensei dag [directory]
  npx aisensei quiz [directory]

Commands:
  [directory]            Scaffold in-depth learning workspace into directory (default: current directory)
  check [directory]      Validate pedagogical architecture and invariants (alias: validate, verify)
  dashboard [directory]  Display visual learning telemetry and generate HTML dashboard (alias: dash)
  dag [directory]        Inspect prerequisite dependency graph and detect cycles (alias: prerequisites)
  quiz [directory]       Generate active recall pop-quiz prompt based on learned concepts (alias: popquiz)

Options:
  --topic <name>  Specify active topic to initialize (e.g. "Rust Systems", "Linear Algebra")
  -d, --dry-run   Simulate scaffolding without modifying filesystem
  -s, --silent    Suppress console output messages
  -f, --force     Overwrite existing files in target directory without confirmation
  --no-git        Do not initialize a git repository
  -v, --version   Display version number
  -h, --help      Display this help message

Examples:
  npx aisensei my-rust-course --topic "Rust Systems Programming"
  npx aisensei check
  npx aisensei dashboard
  npx aisensei dag
  npx aisensei quiz
`);
}

/**
 * Prints the currently installed aisensei package version.
 * @param out Output sink function, defaults to `console.log`.
 */
export function printVersion(out: (msg: string) => void = console.log): void {
  out(pkg.version);
}

/**
 * Executes the aisensei CLI command dispatcher with parsed command-line arguments.
 * Supports scaffolding, check/validation, terminal/HTML dashboards, DAG inspection, and active recall quizzes.
 * @param argv Command-line argument vector (defaults to `process.argv.slice(2)`).
 * @returns Exit code (0 for success, 1 for error).
 */
export async function runCli(argv: string[] = process.argv.slice(2)): Promise<number> {
  const parsed = parseArgs(argv);

  if (parsed.terminal === 'help') {
    printHelp();
    return 0;
  }

  if (parsed.terminal === 'version') {
    printVersion();
    return 0;
  }

  if (parsed.terminal === 'unknown-flag' || parsed.terminal === 'extra-arg') {
    console.error(`🚨 Error: ${parsed.message || 'Invalid command syntax'}`);
    printHelp(console.error);
    return 1;
  }

  const targetDir = resolveTargetDir(parsed.targetDir);

  if (parsed.command === 'check') {
    const res = validate(targetDir);
    return res.errors > 0 ? 1 : 0;
  }

  if (parsed.command === 'dashboard') {
    const term = renderTerminalDashboard(targetDir);
    console.log(term);
    const htmlPath = generateHtmlDashboard(targetDir);
    if (!parsed.silent) {
      console.log(`\n🌐 HTML Dashboard updated: file://${htmlPath.replace(/\\/g, '/')}`);
    }
    return 0;
  }

  if (parsed.command === 'dag') {
    const curr = loadCurriculum(targetDir);
    if (!curr || !curr.prerequisites || curr.prerequisites.length === 0) {
      console.log('ℹ️  No prerequisite DAG found in curriculum.json.');
      return 0;
    }
    const graph: ConceptGraph = {};
    for (const p of curr.prerequisites) {
      graph[p.name] = { id: p.name, name: p.name, prerequisites: (p as any).prerequisites || [] };
    }
    const cycle = detectPrerequisiteCycles(graph);
    if (cycle) {
      console.error(`🚨 Prerequisite DAG Cycle Detected: ${cycle.join(' -> ')}`);
      return 1;
    }
    const order = topologicalSort(graph);
    console.log('🌳 Prerequisite Learning Order (Topological Sort):');
    order.forEach((id, idx) => console.log(`  ${idx + 1}. ${id}`));
    return 0;
  }

  if (parsed.command === 'quiz') {
    const curr = loadCurriculum(targetDir);
    const concepts = curr?.scores ? Object.keys(curr.scores) : [];
    if (concepts.length === 0) {
      console.log('ℹ️  No assessed concepts yet in curriculum. Complete a topic to trigger pop-quizzes.');
      return 0;
    }
    const randomConcept = concepts[Math.floor(Math.random() * concepts.length)];
    console.log('==============================================================');
    console.log(' 🎲 AISENSEI ACTIVE RECALL POP-QUIZ');
    console.log('==============================================================');
    console.log(` Target Concept: ${randomConcept}`);
    console.log(' Instruction for AI Tutor:');
    console.log(` "Conduct an unexpected 1-question active recall diagnostic on ${randomConcept}."`);
    console.log('==============================================================');
    return 0;
  }

  // Default: Scaffold
  try {
    const result = scaffold({
      targetDir,
      topic: parsed.topic,
      force: parsed.force,
      noGit: parsed.noGit,
      dryRun: parsed.dryRun,
      silent: parsed.silent
    });

    if (!parsed.silent) {
      console.log(`🎉 SUCCESS: Scaffolding completed in ${result.targetDir}!`);
      if (result.gitInitialized) {
        console.log('📦 Git repository initialized.');
      }
      console.log('\nNext steps:');
      console.log(`  1. cd ${path.relative(process.cwd(), result.targetDir) || '.'}`);
      console.log('  2. Open with your AI coding assistant (Antigravity, Claude, Cursor, Windsurf)');
      console.log('  3. Run navigation commands: `dashboard`, `summary`, `what\'s next`');
    }
    return 0;
  } catch (err: any) {
    console.error(`🚨 Scaffold Error: ${err.message || String(err)}`);
    return 1;
  }
}

/**
 * Main command-line entrypoint invoking runCli and exiting the process with the returned status code.
 */
export async function main(): Promise<void> {
  try {
    const code = await runCli(process.argv.slice(2));
    process.exit(code);
  } catch (err: any) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

/** Default CLI module exports. */
export default { runCli, main, printHelp, printVersion };
