import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getEmergencyContacts,
  extractContactLimit,
  assessUrgency,
  executeGuardianPrompt,
  EmergencyContact,
  INITIAL_CONTACTS,
} from './guardianCore.ts';

test('getEmergencyContacts strictly sorts by priority ascending', () => {
  const mockContacts: EmergencyContact[] = [
    {
      id: 'c2',
      name: 'Campus Patrol',
      relationship: 'Security',
      phone: '111',
      priority: 3,
      channels: ['call'],
      status: 'active',
    },
    {
      id: 'c1',
      name: 'Didi',
      relationship: 'Sister',
      phone: '222',
      priority: 1,
      channels: ['sms', 'call'],
      status: 'active',
    },
    {
      id: 'c3',
      name: 'Mom',
      relationship: 'Parent',
      phone: '333',
      priority: 2,
      channels: ['sms'],
      status: 'active',
    },
  ];

  const result = getEmergencyContacts(mockContacts, 2);
  assert.equal(result.length, 2);
  assert.equal(result[0].name, 'Didi');
  assert.equal(result[0].priority, 1);
  assert.equal(result[1].name, 'Mom');
  assert.equal(result[1].priority, 2);
});

test('getEmergencyContacts returns empty array when no contacts exist (does not invent contacts)', () => {
  const result = getEmergencyContacts([], 3);
  assert.deepEqual(result, []);
  assert.equal(result.length, 0);
});

test('extractContactLimit parses multiple limit variations', () => {
  assert.equal(extractContactLimit('using get_emergency_contacts with limit 3', 5), 3);
  assert.equal(extractContactLimit('get_emergency_contacts(limit=4)', 5), 4);
  assert.equal(extractContactLimit('give me top 2 contacts', 5), 2);
  assert.equal(extractContactLimit('check my contacts', 5), 5);
});

test('assessUrgency classifies threat levels accurately', () => {
  assert.equal(assessUrgency('I want to test PocketGuardian AI').level, 'LOW');
  assert.equal(assessUrgency('Someone is following me down 5th avenue').level, 'HIGH');
  assert.equal(assessUrgency('Help me, attack in progress!').level, 'CRITICAL');
});

test('executeGuardianPrompt handles the exact prompt with Didi as primary', () => {
  const prompt =
    'I want to test PocketGuardian AI. Retrieve my emergency contacts in priority order, using the get_emergency_contacts tool with limit 3. Show me the returned contacts and explain which contact should be approached first. Do not invent contacts if the tool returns no data.';

  const response = executeGuardianPrompt(prompt, INITIAL_CONTACTS);

  assert.equal(response.assessedUrgency.level, 'LOW');
  assert.equal(response.selectedContact.primaryContact, 'Didi');
  assert.match(response.selectedContact.reason, /Didi is the first configured emergency contact/);
  assert.equal(response.toolExecution.actionInvocation, 'get_emergency_contacts(limit=3)');
  assert.equal(response.toolExecution.rawItems.length, 1);
  assert.equal(response.toolExecution.rawItems[0].name, 'Didi');
  assert.equal(response.remainingActions.length >= 2, true);
});

test('executeGuardianPrompt does NOT invent contacts when contact list is empty', () => {
  const prompt = 'Retrieve my emergency contacts in priority order with limit 3';
  const response = executeGuardianPrompt(prompt, []);

  assert.equal(response.selectedContact.primaryContact, null);
  assert.match(response.selectedContact.reason, /No contacts were returned/);
  assert.equal(response.toolExecution.rawItems.length, 0);
});
