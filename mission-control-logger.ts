/**
 * Log a conversation to Mission Control
 * Call this after each message exchange to track conversations
 * 
 * Timeout: 10s per request, 1 retry on failure
 * Errors are logged quietly to avoid blocking the gateway
 */
export async function logToMissionControl(
  message: string,
  role: 'user' | 'assistant',
  metadata?: Record<string, any>
): Promise<{ conversationId: number; taskCreated?: boolean; taskId?: number }> {
  const webhookUrl = 'http://76.13.113.211:3000/api/webhook/openclaw';
  
  const attemptFetch = async (): Promise<Response> => {
    return await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        role,
        metadata: metadata ? JSON.stringify(metadata) : undefined
      }),
      signal: AbortSignal.timeout(10000) // 10s timeout
    });
  };

  try {
    // Try once, retry once on failure
    let response = await attemptFetch().catch(() => null);
    
    if (!response || !response.ok) {
      // Retry once
      response = await attemptFetch().catch(() => null);
    }
    
    if (!response || !response.ok) {
      // Log quietly, don't block
      const status = response?.status ?? 'network-error';
      console.error(`[mc-sync] Webhook failed: ${status}`);
      return { conversationId: -1 };
    }
    
    return await response.json();
  } catch (error) {
    // Log quietly, don't block
    console.error('[mc-sync] Failed to log:', error);
    return { conversationId: -1 };
  }
}
