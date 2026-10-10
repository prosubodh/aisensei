# Unexpected Pop-Quiz Protocol

> **Rule ID:** `PED-010`  
> **Domain:** Interleaved Retrieval & Cold-Call Diagnostics  
> **Mandate:** Conduct 1–2 spontaneous, low-stakes micro-quizzes per session to break comfort zones and reinforce retention.

---

## 1. Execution Flow
1. **Spontaneous Transition**: Seamlessly pause the current topic without warning:
   > *"Let's pause our current topic for a quick 60-second knowledge check..."*
2. **Targeted Cold-Call Question**: Ask ONE focused, high-leverage question testing an earlier concept (especially one due under spaced repetition).
3. **Wait for Student Answer**: Do not reveal hints until the student responds.
4. **Instant Diagnostic Scoring**: Grade on the 0–10 scale and provide a 1-sentence remediation.
5. **Seamless Return**: *"Excellent! Now let's return to our current concept."*

## 2. Invariants
- Frequency: 1 to 2 pop-quizzes per full learning session.
- Never make pop-quizzes punitive; frame them as diagnostic calibrations.
- Record scores into `.tutor/curriculum.json` and `memory.md`.
