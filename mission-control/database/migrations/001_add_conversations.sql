-- Migration: Add conversations table and link tasks to source messages
-- Date: 2026-02-14
-- Phase 2: Telegram + OpenClaw Integration

-- Create conversations table to store OpenClaw messages
CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id TEXT UNIQUE NOT NULL,
  channel TEXT NOT NULL,
  sender_id TEXT,
  sender_name TEXT,
  content TEXT NOT NULL,
  timestamp DATETIME NOT NULL,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add source_conversation_id to tasks table
ALTER TABLE tasks ADD COLUMN source_conversation_id INTEGER REFERENCES conversations(id);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_conversations_channel ON conversations(channel);
CREATE INDEX IF NOT EXISTS idx_conversations_timestamp ON conversations(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_sender ON conversations(sender_id);
CREATE INDEX IF NOT EXISTS idx_tasks_source ON tasks(source_conversation_id);

-- Add keywords column to projects for auto-detection
ALTER TABLE projects ADD COLUMN keywords TEXT;

-- Add is_archived to conversations
ALTER TABLE conversations ADD COLUMN is_archived INTEGER DEFAULT 0;