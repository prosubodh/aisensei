import fs from 'node:fs';
import path from 'node:path';
import {
  renderProgressBar,
  renderScoreGauge,
  loadCurriculum,
  renderTerminalDashboard,
  generateHtmlDashboard
} from '../src/dashboard.js';

describe('Dashboard Telemetry Engine', () => {
  it('renders progress bar correctly at 0, 50, 100%', () => {
    expect(renderProgressBar(0, 10)).toBe('[░░░░░░░░░░] 0%');
    expect(renderProgressBar(50, 10)).toBe('[█████░░░░░] 50%');
    expect(renderProgressBar(100, 10)).toBe('[██████████] 100%');
  });

  it('renders score gauge with stars correctly', () => {
    const gauge = renderScoreGauge(8);
    expect(gauge).toContain('8.0/10');
    expect(gauge).toContain('★');
  });

  it('renders terminal dashboard from workspace files', () => {
    const output = renderTerminalDashboard(process.cwd());
    expect(output).toContain('AISENSEI LEARNING MASTERY DASHBOARD');
    expect(output).toContain('PHASE PROGRESSION');
  });

  it('generates HTML dashboard file', () => {
    const htmlPath = generateHtmlDashboard(process.cwd());
    expect(fs.existsSync(htmlPath)).toBe(true);
    const content = fs.readFileSync(htmlPath, 'utf-8');
    expect(content).toContain('aisensei');
    expect(content).toContain('Learning Mastery Dashboard');
  });
});
