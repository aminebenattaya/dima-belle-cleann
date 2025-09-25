// src/lib/errors.ts

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

/**
 * A custom error class for Firestore permission errors that includes
 * additional context about the failed request. This helps in debugging
 * security rules by providing detailed information about the operation
 * that was denied.
 */
export class FirestorePermissionError extends Error {
  public readonly context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const message = `Firestore Permission Denied: Cannot ${context.operation} on path '${context.path}'.`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;

    // This is necessary for proper Error subclassing in TypeScript
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }
}
