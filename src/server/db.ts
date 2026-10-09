import "server-only";
import { Pool, type QueryResultRow } from "pg";

/** Optional Postgres. The public site runs without it; accounts, sync, community and the admin CMS need it. */
const url = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
export const hasDb = () => Boolean(url());

const g = globalThis as unknown as { __ubPool?: Pool; __ubSchema?: Promise<void> };

function pool(): Pool {
  if (!g.__ubPool) {
    const u = url();
    const local = /localhost|127\.0\.0\.1/.test(url);
    g.__ubPool = new Pool({ connectionString: u, max: 5, idleTimeoutMillis: 20_000, ssl: local ? undefined : { rejectUnauthorized: false } });
  }
  return g.__ubPool;
}

export const SCHEMA = `
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null default '',
  pw_hash text not null,
  role text not null default 'user',
  plan text not null default 'free',
  disabled boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create table if not exists user_state (
  user_id uuid primary key references users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_by text,
  updated_at timestamptz not null default now()
);
create table if not exists cms_entries (
  id serial primary key,
  kind text not null,
  slug text not null,
  data jsonb not null,
  status text not null default 'draft',
  version int not null default 1,
  created_by text,
  updated_by text,
  scheduled_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (kind, slug)
);
create table if not exists cms_revisions (
  id serial primary key,
  entry_id int not null references cms_entries(id) on delete cascade,
  version int not null,
  data jsonb not null,
  status text not null,
  by_user text,
  note text,
  created_at timestamptz not null default now()
);
create table if not exists questions (
  id serial primary key,
  user_id uuid references users(id) on delete set null,
  text text not null,
  topic text not null default 'general',
  status text not null default 'pending',
  votes int not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists question_votes (
  question_id int not null references questions(id) on delete cascade,
  voter text not null,
  primary key (question_id, voter)
);
create table if not exists reports (
  id serial primary key,
  path text not null,
  message text not null,
  contact text,
  status text not null default 'open',
  resolution text,
  created_at timestamptz not null default now()
);
create table if not exists audit (
  id serial primary key,
  at timestamptz not null default now(),
  actor text,
  action text not null,
  target text,
  detail jsonb
);
create table if not exists events (
  day date not null,
  name text not null,
  n int not null default 0,
  primary key (day, name)
);
`;

export async function ensureSchema() {
  if (!hasDb()) return;
  g.__ubSchema ??= pool().query(SCHEMA).then(() => undefined);
  await g.__ubSchema;
}

export async function q<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<T[]> {
  await ensureSchema();
  const r = await pool().query<T>(text, params);
  return r.rows;
}

export async function one<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<T | null> {
  return (await q<T>(text, params))[0] ?? null;
}
