/**
 * Local development PostgreSQL: a real Postgres engine (PGlite/WASM) on the wire protocol at 127.0.0.1:5433.
 * Production uses a managed Postgres (e.g. Neon); the SQL is identical.
 *   node scripts/dev-db.mjs
 *   DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5433/postgres npm run dev
 */
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import fs from "node:fs";

const port = Number(process.env.LOCAL_DB_PORT ?? 5433);
fs.mkdirSync(".data", { recursive: true });
const db = await PGlite.create(process.env.LOCAL_DB_DIR ?? ".data/pglite");
const server = new PGLiteSocketServer({ db, port, host: "127.0.0.1", maxConnections: 5 });
await server.start();
console.log(`Local PostgreSQL (PGlite) on postgres://postgres:postgres@127.0.0.1:${port}/postgres`);
const stop = async () => { await server.stop(); await db.close(); process.exit(0); };
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
