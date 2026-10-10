import fs from 'node:fs';
import path from 'node:path';
import { ScaffoldError, ERROR_CODES } from './errors.js';
import { assertInside, isProtectedTarget, getTemplateDir } from './guards.js';
import { ensureSymlink } from './links.js';
import { initGit } from './repo.js';

export { getTemplateDir };

/**
 * Canonical list of core pedagogical template files and directories.
 */
export const TEMPLATE_ITEMS: readonly string[] = [
  'AGENTS.md',
  'memory.md',
  'README.md',
  'docs',
  '.agents',
  '.tutor',
  'exercises',
  'notes',
  'projects',
  'scripts',
  '.gitignore',
  '.editorconfig',
  'LICENSE'
];

/**
 * Options configuring workspace scaffolding.
 */
export interface ScaffoldOptions {
  /** Target directory path where the workspace will be created */
  targetDir?: string;
  /** Initial learning topic to seed into .tutor/curriculum.json */
  topic?: string;
  /** Overwrite non-empty targets if true */
  force?: boolean;
  /** Skip git repository initialization if true */
  noGit?: boolean;
  /** Explicit path to aisensei template root */
  templateDir?: string;
  /** Simulate file operations without writing to disk if true */
  dryRun?: boolean;
  /** Suppress terminal console logging if true */
  silent?: boolean;
}

/**
 * Result report from executing a scaffolding operation.
 */
export interface ScaffoldResult {
  /** True if scaffolding completed without fatal errors */
  success: boolean;
  /** Absolute path of the scaffolded directory */
  targetDir: string;
  /** True if git repository was initialized and committed */
  gitInitialized: boolean;
  /** True if run in dry-run simulation mode */
  dryRun: boolean;
  /** List of recorded file and directory actions */
  actions: string[];
}

/**
 * Options for validating target directory safety and emptiness.
 */
export interface ValidateTargetOptions {
  /** Template directory against which target is validated */
  templateDir?: string;
  /** If true, allow non-empty target directories */
  force?: boolean;
  /** If true, skip directory emptiness checks */
  dryRun?: boolean;
  /** If true, allow scaffolding into system-protected directories */
  allowProtected?: boolean;
}

/**
 * Validates that candidate target directory is safe, writable, and not system-protected.
 *
 * @param targetDir - Candidate destination directory
 * @param options - Validation settings
 * @throws {ScaffoldError} When target is a template root, protected directory, or non-empty
 */
export function validateTarget(
  targetDir: string,
  options: ValidateTargetOptions = {}
): void {
  const {
    templateDir = getTemplateDir(),
    force = false,
    dryRun = false,
    allowProtected = false
  } = options;

  const resolvedTarget = path.resolve(targetDir);
  const resolvedTemplate = path.resolve(templateDir);

  if (resolvedTarget.toLowerCase() === resolvedTemplate.toLowerCase()) {
    throw new ScaffoldError(
      'E_TARGET_IS_TEMPLATE',
      `${ERROR_CODES.TARGET_IS_TEMPLATE}: Target directory is identical to aisensei template root.`,
      targetDir
    );
  }

  if (!allowProtected && isProtectedTarget(resolvedTarget, resolvedTemplate)) {
    throw new ScaffoldError(
      'E_TARGET_IS_PROTECTED',
      `${ERROR_CODES.TARGET_IS_PROTECTED}: Target '${targetDir}' is a protected directory.`,
      targetDir
    );
  }

  if (!force && !dryRun && fs.existsSync(resolvedTarget)) {
    const entries = fs.readdirSync(resolvedTarget).filter((e) => e !== '.git');
    if (entries.length > 0) {
      throw new ScaffoldError(
        'E_TARGET_NOT_EMPTY',
        `${ERROR_CODES.TARGET_NOT_EMPTY}: Target directory '${targetDir}' is not empty. Use --force to proceed.`,
        targetDir
      );
    }
  }
}

/**
 * Recursively copies a file or directory tree from source to destination.
 *
 * @param src - Source file or directory path
 * @param dest - Destination file or directory path
 * @param dryRun - When true, records actions without touching the disk
 * @param actions - Audit list tracking file operations
 */
export function copyTemplateItem(
  src: string,
  dest: string,
  dryRun: boolean,
  actions: string[]
): void {
  if (!fs.existsSync(src)) return;

  const stat = fs.lstatSync(src);
  if (stat.isDirectory()) {
    if (!dryRun) fs.mkdirSync(dest, { recursive: true });
    actions.push(`mkdir ${dest}`);
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      copyTemplateItem(path.join(src, entry), path.join(dest, entry), dryRun, actions);
    }
  } else {
    const parent = path.dirname(dest);
    if (!dryRun) {
      fs.mkdirSync(parent, { recursive: true });
      fs.copyFileSync(src, dest);
    }
    actions.push(`copy ${dest}`);
  }
}

/**
 * Scaffolds an aisensei deep-learning workspace with pedagogical governance rules,
 * multi-agent harness aliases, prerequisite DAG, and exercises sandbox.
 *
 * @param options - Scaffolding configuration settings
 * @returns ScaffoldResult summarizing created assets and git status
 */
export function scaffold(options: ScaffoldOptions = {}): ScaffoldResult {
  const targetDir = path.resolve(options.targetDir || process.cwd());
  const templateDir = path.resolve(options.templateDir || getTemplateDir());
  const dryRun = Boolean(options.dryRun);
  const actions: string[] = [];

  validateTarget(targetDir, {
    templateDir,
    force: options.force,
    dryRun
  });

  if (!dryRun) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  actions.push(`target ${targetDir}`);

  // Copy template items
  for (const item of TEMPLATE_ITEMS) {
    const src = path.join(templateDir, item);
    const dest = path.join(targetDir, item);
    assertInside(targetDir, dest);
    copyTemplateItem(src, dest, dryRun, actions);
  }

  // Ensure harness symlinks
  const symlinks = [
    { link: 'CLAUDE.md', target: 'AGENTS.md' },
    { link: 'GEMINI.md', target: 'AGENTS.md' },
    { link: '.cursorrules', target: 'AGENTS.md' },
    { link: '.windsurfrules', target: 'AGENTS.md' }
  ];

  for (const { link, target } of symlinks) {
    if (!dryRun) {
      ensureSymlink({ targetDir, linkName: link, targetFileName: target });
    }
    actions.push(`link ${link} -> ${target}`);
  }

  // If topic provided, seed curriculum
  if (options.topic && !dryRun) {
    const curriculumFile = path.join(targetDir, '.tutor', 'curriculum.json');
    if (fs.existsSync(curriculumFile)) {
      try {
        const curr = JSON.parse(fs.readFileSync(curriculumFile, 'utf-8'));
        curr.activeTopic = options.topic;
        fs.writeFileSync(curriculumFile, JSON.stringify(curr, null, 2), 'utf-8');
        actions.push(`seed topic: ${options.topic}`);
      } catch {
        // Fallback
      }
    }
  }

  // Git init
  let gitInitialized = false;
  if (!options.noGit && !dryRun) {
    gitInitialized = initGit(targetDir);
    if (gitInitialized) actions.push('git init');
  }

  return {
    success: true,
    targetDir,
    gitInitialized,
    dryRun,
    actions
  };
}

/** Default scaffold module exports. */
export default { scaffold, validateTarget, TEMPLATE_ITEMS, getTemplateDir };
