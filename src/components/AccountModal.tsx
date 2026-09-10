import React, { useState } from 'react';
import { UserAccount, AccountRole } from '../types';
import { User, Shield, Briefcase, Plus, Check, X, Building, Phone, FileSpreadsheet, Download } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  allUsers: UserAccount[];
  onSelectUser: (user: UserAccount) => void;
  onCreateUser: (newUser: UserAccount) => void;
  onOpenExcelModal?: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onSelectUser,
  onCreateUser,
  onOpenExcelModal,
}) => {
  const [activeTab, setActiveTab] = useState<'switch' | 'create'>('switch');

  // New account form state
  const [formData, setFormData] = useState({
    name: '',
    role: 'operator' as AccountRole,
    designation: '',
    department: 'Civil Engineering (Permanent Way)',
    headquarters: 'Ghaziabad (GZB)',
    staffId: '',
    contactNumber: '',
  });

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.designation || !formData.staffId) {
      alert('Please fill in Name, Designation, and Staff ID');
      return;
    }

    const colors = ['bg-indigo-600', 'bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-cyan-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newUser: UserAccount = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      name: formData.name,
      role: formData.role,
      designation: formData.designation,
      department: formData.department,
      headquarters: formData.headquarters,
      staffId: formData.staffId,
      contactNumber: formData.contactNumber || '+91 98000 00000',
      avatarColor: randomColor,
      createdAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      status: 'Active',
    };

    onCreateUser(newUser);
    onSelectUser(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 text-slate-900 dark:text-white dark:text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" />
              Indian Railways Staff & Account Management
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Switch role or register a new Worker or Section Controller account
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 dark:text-slate-400 hover:text-white p-1 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('switch')}
            className={`pb-2 text-base font-semibold border-b-2 transition ${
              activeTab === 'switch'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-800'
            }`}
          >
            Select Existing Profile ({allUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-2 text-base font-semibold border-b-2 transition flex items-center gap-1 ${
              activeTab === 'create'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            Register New Account
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Quick Excel Export Bar */}
          {onOpenExcelModal && (
            <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2 text-emerald-800 font-medium">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Master Accounts Excel Spreadsheet ({allUsers.length} accounts)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenExcelModal();
                }}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-sm transition cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Open / Export
              </button>
            </div>
          )}

          {activeTab === 'switch' ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-400 dark:text-slate-500 mb-2">
                Click on any account to switch active session and permissions:
              </p>
              {allUsers.map((user) => {
                const isCurrent = user.id === currentUser.id;
                return (
                  <div
                    key={user.id}
                    onClick={() => {
                      onSelectUser(user);
                      onClose();
                    }}
                    className={`p-3.5 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                      isCurrent
                        ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-400'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full ${user.avatarColor} text-slate-900 dark:text-white dark:text-white font-bold flex items-center justify-center text-base shadow-sm`}
                      >
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-base text-slate-900 dark:text-white">
                            {user.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${
                              user.role === 'management'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : user.role === 'operator'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {user.role === 'management'
                              ? 'Management'
                              : user.role === 'operator'
                              ? 'Operator'
                              : 'Worker'}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 font-medium">
                          {user.designation}
                        </div>
                        <div className="text-[13px] text-slate-400 dark:text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>HQ: {user.headquarters}</span>
                          <span>•</span>
                          <span>ID: {user.staffId}</span>
                        </div>
                      </div>
                    </div>

                    {isCurrent && (
                      <span className="flex items-center gap-1 text-blue-700 text-sm font-semibold bg-white dark:bg-slate-900 border border-blue-200 px-2 py-1 rounded-md shadow-2xs">
                        <Check className="w-3.5 h-3.5" />
                        Active
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Account Type / Role *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition ${
                      formData.role === 'worker'
                        ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-400'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="worker"
                      checked={formData.role === 'worker'}
                      onChange={() => setFormData({ ...formData, role: 'worker' })}
                      className="mt-1 text-emerald-600"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">Field Worker</div>
                      <div className="text-[13px] text-slate-400 dark:text-slate-500">
                        Patrolman, Keyman, SSE P-Way, S&T Fitter (Register Complaints)
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition ${
                      formData.role === 'operator'
                        ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-400'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="operator"
                      checked={formData.role === 'operator'}
                      onChange={() => setFormData({ ...formData, role: 'operator' })}
                      className="mt-1 text-blue-600"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">Section Controller</div>
                      <div className="text-[13px] text-slate-400 dark:text-slate-500">
                        Control Office Operator (AI Optimizer, Manual Slot Allotment)
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Designation */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Designation *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    formData.role === 'worker'
                      ? 'e.g. Senior Section Engineer (P-Way)'
                      : 'e.g. Chief Section Controller (Operating)'
                  }
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3 py-2 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-900"
                >
                  <option value="Civil Engineering (Permanent Way)">Civil Engineering (Permanent Way)</option>
                  <option value="Signal & Telecommunication (S&T)">Signal & Telecommunication (S&T)</option>
                  <option value="Electrical Traction & OHE">Electrical Traction & OHE</option>
                  <option value="Mechanical / Rolling Stock (C&W)">Mechanical / Rolling Stock (C&W)</option>
                  <option value="Operating & Train Traffic Control">Operating & Train Traffic Control</option>
                </select>
              </div>

              {/* HQ and Staff ID */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Headquarters / Station
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. New Delhi (NDLS)"
                    value={formData.headquarters}
                    onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                    className="w-full px-3 py-2 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Staff / PF ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IR-NR-ENG-9011"
                    value={formData.staffId}
                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                    className="w-full px-3 py-2 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Contact */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Official Mobile Number
                </label>
                <input
                  type="text"
                  placeholder="+91 98XXX XXXXX"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  className="w-full px-3 py-2 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold shadow-sm transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Account & Sign In
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-md transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
