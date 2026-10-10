import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

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

export function resolveTargetDir(inputTarget: string | null): string {
  if (!inputTarget || inputTarget === '.') {
    return process.cwd();
  }
  return path.resolve(process.cwd(), inputTarget);
}

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

export default { askQuestion, resolveTargetDir, ensureWritableTarget };
