'use client';

import { useDroppable } from '@dnd-kit/core';
import { Task, Project } from '@/types';
import { TaskCard } from './TaskCard';
import { theme } from '@/config/theme';

interface KanbanColumnProps {
  title: string;
  status: 'Backlog' | 'In Progress' | 'Done';
  tasks: Task[];
  projects: Project[];
  onTaskClick: (task: Task) => void;
  isDragOver?: boolean;
  activeTaskId?: number;
}

export function KanbanColumn({ 
  title, 
  status, 
  tasks, 
  projects, 
  onTaskClick,
  isDragOver = false,
  activeTaskId 
}: KanbanColumnProps) {
  // Make this column a droppable zone using its status as ID
  const { setNodeRef } = useDroppable({
    id: status,
  });

  // Get project by ID
  const getProject = (projectId: number) => {
    return projects.find(p => p.id === projectId);
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.colors.background.secondary,
        borderRadius: '8px',
        border: `1px solid ${isDragOver ? theme.colors.accent : theme.colors.border}`,
        minHeight: '400px',
        maxHeight: 'calc(100vh - 200px)',
        transition: 'border-color 150ms ease',
        boxShadow: isDragOver ? `0 0 0 2px ${theme.colors.accent}40` : 'none',
      }}
    >
      {/* Column Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: `1px solid ${theme.colors.border}`,
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: theme.colors.text.primary,
          margin: 0,
        }}>
          {title}
        </h3>
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
          // Empty state
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 16px',
            color: theme.colors.text.tertiary,
            fontSize: '13px',
            textAlign: 'center',
            border: isDragOver ? `2px dashed ${theme.colors.accent}` : '2px dashed transparent',
            borderRadius: '8px',
            transition: 'border-color 150ms ease',
          }}>
            {isDragOver ? 'Drop here' : 'No tasks yet'}
          </div>
        ) : (
          // Task cards
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              project={getProject(task.project_id)}
              onClick={() => onTaskClick(task)}
              isDragging={activeTaskId === task.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
