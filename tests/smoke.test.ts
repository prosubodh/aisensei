import defaultExport, {
  scaffold,
  validate,
  detectPrerequisiteCycles,
  topologicalSort,
  renderTerminalDashboard
} from '../src/index.js';

describe('Public API Smoke Test', () => {
  it('exports default scaffold module and named members', () => {
    expect(typeof defaultExport.scaffold).toBe('function');
    expect(typeof scaffold).toBe('function');
    expect(typeof validate).toBe('function');
    expect(typeof detectPrerequisiteCycles).toBe('function');
    expect(typeof topologicalSort).toBe('function');
    expect(typeof renderTerminalDashboard).toBe('function');
  });
});
