-- Mission Control Database Schema

-- Projects table
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Backlog',
  priority TEXT NOT NULL DEFAULT 'medium',
  project_id INTEGER,
  due_date DATETIME,
  conversation_id INTEGER,
  auto_created INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

-- Conversations table
CREATE TABLE conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_text TEXT NOT NULL,
  role TEXT NOT NULL,
  project_id INTEGER,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_conversations_created ON conversations(created_at DESC);
CREATE INDEX idx_conversations_role ON conversations(role);

-- Default projects
INSERT INTO projects (name, color) VALUES 
  ('Mission Control', '#3B82F6'),
  ('Moto', '#EF4444'),
  ('OpenClaw', '#8B5CF6'),
  ('Personal', '#10B981');
