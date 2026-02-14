'use client';

import { EmptyState } from '@/components/shared/EmptyState';
import { Calendar } from 'lucide-react';

export default function CalendarPage() {
  return (
    <EmptyState
      title="Calendar"
      description="View and manage your schedule. Coming in a future update."
      icon={<Calendar size={48} />}
    />
  );
}
