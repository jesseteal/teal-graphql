import { describe, expect, it } from "vitest";
import {
  assertGraphqlIdentifier,
  createCrudDocuments,
} from "../src/documents.js";

describe("assertGraphqlIdentifier", () => {
  it("accepts valid GraphQL identifiers", () => {
    expect(() => assertGraphqlIdentifier("User_123")).not.toThrow();
  });

  it("rejects invalid GraphQL identifiers", () => {
    expect(() => assertGraphqlIdentifier("bad-name")).toThrow(
      "must be a valid GraphQL identifier",
    );
  });
});

describe("createCrudDocuments", () => {
  it("requires a valid resource name before creating CRUD documents", () => {
    expect(() => createCrudDocuments("bad-name")).toThrow(
      "must be a valid GraphQL identifier",
    );
  });

  it("omits the update document when no selection is provided", () => {
    expect(createCrudDocuments("User").update).toBeUndefined();
  });
});
