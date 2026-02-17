import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'database', 'mission-control.db');
const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
const migrationsDir = path.join(process.cwd(), 'database', 'migrations');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize database if empty
const tableCount = db.prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table'").get() as { count: number };

if (tableCount.count === 0) {
  console.log('Initializing database from schema...');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  console.log('Database initialized.');
}

// Run migrations
if (fs.existsSync(migrationsDir)) {
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of migrationFiles) {
    try {
      const migration = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      db.exec(migration);
      console.log(`Migration applied: ${file}`);
    } catch (error: any) {
      if (!error.message.includes('duplicate column name') && !error.message.includes('already exists')) {
        console.error(`Migration failed: ${file}`, error);
      }
    }
  }
}

export const database = {
  tasks: {
    findAll: (filters?: { status?: string; project_id?: number; priority?: string }) => {
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
      if (filters?.priority) {
        conditions.push('priority = ?');
        params.push(filters.priority);
      }

      if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      query += ' ORDER BY created_at DESC';

      return db.prepare(query).all(...params);
    },

    findById: (id: number) => {
      return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    },

    create: (data: any) => {
      const stmt = db.prepare(`
        INSERT INTO tasks (title, description, status, priority, project_id, due_date, conversation_id, auto_created)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        data.title,
        data.description || null,
        data.status || 'Backlog',
        data.priority || 'medium',
        data.project_id || null,
        data.due_date || null,
        data.conversation_id || null,
        data.auto_created || 0
      );
      return database.tasks.findById(result.lastInsertRowid as number);
    },

    update: (id: number, data: any) => {
      const fields: string[] = [];
      const params: any[] = [];

      if (data.title !== undefined) {
        fields.push('title = ?');
        params.push(data.title);
      }
      if (data.description !== undefined) {
        fields.push('description = ?');
        params.push(data.description);
      }
      if (data.status !== undefined) {
        fields.push('status = ?');
        params.push(data.status);
      }
      if (data.priority !== undefined) {
        fields.push('priority = ?');
        params.push(data.priority);
      }
      if (data.project_id !== undefined) {
        fields.push('project_id = ?');
        params.push(data.project_id);
      }
      if (data.due_date !== undefined) {
        fields.push('due_date = ?');
        params.push(data.due_date);
      }

      if (fields.length === 0) {
        return database.tasks.findById(id);
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);

      const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;
      db.prepare(query).run(...params);
      return database.tasks.findById(id);
    },

    delete: (id: number) => {
      const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
      stmt.run(id);
      return { success: true };
    }
  },

  projects: {
    findAll: () => {
      return db.prepare('SELECT * FROM projects ORDER BY name').all();
    },

    findById: (id: number) => {
      return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    },

    create: (data: any) => {
      const stmt = db.prepare(`
        INSERT INTO projects (name, color)
        VALUES (?, ?)
      `);
      const result = stmt.run(
        data.name,
        data.color || '#3B82F6'
      );
      return database.projects.findById(result.lastInsertRowid as number);
    },

    update: (id: number, data: any) => {
      const fields: string[] = [];
      const params: any[] = [];

      if (data.name !== undefined) {
        fields.push('name = ?');
        params.push(data.name);
      }
      if (data.color !== undefined) {
        fields.push('color = ?');
        params.push(data.color);
      }
      if (data.description !== undefined) {
        fields.push('description = ?');
        params.push(data.description);
      }

      if (fields.length === 0) {
        return database.projects.findById(id);
      }

      params.push(id);
      const query = `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`;
      db.prepare(query).run(...params);
      return database.projects.findById(id);
    },

    delete: (id: number) => {
      // Orphan tasks and conversations (set project_id to null)
      db.prepare('UPDATE tasks SET project_id = NULL WHERE project_id = ?').run(id);
      db.prepare('UPDATE conversations SET project_id = NULL WHERE project_id = ?').run(id);
      // Delete project
      db.prepare('DELETE FROM projects WHERE id = ?').run(id);
      return { success: true };
    }
  },

  conversations: {
    findAll: (filters?: { project_id?: number; limit?: number }) => {
      let query = 'SELECT * FROM conversations';
      const conditions: string[] = [];
      const params: any[] = [];

      if (filters?.project_id) {
        conditions.push('project_id = ?');
        params.push(filters.project_id);
      }

      if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      query += ' ORDER BY created_at DESC';
      query += ` LIMIT ${filters?.limit || 100}`;

      return db.prepare(query).all(...params);
    },

    findById: (id: number) => {
      return db.prepare('SELECT * FROM conversations WHERE id = ?').get(id);
    },

    create: (data: any) => {
      const stmt = db.prepare(`
        INSERT INTO conversations (message_text, role, project_id, metadata)
        VALUES (?, ?, ?, ?)
      `);
      const result = stmt.run(
        data.message_text,
        data.role,
        data.project_id || null,
        data.metadata || null
      );
      return database.conversations.findById(result.lastInsertRowid as number);
    }
  },

  notes: {
    findAll: (filters?: { project_id?: number }) => {
      let query = 'SELECT * FROM notes';
      const params: any[] = [];

      if (filters?.project_id) {
        query += ' WHERE project_id = ?';
        params.push(filters.project_id);
      }
      query += ' ORDER BY updated_at DESC';

      return db.prepare(query).all(...params);
    },

    findById: (id: number) => {
      return db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    },

    create: (data: any) => {
      const stmt = db.prepare(`
        INSERT INTO notes (title, content, project_id)
        VALUES (?, ?, ?)
      `);
      const result = stmt.run(
        data.title,
        data.content || null,
        data.project_id || null
      );
      return database.notes.findById(result.lastInsertRowid as number);
    },

    update: (id: number, data: any) => {
      const fields: string[] = [];
      const params: any[] = [];

      if (data.title !== undefined) {
        fields.push('title = ?');
        params.push(data.title);
      }
      if (data.content !== undefined) {
        fields.push('content = ?');
        params.push(data.content);
      }
      if (data.project_id !== undefined) {
        fields.push('project_id = ?');
        params.push(data.project_id);
      }

      if (fields.length === 0) {
        return database.notes.findById(id);
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);

      const query = `UPDATE notes SET ${fields.join(', ')} WHERE id = ?`;
      db.prepare(query).run(...params);
      return database.notes.findById(id);
    },

    delete: (id: number) => {
      db.prepare('DELETE FROM notes WHERE id = ?').run(id);
      return { success: true };
    }
  },

  files: {
    findAll: (filters?: { project_id?: number }) => {
      let query = 'SELECT * FROM files';
      const params: any[] = [];

      if (filters?.project_id) {
        query += ' WHERE project_id = ?';
        params.push(filters.project_id);
      }
      query += ' ORDER BY created_at DESC';

      return db.prepare(query).all(...params);
    },

    findById: (id: number) => {
      return db.prepare('SELECT * FROM files WHERE id = ?').get(id);
    },

    create: (data: any) => {
      const stmt = db.prepare(`
        INSERT INTO files (filename, original_name, mime_type, size, project_id)
        VALUES (?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        data.filename,
        data.original_name,
        data.mime_type || null,
        data.size || null,
        data.project_id || null
      );
      return database.files.findById(result.lastInsertRowid as number);
    },

    delete: (id: number) => {
      db.prepare('DELETE FROM files WHERE id = ?').run(id);
      return { success: true };
    }
  }
};

export default db;
