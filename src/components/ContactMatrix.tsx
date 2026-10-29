import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Shield,
  Phone,
  MessageSquare,
  MapPin,
  CheckCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  UserCheck,
} from 'lucide-react';
import { EmergencyContact } from '../types.ts';
import { INITIAL_CONTACTS } from '../utils/guardianCore.ts';

interface ContactMatrixProps {
  contacts: EmergencyContact[];
  setContacts: React.Dispatch<React.SetStateAction<EmergencyContact[]>>;
  onRunTestWithContacts: () => void;
}

export const ContactMatrix: React.FC<ContactMatrixProps> = ({
  contacts,
  setContacts,
  onRunTestWithContacts,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [testNotificationMsg, setTestNotificationMsg] = useState<string | null>(null);

  // Form fields
  const [newName, setNewName] = useState('');
  const [newRelationship, setNewRelationship] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newPriority, setNewPriority] = useState<number>(contacts.length + 1);

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const newContact: EmergencyContact = {
      id: 'contact-' + Date.now(),
      name: newName.trim(),
      relationship: newRelationship.trim() || 'Emergency Contact',
      phone: newPhone.trim(),
      priority: Number(newPriority),
      channels: ['sms', 'call', 'live_location'],
      status: 'active',
      notes: newNotes.trim() || 'Registered safety contact.',
    };

    setContacts((prev) => {
      const updated = [...prev, newContact].sort((a, b) => a.priority - b.priority);
      return updated.map((c, i) => ({ ...c, priority: i + 1 }));
    });

    setNewName('');
    setNewRelationship('');
    setNewPhone('');
    setNewNotes('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    setContacts((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      return filtered.map((c, i) => ({ ...c, priority: i + 1 }));
    });
  };

  const handleMovePriority = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === contacts.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...contacts];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const reindexed = reordered.map((c, i) => ({ ...c, priority: i + 1 }));
    setContacts(reindexed);
  };

  const handleTestPing = (contact: EmergencyContact) => {
    setTestNotificationMsg(`Dispatched encrypted safety ping to ${contact.name} via ${contact.channels.join(' + ').toUpperCase()}`);
    setTimeout(() => {
      setTestNotificationMsg(null);
    }, 4000);
  };

  const handleRestoreDefault = () => {
    setContacts(INITIAL_CONTACTS);
  };

  const handleClearAll = () => {
    setContacts([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Test Notification Banner */}
      {testNotificationMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{testNotificationMsg}</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-emerald-400">SUCCESS</span>
        </div>
      )}

      {/* Overview & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Emergency Contacts & Priority Escalation Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Guardian AI dispatches alerts in strict Priority Order (Tier 1 is approached first, followed by Tier 2, etc.)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>

          <button
            type="button"
            onClick={handleRestoreDefault}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Reset to Didi (Default Priority 1)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset (Didi)</span>
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-800/50 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Clear all contacts to test zero-data behavior"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All (Test 0)</span>
          </button>
        </div>
      </div>

      {/* Add Contact Form Modal / Drawer */}
      {isAdding && (
        <form
          onSubmit={handleAddContact}
          className="p-5 rounded-2xl bg-slate-900 border border-cyan-800/60 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              Register New Emergency Escalation Contact
            </h3>
            <span className="text-xs text-slate-400">Position will be assigned based on priority</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Papa, Officer Chen, Alex"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Relationship *
              </label>
              <input
                type="text"
                required
                value={newRelationship}
                onChange={(e) => setNewRelationship(e.target.value)}
                placeholder="e.g. Parent, Security, Roommate"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Phone Number (E.164) *
              </label>
              <input
                type="tel"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Priority Tier (1 = First to be contacted)
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value={1}>Tier 1 (Highest Priority / Primary)</option>
                <option value={2}>Tier 2 (Secondary Backup)</option>
                <option value={3}>Tier 3 (Tertiary Escalation)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Emergency Notes / Access Details
              </label>
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="e.g. Lives 5 mins away, has apartment key, physician"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
            >
              Save Contact
            </button>
          </div>
        </form>
      )}

      {/* Contacts List */}
      <div className="space-y-3">
        {contacts.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-dashed border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-950/50 border border-rose-800/60 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">0 Contacts Configured (Zero-Data Verification Mode)</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Running the query now will demonstrate that the `get_emergency_contacts` tool returns 0 records and PocketGuardian strictly avoids inventing fake contacts.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={onRunTestWithContacts}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
              >
                Test in Guardian Console &rarr;
              </button>
              <button
                type="button"
                onClick={handleRestoreDefault}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Restore "Didi" Contact
              </button>
            </div>
          </div>
        ) : (
          contacts.map((contact, index) => (
            <div
              key={contact.id}
              className={`p-4 rounded-2xl border transition-all ${
                contact.priority === 1
                  ? 'bg-slate-900/90 border-cyan-800/80 shadow-md shadow-cyan-950/30'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 ${
                      contact.priority === 1
                        ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    #{contact.priority}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-white">{contact.name}</h3>
                      <span className="text-xs text-slate-400">({contact.relationship})</span>
                      {contact.priority === 1 && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          Primary Escalation Contact
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-300 flex items-center space-x-3">
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{contact.phone}</span>
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{contact.notes}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 pt-1 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-500">Alert Channels:</span>
                      {contact.channels.map((ch) => (
                        <span key={ch} className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 uppercase text-[10px]">
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleTestPing(contact)}
                    aria-label={`Send test ping to ${contact.name}`}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center space-x-1 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ping Test</span>
                  </button>

                  <div className="flex items-center border border-slate-800 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMovePriority(index, 'up')}
                      aria-label="Raise priority"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === contacts.length - 1}
                      onClick={() => handleMovePriority(index, 'down')}
                      aria-label="Lower priority"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(contact.id)}
                    aria-label={`Delete ${contact.name}`}
                    className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-800/40 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
