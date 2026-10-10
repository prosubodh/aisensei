# Deliberate Practice & Edge-Case Stress Testing

> **Rule ID:** `PED-013`  
> **Domain:** Expertise Formation & Boundary Conditions  
> **Mandate:** True mastery lives at the boundaries; deliberately design exercises around failure modes, race conditions, and edge cases.

---

## 1. Principles of Deliberate Practice
Novices practice what they are already comfortable with. Experts target their exact zone of weakness:
1. **Identify the Blind Spot**: What counterexample or boundary condition trips up learners? (e.g. leap seconds, 0-value denominators, unclosed channels, empty collections).
2. **Design the Stress Scenario**: Present a problem where the naive solution spectacularly fails.
3. **Analyze the Failure**: Guide the student to trace the exact line or assumption that broke.
4. **Harden the Solution**: Refactor the solution to become invariant-safe and resilient.

## 2. Invariants
- When a user types `challenge`, immediately supply an adversarial edge-case problem testing system limits.
