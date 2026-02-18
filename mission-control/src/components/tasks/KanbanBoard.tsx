'use client';

import { useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  closestCenter,
} from '@dnd-kit/core';
import { Task, CreateTaskInput, UpdateTaskInput } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { Button } from '@/components/ui/Button';
import { theme } from '@/config/theme';

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
    }}>
      {[1, 2, 3].map(col => (
        <div key={col} style={{
          backgroundColor: theme.colors.background.secondary,
          borderRadius: '8px',
          border: `1px solid ${theme.colors.border}`,
          minHeight: '400px',
          padding: '12px',
        }}>
          {/* Column header skeleton */}
          <div style={{
            height: '20px',
            width: '80px',
            backgroundColor: theme.colors.background.tertiary,
            borderRadius: '4px',
            marginBottom: '16px',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }} />
          {/* Card skeletons */}
          {[1, 2, 3].map(card => (
            <div key={card} style={{
              backgroundColor: theme.colors.background.tertiary,
              borderRadius: '8px',
              height: '100px',
              marginBottom: '8px',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// Toast notification component
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: theme.colors.status.success,
    error: theme.colors.status.error,
    info: theme.colors.status.info,
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      backgroundColor: theme.colors.background.tertiary,
      border: `1px solid ${colors[type]}`,
      borderRadius: '8px',
      padding: '12px 20px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      animation: 'slideIn 0.3s ease',
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: colors[type],
      }} />
      <span style={{ color: theme.colors.text.primary, fontSize: '14px' }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: theme.colors.text.secondary,
          cursor: 'pointer',
          fontSize: '16px',
          padding: '0 0 0 8px',
        }}
      >
        ×
      </button>
    </div>
  );
}

export function KanbanBoard() {
  const { tasks, loading: tasksLoading, error: tasksError, createTask, updateTask, deleteTask, refreshTasks } = useTasks();
  const { projects, loading: projectsLoading, error: projectsError } = useProjects();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Show toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  // Separate tasks by status
  const backlogTasks = tasks.filter(t => t.status === 'Backlog');
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
  const doneTasks = tasks.filter(t => t.status === 'Done');

  // Get project by ID helper
  const getProject = (projectId: number) => {
    return projects.find(p => p.id === projectId);
  };

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
    try {
      if (selectedTask) {
        const result = await updateTask(selectedTask.id, data);
        if (result) {
          showToast('Task updated', 'success');
          return true;
        } else {
          showToast('Failed to update task', 'error');
          return false;
        }
      } else {
        const result = await createTask(data as CreateTaskInput);
        if (result) {
          showToast('Task created', 'success');
          return true;
        } else {
          showToast('Failed to create task', 'error');
          return false;
        }
      }
    } catch {
      showToast('Network error - please try again', 'error');
      return false;
    }
  };

  // Handle delete from modal
  const handleDelete = async (): Promise<boolean> => {
    if (!selectedTask) return false;
    try {
      const result = await deleteTask(selectedTask.id);
      if (result) {
        showToast('Task deleted', 'success');
        return true;
      } else {
        showToast('Failed to delete task', 'error');
        return false;
      }
    } catch {
      showToast('Network error - please try again', 'error');
      return false;
    }
  };

  // Handle delete from card button
  const handleDeleteFromCard = async (taskId: number) => {
    try {
      const result = await deleteTask(taskId);
      if (result) {
        showToast('Task deleted', 'success');
      } else {
        showToast('Failed to delete task', 'error');
      }
    } catch {
      showToast('Network error - please try again', 'error');
    }
  };

  // Handle edit from card button
  const handleEditFromCard = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Drag start handler
  const handleDragStart = (event: DragStartEvent) => {
    const taskId = parseInt(event.active.id.toString().replace('task-', ''));
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setActiveTask(task);
    }
  };

  // Drag over handler - for visual feedback
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      setDragOverStatus(over.id as string);
    } else {
      setDragOverStatus(null);
    }
  };

  // Drag end handler - update task status
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveTask(null);
    setDragOverStatus(null);

    if (!over) {
      return;
    }

    const taskId = parseInt(active.id.toString().replace('task-', ''));
    const newStatus = over.id as string;
    const task = tasks.find(t => t.id === taskId);

    if (!task || task.status === newStatus) {
      return;
    }

    try {
      const result = await updateTask(taskId, { status: newStatus as 'Backlog' | 'In Progress' | 'Done' });
      if (result) {
        showToast(`Moved to ${newStatus}`, 'success');
      } else {
        showToast('Failed to move task', 'error');
        refreshTasks();
      }
    } catch {
      showToast('Network error - please try again', 'error');
      refreshTasks();
    }
  };

  // Loading state with skeleton
  if (tasksLoading || projectsLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{
            width: '100px',
            height: '36px',
            backgroundColor: theme.colors.background.tertiary,
            borderRadius: '6px',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }} />
        </div>
        <LoadingSkeleton />
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
        gap: '16px',
      }}>
        <div style={{ fontSize: '48px' }}>⚠️</div>
        <div style={{ fontSize: '16px', textAlign: 'center' }}>
          Failed to load tasks
          <div style={{ fontSize: '12px', color: theme.colors.text.secondary, marginTop: '4px' }}>
            {tasksError || projectsError}
          </div>
        </div>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease' }}>
        {/* Header with New Task button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={handleNewTask}>
            + New Task
          </Button>
        </div>

        {/* Kanban columns - responsive grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          <KanbanColumn
            title="Backlog"
            status="Backlog"
            tasks={backlogTasks}
            projects={projects}
            onTaskClick={handleEditTask}
            onEditTask={handleEditFromCard}
            onDeleteTask={handleDeleteFromCard}
            isDragOver={dragOverStatus === 'Backlog'}
            activeTaskId={activeTask?.id}
          />
          <KanbanColumn
            title="In Progress"
            status="In Progress"
            tasks={inProgressTasks}
            projects={projects}
            onTaskClick={handleEditTask}
            onEditTask={handleEditFromCard}
            onDeleteTask={handleDeleteFromCard}
            isDragOver={dragOverStatus === 'In Progress'}
            activeTaskId={activeTask?.id}
          />
          <KanbanColumn
            title="Done"
            status="Done"
            tasks={doneTasks}
            projects={projects}
            onTaskClick={handleEditTask}
            onEditTask={handleEditFromCard}
            onDeleteTask={handleDeleteFromCard}
            isDragOver={dragOverStatus === 'Done'}
            activeTaskId={activeTask?.id}
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

      {/* Drag Overlay - renders the dragged card */}
      <DragOverlay>
        {activeTask ? (
          <div style={{ opacity: 0.95, transform: 'rotate(3deg) scale(1.02)', boxShadow: '0 16px 32px rgba(0, 0, 0, 0.5)' }}>
            <TaskCard
              task={activeTask}
              project={getProject(activeTask.project_id)}
              onClick={() => {}}
              isDragging
            />
          </div>
        ) : null}
      </DragOverlay>

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </DndContext>
  );
}
