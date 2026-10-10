import {
  detectPrerequisiteCycles,
  topologicalSort,
  evaluateGraphMastery,
  calculateRetention
} from '../src/dag.js';
import type { ConceptGraph } from '../src/dag.js';

describe('Prerequisite DAG Engine', () => {
  it('detects acyclic graph correctly', () => {
    const graph: ConceptGraph = {
      math1: { id: 'math1', name: 'Algebra', prerequisites: [] },
      math2: { id: 'math2', name: 'Calculus', prerequisites: ['math1'] },
      math3: { id: 'math3', name: 'Differential Equations', prerequisites: ['math2'] }
    };
    expect(detectPrerequisiteCycles(graph)).toBeNull();
  });

  it('detects cycle in cyclic prerequisite graph', () => {
    const graph: ConceptGraph = {
      a: { id: 'a', name: 'Concept A', prerequisites: ['b'] },
      b: { id: 'b', name: 'Concept B', prerequisites: ['c'] },
      c: { id: 'c', name: 'Concept C', prerequisites: ['a'] }
    };
    const cycle = detectPrerequisiteCycles(graph);
    expect(cycle).not.toBeNull();
    expect(cycle).toContain('a');
  });

  it('sorts acyclic graph in topological order', () => {
    const graph: ConceptGraph = {
      c: { id: 'c', name: 'Advanced C', prerequisites: ['b'] },
      b: { id: 'b', name: 'Intermediate B', prerequisites: ['a'] },
      a: { id: 'a', name: 'Intro A', prerequisites: [] }
    };
    const sorted = topologicalSort(graph);
    expect(sorted).toEqual(['a', 'b', 'c']);
  });

  it('throws on topologicalSort when cycle exists', () => {
    const graph: ConceptGraph = {
      a: { id: 'a', name: 'A', prerequisites: ['b'] },
      b: { id: 'b', name: 'B', prerequisites: ['a'] }
    };
    expect(() => topologicalSort(graph)).toThrow('E_DAG_CYCLE_DETECTED');
  });

  it('evaluates mastery and unlock status across graph', () => {
    const graph: ConceptGraph = {
      intro: { id: 'intro', name: 'Intro', prerequisites: [] },
      deep: { id: 'deep', name: 'Deep', prerequisites: ['intro'] },
      expert: { id: 'expert', name: 'Expert', prerequisites: ['deep'] }
    };

    // Intro has 8 (mastered), deep has 0, expert has none
    const scores = { intro: 8, deep: 4 };
    const evaluated = evaluateGraphMastery(graph, scores, 7);

    expect(evaluated.intro?.status).toBe('mastered');
    expect(evaluated.deep?.status).toBe('in_progress');
    expect(evaluated.expert?.status).toBe('locked');
    expect(evaluated.expert?.missingPrerequisites).toContain('deep');
  });

  it('calculates retention decay and scheduled intervals', () => {
    const now = new Date('2026-10-10T12:00:00Z');
    const past = new Date('2026-10-09T12:00:00Z').toISOString(); // 1 day ago

    const retention = calculateRetention('c1', 'Concept 1', past, 0, 8, now);
    expect(retention.daysSinceReview).toBe(1);
    expect(retention.targetIntervalDays).toBe(1);
    expect(retention.isDueForReview).toBe(true);
    expect(retention.retentionDecayEstimate).toBeGreaterThan(0);
  });
});
