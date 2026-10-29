import { EmergencyContact, SafeZone, GuardianResponse, UrgencyLevel, ToolExecutionRecord } from './utils/guardianCore.ts';

export type {
  EmergencyContact,
  SafeZone,
  GuardianResponse,
  UrgencyLevel,
  ToolExecutionRecord,
};

export type ActiveTab = 'console' | 'contacts' | 'radar' | 'timer' | 'audit';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'guardian';
  timestamp: string;
  text?: string;
  response?: GuardianResponse;
  toolCall?: {
    toolName: string;
    params: any;
  };
}
