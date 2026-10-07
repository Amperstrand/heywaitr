/**
 * Transport-level failure. A thrown HeywaitrError
 * (reason "network") means unreachable; null from a client method always
 * means the platform answered: absent. Add further reasons ONLY for
 * protocol failures callers must discriminate, and document each.
 */
export type FailureReason = "network";

export class HeywaitrError extends Error {
  constructor(readonly reason: FailureReason, message: string) {
    super(message);
    this.name = "HeywaitrError";
  }
}

export function isTransportFailure(error: unknown): boolean {
  return error instanceof Error || typeof DOMException === "function" && error instanceof DOMException;
}
