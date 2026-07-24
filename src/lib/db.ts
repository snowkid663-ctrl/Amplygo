import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

// Single shared SQLite connection for the whole server process.
// Uses Node's built-in node:sqlite (Node >=22.5) so there is no native
// binary to download/compile - important in network-restricted environments.

declare global {
  // eslint-disable-next-line no-var
  var __amplygoDb: DatabaseSync | undefined;
}

function bootstrap(): DatabaseSync {
  // Configurable so a persistent disk (e.g. Render Disk) can be mounted and
  // pointed at via SQLITE_PATH; defaults to a local file for dev.
  const dbPath = process.env.SQLITE_PATH || path.join(process.cwd(), "dev.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const database = new DatabaseSync(dbPath);
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec("PRAGMA journal_mode = WAL;");
  const schemaPath = path.join(process.cwd(), "src", "lib", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  database.exec(schema);
  migrate(database);
  return database;
}

/**
 * Lightweight, idempotent migrations for columns added after a database was
 * first created. `CREATE TABLE IF NOT EXISTS` never alters an existing table,
 * so new columns must be added explicitly for older dev.db files.
 */
function migrate(database: DatabaseSync) {
  const addColumn = (table: string, column: string, decl: string) => {
    const cols = database.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    if (!cols.some((c) => c.name === column)) {
      database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${decl}`);
    }
  };
  addColumn("companies", "logoUrl", "TEXT");
  addColumn("companies", "bannerUrl", "TEXT");
  addColumn("creators", "avatarUrl", "TEXT");
  addColumn("creators", "bannerUrl", "TEXT");
  addColumn("social_accounts", "externalId", "TEXT");
  addColumn("social_accounts", "connectedVia", "TEXT NOT NULL DEFAULT 'MANUAL'");
  addColumn("companies", "currency", "TEXT NOT NULL DEFAULT 'USD'");
  addColumn("creators", "displayCurrency", "TEXT NOT NULL DEFAULT 'USD'");
  addColumn("payouts", "currency", "TEXT NOT NULL DEFAULT 'USD'");
}

export const db: DatabaseSync = global.__amplygoDb ?? bootstrap();
if (process.env.NODE_ENV !== "production") global.__amplygoDb = db;

type SqlParams = Record<string, unknown>;

/** Run a statement with no expected rows returned (INSERT/UPDATE/DELETE). */
export function run(sql: string, params: SqlParams = {}) {
  const stmt = db.prepare(sql);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return stmt.run(namedParams(params) as any);
}

/** Get a single row or undefined. */
export function get<T = any>(sql: string, params: SqlParams = {}): T | undefined {
  const stmt = db.prepare(sql);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return stmt.get(namedParams(params) as any) as T | undefined;
}

/** Get all matching rows. */
export function all<T = any>(sql: string, params: SqlParams = {}): T[] {
  const stmt = db.prepare(sql);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return stmt.all(namedParams(params) as any) as T[];
}

// node:sqlite expects named params keyed as "$name" -> convert plain object.
function namedParams(params: SqlParams): SqlParams {
  const out: SqlParams = {};
  for (const [key, value] of Object.entries(params)) {
    out[`$${key}`] = value === undefined ? null : value;
  }
  return out;
}

export function newId(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}
