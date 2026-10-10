# aisensei: Pedagogical governance toolkit, with an optional starter

[![npm version](https://img.shields.io/npm/v/aisensei.svg?color=cb3837)](https://www.npmjs.com/package/aisensei)
[![CI Status](https://img.shields.io/badge/CI-passing-brightgreen.svg)](https://github.com/prosubodh/aisensei/actions)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/prosubodh/aisensei/actions)
[![Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)](https://www.npmjs.com/package/aisensei)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

> **Production-oriented pedagogical governance and active mastery workspace for AI-assisted development (early release).**  
> *AI agents move fast. Learning skims the surface. Aisensei turns pedagogical intent into executable constraints your AI agent cannot skip and the learner cannot bluff.*

---

## 🌟 Pedagogical Pillars

1. **First-Principles & Axiomatic Deconstruction**: Strip analogies and conventional hand-waving. Reduce every phenomenon to fundamental physical, mathematical, or computational axioms before synthesizing higher-order laws.
2. **Inductive Socratic Elicitation**: Never lecture passively when you can elicit actively. Guide the student to discover truths through 5-level questioning loops. Limit didactic exposition to 2 paragraphs maximum.
3. **Bloom's Taxonomy Cognitive Progression**: Systematically graduate understanding across all 6 cognitive orders: Remember → Understand → Apply → Analyze → Evaluate → Create. Mastery requires graduating beyond passive comprehension.
4. **Active Recall & Ebbinghaus Spaced Repetition**: Defeat forgetting curves through forced retrieval practice and exponentially expanding review intervals (1, 3, 7, 14, 30 days).
5. **Anti-Sycophancy & Academic Honesty**: Ban hollow flattery ("Great job!", "Awesome!"). Provide immediate factual correction. Rigorous truth is the highest respect for the learner's intellect.
6. **Calibrated 0–10 Rubric Scoring with Mastery Gates**: Objective assessment across 4 calibrated tiers (0–3 Novice, 4–6 Developing, 7–8 Proficient, 9–10 Master). Advancing to downstream concepts strictly requires a score of **>= 7/10**.
7. **Topological Prerequisite Dependency DAG**: Knowledge forms a mathematically verified Directed Acyclic Graph (DAG). Never skip foundational prerequisites before tackling advanced topics.
8. **Adversarial Multi-Persona Sparring**: Dynamic sparring partners (Naïve Junior, Hostile Security Auditor, Principal Systems Architect, Product Executive) to challenge assumptions and stress-test reasoning.
9. **Hands-On Agentic Sandboxing & Test-Driven Learning**: Theory without code is fragile. Provide starter exercise stubs in `exercises/` with automated unit tests. Execute tests via terminal commands to objectively verify passing solutions.
10. **Immutable Learning Mastery Records (LMR Ledger)**: Maintain an immutable audit trail in `memory.md` recording every assessed concept, score, evidence, and retention decay schedule.

---

## ⚡ 60-Second Demo: See Pedagogical Governance in Action

Aisensei turns pedagogical philosophy into machine-checked constraints. Runtime hooks prevent AI tutors from spoon-feeding answers, and the CLI ensures curriculum integrity.

### 1. Standalone Pedagogical & Architecture Check
Run the validator on any learning workspace without scaffolding:
```bash
npx aisensei check
```
```text
🔍 Validating aisensei Pedagogical Architecture in: ./
--------------------------------------------------------------
📌 1. Root Configuration & Multi-Agent Harness Parity
  ✅ PASS: AGENTS.md exists and is readable.
  ✅ PASS: Agent harness 'CLAUDE.md' verified.
  ✅ PASS: Agent harness 'GEMINI.md' verified.
  ✅ PASS: Agent harness '.cursorrules' verified.
  ✅ PASS: Agent harness '.windsurfrules' verified.

📌 2. Progressive Disclosure Pedagogical Rules
  ✅ PASS: Found 20 pedagogical rules in docs/rules/.

📌 3. Specialized Mentorship Skills
  ✅ PASS: Skill verified: ai-tutor
  ✅ PASS: Skill verified: code-lab-mentor
  ✅ PASS: Skill verified: curriculum-architect
  ✅ PASS: Skill verified: diagnostic-evaluator
  ✅ PASS: Skill verified: feynman-explainer
  ✅ PASS: Skill verified: socratic-examiner

📌 4. Memory & Learning Mastery Records (LMR)
  ✅ PASS: memory.md header and ledger format verified.

📌 5. Curriculum Integrity & Prerequisite DAG
  ✅ PASS: Active topic: Distributed Systems
  ✅ PASS: All calibrated scores adhere to 0-10 bounds.
  ✅ PASS: Prerequisite dependency graph is strictly acyclic (DAG verified).

🎉 SUCCESS: All pedagogical invariants are healthy! (0 warnings)
```

### 2. Real-Time PreToolUse Guard: Anti-Spoonfeeding
When an AI agent attempts to dump a completed solution into an exercise file without student stubs or failing tests:
```text
🚨 TOOL USE BLOCKED: Anti-Spoonfeeding Guard Violation
   File 'exercises/raft/consensus.ts' has finished implementation.
   Direct solution dumps are blocked.
   Scaffold an interactive starter stub with automated unit tests instead.
```

### 3. Prerequisite DAG Inspection & Topological Sequence
Inspect dependency chains, unlock states, and detect prerequisite cycles:
```bash
npx aisensei dag
```
```text
🌳 Prerequisite Learning Order (Topological Sort):
  1. Solar Time vs. Standard Time
  2. Origins and Legislative History of DST
  3. The Mechanics of Spring-Forward and Fall-Back
  4. Circadian Rhythms and Public Health Implications
  5. The IANA Time Zone Database (tzdb)
```

### 4. Spontaneous Active Recall Pop-Quiz
Trigger an interleaved retrieval question based on learned concepts due for review:
```bash
npx aisensei quiz
```
```text
==============================================================
 🎲 AISENSEI ACTIVE RECALL POP-QUIZ
==============================================================
 Target Concept: prereq_utc_vs_tz
 Instruction for AI Tutor:
 "Conduct an unexpected 1-question active recall diagnostic on prereq_utc_vs_tz."
==============================================================
```

### 5. Interactive Learning Dashboard & Telemetry
View progress meters, calibrated score gauges, and generate offline HTML dashboards:
```bash
npx aisensei dashboard
```
```text
==============================================================
 🥋 AISENSEI LEARNING MASTERY DASHBOARD
==============================================================
 Topic:       Daylight Saving Time & Global Timekeeping
 Domain:      Chronometry, Planetary Mechanics & Systems Engineering
 Phase:       Development
 Est. Time:   6 weeks (24 hours)
--------------------------------------------------------------
 📊 PHASE PROGRESSION:
   ✅ Foundation  : [███████████████] 100%
   🔄 Development : [░░░░░░░░░░░░░░░] 0%
   ⏳ Advanced    : [░░░░░░░░░░░░░░░] 0%
   ⏳ Mastery     : [░░░░░░░░░░░░░░░] 0%
--------------------------------------------------------------
 🎯 MASTERY SCORES (0-10 Calibrated Scale):
   - prereq_utc_vs_tz        : 6.0/10 ★★★☆☆
   - foundation_mechanics    : 10.0/10 ★★★★★
--------------------------------------------------------------
 🧠 Retention Rate: 100%
 🏅 Badges: [Genesis, Precision Score]
==============================================================

🌐 HTML Dashboard updated: file:///D:/projects/ai-tutor-workspace/.tutor/dashboard.html
```

---

## 🗂️ Workspace Architecture

```
.
├── .agents/
│   └── skills/                       # Specialized on-demand mentorship skills
│       ├── ai-tutor/                 # Master adaptive learning orchestrator
│       ├── code-lab-mentor/          # Hands-on exercises & test harness generator
│       ├── curriculum-architect/     # Domain deconstruction & DAG mapper
│       ├── diagnostic-evaluator/     # Strict 0-10 rubric calibration & scoring
│       ├── feynman-explainer/        # Jargon elimination & conceptual stress-testing
│       └── socratic-examiner/        # 5-level Socratic cross-examination loop
├── .tutor/                           # Session telemetry and curriculum state
│   ├── changelog.md                  # System prompt modification log
│   ├── curriculum.json               # Active DAG curriculum and 0-10 scores
│   ├── dashboard.html                # Standalone interactive visual telemetry
│   └── system_prompt.md              # Deep tutor prompt specification
├── docs/
│   ├── knowledge/                    # Institutional pedagogical knowledge
│   │   ├── bloom_taxonomy_rubric.md  # 6-level cognitive depth specification
│   │   └── ubiquitous_language.md    # Living Ubiquitous Language glossary
│   └── rules/                        # 20 progressive disclosure pedagogical rules
├── exercises/                        # Hands-on labs with automated tests
├── notes/                            # Conceptual syntheses and mental models
├── projects/                         # Capstone portfolio projects
├── AGENTS.md                         # Lean root agentic configuration (< 120 lines)
├── CLAUDE.md -> AGENTS.md            # Filesystem symlink for harness parity (Claude Code)
├── GEMINI.md -> AGENTS.md            # Filesystem symlink for harness parity (Antigravity)
├── .cursorrules -> AGENTS.md         # Filesystem symlink for harness parity (Cursor)
├── .windsurfrules -> AGENTS.md       # Filesystem symlink for harness parity (Windsurf)
├── memory.md                         # Master memory hub & Learning Mastery Record (LMR) ledger
└── README.md                         # Project documentation
```

---

## 📋 Progressive Disclosure Rules Catalog (`docs/rules/`)

Read on demand to prevent prompt context bloat:

| Domain | Rule Reference File | Key Focus & Invariants |
|---|---|---|
| **First Principles** | [`first_principles_thinking.md`](./docs/rules/first_principles_thinking.md) | Axiomatic breakdown, eliminate analogies, ground-up reconstruction. |
| **Socratic Method** | [`socratic_dialogue_protocol.md`](./docs/rules/socratic_dialogue_protocol.md) | 5-level "why" questioning, inductive guidance, elenctic inquiry. |
| **Feynman Technique** | [`feynman_technique.md`](./docs/rules/feynman_technique.md) | Teach a 12-year-old, detect jargon shields and conceptual leaks. |
| **Active Recall** | [`active_recall_spaced_repetition.md`](./docs/rules/active_recall_spaced_repetition.md) | Effortful retrieval practice, Leitner intervals, Ebbinghaus decay defeat. |
| **Bloom's Taxonomy** | [`bloom_taxonomy_progression.md`](./docs/rules/bloom_taxonomy_progression.md) | 6-stage progression from Remember up to Evaluate & Create. |
| **Cognitive Load** | [`cognitive_load_optimization.md`](./docs/rules/cognitive_load_optimization.md) | Max 3 novel concepts per turn, chunking, eliminate extraneous load. |
| **Academic Honesty** | [`anti_sycophancy_integrity.md`](./docs/rules/anti_sycophancy_integrity.md) | Zero unearned praise, immediate factual correction, defend truth. |
| **Scoring Rubric** | [`rubric_scoring_0_10.md`](./docs/rules/rubric_scoring_0_10.md) | 0–3 Novice, 4–6 Developing, 7–8 Proficient, 9–10 Master; gate >= 7. |
| **Prerequisites DAG** | [`prerequisite_dependency_dag.md`](./docs/rules/prerequisite_dependency_dag.md) | Strict topological DAG, zero forward jumps without prerequisite clearance. |
| **Pop-Quizzes** | [`unexpected_pop_quizzes.md`](./docs/rules/unexpected_pop_quizzes.md) | 1–2 spontaneous low-stakes diagnostics per session, interleaved checks. |
| **Adversarial Sparring**| [`adversarial_persona_sparring.md`](./docs/rules/adversarial_persona_sparring.md) | Multi-persona debates: Junior Engineer, Architect, Security Auditor. |
| **Agentic Sandbox** | [`hands_on_agentic_sandboxing.md`](./docs/rules/hands_on_agentic_sandboxing.md) | Exercises in `exercises/`, automated unit testing, red-to-green verification. |
| **Deliberate Practice**| [`deliberate_practice_edge_cases.md`](./docs/rules/deliberate_practice_edge_cases.md) | Boundary conditions, failure modes, counterexamples on `challenge`. |
| **Mastery Ledger** | [`learning_mastery_ledger.md`](./docs/rules/learning_mastery_ledger.md) | Immutable LMR records in `memory.md`, historical growth tracking. |
| **Visual Dashboard** | [`generative_ui_dashboards.md`](./docs/rules/generative_ui_dashboards.md) | Visual telemetry in chat and synced offline `.tutor/dashboard.html`. |
| **Meta-Learning** | [`meta_learning_reflection.md`](./docs/rules/meta_learning_reflection.md) | Calibration curves, reflective pauses, error journal logging. |
| **Maintenance Mode** | [`maintenance_mode_protocol.md`](./docs/rules/maintenance_mode_protocol.md) | Pause session, explicit consent gate, prompt update, changelog sync. |
| **Error Remediation** | [`error_driven_remediation.md`](./docs/rules/error_driven_remediation.md) | Treat errors as diagnostic assets; minimal counterexample guidance. |
| **Capstone Projects** | [`portfolio_project_standards.md`](./docs/rules/portfolio_project_standards.md) | End-to-end projects in `projects/`, passing test suites, defense. |
| **Dual Coding** | [`multimodal_representation.md`](./docs/rules/multimodal_representation.md) | Dual-coding theory: prose, ASCII diagrams, KaTeX math, code snippets. |

---

## 🛠️ Specialized Skills Catalog (`.agents/skills/`)

- [`ai-tutor`](.agents/skills/ai-tutor/SKILL.md): Master adaptive mentor and workspace instructor.
- [`code-lab-mentor`](.agents/skills/code-lab-mentor/SKILL.md): Hands-on exercises and automated test suites.
- [`curriculum-architect`](.agents/skills/curriculum-architect/SKILL.md): Domain deconstruction into topological DAGs.
- [`diagnostic-evaluator`](.agents/skills/diagnostic-evaluator/SKILL.md): Strict 0–10 rubric calibration and feedback.
- [`feynman-explainer`](.agents/skills/feynman-explainer/SKILL.md): Jargon elimination and ELI5 conceptual stress-testing.
- [`socratic-examiner`](.agents/skills/socratic-examiner/SKILL.md): Rigorous 5-level Socratic interrogation loop.

---

## 🚀 Starting a New Learning Journey

### Step 1: Initialize Workspace with npx
Scaffold a complete in-depth learning workspace for any discipline:
```bash
npx aisensei my-quantum-course --topic "Quantum Computing & Qiskit"
cd my-quantum-course
```

### Step 2: Open with Your AI Agent
Open the workspace in Google Antigravity, Claude Code, Cursor, or Windsurf. The root `AGENTS.md` automatically activates the world-class mentor persona.

### Step 3: Interactive Learning Commands
Available at any point during your learning journey:
- `dashboard` — Render visual progress and sync offline HTML dashboard.
- `summary` — Recap concepts learned in the current session.
- `back` — Step back to previous concept.
- `pause` — Save progress and pause session.
- `help` — Show list of all available commands.
- `what's next` — Preview upcoming topics in the curriculum DAG.
- `review [topic]` — Deliver targeted review and quick diagnostic.
- `examples` — Provide practical domain examples.
- `challenge` — Request an adversarial edge-case problem.
- `show prompt` / `update prompt` / `changelog` — Execute Maintenance Mode.

---

## 🔒 Security & Supply-Chain Notes

- **Zero Runtime Dependencies**: The core CLI and validation engine run on native Node.js ESM with zero runtime production dependencies.
- **Protected Targets Guard**: Aisensei refuses to write or scaffold into system roots (`/`, `C:\`), `$HOME`, or template ancestors, even with `--force`.
- **Safe Git Subcommand Boundary**: Git interactions are strictly constrained to allowlisted subcommands (`rev-parse`, `init`, `branch`, `add`, `commit`, `status`) executed without shell interpretation (`shell: false`).

---

## 📜 License & Author

- Author: **Subodh Khanal**
- License: [MIT](./LICENSE)
