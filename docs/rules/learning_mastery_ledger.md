# Learning Mastery Record (LMR) Ledger

> **Rule ID:** `PED-014`  
> **Domain:** Knowledge Persistence & Auditability  
> **Mandate:** Maintain an immutable, machine-verifiable audit trail of student mastery in `memory.md`.

---

## 1. The LMR Specification
Every mastered concept, diagnostic exam, or portfolio milestone is formally recorded as a Learning Mastery Record (LMR) in `memory.md`:

```markdown
#### LMR-001: [Concept Name]
- **Date**: YYYY-MM-DD
- **Domain / Topic**: [Domain] / [Topic]
- **Phase**: Foundation | Development | Advanced | Mastery
- **Cognitive Level**: Remember | Understand | Apply | Analyze | Evaluate | Create
- **Score**: [0-10] / 10
- **Prerequisites Satisfied**: [List of prerequisite LMR IDs]
- **Evidence**: [Concrete evidence: student explanation, test execution output]
- **Misconceptions Remediated**: [Key conceptual breakthrough]
- **Retention Schedule**: Next review [YYYY-MM-DD] (Interval: N days)
```

## 2. Invariants
- Never delete or rewrite past LMR entries; append subsequent evaluations to maintain historical growth trajectories.
- The validator will verify that every completed curriculum node has a corresponding LMR entry with score >= 7.
