import "server-only";
import { NextResponse } from "next/server";
import { HttpError } from "./auth";
import { hasDb } from "./db";

/** Wraps a route handler: JSON in/out, HttpError becomes its status, anything else a generic 500. */
export function api<A extends unknown[]>(fn: (...args: A) => Promise<unknown>, opts: { db?: boolean } = {}) {
  return async (...args: A) => {
    try {
      if (opts.db && !hasDb()) {
        return NextResponse.json({ error: "This feature needs the database, which is not configured on this deployment yet.", needsDb: true }, { status: 503 });
      }
      const out = await fn(...args);
      if (out instanceof Response) return out;
      return NextResponse.json(out ?? { ok: true }, { headers: { "cache-control": "no-store" } });
    } catch (e) {
      if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
      if (e && typeof e === "object" && "issues" in e) return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });
      console.error("api error", e);
      return NextResponse.json({ error: "Something went wrong on our side. Please try again." }, { status: 500 });
    }
  };
}
