'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Project {
  id: number;
  name: string;
  color: string;
  description: string | null;
  created_at: string;
}

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  created_at: string;
}

interface Note {
  id: number;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

interface FileRecord {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string | null;
  size: number | null;
  created_at: string;
}

interface Conversation {
  id: number;
  message_text: string;
  role: string;
  created_at: string;
}

type Tab = 'tasks' | 'notes' | 'files' | 'conversations';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('tasks');

  // Edit project modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', color: '#3B82F6' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Add task modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'Backlog', priority: 'medium' });
  const [savingTask, setSavingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Add note modal
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });
  const [savingNote, setSavingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // File upload
  const [uploadingFile, setUploadingFile] = useState(false);

  // Add conversation modal
  const [isConvModalOpen, setIsConvModalOpen] = useState(false);
  const [convForm, setConvForm] = useState({ message_text: '', role: 'user' });
  const [savingConv, setSavingConv] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();
      if (data.success) {
        setProject(data.data.project);
        setTasks(data.data.tasks);
        setConversations(data.data.conversations);
        setEditForm({
          name: data.data.project.name,
          description: data.data.project.description || '',
          color: data.data.project.color
        });
      } else {
        setError(data.error);
      }

      // Fetch notes
      const notesRes = await fetch(`/api/projects/${projectId}/notes`);
      const notesData = await notesRes.json();
      if (notesData.success) {
        setNotes(notesData.data);
      }

      // Fetch files
      const filesRes = await fetch(`/api/projects/${projectId}/files`);
      const filesData = await filesRes.json();
      if (filesData.success) {
        setFiles(filesData.data);
      }
    } catch (err) {
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim()) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();
      if (data.success) {
        setProject(data.data);
        setIsEditModalOpen(false);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project? Tasks and conversations will be unassigned.')) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        router.push('/projects');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    setSavingTask(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskForm)
      });

      const data = await response.json();
      if (data.success) {
        setTasks([data.data, ...tasks]);
        setIsTaskModalOpen(false);
        setTaskForm({ title: '', description: '', status: 'Backlog', priority: 'medium' });
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to create task');
    } finally {
      setSavingTask(false);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !editingTask) return;

    setSavingTask(true);
    try {
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskForm)
      });

      const data = await response.json();
      if (data.success) {
        setTasks(tasks.map(t => t.id === editingTask.id ? data.data : t));
        setIsTaskModalOpen(false);
        setEditingTask(null);
        setTaskForm({ title: '', description: '', status: 'Backlog', priority: 'medium' });
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to update task');
    } finally {
      setSavingTask(false);
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.title.trim()) return;

    setSavingNote(true);
    try {
      if (editingNote) {
        const response = await fetch(`/api/notes/${editingNote.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noteForm)
        });
        const data = await response.json();
        if (data.success) {
          setNotes(notes.map(n => n.id === editingNote.id ? data.data : n));
        }
      } else {
        const response = await fetch(`/api/projects/${projectId}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noteForm)
        });
        const data = await response.json();
        if (data.success) {
          setNotes([data.data, ...notes]);
        }
      }
      setIsNoteModalOpen(false);
      setNoteForm({ title: '', content: '' });
      setEditingNote(null);
    } catch (err) {
      setError('Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Delete this note?')) return;
    try {
      const response = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      if (response.ok) {
        setNotes(notes.filter(n => n.id !== noteId));
      }
    } catch (err) {
      setError('Failed to delete note');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Delete this task?')) return;
    try {
      const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (response.ok) {
        setTasks(tasks.filter(t => t.id !== taskId));
      }
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        setFiles([data.data, ...files]);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to upload file');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!confirm('Delete this file?')) return;
    try {
      const response = await fetch(`/api/files/${fileId}`, { method: 'DELETE' });
      if (response.ok) {
        setFiles(files.filter(f => f.id !== fileId));
      }
    } catch (err) {
      setError('Failed to delete file');
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleAddConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convForm.message_text.trim()) return;

    setSavingConv(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(convForm)
      });

      const data = await response.json();
      if (data.success) {
        setConversations([data.data, ...conversations]);
        setIsConvModalOpen(false);
        setConvForm({ message_text: '', role: 'user' });
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to add conversation');
    } finally {
      setSavingConv(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading project...</div>;
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-red-600">Project not found</div>
        <Link href="/projects" className="text-blue-500 hover:underline mt-4 inline-block">
          ← Back to projects
        </Link>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'tasks', label: 'Tasks', count: tasks.length },
    { id: 'notes', label: 'Notes', count: notes.length },
    { id: 'files', label: 'Files', count: files.length },
    { id: 'conversations', label: 'Conversations', count: conversations.length },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Link href="/projects" className="text-gray-400 hover:text-gray-700">
          Projects
        </Link>
        <span className="text-gray-400">/</span>
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }} />
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#ffffff' }}>
          {project.name}
          <button onClick={() => setIsEditModalOpen(true)} className="text-sm text-gray-400 hover:text-blue-400" title="Edit project">
            ✏️
          </button>
          <button onClick={handleDeleteProject} disabled={deleting} className="text-sm text-gray-400 hover:text-red-400" title="Delete project">
            🗑️
          </button>
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {/* Project Info - Description */}
      {project.description && (
        <div className="bg-gray-800 border rounded-lg p-4 mb-6 style={{ backgroundColor: '#1f2937' }}">
          <p className="text-gray-300">{project.description}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b mb-4">
        <div className="flex gap-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 px-1 text-sm font-medium border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'tasks' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setIsTaskModalOpen(true)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
              + Add Task
            </button>
          </div>
          {tasks.length === 0 ? (
            <div className="text-gray-400 text-sm">No tasks in this project</div>
          ) : (
            <div className="space-y-2">
              {tasks.map(task => (
                <div key={task.id} className="border border-gray-600 rounded-lg p-3 bg-gray-800">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-100">{task.title}</h3>
                      {task.description && <p className="text-sm text-gray-300 mt-1">{task.description}</p>}
                      <div className="flex gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          task.status === 'Done' ? 'bg-green-100 text-green-800' :
                          task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>{task.status}</span>
                        <span className="text-xs text-gray-400">{task.priority}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{new Date(task.created_at).toLocaleDateString()}</span>
                      <button onClick={() => { setEditingTask(task); setTaskForm({ title: task.title, description: task.description || '', status: task.status, priority: task.priority }); setIsTaskModalOpen(true); }} className="p-1 text-gray-400 hover:text-blue-600" title="Edit task">
                        ✏️
                      </button>
                      <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-gray-400 hover:text-red-600" title="Delete task">
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => { setEditingNote(null); setNoteForm({ title: '', content: '' }); setIsNoteModalOpen(true); }} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
              + Add Note
            </button>
          </div>
          {notes.length === 0 ? (
            <div className="text-gray-400 text-sm">No notes in this project</div>
          ) : (
            <>
              {/* Date created as first note */}
              <div className="border border-blue-200 rounded-lg p-3 bg-blue-50 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-blue-900">📅 Project Created</h3>
                    <p className="text-sm text-blue-700 mt-1">{new Date(project.created_at).toLocaleString('en-US', { timeZone: 'America/New_York' })}</p>
                  </div>
                </div>
              </div>
              {notes.map(note => (
                <div key={note.id} className="border border-gray-600 rounded-lg p-3 bg-gray-800">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-100">{note.title}</h3>
                      {note.content && <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap">{note.content}</p>}
                      <p className="text-xs text-gray-400 mt-2">Updated {new Date(note.updated_at).toLocaleString('en-US', { timeZone: 'America/New_York' })}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button onClick={() => { setEditingNote(note); setNoteForm({ title: note.title, content: note.content || '' }); setIsNoteModalOpen(true); }} className="p-1 text-gray-400 hover:text-blue-600">
                        ✏️
                      </button>
                      <button onClick={() => handleDeleteNote(note.id)} className="p-1 text-gray-400 hover:text-red-600">
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {activeTab === 'files' && (
        <div>
          <div className="flex justify-end mb-4">
            <label className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm cursor-pointer ${uploadingFile ? 'opacity-50' : ''}`}>
              {uploadingFile ? 'Uploading...' : '+ Upload File'}
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploadingFile} />
            </label>
          </div>
          {files.length === 0 ? (
            <div className="text-gray-400 text-sm">No files in this project</div>
          ) : (
            <div className="space-y-2">
              {files.map(file => (
                <div key={file.id} className="border border-gray-600 rounded-lg p-3 bg-gray-800 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-100">{file.original_name}</h3>
                    <p className="text-xs text-gray-400">{formatFileSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => handleDeleteFile(file.id)} className="p-1 text-gray-400 hover:text-red-600">
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'conversations' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setIsConvModalOpen(true)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
              + Add Conversation
            </button>
          </div>
          {conversations.length === 0 ? (
            <div className="text-gray-400 text-sm">No conversations in this project</div>
          ) : (
            <div className="space-y-2">
              {conversations.map(conv => (
                <div key={conv.id} className="border border-gray-600 rounded-lg p-3 bg-gray-800">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">{conv.role}</span>
                      <p className="text-sm text-gray-700 mt-1">{conv.message_text}</p>
                    </div>
                    <span className="text-xs text-gray-400 ml-2">{new Date(conv.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Edit Project</h2>
            <form onSubmit={handleUpdateProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-gray-100" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-gray-100" rows={3} />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input type="color" value={editForm.color} onChange={e => setEditForm({ ...editForm, color: e.target.value })} className="w-16 h-10 border rounded cursor-pointer" />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-gray-300">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">{editingTask ? 'Edit Task' : 'Add Task'}</h2>
            <form onSubmit={editingTask ? handleUpdateTask : handleAddTask}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-gray-100" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-gray-100" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-gray-100">
                    <option value="Backlog">Backlog</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-gray-100">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => { setIsTaskModalOpen(false); setEditingTask(null); setTaskForm({ title: '', description: '', status: 'Backlog', priority: 'medium' }); }} className="px-4 py-2 text-gray-300">Cancel</button>
                <button type="submit" disabled={savingTask} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50">
                  {savingTask ? (editingTask ? 'Saving...' : 'Creating...') : (editingTask ? 'Save' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">{editingNote ? 'Edit Note' : 'Add Note'}</h2>
            <form onSubmit={handleSaveNote}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" value={noteForm.title} onChange={e => setNoteForm({ ...noteForm, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-gray-100" required />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea value={noteForm.content} onChange={e => setNoteForm({ ...noteForm, content: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-gray-100" rows={6} />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => { setIsNoteModalOpen(false); setEditingNote(null); }} className="px-4 py-2 text-gray-300">Cancel</button>
                <button type="submit" disabled={savingNote} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50">
                  {savingNote ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Conversation Modal */}
      {isConvModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-100 mb-4">Add Conversation</h2>
            <form onSubmit={handleAddConversation}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={convForm.role} onChange={e => setConvForm({ ...convForm, role: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-gray-100">
                  <option value="user">User</option>
                  <option value="assistant">Assistant</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea value={convForm.message_text} onChange={e => setConvForm({ ...convForm, message_text: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-gray-100" rows={4} required placeholder="Enter conversation message..." />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setIsConvModalOpen(false)} className="px-4 py-2 text-gray-300">Cancel</button>
                <button type="submit" disabled={savingConv} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50">
                  {savingConv ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
