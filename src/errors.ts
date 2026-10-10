/**
 * Union of machine-readable error codes across the aisensei engine.
 */
export type ScaffoldErrorCode =
  | 'E_TARGET_IS_TEMPLATE'
  | 'E_TARGET_NOT_EMPTY'
  | 'E_TARGET_IS_PROTECTED'
  | 'E_PATH_ESCAPE'
  | 'E_GIT_ARGS_INVALID'
  | 'E_GIT_BLOCKED'
  | 'E_DAG_CYCLE_DETECTED'
  | 'E_PREREQUISITE_UNMET'
  | 'E_SPOONFEED_BLOCKED'
  | 'E_SCORE_OUT_OF_BOUNDS'
  | 'E_COGNITIVE_OVERLOAD'
  | 'E_INVALID_CURRICULUM';

/**
 * Shape of custom aisensei errors containing error codes and optional targets.
 */
export interface ScaffoldErrorShape extends Error {
  /** Machine-readable error code */
  code: ScaffoldErrorCode;
  /** Optional file or directory target associated with the error */
  target?: string;
}

/**
 * Custom error class thrown for scaffolding, target validation, and DAG violations.
 */
export class ScaffoldError extends Error implements ScaffoldErrorShape {
  /** Machine-readable error code */
  public readonly code: ScaffoldErrorCode;
  /** Optional target path associated with the error */
  public readonly target?: string;

  /**
   * Constructs a new ScaffoldError instance.
   * @param code Machine-readable error code.
   * @param message Human-readable error message.
   * @param target Optional target path related to the error.
   */
  constructor(code: ScaffoldErrorCode, message: string, target?: string) {
    super(message);
    this.name = 'ScaffoldError';
    this.code = code;
    this.target = target;
    Object.setPrototypeOf(this, ScaffoldError.prototype);
  }
}

/**
 * Lookup dictionary of standard machine-readable error code constants.
 */
export const ERROR_CODES = {
  TARGET_IS_TEMPLATE: 'E_TARGET_IS_TEMPLATE' as const,
  TARGET_NOT_EMPTY: 'E_TARGET_NOT_EMPTY' as const,
  TARGET_IS_PROTECTED: 'E_TARGET_IS_PROTECTED' as const,
  PATH_ESCAPE: 'E_PATH_ESCAPE' as const,
  GIT_ARGS_INVALID: 'E_GIT_ARGS_INVALID' as const,
  GIT_BLOCKED: 'E_GIT_BLOCKED' as const,
  DAG_CYCLE_DETECTED: 'E_DAG_CYCLE_DETECTED' as const,
  PREREQUISITE_UNMET: 'E_PREREQUISITE_UNMET' as const,
  SPOONFEED_BLOCKED: 'E_SPOONFEED_BLOCKED' as const,
  SCORE_OUT_OF_BOUNDS: 'E_SCORE_OUT_OF_BOUNDS' as const,
  COGNITIVE_OVERLOAD: 'E_COGNITIVE_OVERLOAD' as const,
  INVALID_CURRICULUM: 'E_INVALID_CURRICULUM' as const
};
