'use client';

import { EmptyState } from '@/components/shared/EmptyState';
import { FileText } from 'lucide-react';

export default function ContentPage() {
  return (
    <EmptyState
      title="Content"
      description="Manage your content library. Coming in a future update."
      icon={<FileText size={48} />}
    />
  );
}
