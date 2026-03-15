-- Migration 004: add owner_agent to projects
-- Allowed values: 'main' | 'cfo' | 'cro' | 'cto' | 'schwab' | 'unassigned'
-- Default for all existing rows: 'unassigned'
ALTER TABLE projects ADD COLUMN owner_agent TEXT NOT NULL DEFAULT 'unassigned';
