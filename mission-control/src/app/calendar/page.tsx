'use client';

import { useState, useEffect } from 'react';
import { theme } from '@/config/theme';

type Event = {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
  htmlLink?: string;
};

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '', description: '', location: '' });

  useEffect(() => {
    fetch('/api/calendar?days=30')
      .then(res => res.json())
      .then(data => {
        setEvents(data.events || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const createEvent = async () => {
    const res = await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent),
    });
    if (res.ok) {
      setShowForm(false);
      setNewEvent({ title: '', start: '', end: '', description: '', location: '' });
      // Refresh events
      fetch('/api/calendar?days=30')
        .then(res => res.json())
        .then(data => setEvents(data.events || []));
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const isAllDay = (start: string, end: string) => {
    if (!start || !end) return false;
    return !start.includes('T') && !end.includes('T');
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: theme.colors.text.primary }}>
          Calendar
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            backgroundColor: theme.colors.accent.primary,
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          {showForm ? 'Cancel' : '+ Add Event'}
        </button>
      </div>

      {showForm && (
        <div style={{ 
          backgroundColor: theme.colors.background.secondary, 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '24px',
        }}>
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Event title"
              value={newEvent.title}
              onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: theme.colors.background.primary,
                color: theme.colors.text.primary,
                fontSize: '14px',
              }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <input
              type="datetime-local"
              value={newEvent.start}
              onChange={e => setNewEvent({ ...newEvent, start: e.target.value })}
              style={{
                padding: '10px',
                borderRadius: '6px',
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: theme.colors.background.primary,
                color: theme.colors.text.primary,
                fontSize: '14px',
              }}
            />
            <input
              type="datetime-local"
              value={newEvent.end}
              onChange={e => setNewEvent({ ...newEvent, end: e.target.value })}
              style={{
                padding: '10px',
                borderRadius: '6px',
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: theme.colors.background.primary,
                color: theme.colors.text.primary,
                fontSize: '14px',
              }}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Location (optional)"
              value={newEvent.location}
              onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: theme.colors.background.primary,
                color: theme.colors.text.primary,
                fontSize: '14px',
              }}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <textarea
              placeholder="Description (optional)"
              value={newEvent.description}
              onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
              rows={2}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: theme.colors.background.primary,
                color: theme.colors.text.primary,
                fontSize: '14px',
                resize: 'vertical',
              }}
            />
          </div>
          <button
            onClick={createEvent}
            disabled={!newEvent.title || !newEvent.start}
            style={{
              backgroundColor: newEvent.title && newEvent.start ? theme.colors.accent.primary : theme.colors.background.tertiary,
              color: '#fff',
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: newEvent.title && newEvent.start ? 'pointer' : 'not-allowed',
            }}
          >
            Create Event
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ color: theme.colors.text.secondary }}>Loading...</div>
      ) : events.length === 0 ? (
        <div style={{ 
          color: theme.colors.text.secondary, 
          padding: '40px',
          textAlign: 'center',
          backgroundColor: theme.colors.background.secondary,
          borderRadius: '8px',
        }}>
          No upcoming events
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {events.map(event => (
            <a
              key={event.id}
              href={event.htmlLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: '16px 20px',
                backgroundColor: theme.colors.background.secondary,
                borderRadius: '8px',
                textDecoration: 'none',
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: theme.colors.text.primary,
                marginBottom: '4px',
              }}>
                {event.title}
              </div>
              <div style={{ fontSize: '13px', color: theme.colors.text.secondary, marginBottom: '4px' }}>
                {formatDateTime(event.start)} {event.end && `- ${new Date(event.end).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
              </div>
              {event.location && (
                <div style={{ fontSize: '12px', color: theme.colors.text.tertiary }}>
                  📍 {event.location}
                </div>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}