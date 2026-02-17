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
  const keywords = ['add', 'create', 'make', 'build', 'setup', 'fix', 'update', 'task', 'todo', 'remind'];
  const lower = message.toLowerCase();
  
  for (const keyword of keywords) {
    if (lower.includes(keyword)) {
      const afterKeyword = message.substring(lower.indexOf(keyword) + keyword.length).trim();
      let title = afterKeyword.replace(/^(a |the |to |for )/i, '');
      
      const projectMatch = title.match(/to (mission control|moto|openclaw|personal)/i);
      if (projectMatch) {
        title = title.substring(0, projectMatch.index).trim();
      }
      
      return title.substring(0, 200);
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
