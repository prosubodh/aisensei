import fs from 'node:fs';
import path from 'node:path';

/**
 * Schema representing the active curriculum and learner mastery progress.
 */
export interface CurriculumData {
  /** Active learning topic */
  activeTopic?: string;
  /** High-level academic or technical domain categorization */
  domainAnalysis?: {
    category?: string;
    subdomains?: string[];
  };
  /** Estimated study duration in weeks */
  totalDurationWeeks?: number;
  /** Estimated study duration in hours */
  totalHours?: number;
  /** Current Bloom's cognitive taxonomy phase */
  currentPhase?: string;
  /** Completion records per learning phase */
  phases?: Record<
    string,
    {
      status: string;
      completionPercent: number;
      topics?: string[];
    }
  >;
  /** Prerequisite dependencies and their current scores */
  prerequisites?: Array<{
    name: string;
    status: string;
    score: number;
  }>;
  /** Calibrated scores per concept on the 0-10 scale */
  scores?: Record<string, number>;
  /** Estimated knowledge retention percentage (0-100) */
  retentionRate?: number;
  /** Array of earned mastery badge identifiers */
  badgesEarned?: string[];
}

/**
 * Generates an ASCII visual progress bar for terminal CLI telemetry.
 *
 * @param percent - Completion percentage (0 to 100)
 * @param width - Bar width in characters (defaults to 20)
 * @returns Formatted ASCII bar string e.g. `[█████░░░░░] 50%`
 */
export function renderProgressBar(percent: number, width = 20): string {
  const bounded = Math.max(0, Math.min(100, percent));
  const filled = Math.round((bounded / 100) * width);
  const empty = width - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${bounded}%`;
}

/**
 * Generates a calibrated 0-10 score gauge with filled star glyphs.
 *
 * @param score - Numeric score on the 0-10 calibrated scale
 * @returns Formatted score gauge string e.g. `8.0/10 ★★★★☆`
 */
export function renderScoreGauge(score: number): string {
  const bounded = Math.max(0, Math.min(10, score));
  const stars = '★'.repeat(Math.round(bounded / 2)) + '☆'.repeat(5 - Math.round(bounded / 2));
  return `${bounded.toFixed(1)}/10 ${stars}`;
}

/**
 * Loads and parses the workspace curriculum file from .tutor/curriculum.json.
 *
 * @param workspaceRoot - Path to workspace root directory
 * @returns Parsed CurriculumData object or null if missing/corrupt
 */
export function loadCurriculum(workspaceRoot: string): CurriculumData | null {
  const curriculumPath = path.join(workspaceRoot, '.tutor', 'curriculum.json');
  if (!fs.existsSync(curriculumPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(curriculumPath, 'utf-8')) as CurriculumData;
  } catch {
    return null;
  }
}

/**
 * Renders an ASCII text dashboard summary to the terminal.
 *
 * @param workspaceRoot - Path to workspace root directory
 * @returns Formatted multi-line ASCII dashboard
 */
export function renderTerminalDashboard(workspaceRoot: string): string {
  const data = loadCurriculum(workspaceRoot);
  if (!data) {
    return '⚠️  No active curriculum found. Scaffold or initialize a learning session with `aisensei`.';
  }

  const lines: string[] = [];
  lines.push('==============================================================');
  lines.push(` 🥋 AISENSEI LEARNING MASTERY DASHBOARD`);
  lines.push('==============================================================');
  lines.push(` Topic:       ${data.activeTopic || 'Unknown'}`);
  lines.push(` Domain:      ${data.domainAnalysis?.category || 'General'}`);
  lines.push(` Phase:       ${data.currentPhase || 'Foundation'}`);
  lines.push(` Est. Time:   ${data.totalDurationWeeks || 0} weeks (${data.totalHours || 0} hours)`);
  lines.push('--------------------------------------------------------------');
  lines.push(' 📊 PHASE PROGRESSION:');

  if (data.phases) {
    for (const [phaseKey, phase] of Object.entries(data.phases)) {
      const name = phaseKey.charAt(0).toUpperCase() + phaseKey.slice(1);
      const icon = phase.status === 'completed' ? '✅' : phase.status === 'in_progress' ? '🔄' : '⏳';
      const bar = renderProgressBar(phase.completionPercent || 0, 15);
      lines.push(`   ${icon} ${name.padEnd(12)}: ${bar}`);
    }
  }

  lines.push('--------------------------------------------------------------');
  lines.push(' 🎯 MASTERY SCORES (0-10 Calibrated Scale):');
  if (data.scores && Object.keys(data.scores).length > 0) {
    for (const [key, score] of Object.entries(data.scores)) {
      lines.push(`   - ${key.padEnd(24)}: ${renderScoreGauge(score)}`);
    }
  } else {
    lines.push('   (No formal assessments completed yet)');
  }

  lines.push('--------------------------------------------------------------');
  lines.push(` 🧠 Retention Rate: ${data.retentionRate ?? 100}%`);
  if (data.badgesEarned && data.badgesEarned.length > 0) {
    lines.push(` 🏅 Badges: [${data.badgesEarned.join(', ')}]`);
  }
  lines.push('==============================================================');

  return lines.join('\n');
}

/**
 * Generates an interactive, standalone HTML learning dashboard in .tutor/dashboard.html.
 *
 * @param workspaceRoot - Path to workspace root directory
 * @returns Absolute path to generated dashboard.html file
 */
export function generateHtmlDashboard(workspaceRoot: string): string {
  const data = loadCurriculum(workspaceRoot) || {
    activeTopic: 'General Mastery',
    currentPhase: 'Foundation',
    phases: {
      foundation: { status: 'in_progress', completionPercent: 0, topics: [] }
    },
    scores: {},
    retentionRate: 100,
    badgesEarned: []
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>aisensei • Learning Mastery Dashboard</title>
  <style>
    :root {
      --bg: #0d1117;
      --card-bg: #161b22;
      --border: #30363d;
      --text: #c9d1d9;
      --heading: #f0f6fc;
      --accent: #58a6ff;
      --success: #3fb950;
      --warn: #d29922;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); padding: 2rem; }
    .container { max-width: 900px; margin: 0 auto; }
    .header { margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
    .header h1 { color: var(--heading); font-size: 1.8rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
    .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600; background: #1f6feb33; color: var(--accent); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
    .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 8px; padding: 1.5rem; }
    .card h2 { color: var(--heading); font-size: 1.2rem; margin-bottom: 1rem; }
    .progress-bar { background: #21262d; border-radius: 4px; height: 10px; overflow: hidden; margin: 0.5rem 0 1rem; }
    .progress-fill { background: var(--accent); height: 100%; transition: width 0.3s; }
    .score-row { display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid #21262d; }
    .score-val { font-weight: 600; color: var(--heading); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🥋 aisensei <span class="badge">${data.currentPhase || 'Foundation'}</span></h1>
      <p>Active Mastery: <strong>${data.activeTopic || 'Dynamic Curriculum'}</strong></p>
    </div>
    <div class="grid">
      <div class="card">
        <h2>Phases</h2>
        ${Object.entries(data.phases || {})
          .map(
            ([key, p]) => `
          <div><strong>${key.toUpperCase()}</strong> (${p.completionPercent || 0}%)</div>
          <div class="progress-bar"><div class="progress-fill" style="width: ${p.completionPercent || 0}%"></div></div>
        `
          )
          .join('')}
      </div>
      <div class="card">
        <h2>Mastery Scores (0-10)</h2>
        ${Object.entries(data.scores || {})
          .map(
            ([k, v]) => `
          <div class="score-row"><span>${k}</span><span class="score-val">${v}/10</span></div>
        `
          )
          .join('') || '<p>No scores recorded yet.</p>'}
      </div>
    </div>
  </div>
</body>
</html>`;

  const dashboardPath = path.join(workspaceRoot, '.tutor', 'dashboard.html');
  fs.mkdirSync(path.dirname(dashboardPath), { recursive: true });
  fs.writeFileSync(dashboardPath, html, 'utf-8');
  return dashboardPath;
}

/** Default learning dashboard and telemetry module exports. */
export default {
  renderTerminalDashboard,
  generateHtmlDashboard,
  loadCurriculum,
  renderProgressBar,
  renderScoreGauge
};
