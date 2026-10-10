/**
 * @module @aisensei/aisensei
 * Pedagogical governance toolkit and deep learning workspace for AI-assisted mastery.
 */

export type { ScaffoldErrorCode, ScaffoldErrorShape } from './errors.js';
export { ScaffoldError, ERROR_CODES } from './errors.js';

export {
  scaffold,
  validateTarget,
  copyTemplateItem,
  TEMPLATE_ITEMS,
  getTemplateDir
} from './scaffold.js';
export type {
  ScaffoldOptions,
  ScaffoldResult,
  ValidateTargetOptions
} from './scaffold.js';

export {
  validate,
  createConsoleReporter,
  createSilentReporter
} from './validate.js';
export type { ValidationResult, ValidationReporter } from './validate.js';

export {
  detectPrerequisiteCycles,
  topologicalSort,
  evaluateGraphMastery,
  calculateRetention
} from './dag.js';
export type {
  ConceptNode,
  ConceptGraph,
  MasteryEvaluation,
  RetentionStatus
} from './dag.js';

export {
  inspectFileWrite,
  inspectCommand,
  inspectPreTool,
  parseEnvelope
} from './agent-guard.js';
export type {
  GuardDecision,
  ToolEnvelope,
  GuardOptions
} from './agent-guard.js';

export {
  renderTerminalDashboard,
  generateHtmlDashboard,
  loadCurriculum,
  renderProgressBar,
  renderScoreGauge
} from './dashboard.js';
export type { CurriculumData } from './dashboard.js';

export {
  assertInside,
  isProtectedTarget,
  normalizeForComparison
} from './guards.js';
export type { ProtectedTargetOptions } from './guards.js';

export {
  ensureSymlink,
  ensureSymlinkOrPointer,
  isSameCaseInsensitiveFile
} from './links.js';
export type { EnsureSymlinkOptions } from './links.js';

export { runGit, GIT_ALLOWED_SUBCOMMANDS } from './git.js';
export { isInsideGitWorkTree, initGit } from './repo.js';
export type { InitGitOptions } from './repo.js';

import scaffoldModule from './scaffold.js';
export default scaffoldModule;
