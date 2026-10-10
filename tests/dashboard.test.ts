import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  renderProgressBar,
  renderScoreGauge,
  loadCurriculum,
  renderTerminalDashboard,
  generateHtmlDashboard
} from '../src/dashboard.js';

describe('Dashboard Telemetry Engine', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aisensei-dash-test-'));
  });

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('renders progress bar correctly at 0, 50, 100% including default width', () => {
    expect(renderProgressBar(0, 10)).toBe('[░░░░░░░░░░] 0%');
    expect(renderProgressBar(50, 10)).toBe('[█████░░░░░] 50%');
    expect(renderProgressBar(100, 10)).toBe('[██████████] 100%');
    expect(renderProgressBar(50)).toBe('[██████████░░░░░░░░░░] 50%');
  });

  it('renders score gauge with stars correctly', () => {
    const gauge = renderScoreGauge(8);
    expect(gauge).toContain('8.0/10');
    expect(gauge).toContain('★');
  });

  it('loadCurriculum handles missing file and invalid JSON gracefully', () => {
    expect(loadCurriculum(tmpDir)).toBeNull();

    const tutorDir = path.join(tmpDir, '.tutor');
    fs.mkdirSync(tutorDir);
    fs.writeFileSync(path.join(tutorDir, 'curriculum.json'), '{ invalid json }');
    expect(loadCurriculum(tmpDir)).toBeNull();
  });

  it('renderTerminalDashboard handles missing curriculum, empty scores, and missing fields', () => {
    expect(renderTerminalDashboard(tmpDir)).toContain('No active curriculum found');

    const tutorDir = path.join(tmpDir, '.tutor');
    fs.mkdirSync(tutorDir, { recursive: true });
    fs.writeFileSync(
      path.join(tutorDir, 'curriculum.json'),
      JSON.stringify({ activeTopic: 'Test', phases: {}, scores: {} })
    );
    const output = renderTerminalDashboard(tmpDir);
    expect(output).toContain('(No formal assessments completed yet)');

    // Missing fields fallback test
    fs.writeFileSync(path.join(tutorDir, 'curriculum.json'), JSON.stringify({}));
    const fallbackTerm = renderTerminalDashboard(tmpDir);
    expect(fallbackTerm).toContain('Topic:       Unknown');
    expect(fallbackTerm).toContain('Domain:      General');
    expect(fallbackTerm).toContain('Phase:       Foundation');
  });

  it('renders terminal dashboard from workspace files', () => {
    const output = renderTerminalDashboard(process.cwd());
    expect(output).toContain('AISENSEI LEARNING MASTERY DASHBOARD');
    expect(output).toContain('PHASE PROGRESSION');
  });

  it('generates HTML dashboard file with and without fallback curriculum', () => {
    const htmlPath = generateHtmlDashboard(process.cwd());
    expect(fs.existsSync(htmlPath)).toBe(true);
    const content = fs.readFileSync(htmlPath, 'utf-8');
    expect(content).toContain('aisensei');
    expect(content).toContain('Learning Mastery Dashboard');

    // Generate in empty tmpDir to exercise default fallback curriculum branch
    const fallbackPath = generateHtmlDashboard(tmpDir);
    expect(fs.existsSync(fallbackPath)).toBe(true);

    // Generate in tmpDir where curriculum exists but has empty scores and missing fields
    const tutorDir = path.join(tmpDir, '.tutor');
    fs.mkdirSync(tutorDir, { recursive: true });
    fs.writeFileSync(path.join(tutorDir, 'curriculum.json'), JSON.stringify({}));
    const emptyHtmlPath = generateHtmlDashboard(tmpDir);
    const emptyHtmlContent = fs.readFileSync(emptyHtmlPath, 'utf-8');
    expect(emptyHtmlContent).toContain('No scores recorded yet.');
    expect(emptyHtmlContent).toContain('Dynamic Curriculum');
  });
});
