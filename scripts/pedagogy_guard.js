#!/usr/bin/env node

/**
 * PreToolUse runtime hook for aisensei.
 * Inspects incoming tool payloads for anti-spoonfeeding and curriculum integrity breaches.
 */
import { inspectPreTool } from '../lib/agent-guard.js';

function main() {
  const rawInput = process.argv[2] || '';
  if (!rawInput) {
    process.exit(0);
  }

  const decision = inspectPreTool(rawInput);
  if (!decision.allowed) {
    console.error(`🚨 AISENSEI GUARD BLOCKED: ${decision.reason}`);
    process.exit(1);
  }

  process.exit(0);
}

main();
