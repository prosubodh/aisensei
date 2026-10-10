import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

/**
 * Prompts the user with a question via readline interface.
 * @param query The question string to display.
 * @param rlInterface Optional readline interface (creates and closes default interface if omitted).
 * @returns Promise resolving to the trimmed user answer.
 */
export async function askQuestion(
  query: string,
  rlInterface?: readline.Interface
): Promise<string> {
  const rl =
    rlInterface ||
    readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      if (!rlInterface) rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Resolves a user-provided target directory path against the current working directory.
 * Defaults to `process.cwd()` when input is null, empty, or `'.'`.
 * @param inputTarget Raw input directory string or null.
 * @returns Fully qualified absolute directory path.
 */
export function resolveTargetDir(inputTarget: string | null): string {
  if (!inputTarget || inputTarget === '.') {
    return process.cwd();
  }
  return path.resolve(process.cwd(), inputTarget);
}

/**
 * Tests whether the given target directory exists or can be created, and is writable.
 * Cleans up temporary test probe file after verification.
 * @param targetDir Directory path to verify.
 * @returns True if writable, false on any filesystem permission error.
 */
export function ensureWritableTarget(targetDir: string): boolean {
  try {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const testFile = path.join(targetDir, `.aisensei_write_test_${Date.now()}`);
    fs.writeFileSync(testFile, 'ok', 'utf-8');
    fs.rmSync(testFile, { force: true });
    return true;
  } catch {
    return false;
  }
}

/** Default CLI target directory resolution module exports. */
export default { askQuestion, resolveTargetDir, ensureWritableTarget };
