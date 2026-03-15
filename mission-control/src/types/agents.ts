// Owner agents — the five core agents that can own a project, plus unassigned
export type OwnerAgent = 'main' | 'cfo' | 'cro' | 'cto' | 'schwab' | 'unassigned';

export const VALID_OWNER_AGENTS: OwnerAgent[] = ['main', 'cfo', 'cro', 'cto', 'schwab', 'unassigned'];

export type AgentPriority = 'high' | 'medium' | 'low';
export type AgentCategory = 'hub' | 'finance' | 'revenue' | 'tech' | 'lifestyle' | 'other';

export interface Agent {
  id: string;
  human_name: string;
  role: string;
  priority: AgentPriority;
  model: string;
  category: AgentCategory;
  status: string;
  last_active_at: string | null;
  notes?: string;
}
