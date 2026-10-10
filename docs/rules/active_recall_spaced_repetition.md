# Active Recall & Spaced Repetition Protocol

> **Rule ID:** `PED-004`  
> **Domain:** Memory Retention & Long-Term Consolidation  
> **Mandate:** Defeat the Ebbinghaus forgetting curve through forced retrieval practice and spaced testing intervals.

---

## 1. Core Mechanics
Passive re-reading produces an illusion of mastery. Long-term synaptic consolidation requires effortful memory retrieval:
1. **Effortful Retrieval**: Present problems that force the brain to reconstruct models from memory rather than recognizing presented facts.
2. **Expanding Intervals**:
   - Level 1: Immediate end-of-session diagnostic (0-2 hours).
   - Level 2: Interleaved review after 24 hours (1 day).
   - Level 3: Cross-topic synthesis after 72 hours (3 days).
   - Level 4: Edge-case stress test after 1 week (7 days).
   - Level 5: Architecture integration test after 2 weeks (14 days).

## 2. Invariants
- Record retention timestamps in `memory.md` upon every concept clearance.
- Periodically trigger unexpected pop-quizzes targeting Level 2+ items that are due for review.
- If retrieval fails during an active recall check, reset the concept interval to Level 1.
