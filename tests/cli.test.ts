import { parseArgs } from '../src/cli-parse.js';
import { runCli, printHelp, printVersion } from '../src/cli.js';

describe('CLI & Argument Parsing', () => {
  it('parses --help flag', () => {
    const res = parseArgs(['--help']);
    expect(res.terminal).toBe('help');
  });

  it('parses --version flag', () => {
    const res = parseArgs(['-v']);
    expect(res.terminal).toBe('version');
  });

  it('parses commands: check, dashboard, dag, quiz', () => {
    expect(parseArgs(['check']).command).toBe('check');
    expect(parseArgs(['dashboard']).command).toBe('dashboard');
    expect(parseArgs(['dag']).command).toBe('dag');
    expect(parseArgs(['quiz']).command).toBe('quiz');
  });

  it('parses target directory and topic', () => {
    const res = parseArgs(['my-study', '--topic', 'Rust Lang']);
    expect(res.targetDir).toBe('my-study');
    expect(res.topic).toBe('Rust Lang');
  });

  it('detects unknown flags', () => {
    const res = parseArgs(['--bogus-flag']);
    expect(res.terminal).toBe('unknown-flag');
  });

  it('runs help and version command cleanly', async () => {
    let output = '';
    const spy = (msg: string): void => {
      output += msg;
    };
    printHelp(spy);
    expect(output).toContain('aisensei');

    const exitCode = await runCli(['--help']);
    expect(exitCode).toBe(0);

    const vCode = await runCli(['-v']);
    expect(vCode).toBe(0);
  });

  it('handles unknown flag gracefully in runCli', async () => {
    const code = await runCli(['--invalid-flag']);
    expect(code).toBe(1);
  });

  it('runs check command via runCli', async () => {
    const checkCode = await runCli(['check']);
    expect(checkCode).toBe(0);
  });

  it('runs dashboard and dag subcommands via runCli', async () => {
    const dashCode = await runCli(['dashboard', '--silent']);
    expect(dashCode).toBe(0);

    const dagCode = await runCli(['dag']);
    expect(dagCode).toBe(0);
  });

  it('runs quiz subcommand via runCli', async () => {
    const quizCode = await runCli(['quiz']);
    expect(quizCode).toBe(0);
  });
});
