import type { AuditConfig, MutationInput } from "./types.js";

/**
 * Checks whether a value can be safely traversed as a plain input object.
 *
 * usage: used internally before recursively sanitizing object values.
 */
const isPlainObject = (value: unknown): value is MutationInput =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype;

/**
 * Normalizes a single mutation input value recursively.
 *
 * usage: used internally by `sanitizeMutationInput`.
 */
const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (isPlainObject(value)) {
    return sanitizeMutationInput(value);
  }

  return value;
};

/**
 * Removes GraphQL metadata, drops undefined values, and applies audit fields.
 *
 * usage: `sanitizeMutationInput(input, { field: "updatedBy", value: userId })`.
 */
export const sanitizeMutationInput = (
  input: MutationInput,
  audit?: AuditConfig,
): MutationInput => {
  const sanitized: MutationInput = {};

  Object.entries(input).forEach(([key, value]) => {
    if (key === "__typename" || typeof value === "undefined") {
      return;
    }

    sanitized[key] = sanitizeValue(value);
  });

  if (audit) {
    sanitized[audit.field] = audit.value;
  }

  return sanitized;
};
