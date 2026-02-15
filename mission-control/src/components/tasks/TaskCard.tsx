'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Task, Project } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { theme } from '@/config/theme';

interface TaskCardProps {
  task: Task;
  project?: Project;
  onClick: () => void;
  isDragging?: boolean;
}

export function TaskCard({ task, project, onClick, isDragging = false }: TaskCardProps) {
  // Make this card draggable with id "task-{id}"
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `task-${task.id}`,
    data: {
      task,
    },
  });

  // Apply transform for drag position
  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  // Format relative date with better human-readable format
  const getRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 14) return 'Last week';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Truncate description to 2 lines
  const truncateDescription = (text: string, maxLength: number = 80) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: theme.colors.background.tertiary,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '8px',
        padding: '16px',
        transition: isDragging ? 'none' : 'all 150ms ease',
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        boxShadow: isDragging ? '0 12px 24px rgba(0, 0, 0, 0.4)' : 'none',
      }}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        if (!transform) {
          onClick();
        }
      }}
      onMouseEnter={(e) => {
        if (!isDragging) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
          e.currentTarget.style.borderColor = theme.colors.text.tertiary;
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = theme.colors.border;
        }
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Title */}
        <div style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          color: theme.colors.text.primary,
          lineHeight: 1.3,
        }}>
          {task.title}
        </div>

        {/* Description (truncated) */}
        {task.description && (
          <div style={{ 
            fontSize: '12px', 
            color: theme.colors.text.secondary,
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {truncateDescription(task.description)}
          </div>
        )}

        {/* Footer: Project badge, Priority dot, Date */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginTop: '4px' 
        }}>
          {/* Project badge */}
          {project && (
            <Badge color={project.color}>
              {project.name}
            </Badge>
          )}

          {/* Priority indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: `${theme.colors.priority[task.priority]}15`,
              fontSize: '11px',
              fontWeight: '500',
              color: theme.colors.priority[task.priority],
              textTransform: 'capitalize',
            }}
          >
            {task.priority}
          </div>

          {/* Relative date */}
          <div style={{ 
            fontSize: '11px', 
            color: theme.colors.text.tertiary,
            marginLeft: 'auto',
          }}>
            {getRelativeDate(task.created_at)}
          </div>
        </div>
      </div>
    </div>
  );
}
