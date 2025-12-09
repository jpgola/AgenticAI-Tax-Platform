export enum AgentType {
  INTAKE = 'Intake Agent',
  EXTRACTION = 'Extraction Agent',
  VALIDATION = 'Validation Agent',
  ADVISOR = 'Advisor Agent',
  FILING = 'Filing Agent',
  MEMORY = 'Memory Agent'
}

export enum AgentStatus {
  IDLE = 'idle',
  WORKING = 'working',
  SUCCESS = 'success',
  ERROR = 'error',
  WAITING_FOR_HUMAN = 'waiting_for_human'
}

export interface TaxDocument {
  id: string;
  name: string;
  type: string;
  status: 'uploaded' | 'processing' | 'verified';
  confidenceScore?: number;
  uploadDate: string;
}

export interface DeductionItem {
  id: string;
  category: string;
  amount: number;
  description: string;
  sourceDocId?: string;
  confidence: number;
  explanation: string; // The "Explain My Return" content
}

export interface RiskItem {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  mitigation: string; // Agent's explanation or action taken
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: Date;
  isThinking?: boolean;
}