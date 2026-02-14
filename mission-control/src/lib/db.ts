import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'database', 'mission-control.db');
const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
const seedsPath = path.join(process.cwd(), 'database', 'seeds.sql');

// Initialize database if it doesn't exist
if (!fs.existsSync(dbPath)) {
  // Ensure database directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  const db = new Database(dbPath);
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  
  // Run seeds if available
  if (fs.existsSync(seedsPath)) {
    const seeds = fs.readFileSync(seedsPath, 'utf-8');
    db.exec(seeds);
  }
  db.close();
}

const db = new Database(dbPath);

export const database = {
  tasks: {
    findAll: (filters?: { status?: string; project_id?: number }) => {
      let query = 'SELECT * FROM tasks';
      const conditions: string[] = [];
      const params: (string | number)[] = [];
      
      if (filters?.status) {
        conditions.push('status = ?');
        params.push(filters.status);
      }
      if (filters?.project_id) {
        conditions.push('project_id = ?');
        params.push(filters.project_id);
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
    
    create: (data: { title: string; description?: string; project_id: number; status: string; priority: string }) => {
      const stmt = db.prepare(`
        INSERT INTO tasks (title, description, project_id, status, priority)
        VALUES (?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        data.title,
        data.description || null,
        data.project_id,
        data.status,
        data.priority
      );
      return database.tasks.findById(result.lastInsertRowid as number);
    },
    
    update: (id: number, data: { title?: string; description?: string; project_id?: number; status?: string; priority?: string }) => {
      const updates: string[] = [];
      const params: (string | number | null)[] = [];
      
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
      
      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);
      
      const stmt = db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`);
      stmt.run(...params);
      return database.tasks.findById(id);
    },
    
    delete: (id: number) => {
      const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
      return stmt.run(id);
    }
  },
  
  projects: {
    findAll: () => {
      return db.prepare('SELECT * FROM projects ORDER BY name').all() as any[];
    },
    
    findById: (id: number) => {
      return db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
    }
  }
};

export default db;
