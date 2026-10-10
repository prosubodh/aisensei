#!/usr/bin/env node

/**
 * CLI entry point for aisensei.
 * Logic is encapsulated in lib/cli.js for modular testing.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import * as cli from '../lib/cli.js';

const selfPath = fileURLToPath(import.meta.url);
const isDirectRun = process.argv[1]
  ? fs.realpathSync(path.resolve(process.argv[1])).toLowerCase() === fs.realpathSync(selfPath).toLowerCase()
  : false;

if (isDirectRun) {
  cli.main();
}

export * from '../lib/cli.js';
export default cli;
