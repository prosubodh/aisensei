import { validate, createSilentReporter, createConsoleReporter } from '../src/validate.js';

describe('Validation Engine', () => {
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
});
