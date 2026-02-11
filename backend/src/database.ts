import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Main database for app management
const mainDb = new Database(path.join(DATA_DIR, 'main.sqlite'));
mainDb.pragma('journal_mode = WAL');

mainDb.exec(`
  CREATE TABLE IF NOT EXISTS apps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    api_key TEXT UNIQUE NOT NULL,
    secret_key TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Cache open app database connections
const appDbCache = new Map<string, Database.Database>();

export function getMainDb(): Database.Database {
    return mainDb;
}

export function getAppDb(appId: string): Database.Database {
    if (appDbCache.has(appId)) {
        return appDbCache.get(appId)!;
    }

    const dbPath = path.join(DATA_DIR, `app_${appId}.sqlite`);
    const db = new Database(dbPath);
    db.pragma('journal_mode = WAL');

    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      metadata TEXT DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_sign_in TEXT
    )
  `);

    appDbCache.set(appId, db);
    return db;
}

export function deleteAppDb(appId: string): void {
    const cached = appDbCache.get(appId);
    if (cached) {
        cached.close();
        appDbCache.delete(appId);
    }

    const dbPath = path.join(DATA_DIR, `app_${appId}.sqlite`);
    for (const suffix of ['', '-wal', '-shm']) {
        const p = dbPath + suffix;
        if (fs.existsSync(p)) fs.unlinkSync(p);
    }
}

export function getAppByApiKey(apiKey: string) {
    return mainDb.prepare('SELECT * FROM apps WHERE api_key = ?').get(apiKey) as
        | { id: string; name: string; secret_key: string }
        | undefined;
}
