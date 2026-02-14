INSERT INTO projects (name, color) VALUES
  ('Mission Control', '#8B5CF6'),
  ('Moto', '#F97316'),
  ('OpenClaw', '#3B82F6'),
  ('Personal', '#10B981');

INSERT INTO tasks (title, description, project_id, status, priority) VALUES
  ('Build kanban board', 'Create drag and drop interface with columns', 1, 'In Progress', 'high'),
  ('Add Telegram integration', 'Connect OpenClaw webhook to capture messages', 1, 'Backlog', 'high'),
  ('Change dirtbike tire', 'Replace front tire before next ride', 2, 'Backlog', 'medium'),
  ('Setup conversation logging', 'Store all OpenClaw chats in Memory', 1, 'Backlog', 'medium'),
  ('Test drag and drop', 'Verify tasks move between columns', 1, 'Done', 'low');
