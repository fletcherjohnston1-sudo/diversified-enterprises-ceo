'use client';

import { useState, useEffect } from 'react';
import { Task, Project, CreateTaskInput, UpdateTaskInput } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { theme } from '@/config/theme';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateTaskInput | UpdateTaskInput) => Promise<boolean>;
  onDelete?: () => Promise<boolean>;
  task?: Task | null;
  projects: Project[];
}

export function TaskModal({ isOpen, onClose, onSave, onDelete, task, projects }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState('Backlog');
  const [priority, setPriority] = useState('medium');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; project?: string; general?: string }>({});

  const isEditing = !!task;

  // Populate form when editing or reset when creating
  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setProjectId(task.project_id?.toString() || '');
        setStatus(task.status);
        setPriority(task.priority);
      } else {
        // Reset for new task
        setTitle('');
        setDescription('');
        setProjectId(projects[0]?.id?.toString() || '');
        setStatus('Backlog');
        setPriority('medium');
      }
      setErrors({});
      setShowDeleteConfirm(false);
    }
  }, [isOpen, task, projects]);

  const validateForm = (): boolean => {
    const newErrors: { title?: string; project?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!projectId) {
      newErrors.project = 'Please select a project';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setErrors({});

    const data: CreateTaskInput | UpdateTaskInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      project_id: parseInt(projectId),
      status: status as 'Backlog' | 'In Progress' | 'Done',
      priority: priority as 'high' | 'medium' | 'low',
    };

    try {
      const success = await onSave(data);
      setSaving(false);

      if (success) {
        // Clear form and close
        setTitle('');
        setDescription('');
        setErrors({});
        onClose();
      } else {
        setErrors({ general: 'Failed to save task. Please try again.' });
      }
    } catch (error) {
      setSaving(false);
      setErrors({ general: 'Network error. Please check your connection.' });
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setDeleting(true);
    setErrors({});

    try {
      const success = await onDelete();
      setDeleting(false);

      if (success) {
        onClose();
      } else {
        setErrors({ general: 'Failed to delete task. Please try again.' });
      }
    } catch (error) {
      setDeleting(false);
      setErrors({ general: 'Network error. Please check your connection.' });
    }
  };

  const handleClose = () => {
    setErrors({});
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Task' : 'New Task'}
      footer={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'space-between' }}>
          {/* Delete button (edit only) */}
          <div>
            {isEditing && onDelete && !showDeleteConfirm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={saving || deleting}
                style={{ color: theme.colors.status.error }}
              >
                Delete
              </Button>
            )}
            {isEditing && onDelete && showDeleteConfirm && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: theme.colors.text.secondary }}>Delete this task?</span>
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={handleDelete} 
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* Save/Cancel buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleClose}
              disabled={saving || deleting}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleSave} 
              disabled={saving || deleting}
            >
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* General error */}
        {errors.general && (
          <div style={{ 
            padding: '12px 16px',
            backgroundColor: `${theme.colors.status.error}15`,
            border: `1px solid ${theme.colors.status.error}40`,
            borderRadius: '6px',
            fontSize: '13px', 
            color: theme.colors.status.error,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>⚠️</span>
            {errors.general}
          </div>
        )}

        {/* Title */}
        <Input
          label="Title *"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors({ ...errors, title: undefined });
          }}
          error={errors.title}
          disabled={saving || deleting}
        />

        {/* Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: '500', color: theme.colors.text.secondary }}>
            Description
          </label>
          <textarea
            placeholder="Enter task description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            disabled={saving || deleting}
            style={{
              backgroundColor: theme.colors.background.card,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '6px',
              padding: '10px 14px',
              fontSize: '14px',
              color: theme.colors.text.primary,
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
              transition: 'border-color 150ms ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = theme.colors.accent.primary;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = theme.colors.border;
            }}
          />
        </div>

        {/* Project */}
        <Select
          label="Project *"
          options={projects.map(p => ({ value: p.id.toString(), label: p.name }))}
          value={projectId}
          onChange={(value) => {
            setProjectId(value);
            if (errors.project) setErrors({ ...errors, project: undefined });
          }}
          error={errors.project}
          disabled={saving || deleting}
        />

        {/* Status */}
        <Select
          label="Status"
          options={[
            { value: 'Backlog', label: '📋 Backlog' },
            { value: 'In Progress', label: '🔄 In Progress' },
            { value: 'Done', label: '✅ Done' },
          ]}
          value={status}
          onChange={(value) => setStatus(value as 'Backlog' | 'In Progress' | 'Done')}
          disabled={saving || deleting}
        />

        {/* Priority */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: '500', color: theme.colors.text.secondary }}>
            Priority
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['low', 'medium', 'high'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                disabled={saving || deleting}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  backgroundColor: priority === p ? `${theme.colors.priority[p]}20` : 'transparent',
                  border: `1px solid ${priority === p ? theme.colors.priority[p] : theme.colors.border}`,
                  borderRadius: '6px',
                  color: priority === p ? theme.colors.priority[p] : theme.colors.text.secondary,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: priority === p ? '600' : '400',
                  transition: 'all 150ms ease',
                  textTransform: 'capitalize',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
