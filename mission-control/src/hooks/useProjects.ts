'use client';

import { useState, useEffect, useCallback } from 'react';
import { Project } from '@/types';

interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/projects');
      const result = await response.json();
      
      if (result.success) {
        setProjects(result.data);
      } else {
        setError(result.error || 'Failed to fetch projects');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
  };
}
