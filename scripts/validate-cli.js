#!/usr/bin/env node

import path from 'node:path';
import { validate } from '../lib/validate.js';

const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const res = validate(targetDir);

if (res.errors > 0) {
  process.exit(1);
}
