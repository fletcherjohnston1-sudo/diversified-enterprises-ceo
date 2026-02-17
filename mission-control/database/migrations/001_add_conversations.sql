-- Simple conversations table for OpenClaw messages
CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_text TEXT NOT NULL,
  role TEXT NOT NULL,
  project_id INTEGER,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Link tasks to conversations
ALTER TABLE tasks ADD COLUMN conversation_id INTEGER;
ALTER TABLE tasks ADD COLUMN auto_created INTEGER DEFAULT 0;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_created ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_role ON conversations(role);
CREATE INDEX IF NOT EXISTS idx_tasks_conversation ON tasks(conversation_id);
