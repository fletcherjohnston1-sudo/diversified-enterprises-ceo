'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, CreateTaskInput, UpdateTaskInput } from '@/types';

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  createTask: (data: CreateTaskInput) => Promise<Task | null>;
  updateTask: (id: number, data: UpdateTaskInput) => Promise<Task | null>;
  deleteTask: (id: number) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/tasks');
      const result = await response.json();
      
      if (result.success) {
        setTasks(result.data);
      } else {
        setError(result.error || 'Failed to fetch tasks');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (data: CreateTaskInput): Promise<Task | null> => {
    try {
      setError(null);
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      
      if (result.success) {
        await fetchTasks();
        return result.data;
      } else {
        setError(result.error || 'Failed to create task');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
      return null;
    }
  }, [fetchTasks]);

  const updateTask = useCallback(async (id: number, data: UpdateTaskInput): Promise<Task | null> => {
    try {
      setError(null);
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      
      if (result.success) {
        await fetchTasks();
        return result.data;
      } else {
        setError(result.error || 'Failed to update task');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
      return null;
    }
  }, [fetchTasks]);

  const deleteTask = useCallback(async (id: number): Promise<boolean> => {
    try {
      setError(null);
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      
      if (result.success) {
        await fetchTasks();
        return true;
      } else {
        setError(result.error || 'Failed to delete task');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
      return false;
    }
  }, [fetchTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refresh: fetchTasks,
  };
}
