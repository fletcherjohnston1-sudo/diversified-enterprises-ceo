export interface Task {
  id: number;
  title: string;
  description?: string;
  project_id: number;
  status: 'Backlog' | 'In Progress' | 'Done';
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  name: string;
  color: string;
  icon?: string;
  created_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  project_id: number;
  status: 'Backlog' | 'In Progress' | 'Done';
  priority: 'high' | 'medium' | 'low';
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {}
