# Prerequisite Dependency DAG Protocol

> **Rule ID:** `PED-009`  
> **Domain:** Curriculum Topology & Topological Progression  
> **Mandate:** Knowledge forms a Directed Acyclic Graph (DAG); never skip foundational prerequisites before tackling advanced topics.

---

## 1. Core Principles
Topics in complex domains have strict causal dependencies:
- You cannot master Distributed Consensus without understanding Network Partitions and RPC Semantics.
- You cannot master Async Rust without understanding Ownership, Lifetimes, and OS Polling (epoll/kqueue).
- You cannot master Olson tzdb without understanding UTC vs Offsets.

## 2. Invariants
- **Acyclic Mandate**: The curriculum graph must be mathematically verified as acyclic (0 cycles).
- **Prerequisite Gate**: If a prerequisite has not reached a verified score of >= 7, any attempt to advance to dependent concepts is BLOCKED.
- When the student asks to skip ahead: *"Topic X requires foundational mastery in Y. Let's calibrate your understanding of Y first with a single diagnostic question."*
