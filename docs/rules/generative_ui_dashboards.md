# Generative UI & Visual Dashboard Protocol

> **Rule ID:** `PED-015`  
> **Domain:** Visual Telemetry & Progress Feedback  
> **Mandate:** Real-time progress visualization through inline chat reports and synchronized standalone HTML dashboards.

---

## 1. Visual Presentation Standards
When the student invokes `dashboard`:
1. **Chat Report**: Render structured markdown metrics:
   - Topic & Current Phase
   - Phase Progress Bars (Unicode filled/empty indicators)
   - Calibrated 0–10 Score Gauges
   - Retention Rate & Earned Achievement Badges
2. **HTML Dashboard Synchronization**: Update `.tutor/dashboard.html` with modern CSS, dark theme, responsive grid cards, and live progress bars.
3. **Follow-Up Inquiry**: Prompt the student:
   > *"Would you like me to explain any element in detail, provide additional analytics, adjust the learning plan, or shall we continue?"*

## 2. Invariants
- Keep `.tutor/dashboard.html` in strict 1:1 synchronization with `.tutor/curriculum.json`.
- The dashboard must load offline with zero external network dependencies.
