'use client';

import { useEffect, useState } from 'react';

interface Conversation {
  id: number;
  message_text: string;
  role: string;
  project_id: number | null;
  created_at: string;
}

interface TaskState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskStates, setTaskStates] = useState<Record<number, TaskState>>({});
  const [search, setSearch] = useState('');

  const filtered = conversations.filter(c => 
    c.message_text.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    fetch('/api/conversations')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setConversations(data.data);
        }
        setLoading(false);
      });
  }, []);

  const createTask = async (conv: Conversation) => {
    // Set loading state
    setTaskStates(prev => ({
      ...prev,
      [conv.id]: { loading: true, success: false, error: null }
    }));

    try {
      const response = await fetch(`/api/conversations/${conv.id}/create-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: conv.message_text.substring(0, 100),
          status: 'Backlog'
        })
      });
      
      if (response.ok) {
        // Set success state
        setTaskStates(prev => ({
          ...prev,
          [conv.id]: { loading: false, success: true, error: null }
        }));

        // Clear success after 3 seconds
        setTimeout(() => {
          setTaskStates(prev => ({
            ...prev,
            [conv.id]: { loading: false, success: false, error: null }
          }));
        }, 3000);
      } else {
        setTaskStates(prev => ({
          ...prev,
          [conv.id]: { loading: false, success: false, error: 'Failed to create task' }
        }));
      }
    } catch (error) {
      setTaskStates(prev => ({
        ...prev,
        [conv.id]: { loading: false, success: false, error: 'Error creating task' }
      }));
    }
  };

  if (loading) {
    return <div className="p-6">Loading conversations...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Conversations</h1>
      
      <input
        type="text"
        placeholder="Search conversations..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 mb-4 border rounded-lg bg-gray-800 text-white placeholder-gray-400"
      />
      
      <p className="text-sm text-gray-500 mb-4">{filtered.length} of {conversations.length} conversations</p>
      
      <div className="space-y-4">
        {filtered.map(conv => {
          const state = taskStates[conv.id] || { loading: false, success: false, error: null };
          
          return (
            <div key={conv.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {conv.role}
                    </span>
                    {conv.project_id && (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        Project {conv.project_id}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800 mb-2">{conv.message_text}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(conv.created_at).toLocaleString('en-US', { timeZone: 'America/New_York' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => createTask(conv)}
                    disabled={state.loading}
                    className={`px-4 py-2 rounded text-sm whitespace-nowrap ${
                      state.loading
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {state.loading ? 'Creating...' : 'Create Task'}
                  </button>
                  {state.success && (
                    <span className="text-green-600 text-sm flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Task created!
                    </span>
                  )}
                  {state.error && (
                    <span className="text-red-600 text-sm">{state.error}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
