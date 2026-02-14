'use client';

import { useState } from 'react';
import { Task, CreateTaskInput, UpdateTaskInput } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { KanbanColumn } from './KanbanColumn';
import { TaskModal } from './TaskModal';
import { Button } from '@/components/ui/Button';
import { theme } from '@/config/theme';

export function KanbanBoard() {
  const { tasks, loading: tasksLoading, error: tasksError, createTask, updateTask, deleteTask } = useTasks();
  const { projects, loading: projectsLoading, error: projectsError } = useProjects();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Separate tasks by status
  const backlogTasks = tasks.filter(t => t.status === 'Backlog');
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
  const doneTasks = tasks.filter(t => t.status === 'Done');

  // Handle opening modal for new task
  const handleNewTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  // Handle opening modal for editing task
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Handle save (create or update)
  const handleSave = async (data: CreateTaskInput | UpdateTaskInput): Promise<boolean> => {
    if (selectedTask) {
      // Update existing task
      const result = await updateTask(selectedTask.id, data);
      return result !== null;
    } else {
      // Create new task
      const result = await createTask(data as CreateTaskInput);
      return result !== null;
    }
  };

  // Handle delete
  const handleDelete = async (): Promise<boolean> => {
    if (!selectedTask) return false;
    return await deleteTask(selectedTask.id);
  };

  // Loading state
  if (tasksLoading || projectsLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        color: theme.colors.text.secondary,
      }}>
        Loading tasks...
      </div>
    );
  }

  // Error state
  if (tasksError || projectsError) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        color: theme.colors.status.error,
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div>Error: {tasksError || projectsError}</div>
        <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header with New Task button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="primary" onClick={handleNewTask}>
          + New Task
        </Button>
      </div>

      {/* Kanban columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
      }}>
        <KanbanColumn
          title="Backlog"
          status="Backlog"
          tasks={backlogTasks}
          projects={projects}
          onTaskClick={handleEditTask}
        />
        <KanbanColumn
          title="In Progress"
          status="In Progress"
          tasks={inProgressTasks}
          projects={projects}
          onTaskClick={handleEditTask}
        />
        <KanbanColumn
          title="Done"
          status="Done"
          tasks={doneTasks}
          projects={projects}
          onTaskClick={handleEditTask}
        />
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onDelete={selectedTask ? handleDelete : undefined}
        task={selectedTask}
        projects={projects}
      />
    </div>
  );
}
