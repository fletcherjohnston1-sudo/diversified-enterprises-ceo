import Database from 'better-sqlite3';
import { readdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

const dbPath = join(process.cwd(), 'database', 'mission-control.db');
const schemaPath = join(process.cwd(), 'database', 'schema.sql');
const migrationsPath = join(process.cwd(), 'database', 'migrations');

// Ensure database directory exists
import { mkdirSync } from 'fs';
const dbDir = join(process.cwd(), 'database');
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Check if this is a fresh database
const tablesExist = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'").get();

// Initialize schema on first run
if (!tablesExist && existsSync(schemaPath)) {
  console.log('Initializing database from schema.sql...');
  const schema = readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  console.log('Database schema initialized.');
}

// Create migrations tracking table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Run pending migrations
if (existsSync(migrationsPath)) {
  const appliedMigrations = new Set(
    (db.prepare('SELECT name FROM migrations').all() as { name: string }[])
      .map((row) => row.name)
  );

  const migrationFiles = readdirSync(migrationsPath)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of migrationFiles) {
    if (!appliedMigrations.has(file)) {
      console.log(`Running migration: ${file}`);
      const migration = readFileSync(join(migrationsPath, file), 'utf-8');
      
      try {
        db.exec(migration);
        db.prepare('INSERT INTO migrations (name) VALUES (?)').run(file);
        console.log(`Migration ${file} applied successfully.`);
      } catch (err: any) {
        // Ignore "already exists" errors (re-runnable migrations)
        if (!err.message.includes('duplicate column name') && 
            !err.message.includes('already exists')) {
          console.error(`Migration ${file} failed:`, err.message);
          throw err;
        }
        // Still mark as applied even if columns already exist
        db.prepare('INSERT OR IGNORE INTO migrations (name) VALUES (?)').run(file);
      }
    }
  }
}

// Database API
const database = {
  tasks: {
    findAll: (filters?: { status?: string; project_id?: number; source_conversation_id?: number }) => {
      let query = 'SELECT * FROM tasks';
      const conditions: string[] = [];
      const params: any[] = [];

      if (filters?.status) {
        conditions.push('status = ?');
        params.push(filters.status);
      }
      if (filters?.project_id) {
        conditions.push('project_id = ?');
        params.push(filters.project_id);
      }
      if (filters?.source_conversation_id !== undefined) {
        conditions.push('source_conversation_id = ?');
        params.push(filters.source_conversation_id);
      }

      if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      query += ' ORDER BY created_at DESC';

      return db.prepare(query).all(...params) as any[];
    },

    findById: (id: number) => {
      return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as any;
    },

    create: (data: { title: string; description?: string | null; project_id: number; status: string; priority: string; source_conversation_id?: number | null }) => {
      const stmt = db.prepare(`
        INSERT INTO tasks (title, description, project_id, status, priority, source_conversation_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        data.title,
        data.description || null,
        data.project_id,
        data.status,
        data.priority,
        data.source_conversation_id || null
      );
      return database.tasks.findById(result.lastInsertRowid as number);
    },

    update: (id: number, data: { title?: string; description?: string | null; project_id?: number; status?: string; priority?: string; source_conversation_id?: number | null }) => {
      const updates: string[] = [];
      const params: any[] = [];

      if (data.title !== undefined) {
        updates.push('title = ?');
        params.push(data.title);
      }
      if (data.description !== undefined) {
        updates.push('description = ?');
        params.push(data.description);
      }
      if (data.project_id !== undefined) {
        updates.push('project_id = ?');
        params.push(data.project_id);
      }
      if (data.status !== undefined) {
        updates.push('status = ?');
        params.push(data.status);
      }
      if (data.priority !== undefined) {
        updates.push('priority = ?');
        params.push(data.priority);
      }
      if (data.source_conversation_id !== undefined) {
        updates.push('source_conversation_id = ?');
        params.push(data.source_conversation_id);
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);

      db.prepare('UPDATE tasks SET ' + updates.join(', ') + ' WHERE id = ?').run(...params);
      return database.tasks.findById(id);
    },

    delete: (id: number) => {
      return db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    },
  },

  projects: {
    findAll: () => {
      return db.prepare('SELECT * FROM projects ORDER BY name').all() as any[];
    },

    findById: (id: number) => {
      return db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
    },

    findByName: (name: string) => {
      return db.prepare('SELECT * FROM projects WHERE name = ?').get(name) as any;
    },

    findByKeyword: (keyword: string) => {
      const search = '%' + keyword.toLowerCase() + '%';
      return db.prepare(
        'SELECT * FROM projects WHERE keywords LIKE ? OR LOWER(name) LIKE ? ORDER BY name'
      ).all(search, search) as any[];
    },

    create: (data: { name: string; color?: string; icon?: string; keywords?: string }) => {
      const stmt = db.prepare(`
        INSERT INTO projects (name, color, icon, keywords)
        VALUES (?, ?, ?, ?)
      `);
      const result = stmt.run(
        data.name,
        data.color || '#8B5CF6',
        data.icon || null,
        data.keywords || null
      );
      return database.projects.findById(result.lastInsertRowid as number);
    },

    updateKeywords: (id: number, keywords: string) => {
      return db.prepare('UPDATE projects SET keywords = ? WHERE id = ?').run(keywords, id);
    },
  },

  conversations: {
    findAll: (filters?: { channel?: string; sender_id?: string; limit?: number }) => {
      let query = 'SELECT * FROM conversations WHERE is_archived = 0';
      const conditions: string[] = [];
      const params: any[] = [];

      if (filters?.channel) {
        conditions.push('channel = ?');
        params.push(filters.channel);
      }
      if (filters?.sender_id) {
        conditions.push('sender_id = ?');
        params.push(filters.sender_id);
      }

      if (conditions.length) {
        query += ' AND ' + conditions.join(' AND ');
      }
      query += ' ORDER BY timestamp DESC';

      if (filters?.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
      }

      return db.prepare(query).all(...params) as any[];
    },

    findById: (id: number) => {
      return db.prepare('SELECT * FROM conversations WHERE id = ?').get(id) as any;
    },

    findByMessageId: (messageId: string) => {
      return db.prepare('SELECT * FROM conversations WHERE message_id = ?').get(messageId) as any;
    },

    create: (data: { message_id: string; channel: string; sender_id?: string | null; sender_name?: string | null; content: string; timestamp: string; metadata?: string | null }) => {
      const stmt = db.prepare(`
        INSERT INTO conversations (message_id, channel, sender_id, sender_name, content, timestamp, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        data.message_id,
        data.channel,
        data.sender_id || null,
        data.sender_name || null,
        data.content,
        data.timestamp,
        data.metadata || null
      );
      return database.conversations.findById(result.lastInsertRowid as number);
    },

    archive: (id: number) => {
      return db.prepare('UPDATE conversations SET is_archived = 1 WHERE id = ?').run(id);
    },

    delete: (id: number) => {
      return db.prepare('DELETE FROM conversations WHERE id = ?').run(id);
    },
  },

  // Direct database access for advanced queries
  raw: db,
};

export { database };
export default database;
