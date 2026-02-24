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
  useDroppable,
} from '@dnd-kit/core';
import { Task, Project, UpdateTaskInput } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import { KanbanColumn } from '@/components/tasks/KanbanColumn';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskModal } from '@/components/tasks/TaskModal';
import { Button } from '@/components/ui/Button';
import { theme } from '@/config/theme';

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
          <div style={{
            height: '20px',
            width: '80px',
            backgroundColor: theme.colors.background.tertiary,
            borderRadius: '4px',
            marginBottom: '16px',
          }} />
          {[1, 2, 3].map(card => (
            <div key={card} style={{
              backgroundColor: theme.colors.background.tertiary,
              borderRadius: '8px',
              height: '100px',
              marginBottom: '8px',
            }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// Toast notification
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

interface ProjectKanbanBoardProps {
  projects: Project[];
}

export function ProjectKanbanBoard({ projects }: ProjectKanbanBoardProps) {
  const { tasks, loading, error, updateTask, refreshTasks } = useTasks();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [dragOverProject, setDragOverProject] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  // Group tasks by project
  const getTasksByProject = (projectId: number) => {
    return tasks.filter(t => t.project_id === projectId);
  };

  // Get project by ID
  const getProject = (projectId: number) => {
    return projects.find(p => p.id === projectId);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSave = async (data: UpdateTaskInput): Promise<boolean> => {
    if (!selectedTask) return false;
    try {
      const result = await updateTask(selectedTask.id, data);
      if (result) {
        showToast('Task updated', 'success');
        return true;
      } else {
        showToast('Failed to update task', 'error');
        return false;
      }
    } catch {
      showToast('Network error - please try again', 'error');
      return false;
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = parseInt(event.active.id.toString().replace('task-', ''));
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      const projectId = parseInt(over.id.toString().replace('project-', ''));
      setDragOverProject(projectId);
    } else {
      setDragOverProject(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveTask(null);
    setDragOverProject(null);

    if (!over) {
      return;
    }

    const taskId = parseInt(active.id.toString().replace('task-', ''));
    const newProjectId = parseInt(over.id.toString().replace('project-', ''));
    const task = tasks.find(t => t.id === taskId);

    if (!task || task.project_id === newProjectId) {
      return;
    }

    try {
      const result = await updateTask(taskId, { project_id: newProjectId });
      if (result) {
        const projectName = getProject(newProjectId)?.name || 'project';
        showToast(`Moved to ${projectName}`, 'success');
      } else {
        showToast('Failed to move task', 'error');
        refreshTasks();
      }
    } catch {
      showToast('Network error - please try again', 'error');
      refreshTasks();
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
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
        <div>Failed to load tasks: {error}</div>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Kanban columns - one per project */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          {projects.map(project => (
            <ProjectColumn
              key={project.id}
              project={project}
              tasks={getTasksByProject(project.id)}
              onTaskClick={handleTaskClick}
              isDragOver={dragOverProject === project.id}
              activeTaskId={activeTask?.id}
            />
          ))}
        </div>

        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          task={selectedTask}
          projects={projects}
        />
      </div>

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

// Project column component - same as KanbanColumn but uses project instead of status
interface ProjectColumnProps {
  project: Project;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  isDragOver?: boolean;
  activeTaskId?: number;
}

function ProjectColumn({ project, tasks, onTaskClick, isDragOver = false, activeTaskId }: ProjectColumnProps) {
  const { setNodeRef } = useDroppable({
    id: `project-${project.id}`,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.colors.background.secondary,
        borderRadius: '8px',
        border: `2px solid ${isDragOver ? project.color : theme.colors.border}`,
        minHeight: '400px',
        maxHeight: 'calc(100vh - 200px)',
        transition: 'border-color 150ms ease',
        boxShadow: isDragOver ? `0 0 0 2px ${project.color}40` : 'none',
      }}
    >
      {/* Column Header with project color */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: `1px solid ${theme.colors.border}`,
        backgroundColor: `${project.color}10`,
        borderRadius: '8px 8px 0 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: project.color,
          }} />
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: theme.colors.text.primary,
            margin: 0,
          }}>
            {project.name}
          </h3>
        </div>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '24px',
          height: '24px',
          padding: '0 8px',
          borderRadius: '12px',
          backgroundColor: theme.colors.background.tertiary,
          fontSize: '12px',
          fontWeight: '500',
          color: theme.colors.text.secondary,
        }}>
          {tasks.length}
        </span>
      </div>

      {/* Task List */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {tasks.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 16px',
            color: theme.colors.text.tertiary,
            fontSize: '13px',
            textAlign: 'center',
            border: isDragOver ? `2px dashed ${project.color}` : '2px dashed transparent',
            borderRadius: '8px',
          }}>
            {isDragOver ? 'Drop here' : 'No tasks'}
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              project={project}
              onClick={() => onTaskClick(task)}
              isDragging={activeTaskId === task.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
