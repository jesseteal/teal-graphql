import { describe, expect, it } from "vitest";
import { sanitizeMutationInput } from "../src/input.js";

describe("sanitizeMutationInput", () => {
  it("removes GraphQL metadata and undefined fields", () => {
    expect(
      sanitizeMutationInput({
        __typename: "User",
        id: "1",
        ignored: undefined,
      }),
    ).toEqual({
      id: "1",
    });
  });

  it("normalizes empty strings recursively", () => {
    expect(
      sanitizeMutationInput({
        name: "   ",
        profile: {
          __typename: "Profile",
          bio: "",
        },
        tags: ["", "active"],
      }),
    ).toEqual({
      name: null,
      profile: {
        bio: null,
      },
      tags: [null, "active"],
    });
  });

  it("applies audit fields after sanitizing input", () => {
    expect(
      sanitizeMutationInput(
        {
          updatedBy: "stale",
        },
        {
          field: "updatedBy",
          value: "current-user",
        },
      ),
    ).toEqual({
      updatedBy: "current-user",
    });
  });
});
