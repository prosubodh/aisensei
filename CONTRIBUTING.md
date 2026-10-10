# Contributing to aisensei

Thank you for your interest in contributing to **aisensei**! We are committed to building the highest-rigor pedagogical governance toolkit and deep learning workspace for AI-assisted mastery.

---

## Architectural & Pedagogical Standards

1. **Systemic Atomicity**: Every rule, skill, and code unit must adhere strictly to the Single Responsibility Principle (SRP).
2. **True Incremental TDD**: Write minimal micro-assertions, verify RED, write minimal code to pass GREEN, and refactor.
3. **Zero External Runtime Dependencies**: The core package runs natively on modern Node.js (`>=22.8.0`) ESM with zero third-party dependencies in production.
4. **Academic & Pedagogical Integrity**: Reject sycophantic validation, hand-waving explanations, and uncalibrated assessments.

---

## Development Setup

```bash
# Clone the repository
git clone https://github.com/prosubodh/aisensei.git
cd aisensei

# Install development dependencies
npm install

# Run the test suite
npm test

# Run architecture & pedagogical invariant validation
npm run validate

# Build ESM artifacts
npm run build
```

---

## Submitting Pull Requests

1. Create a feature branch (`git checkout -b feature/pedagogical-rule-name`).
2. Ensure all tests pass with zero warnings (`npm test && npm run validate`).
3. Commit with semantic commit messages (`feat: add Leitner box schedule rule`).
4. Open a Pull Request on GitHub.
