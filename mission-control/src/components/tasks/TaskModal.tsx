'use client';

import { useState } from 'react';
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
  task?: Task | null; // null = creating new task
  projects: Project[];
}

export function TaskModal({ isOpen, onClose, onSave, onDelete, task, projects }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [projectId, setProjectId] = useState(task?.project_id?.toString() || projects[0]?.id?.toString() || '');
  const [status, setStatus] = useState(task?.status || 'Backlog');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!task;

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!projectId) {
      setError('Please select a project');
      return;
    }

    setSaving(true);
    setError(null);

    const data: CreateTaskInput | UpdateTaskInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      project_id: parseInt(projectId),
      status: status as 'Backlog' | 'In Progress' | 'Done',
      priority: priority as 'high' | 'medium' | 'low',
    };

    const success = await onSave(data);
    setSaving(false);

    if (success) {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setDeleting(true);
    setError(null);

    const success = await onDelete();
    setDeleting(false);

    if (success) {
      onClose();
    }
  };

  const handleClose = () => {
    // Reset form
    setTitle(task?.title || '');
    setDescription(task?.description || '');
    setProjectId(task?.project_id?.toString() || projects[0]?.id?.toString() || '');
    setStatus(task?.status || 'Backlog');
    setPriority(task?.priority || 'medium');
    setError(null);
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
                style={{ color: theme.colors.status.error }}
              >
                Delete
              </Button>
            )}
            {isEditing && onDelete && showDeleteConfirm && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: theme.colors.text.secondary }}>Confirm?</span>
                <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Yes'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                  No
                </Button>
              </div>
            )}
          </div>

          {/* Save/Cancel buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button variant="secondary" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Title */}
        <Input
          label="Title *"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={error && !title.trim() ? error : undefined}
        />

        {/* Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: '500', color: theme.colors.text.secondary }}>
            Description
          </label>
          <textarea
            placeholder="Enter task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
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
          label="Project"
          options={projects.map(p => ({ value: p.id.toString(), label: p.name }))}
          value={projectId}
          onChange={setProjectId}
        />

        {/* Status */}
        <Select
          label="Status"
          options={[
            { value: 'Backlog', label: 'Backlog' },
            { value: 'In Progress', label: 'In Progress' },
            { value: 'Done', label: 'Done' },
          ]}
          value={status}
          onChange={(value) => setStatus(value as 'Backlog' | 'In Progress' | 'Done')}
        />

        {/* Priority */}
        <Select
          label="Priority"
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]}
          value={priority}
          onChange={(value) => setPriority(value as 'high' | 'medium' | 'low')}
        />

        {/* Error message */}
        {error && (
          <div style={{ 
            fontSize: '12px', 
            color: theme.colors.status.error,
            marginTop: '-8px',
          }}>
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
