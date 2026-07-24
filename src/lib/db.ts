import postgres from "postgres";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

// Postgres (Supabase) data layer. Async throughout — there is no synchronous
// Postgres driver. Queries use "$name" placeholders + a params object, which a
// small adapter rewrites into positional $1..$n. camelCase identifiers are
// double-quoted in the SQL so Postgres preserves their case.

declare global {
  // eslint-disable-next-line no-var
  var __amplygoSql: ReturnType<typeof postgres> | undefined;
}

// Lazily connect on first query so importing this module (e.g. during
// `next build`) never fails when DATABASE_URL isn't present yet.
export function sql(): ReturnType<typeof postgres> {
  if (!global.__amplygoSql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Point it at your Supabase Postgres connection string " +
          "(Supabase → Project Settings → Database → Connection string → URI)."
      );
    }
    global.__amplygoSql = postgres(url, {
      ssl: "require",
      max: 5,
      idle_timeout: 20,
      connect_timeout: 15,
      prepare: false, // safe with the Supabase connection pooler
      onnotice: () => {}, // quiet "already exists" notices from ensureSchema
    });
  }
  return global.__amplygoSql;
}

type SqlParams = Record<string, unknown>;

/** Rewrite "$name" placeholders + params object into positional $1..$n. */
function positional(text: string, params: SqlParams) {
  const values: unknown[] = [];
  const out = text.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (_m, name: string) => {
    values.push(params[name] === undefined ? null : params[name]);
    return "$" + values.length;
  });
  return { out, values };
}

export async function run(text: string, params: SqlParams = {}): Promise<void> {
  const { out, values } = positional(text, params);
  await sql().unsafe(out, values as any[]);
}

export async function get<T = any>(text: string, params: SqlParams = {}): Promise<T | undefined> {
  const { out, values } = positional(text, params);
  const rows = await sql().unsafe(out, values as any[]);
  return (rows as any)[0] as T | undefined;
}

export async function all<T = any>(text: string, params: SqlParams = {}): Promise<T[]> {
  const { out, values } = positional(text, params);
  const rows = await sql().unsafe(out, values as any[]);
  return rows as unknown as T[];
}

export function newId(): string {
  return randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

// Creates tables/indexes if they don't exist. Run once at deploy/seed time.
let schemaReady: Promise<void> | null = null;
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    const schemaPath = path.join(process.cwd(), "src", "lib", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");
    schemaReady = sql().unsafe(schema).then(() => undefined);
  }
  return schemaReady;
}
