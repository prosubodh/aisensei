import { runGit, GIT_ALLOWED_SUBCOMMANDS } from '../src/git.js';

describe('Safe Git Subcommand Process Boundary', () => {
  it('exposes allowable subcommands set', () => {
    expect(GIT_ALLOWED_SUBCOMMANDS.has('status')).toBe(true);
    expect(GIT_ALLOWED_SUBCOMMANDS.has('init')).toBe(true);
    expect(GIT_ALLOWED_SUBCOMMANDS.has('push')).toBe(false);
  });

  it('throws on empty args array', () => {
    expect(() => runGit([])).toThrow('E_GIT_ARGS_INVALID');
  });

  it('throws on disallowed git subcommands (push, reset, clone)', () => {
    expect(() => runGit(['push'])).toThrow('E_GIT_BLOCKED');
    expect(() => runGit(['reset'])).toThrow('E_GIT_BLOCKED');
    expect(() => runGit(['clone'])).toThrow('E_GIT_BLOCKED');
  });

  it('executes allowlisted git commands safely', () => {
    const out = runGit(['status', '--porcelain'], { cwd: process.cwd() });
    expect(typeof out).toBe('string');
  });
});
