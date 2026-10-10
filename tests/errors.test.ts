import { ScaffoldError, ERROR_CODES } from '../src/errors.js';

describe('Error Hierarchy & Codes', () => {
  it('instantiates ScaffoldError with stable code and target', () => {
    const err = new ScaffoldError('E_TARGET_IS_PROTECTED', 'Target is protected', '/');
    expect(err.code).toBe('E_TARGET_IS_PROTECTED');
    expect(err.target).toBe('/');
    expect(err.message).toBe('Target is protected');
    expect(err.name).toBe('ScaffoldError');
  });

  it('exposes ERROR_CODES lookup table', () => {
    expect(ERROR_CODES.TARGET_IS_PROTECTED).toBe('E_TARGET_IS_PROTECTED');
    expect(ERROR_CODES.DAG_CYCLE_DETECTED).toBe('E_DAG_CYCLE_DETECTED');
    expect(ERROR_CODES.SPOONFEED_BLOCKED).toBe('E_SPOONFEED_BLOCKED');
  });
});
