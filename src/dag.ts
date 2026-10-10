import { ScaffoldError, ERROR_CODES } from './errors.js';

/**
 * Node representing an individual learning concept in the prerequisite graph.
 */
export interface ConceptNode {
  /** Unique concept identifier */
  id: string;
  /** Human-readable concept title */
  name: string;
  /** Associated Bloom's taxonomy learning phase */
  phase?: 'Foundation' | 'Development' | 'Advanced' | 'Mastery';
  /** Array of prerequisite concept IDs required before learning this node */
  prerequisites: string[];
}

/**
 * Directed graph mapping concept IDs to ConceptNode entries.
 */
export type ConceptGraph = Record<string, ConceptNode>;

/**
 * Evaluated mastery and progression state for an individual concept node.
 */
export interface MasteryEvaluation {
  /** Unique concept identifier */
  id: string;
  /** Concept title */
  name: string;
  /** Progression status based on prerequisite clearance and calibrated score */
  status: 'locked' | 'unlocked' | 'in_progress' | 'mastered';
  /** Current calibrated mastery score (0-10 scale) */
  score?: number;
  /** List of unmet prerequisite concept IDs blocking this concept */
  missingPrerequisites: string[];
}

/**
 * Spaced repetition memory decay telemetry based on Ebbinghaus forgetting curves.
 */
export interface RetentionStatus {
  /** Concept identifier */
  id: string;
  /** Concept title */
  name: string;
  /** Elapsed days since last effortful recall practice */
  daysSinceReview: number;
  /** Target Leitner interval days for current repetition stage */
  targetIntervalDays: number;
  /** True if elapsed days exceed scheduled target interval */
  isDueForReview: boolean;
  /** Estimated remaining retention rate (0.0 to 1.0) */
  retentionDecayEstimate: number;
}

/**
 * Detects cycles in a prerequisite dependency graph using Tarjan's DFS cycle detection.
 *
 * @param graph - The concept dependency graph to inspect
 * @returns Array representing cycle path if cyclic, or null if acyclic
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
 * Performs Kahn's algorithm topological sort on the prerequisite DAG.
 * Returns concept IDs ordered in their optimal topological learning sequence.
 *
 * @param graph - Prerequisite concept graph
 * @returns Array of concept IDs in dependency-resolved order
 * @throws {ScaffoldError} When a cyclic dependency loop is detected
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

    for (const next of dependents[curr]!) {
      inDegree[next]! -= 1;
      if (inDegree[next] === 0) {
        queue.push(next);
      }
    }
  }

  return sorted;
}

/**
 * Evaluates unlock status and mastery gates across the concept graph.
 * Progression requires score >= masteryThreshold (defaults to 7.0 / 10).
 *
 * @param graph - Concept dependency graph
 * @param scores - Dictionary of calibrated learner scores (0-10)
 * @param masteryThreshold - Gate score threshold (defaults to 7)
 * @returns Dictionary mapping concept IDs to MasteryEvaluation records
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
 * Calculates Ebbinghaus spaced repetition memory decay and scheduled review intervals.
 * Uses calibrated Leitner intervals (1, 3, 7, 14, 30, 60 days).
 *
 * @param conceptId - Concept identifier
 * @param conceptName - Concept title
 * @param lastReviewedIso - ISO timestamp string of the last review session
 * @param repetitionCount - Count of successful recalls completed
 * @param score - Most recent score on the 0-10 scale
 * @param now - Reference current Date (defaults to new Date())
 * @returns RetentionStatus object with retention rate and due date calculation
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
    0.05,
    Math.min(1.0, Math.exp(-daysSinceReview / Math.max(0.1, stability)))
  );

  const isDueForReview = daysSinceReview >= targetIntervalDays;

  return {
    id: conceptId,
    name: conceptName,
    daysSinceReview,
    targetIntervalDays,
    isDueForReview,
    retentionDecayEstimate
  };
}

/** Default DAG and prerequisite graph module exports. */
export default {
  detectPrerequisiteCycles,
  topologicalSort,
  evaluateGraphMastery,
  calculateRetention
};
