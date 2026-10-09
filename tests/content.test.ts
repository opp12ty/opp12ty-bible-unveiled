import { describe, it, expect } from "vitest";
import { ALL, brokenLinks, search, daily, graph, key, TIMELINE, JOURNEYS, get } from "@/content";

describe("content integrity", () => {
  it("has no broken links or unknown sources", () => {
    expect(brokenLinks()).toEqual([]);
  });
  it("has unique keys", () => {
    const keys = ALL.map(key);
    expect(new Set(keys).size).toBe(keys.length);
  });
  it("every entry names at least one source", () => {
    for (const e of ALL) expect(e.sources.length, key(e)).toBeGreaterThan(0);
  });
  it("timeline links and journeys resolve", () => {
    for (const t of TIMELINE) if (t.link) expect(get(t.link), t.id).toBeTruthy();
    for (const j of JOURNEYS) for (const s of j.steps) expect(get(s), `${j.slug}:${s}`).toBeTruthy();
  });
  it("search finds Goliath and the graph is connected", () => {
    expect(search("goliath").length).toBeGreaterThan(1);
    expect(graph("investigations/goliaths-height").nodes.length).toBeGreaterThan(4);
    expect(daily(new Date("2026-10-09"))).toBeTruthy();
  });
});
