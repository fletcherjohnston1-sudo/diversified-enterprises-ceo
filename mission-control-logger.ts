/**
 * Log a conversation to Mission Control
 * Call this after each message exchange to track conversations
 */
export async function logToMissionControl(
  message: string,
  role: 'user' | 'assistant',
  metadata?: Record<string, any>
): Promise<{ conversationId: number; taskCreated?: boolean; taskId?: number }> {
  const webhookUrl = 'http://76.13.113.211:3000/api/webhook/openclaw';
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        role,
        metadata: metadata ? JSON.stringify(metadata) : undefined
      })
    });
    
    if (!response.ok) {
      console.error('Mission Control webhook failed:', response.status);
      return { conversationId: -1 };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to log to Mission Control:', error);
    return { conversationId: -1 };
  }
}
