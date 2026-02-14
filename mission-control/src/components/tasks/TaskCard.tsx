'use client';

import { Task, Project } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { theme } from '@/config/theme';

interface TaskCardProps {
  task: Task;
  project?: Project;
  onClick: () => void;
}

export function TaskCard({ task, project, onClick }: TaskCardProps) {
  // Priority colors
  const priorityColors = {
    high: theme.colors.status.error,
    medium: '#FBBF24', // yellow
    low: '#10B981', // green
  };

  // Format relative date
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
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Truncate description to 2 lines
  const truncateDescription = (text: string, maxLength: number = 80) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card onClick={onClick} hoverable>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Title */}
        <div style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          color: theme.colors.text.primary 
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

          {/* Priority dot */}
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: priorityColors[task.priority],
              flexShrink: 0,
            }}
            title={`${task.priority} priority`}
          />

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
    </Card>
  );
}
