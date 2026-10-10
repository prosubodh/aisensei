import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { parseArgs } from '../src/cli-parse.js';
import { runCli, printHelp, printVersion, main } from '../src/cli.js';

describe('CLI & Argument Parsing', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aisensei-cli-test-'));
  });

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('parses flags and positionals exhaustively in parseArgs', () => {
    expect(parseArgs(['-h']).terminal).toBe('help');
    expect(parseArgs(['--help']).terminal).toBe('help');
    expect(parseArgs(['-v']).terminal).toBe('version');
    expect(parseArgs(['--version']).terminal).toBe('version');

    expect(parseArgs(['--topic', 'Topic A']).topic).toBe('Topic A');
    expect(parseArgs(['--topic']).topic).toBeUndefined();

    const bools = parseArgs(['-f', '--no-git', '-d', '-s']);
    expect(bools.force).toBe(true);
    expect(bools.noGit).toBe(true);
    expect(bools.dryRun).toBe(true);
    expect(bools.silent).toBe(true);

    const unknown = parseArgs(['--unknown']);
    expect(unknown.terminal).toBe('unknown-flag');

    // Positional arguments (targetDir, topic, and extra)
    const pos = parseArgs(['my-target', 'My Topic', 'extra-arg']);
    expect(pos.terminal).toBe('extra-arg');
    expect(pos.message).toBeUndefined();
  });

  it('runs help and version command cleanly and covers default out printer', async () => {
    let output = '';
    const spy = (msg: string): void => {
      output += msg;
    };
    printHelp(spy);
    expect(output).toContain('aisensei');

    printVersion(spy);

    // Call default out (console.log)
    printHelp();
    printVersion();

    const exitCode = await runCli(['--help']);
    expect(exitCode).toBe(0);

    const vCode = await runCli(['-v']);
    expect(vCode).toBe(0);
  });

  it('handles unknown flag and extra argument in runCli', async () => {
    const unknownCode = await runCli(['--invalid-flag']);
    expect(unknownCode).toBe(1);

    const extraArgCode = await runCli(['dir', 'topic', 'extra']);
    expect(extraArgCode).toBe(1);
  });

  it('runs check command via runCli on clean and failing workspace', async () => {
    const checkCode = await runCli(['check']);
    expect(checkCode).toBe(0);

    // Failing workspace
    const failCode = await runCli(['check', tmpDir]);
    expect(failCode).toBe(1);
  });

  it('runs dashboard command with and without --silent', async () => {
    const silentCode = await runCli(['dashboard', '--silent']);
    expect(silentCode).toBe(0);

    const noisyCode = await runCli(['dashboard']);
    expect(noisyCode).toBe(0);
  });

  it('runs dag command with no prerequisites, cyclic prerequisites, and valid DAG', async () => {
    // 1. Valid workspace DAG
    const dagCode = await runCli(['dag']);
    expect(dagCode).toBe(0);

    // 2. Empty directory (no prerequisites)
    const emptyDag = await runCli(['dag', tmpDir]);
    expect(emptyDag).toBe(0);

    // 3. Cyclic curriculum
    const tutorDir = path.join(tmpDir, '.tutor');
    fs.mkdirSync(tutorDir, { recursive: true });
    fs.writeFileSync(
      path.join(tutorDir, 'curriculum.json'),
      JSON.stringify({
        prerequisites: [
          { name: 'X', prerequisites: ['Y'] },
          { name: 'Y', prerequisites: ['X'] }
        ]
      })
    );
    const cyclicCode = await runCli(['dag', tmpDir]);
    expect(cyclicCode).toBe(1);
  });

  it('runs quiz command with concepts and with empty curriculum', async () => {
    // 1. Current workspace has scores
    const quizCode = await runCli(['quiz']);
    expect(quizCode).toBe(0);

    // 2. Empty curriculum
    const emptyQuiz = await runCli(['quiz', tmpDir]);
    expect(emptyQuiz).toBe(0);
  });

  it('runs default scaffold command with success, cd . output, and error handling', async () => {
    const target = path.join(tmpDir, 'scaffold-test');
    const code = await runCli([target, '--topic', 'Rust Systems', '--force']);
    expect(code).toBe(0);

    // Test cd . output branch when targetDir === process.cwd()
    const origCwd = process.cwd();
    const scaffoldInCwdDir = path.join(tmpDir, 'cwd-test');
    fs.mkdirSync(scaffoldInCwdDir, { recursive: true });
    try {
      process.chdir(scaffoldInCwdDir);
      const cwdCode = await runCli(['.', '--force']);
      expect(cwdCode).toBe(0);
    } finally {
      process.chdir(origCwd);
    }

    // Scaffold error on template itself
    const errCode = await runCli(['.', '--no-git']);
    // Since . is not empty without force, validateTarget throws
    expect(errCode).toBe(1);

    // Scaffold error when non-Error object without message is thrown
    const origMkdirSync = fs.mkdirSync;
    try {
      (fs as any).mkdirSync = () => {
        throw 'raw string error';
      };
      const stringErrCode = await runCli([path.join(tmpDir, 'fail-dir'), '--force']);
      expect(stringErrCode).toBe(1);
    } finally {
      (fs as any).mkdirSync = origMkdirSync;
    }
  });

  it('runs runCli with default argv', async () => {
    const origArgv = process.argv;
    try {
      process.argv = [process.execPath, 'bin/aisensei.js', '-v'];
      const code = await runCli();
      expect(code).toBe(0);
    } finally {
      process.argv = origArgv;
    }
  });

  it('main handles exit codes and unexpected errors', async () => {
    const origArgv = process.argv;
    const origExit = process.exit;
    const origError = console.error;
    let exitCode: number | null = null;
    let errorLogged: any = null;

    try {
      (process as any).exit = (c: number) => {
        exitCode = c;
      };
      console.error = (msg: any) => {
        errorLogged = msg;
      };

      // 1. Success exit
      process.argv = [process.execPath, 'bin/aisensei.js', '-v'];
      await main();
      expect(exitCode).toBe(0);

      // 2. Unexpected error branch
      (process as any).argv = null;
      await main();
      expect(exitCode).toBe(1);
      expect(errorLogged).toContain('Unexpected error');
    } finally {
      process.argv = origArgv;
      process.exit = origExit;
      console.error = origError;
    }
  });
});
