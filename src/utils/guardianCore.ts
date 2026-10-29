export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  priority: number;
  channels: ('sms' | 'call' | 'live_location')[];
  status: 'active' | 'unverified' | 'unavailable';
  notes?: string;
  lastContacted?: string;
}

export interface SafeZone {
  id: string;
  name: string;
  type: 'police' | 'hospital' | 'transit' | 'campus';
  distanceMiles: number;
  open24Hours: boolean;
  address: string;
  phone: string;
  securityStaffed: boolean;
}

export type UrgencyLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface ToolExecutionRecord {
  toolName: string;
  parameters: Record<string, any>;
  timestamp: string;
  status: 'success' | 'empty' | 'error';
  rawOutput: any;
}

export interface GuardianResponse {
  id: string;
  query: string;
  timestamp: string;
  assessedUrgency: {
    level: UrgencyLevel;
    rationale: string;
  };
  recommendedImmediateAction: string;
  selectedContact: {
    primaryContact: string | null;
    reason: string;
    escalationChain: string[];
  };
  toolExecution: {
    actionInvocation: string;
    resultSummary: string;
    rawItems: any[];
    toolRecord: ToolExecutionRecord;
  };
  remainingActions: string[];
}

export const INITIAL_CONTACTS: EmergencyContact[] = [
  {
    id: 'contact-didi',
    name: 'Didi',
    relationship: 'Sister & Designated First Responder',
    phone: '+1 (555) 349-8812',
    priority: 1,
    channels: ['sms', 'call', 'live_location'],
    status: 'active',
    notes: 'Key holder, lives 10 mins away, authorized for primary emergency dispatch.',
  },
];

export const INITIAL_SAFE_ZONES: SafeZone[] = [
  {
    id: 'sz-1',
    name: 'Central District Police Substation',
    type: 'police',
    distanceMiles: 0.4,
    open24Hours: true,
    address: '450 Civic Center Blvd',
    phone: '+1 (555) 911-0144',
    securityStaffed: true,
  },
  {
    id: 'sz-2',
    name: 'Metropolitan Hospital Level 1 Trauma Center',
    type: 'hospital',
    distanceMiles: 0.8,
    open24Hours: true,
    address: '1200 Healthcare Way',
    phone: '+1 (555) 782-9000',
    securityStaffed: true,
  },
  {
    id: 'sz-3',
    name: 'Downtown Transit Hub (24/7 Security Kiosk)',
    type: 'transit',
    distanceMiles: 1.1,
    open24Hours: true,
    address: '88 Market St Terminal',
    phone: '+1 (555) 674-8899',
    securityStaffed: true,
  },
  {
    id: 'sz-4',
    name: 'Campus Safety & Escort Station',
    type: 'campus',
    distanceMiles: 1.5,
    open24Hours: true,
    address: 'University Quad Tower A',
    phone: '+1 (555) 432-1100',
    securityStaffed: true,
  },
];

/**
 * Tool implementation: get_emergency_contacts
 * Strictly orders contacts by priority ascending, limits output,
 * and NEVER invents fake contacts when empty.
 */
export function getEmergencyContacts(
  contacts: EmergencyContact[],
  limit: number = 3
): EmergencyContact[] {
  if (!Array.isArray(contacts) || contacts.length === 0) {
    return [];
  }

  // Clone and sort by priority ascending (1 = highest priority)
  const sorted = [...contacts].sort((a, b) => a.priority - b.priority);
  return sorted.slice(0, Math.max(1, limit));
}

/**
 * Assesses threat urgency from user input text
 */
export function assessUrgency(text: string): { level: UrgencyLevel; rationale: string } {
  const lower = text.toLowerCase();

  if (
    lower.includes('help me') ||
    lower.includes('attack') ||
    lower.includes('robbery') ||
    lower.includes('bleeding') ||
    lower.includes('immediate danger') ||
    lower.includes('in danger') ||
    lower.includes('emergency 911')
  ) {
    return {
      level: 'CRITICAL',
      rationale: 'Active acute danger detected. Immediate emergency response protocol initiated.',
    };
  }

  if (
    lower.includes('following me') ||
    lower.includes('suspicious person') ||
    lower.includes('stalking') ||
    lower.includes('uncomfortable') ||
    lower.includes('scared') ||
    lower.includes('dark alley')
  ) {
    return {
      level: 'HIGH',
      rationale: 'Heightened environmental threat. Escalation chain armed, live tracking broadcast recommended.',
    };
  }

  if (
    lower.includes('walking home') ||
    lower.includes('late night') ||
    lower.includes('check-in') ||
    lower.includes('timer') ||
    lower.includes('battery low')
  ) {
    return {
      level: 'MODERATE',
      rationale: 'Precautionary transit monitoring. Safety check timer and contact standby advised.',
    };
  }

  // Routine check, tool test, contact review
  return {
    level: 'LOW',
    rationale: 'Routine system test / configuration check.',
  };
}

/**
 * Parses user message for tool intent and execution limit
 */
export function extractContactLimit(text: string, defaultLimit: number = 3): number {
  const match = text.match(/limit\s*[:=]?\s*(\d+)/i) || text.match(/top\s*(\d+)/i) || text.match(/first\s*(\d+)/i);
  if (match && match[1]) {
    const val = parseInt(match[1], 10);
    if (!isNaN(val) && val > 0) return val;
  }
  return defaultLimit;
}

/**
 * Executes a simulated PocketGuardian AI cycle, evaluating user prompt,
 * invoking tools, and producing the official 5-part Guardian Safety report.
 */
export function executeGuardianPrompt(
  prompt: string,
  contacts: EmergencyContact[],
  safeZones: SafeZone[] = INITIAL_SAFE_ZONES
): GuardianResponse {
  const urgency = assessUrgency(prompt);
  const now = new Date().toISOString();
  const lower = prompt.toLowerCase();

  // Check if contact tool is invoked
  const isContactTool =
    lower.includes('get_emergency_contacts') ||
    lower.includes('emergency contacts') ||
    lower.includes('retrieve my emergency contacts') ||
    lower.includes('contacts in priority');

  const isSafeZoneTool =
    lower.includes('get_safe_zones') ||
    lower.includes('safe zones') ||
    lower.includes('safe havens') ||
    lower.includes('hospital') ||
    lower.includes('police station');

  const isPanicTool =
    lower.includes('panic') ||
    lower.includes('trigger_panic_alert') ||
    lower.includes('distress signal') ||
    lower.includes('sos');

  if (isContactTool || (!isSafeZoneTool && !isPanicTool)) {
    const limit = extractContactLimit(prompt, 3);
    const retrieved = getEmergencyContacts(contacts, limit);

    const toolRecord: ToolExecutionRecord = {
      toolName: 'get_emergency_contacts',
      parameters: { limit },
      timestamp: now,
      status: retrieved.length > 0 ? 'success' : 'empty',
      rawOutput: retrieved,
    };

    let recommendedAction = '';
    let primaryContact: string | null = null;
    let contactReason = '';
    const escalationChain = retrieved.map((c) => `${c.priority}. ${c.name} (${c.relationship})`);
    let resultSummary = '';
    const remainingActions: string[] = [];

    if (retrieved.length > 0) {
      primaryContact = retrieved[0].name;

      if (urgency.level === 'LOW') {
        recommendedAction = 'Review the retrieved contact to ensure information and priority order are accurate and up to date.';
        contactReason = `${retrieved[0].name} is the first configured emergency contact returned by the system in your priority list. In an elevated or emergency situation, this contact would be approached first in accordance with your configured escalation settings.`;
        remainingActions.push(`Confirm that "${retrieved[0].name}" has complete and reachable contact details (e.g., phone number, alert channel) configured.`);
        if (contacts.length <= 1) {
          remainingActions.push('If you wish to have backup contacts for emergency escalation, configure additional emergency contacts in your profile.');
        } else {
          remainingActions.push(`Review secondary contacts (${retrieved.slice(1).map(c => c.name).join(', ')}) for escalation redundancy.`);
        }
      } else {
        recommendedAction = `Immediate broadcast notification primed for ${retrieved[0].name}. Stand by for one-touch dispatch.`;
        contactReason = `${retrieved[0].name} holds Priority Tier 1 and is designated for immediate first-responder escalation under elevated threat.`;
        remainingActions.push(`Keep device unlocked or use fast-panic trigger to ping ${retrieved[0].name}.`);
        remainingActions.push('Head toward the nearest illuminated safe zone if in transit.');
      }

      resultSummary = `Retrieved ${retrieved.length} contact${retrieved.length > 1 ? 's' : ''}:\n` +
        retrieved.map((c, i) => `  ${i + 1}. **${c.name}**${c.relationship ? ` (${c.relationship})` : ''}`).join('\n');
    } else {
      primaryContact = null;
      recommendedAction = 'No emergency contacts are currently configured. Immediately register at least one primary contact to activate automated escalation.';
      contactReason = 'No contacts were returned by the get_emergency_contacts tool. In compliance with safety verification protocols, no contacts have been fabricated or assumed.';
      resultSummary = 'No contacts found. Tool returned 0 records.';
      remainingActions.push('Add a primary emergency contact with valid phone number and alert preferences.');
      remainingActions.push('Test contact reachability with a silent verification ping.');
    }

    return {
      id: 'resp-' + Math.random().toString(36).substring(2, 9),
      query: prompt,
      timestamp: now,
      assessedUrgency: urgency,
      recommendedImmediateAction: recommendedAction,
      selectedContact: {
        primaryContact,
        reason: contactReason,
        escalationChain,
      },
      toolExecution: {
        actionInvocation: `get_emergency_contacts(limit=${limit})`,
        resultSummary,
        rawItems: retrieved,
        toolRecord,
      },
      remainingActions,
    };
  }

  if (isSafeZoneTool) {
    const toolRecord: ToolExecutionRecord = {
      toolName: 'get_safe_zones',
      parameters: { radiusMiles: 2.0 },
      timestamp: now,
      status: 'success',
      rawOutput: safeZones,
    };

    const nearest = safeZones[0];
    const topContacts = getEmergencyContacts(contacts, 1);
    const primaryName = topContacts[0]?.name || 'Primary Guardian';

    return {
      id: 'resp-' + Math.random().toString(36).substring(2, 9),
      query: prompt,
      timestamp: now,
      assessedUrgency: {
        level: 'MODERATE',
        rationale: 'Active transit route assessment requested.',
      },
      recommendedImmediateAction: `Proceed toward ${nearest.name} (${nearest.distanceMiles} mi away, open 24/7).`,
      selectedContact: {
        primaryContact: topContacts[0]?.name || null,
        reason: topContacts[0]
          ? `${topContacts[0].name} will receive automatic GPS waypoint telemetry if safety walk timer expires.`
          : 'No contacts configured for safe route broadcast.',
        escalationChain: topContacts.map((c) => `${c.priority}. ${c.name}`),
      },
      toolExecution: {
        actionInvocation: 'get_safe_zones(radiusMiles=2.0)',
        resultSummary: `Found ${safeZones.length} verified safe havens within radius:\n` +
          safeZones.map((sz, i) => `  ${i + 1}. **${sz.name}** (${sz.distanceMiles} mi, ${sz.address})`).join('\n'),
        rawItems: safeZones,
        toolRecord,
      },
      remainingActions: [
        `Navigate toward ${nearest.address}.`,
        `Share live location link with ${primaryName}.`,
        'Keep safety check-in active until arrived.',
      ],
    };
  }

  // Panic / Distress Signal
  const topContacts = getEmergencyContacts(contacts, 3);
  const toolRecord: ToolExecutionRecord = {
    toolName: 'trigger_panic_alert',
    parameters: { level: 'CRITICAL', silent: false, dispatchQueue: topContacts.map(c => c.name) },
    timestamp: now,
    status: 'success',
    rawOutput: { status: 'DISPATCHED', contactsAlerted: topContacts.map(c => c.name) },
  };

  return {
    id: 'resp-' + Math.random().toString(36).substring(2, 9),
    query: prompt,
    timestamp: now,
    assessedUrgency: {
      level: 'CRITICAL',
      rationale: 'Immediate panic protocol activated by user instruction.',
    },
    recommendedImmediateAction: 'Seek immediate shelter or crowd presence. Audio incident recording and live location beacon are broadcasting.',
    selectedContact: {
      primaryContact: topContacts[0]?.name || null,
      reason: topContacts[0]
        ? `${topContacts[0].name} holds Priority Tier 1 and is currently being messaged and dialed on the high-priority emergency channel.`
        : 'Emergency contacts list is empty. Dialing 911 / municipal emergency dispatch directly.',
      escalationChain: topContacts.map(c => `${c.priority}. ${c.name} [ALERT_SENT]`),
    },
    toolExecution: {
      actionInvocation: `trigger_panic_alert(contacts=${topContacts.length})`,
      resultSummary: topContacts.length > 0
        ? `Alert dispatched to ${topContacts.map(c => c.name).join(', ')} with high-precision GPS coordinates.`
        : 'No contacts configured. Emergency bypass triggered.',
      rawItems: topContacts,
      toolRecord,
    },
    remainingActions: [
      'Maintain cover in a secure or illuminated area.',
      'Answer incoming emergency callback when phone rings.',
      'Tap "Cancel Alert" with safety PIN if triggered unintentionally.',
    ],
  };
}
