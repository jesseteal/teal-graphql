import { describe, expect, it, vi } from "vitest";
import { evictCacheFields, normalizeCacheEvictTargets } from "../src/cache.js";

describe("normalizeCacheEvictTargets", () => {
  it("normalizes comma-separated strings and arrays", () => {
    expect(normalizeCacheEvictTargets("users, posts ,, comments")).toEqual([
      "users",
      "posts",
      "comments",
    ]);
    expect(normalizeCacheEvictTargets(["users", "posts"])).toEqual([
      "users",
      "posts",
    ]);
  });

  it("returns an empty list for empty targets", () => {
    expect(normalizeCacheEvictTargets()).toEqual([]);
    expect(normalizeCacheEvictTargets("")).toEqual([]);
  });
});

describe("evictCacheFields", () => {
  it("evicts root query fields and collects garbage once", () => {
    const cache = {
      evict: vi.fn(),
      gc: vi.fn(),
    };

    evictCacheFields(cache as never, "users,posts");

    expect(cache.evict).toHaveBeenCalledWith({
      fieldName: "users",
      id: "ROOT_QUERY",
    });
    expect(cache.evict).toHaveBeenCalledWith({
      fieldName: "posts",
      id: "ROOT_QUERY",
    });
    expect(cache.gc).toHaveBeenCalledOnce();
  });

  it("does not collect garbage when there is nothing to evict", () => {
    const cache = {
      evict: vi.fn(),
      gc: vi.fn(),
    };

    evictCacheFields(cache as never);

    expect(cache.evict).not.toHaveBeenCalled();
    expect(cache.gc).not.toHaveBeenCalled();
  });
});
