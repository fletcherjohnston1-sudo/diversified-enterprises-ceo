import { database } from '@/lib/db';

function detectProject(message: string): number | null {
  const lower = message.toLowerCase();
  if (lower.includes('mission control')) return 1;
  if (lower.includes('moto')) return 2;
  if (lower.includes('openclaw')) return 3;
  if (lower.includes('personal')) return 4;
  return null;
}

function detectPriority(message: string): 'high' | 'medium' | 'low' {
  const lower = message.toLowerCase();
  if (/(urgent|asap|critical|immediately|now|emergency)/.test(lower)) return 'high';
  if (/(eventually|someday|maybe|low priority|when you can)/.test(lower)) return 'low';
  return 'medium';
}

function extractTaskTitle(message: string): string | null {
  // Only create tasks for EXPLICIT commands
  const explicitKeywords = [
    'add task',
    'create task', 
    'new task',
    'todo:',
    'task:',
    'remind me to',
    'reminder:',
    'add to task',
    'create a task',
    'make a task',
    'add to do',
    'add todo'
  ];
  
  const lower = message.toLowerCase();
  
  for (const keyword of explicitKeywords) {
    if (lower.includes(keyword)) {
      const index = lower.indexOf(keyword);
      const afterKeyword = message.substring(index + keyword.length).trim();
      let title = afterKeyword.replace(/^(a |the |to |for )/i, '');
      
      // Stop at common sentence endings
      const sentenceEnd = title.search(/[.!?\n]/);
      if (sentenceEnd > 10) {
        title = title.substring(0, sentenceEnd).trim();
      }
      
      const projectMatch = title.match(/to (mission control|moto|openclaw|personal)/i);
      if (projectMatch) {
        title = title.substring(0, projectMatch.index).trim();
      }
      
      if (title.length > 3) {
        return title.substring(0, 200);
      }
    }
  }
  
  return null;
}

export async function POST(request: Request) {
  let payload: any;

  try {
    payload = await request.json();
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!payload || typeof payload.message !== 'string' || !payload.role) {
    return new Response(
      JSON.stringify({ success: false, error: 'Missing required fields' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { message, role, metadata } = payload;
  const projectId = detectProject(message);

  const conversation = database.conversations.create({
    message_text: message,
    role,
    project_id: projectId,
    metadata: metadata ? JSON.stringify(metadata) : null,
  }) as { id: number };

  let taskCreated = false;
  let taskId = null;

  if (role === 'user') {
    const title = extractTaskTitle(message);
    
    if (title) {
      const priority = detectPriority(message);
      
      const task = database.tasks.create({
        title,
        description: message,
        status: 'Backlog',
        priority,
        project_id: projectId,
        conversation_id: conversation.id,
        auto_created: 1,
      }) as { id: number };
      
      taskCreated = true;
      taskId = task.id;
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      conversation_id: conversation.id,
      task_created: taskCreated,
      task_id: taskId,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
