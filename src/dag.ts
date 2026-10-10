import { ScaffoldError, ERROR_CODES } from './errors.js';

export interface ConceptNode {
  id: string;
  name: string;
  phase?: 'Foundation' | 'Development' | 'Advanced' | 'Mastery';
  prerequisites: string[];
}

export type ConceptGraph = Record<string, ConceptNode>;

export interface MasteryEvaluation {
  id: string;
  name: string;
  status: 'locked' | 'unlocked' | 'in_progress' | 'mastered';
  score?: number;
  missingPrerequisites: string[];
}

export interface RetentionStatus {
  id: string;
  name: string;
  daysSinceReview: number;
  targetIntervalDays: number;
  isDueForReview: boolean;
  retentionDecayEstimate: number; // 0.0 - 1.0 (estimated retention)
}

/**
 * Detects cycles in a prerequisite dependency graph using Tarjan's / DFS cycle detection.
 * Returns null if acyclic, or the cycle path as an array of IDs if cyclic.
 */
export function detectPrerequisiteCycles(graph: ConceptGraph): string[] | null {
  const visited = new Set<string>();
  const inStack = new Set<string>();
  const stack: string[] = [];

  function dfs(nodeId: string): string[] | null {
    visited.add(nodeId);
    inStack.add(nodeId);
    stack.push(nodeId);

    const node = graph[nodeId];
    if (node) {
      for (const prereqId of node.prerequisites) {
        if (!visited.has(prereqId)) {
          const cycle = dfs(prereqId);
          if (cycle) return cycle;
        } else if (inStack.has(prereqId)) {
          const cycleStartIndex = stack.indexOf(prereqId);
          return stack.slice(cycleStartIndex).concat(prereqId);
        }
      }
    }

    stack.pop();
    inStack.delete(nodeId);
    return null;
  }

  for (const id of Object.keys(graph)) {
    if (!visited.has(id)) {
      const cycle = dfs(id);
      if (cycle) return cycle;
    }
  }

  return null;
}

/**
 * Performs topological sort on the prerequisite DAG.
 * Returns concept IDs in optimal learning sequence.
 */
export function topologicalSort(graph: ConceptGraph): string[] {
  const cycle = detectPrerequisiteCycles(graph);
  if (cycle) {
    throw new ScaffoldError(
      'E_DAG_CYCLE_DETECTED',
      `${ERROR_CODES.DAG_CYCLE_DETECTED}: ${cycle.join(' -> ')}`
    );
  }

  const inDegree: Record<string, number> = {};
  const dependents: Record<string, string[]> = {};

  for (const id of Object.keys(graph)) {
    inDegree[id] = 0;
    dependents[id] = [];
  }

  for (const [id, node] of Object.entries(graph)) {
    for (const prereqId of node.prerequisites) {
      if (graph[prereqId]) {
        dependents[prereqId]!.push(id);
        inDegree[id] = (inDegree[id] || 0) + 1;
      }
    }
  }

  const queue: string[] = [];
  for (const [id, deg] of Object.entries(inDegree)) {
    if (deg === 0) queue.push(id);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    sorted.push(curr);

    for (const next of dependents[curr] || []) {
      inDegree[next]! -= 1;
      if (inDegree[next] === 0) {
        queue.push(next);
      }
    }
  }

  return sorted;
}

/**
 * Evaluates mastery and unlock status across the graph.
 * Mastery threshold defaults to 7 (out of 10).
 */
export function evaluateGraphMastery(
  graph: ConceptGraph,
  scores: Record<string, number>,
  masteryThreshold = 7
): Record<string, MasteryEvaluation> {
  const results: Record<string, MasteryEvaluation> = {};

  for (const [id, node] of Object.entries(graph)) {
    const score = scores[id];
    const isMastered = typeof score === 'number' && score >= masteryThreshold;

    const missingPrerequisites: string[] = [];
    for (const prereq of node.prerequisites) {
      const prereqScore = scores[prereq];
      if (typeof prereqScore !== 'number' || prereqScore < masteryThreshold) {
        missingPrerequisites.push(prereq);
      }
    }

    let status: 'locked' | 'unlocked' | 'in_progress' | 'mastered';
    if (isMastered) {
      status = 'mastered';
    } else if (missingPrerequisites.length > 0) {
      status = 'locked';
    } else if (typeof score === 'number' && score > 0) {
      status = 'in_progress';
    } else {
      status = 'unlocked';
    }

    results[id] = {
      id,
      name: node.name,
      status,
      score,
      missingPrerequisites
    };
  }

  return results;
}

/**
 * Calculates Ebbinghaus spaced repetition decay and due dates.
 * Standard Leitner intervals: 1, 3, 7, 14, 30, 60 days.
 */
export function calculateRetention(
  conceptId: string,
  conceptName: string,
  lastReviewedIso: string,
  repetitionCount: number,
  score: number,
  now: Date = new Date()
): RetentionStatus {
  const intervals = [1, 3, 7, 14, 30, 60];
  const intervalIndex = Math.min(Math.max(0, repetitionCount), intervals.length - 1);
  const targetIntervalDays = intervals[intervalIndex]!;

  const lastReview = new Date(lastReviewedIso);
  const diffMs = now.getTime() - lastReview.getTime();
  const daysSinceReview = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  // Half-life decay model: R = e^(-t / S), where S scales with repetition & score
  const stability = targetIntervalDays * (score / 10);
  const retentionDecayEstimate = Math.max(
    0,
    Math.min(1, Math.exp(-daysSinceReview / Math.max(1, stability)))
  );

  const isDueForReview = daysSinceReview >= targetIntervalDays;

  return {
    id: conceptId,
    name: conceptName,
    daysSinceReview,
    targetIntervalDays,
    isDueForReview,
    retentionDecayEstimate: Math.round(retentionDecayEstimate * 100) / 100
  };
}
