import React, { useState } from 'react';
import { UserAccount, AccountRole, OperatorDepartment } from '../types';
import {
  Train,
  Shield,
  Briefcase,
  UserCheck,
  Building2,
  Lock,
  ArrowRight,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Phone,
  FileSpreadsheet,
  Download,
  RefreshCw,
  Sun,
  Moon,
} from 'lucide-react';
import { AccountsExcelModal } from './AccountsExcelModal';

interface LoginPageProps {
  onLogin: (user: UserAccount) => void;
  availableUsers?: UserAccount[];
  allUsers?: UserAccount[];
  onRegister: (newUser: UserAccount) => void;
  onRefreshUsers?: () => Promise<void> | void;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

const OPERATOR_DEPARTMENTS: OperatorDepartment[] = [
  'Civil Engineering (Permanent Way)',
  'Signal & Telecommunication (S&T)',
  'Electrical Traction & OHE',
  'Mechanical / Rolling Stock (C&W)',
  'Operating & Train Control',
];

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  availableUsers: propAvailableUsers,
  allUsers,
  onRegister,
  onRefreshUsers,
  isDarkMode = true,
  toggleTheme = () => {},
}) => {
  const availableUsers = propAvailableUsers || allUsers || [];
  const [selectedRole, setSelectedRole] = useState<AccountRole>('operator');
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    if (!onRefreshUsers) return;
    setIsSyncing(true);
    try {
      await onRefreshUsers();
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  // Login Form States
  const [selectedDept, setSelectedDept] = useState<OperatorDepartment>(OPERATOR_DEPARTMENTS[0]);
  const [loginStaffId, setLoginStaffId] = useState('');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState<AccountRole>('operator');
  const [regDept, setRegDept] = useState<string>(OPERATOR_DEPARTMENTS[0]);
  const [regDesignation, setRegDesignation] = useState('');
  const [regHq, setRegHq] = useState('Ghaziabad (GZB)');
  const [regStaffId, setRegStaffId] = useState('');
  const [regContact, setRegContact] = useState('');

  // Handle standard login submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    // Try finding matching user by staffId or role & department
    let matchedUser = availableUsers.find(
      (u) =>
        u.staffId.toLowerCase() === loginStaffId.trim().toLowerCase() ||
        (u.role === selectedRole &&
          (selectedRole === 'management' || u.department.includes(selectedDept.split(' ')[0])))
    );

    if (!matchedUser) {
      // Fallback matching by role
      matchedUser = availableUsers.find((u) => u.role === selectedRole);
    }

    if (matchedUser) {
      onLogin(matchedUser);
    } else {
      setLoginError('No matching railway staff profile found. Please register or choose a demo profile below.');
    }
  };

  // Handle register submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regStaffId.trim()) {
      alert('Please provide Full Name and Staff ID');
      return;
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      name: regName,
      role: regRole,
      designation:
        regDesignation ||
        (regRole === 'operator' ? 'Section Engineer' : 'Divisional Safety Officer'),
      department:
        regRole === 'operator' ? regDept : 'Divisional Operations & Safety Management',
      headquarters: regHq || 'New Delhi',
      staffId: regStaffId,
      contactNumber: regContact || '+91 98000 00000',
      avatarColor: regRole === 'operator' ? 'bg-blue-600' : 'bg-indigo-700',
      password: 'password123',
      createdAt: new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      status: 'Active',
    };

    onRegister(newUser);
    onLogin(newUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-900 dark:text-white dark:text-slate-100 antialiased relative">
      {/* Theme Toggle Button at top right */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          onClick={toggleTheme}
          title="Toggle Dark/Light Mode"
          className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm transition"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Top Header / Railway Emblem Bar */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/80 px-4 py-2 rounded-full shadow-inner mb-4">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <Train className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold tracking-wider text-slate-900 dark:text-white dark:text-white uppercase">
            Indian Railways • Northern Railway Core Corridor
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white dark:text-white tracking-tight">
          Automatic Block Planning & Corridor Safety System
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          AI-driven corridor block scheduling, defect synchronization from TMS, SMMS & TDMS, and multi-department maintenance authorization.
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        {/* Master Accounts Excel Sheet Quick Access Banner */}
        <div className="mb-4 bg-gradient-to-r from-emerald-50 dark:from-emerald-950/80 via-emerald-100/50 dark:via-slate-900 to-white dark:to-slate-900 border border-emerald-300 dark:border-emerald-500/40 rounded-2xl p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/25 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wide">
                  Master Accounts Excel Sheet
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {availableUsers.length} Users
                </span>
              </div>
              <p className="text-[13px] text-emerald-200/70 mt-0.5">
                Central multi-device registry • Download Excel (.xlsx) or CSV anytime
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRefreshUsers && (
              <button
                type="button"
                id="login-sync-btn"
                onClick={handleManualSync}
                title="Sync and pull latest accounts from all connected laptops"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white dark:text-white hover:text-white text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>
            )}

            <button
              type="button"
              id="login-view-excel-btn"
              onClick={() => setShowExcelModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Open Excel Sheet</span>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden">
          {/* Role Choice Switcher Tabs */}
          <div className="p-4 bg-white dark:bg-slate-900 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select User Role:
            </div>
            <div className="grid grid-cols-2 gap-2 flex-1 max-w-xs">
              <button
                type="button"
                id="role-select-operator"
                onClick={() => {
                  setSelectedRole('operator');
                  setRegRole('operator');
                }}
                className={`py-2 px-3 rounded-lg text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                  selectedRole === 'operator'
                    ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Operator
              </button>

              <button
                type="button"
                id="role-select-management"
                onClick={() => {
                  setSelectedRole('management');
                  setRegRole('management');
                }}
                className={`py-2 px-3 rounded-lg text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                  selectedRole === 'management'
                    ? 'bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Management Person
              </button>
            </div>
          </div>

          {/* Sign In vs Register Toggle */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:bg-slate-900 px-6 pt-3 gap-6 text-base">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`pb-2.5 font-bold transition border-b-2 ${
                activeTab === 'login'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In to Account
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`pb-2.5 font-bold transition border-b-2 flex items-center gap-1.5 ${
                activeTab === 'register'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Register New Profile
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Operator Department Selector (Only for Operator) */}
                {selectedRole === 'operator' ? (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Operator Department *
                    </label>
                    <select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value as OperatorDepartment)}
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-base text-slate-900 dark:text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {OPERATOR_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
                      Defect reports, TMS/SMMS synchronization, and AI free time slots will calibrate to this department.
                    </p>
                  </div>
                ) : (
                  <div className="bg-indigo-950/40 border border-indigo-800/50 p-3 rounded-lg text-sm text-indigo-300 flex items-start gap-2">
                    <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 dark:text-white dark:text-white block">Management Person Access</strong>
                      Direct access to the comprehensive complaint register (all new and historical reports), corridor uptime metrics, and block approval workflows.
                    </div>
                  </div>
                )}

                {/* Staff ID */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Staff ID / PF Number (Optional - or pick 1-Click Demo below)
                  </label>
                  <input
                    type="text"
                    placeholder={
                      selectedRole === 'operator'
                        ? 'e.g. IR-NR-ENG-8492 or leave blank'
                        : 'e.g. IR-MGMT-DRM-001 or leave blank'
                    }
                    value={loginStaffId}
                    onChange={(e) => setLoginStaffId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-base text-slate-900 dark:text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Password / Access Code
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-base text-slate-900 dark:text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <Lock className="w-4 h-4 absolute right-3 top-3 text-slate-400 dark:text-slate-500" />
                  </div>
                </div>

                {loginError && (
                  <div className="bg-rose-950/60 border border-rose-800 text-rose-300 p-2.5 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  id="btn-login-submit"
                  className={`w-full py-2.5 px-4 rounded-lg font-bold text-base shadow-md transition flex items-center justify-center gap-2 ${
                    selectedRole === 'operator'
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  <ArrowRight className="w-4 h-4" />
                  Sign In as {selectedRole === 'operator' ? 'Operator' : 'Management Person'}
                </button>
              </form>
            ) : (
              /* Register New Account Form */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Account Type *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRegRole('operator')}
                      className={`p-2.5 rounded-lg text-sm font-bold border text-left transition ${
                        regRole === 'operator'
                          ? 'bg-blue-600 text-white border-blue-400'
                          : 'bg-white dark:bg-slate-900 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-900'
                      }`}
                    >
                      Operator Account
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('management')}
                      className={`p-2.5 rounded-lg text-sm font-bold border text-left transition ${
                        regRole === 'management'
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-white dark:bg-slate-900 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-900'
                      }`}
                    >
                      Management Person
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full Staff Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-base text-slate-900 dark:text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {regRole === 'operator' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Department *
                    </label>
                    <select
                      value={regDept}
                      onChange={(e) => setRegDept(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-base text-slate-900 dark:text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {OPERATOR_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      placeholder={
                        regRole === 'operator'
                          ? 'e.g. Senior Section Engineer (P-Way)'
                          : 'e.g. Divisional Safety Officer'
                      }
                      value={regDesignation}
                      onChange={(e) => setRegDesignation(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-base text-slate-900 dark:text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Staff / PF ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. IR-NR-ENG-9102"
                      value={regStaffId}
                      onChange={(e) => setRegStaffId(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-base text-slate-900 dark:text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Headquarters / Station
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. New Delhi (NDLS)"
                      value={regHq}
                      onChange={(e) => setRegHq(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-base text-slate-900 dark:text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Official Mobile Number
                    </label>
                    <input
                      type="text"
                      placeholder="+91 98XXX XXXXX"
                      value={regContact}
                      onChange={(e) => setRegContact(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-base text-slate-900 dark:text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-md transition flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Profile & Sign In
                </button>
              </form>
            )}

            {/* Quick 1-Click Login for immediate testing */}
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-3">
                <span className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  ⚡ 1-Click Demo Profiles
                </span>
                <span className="text-[13px] text-amber-400">Immediate Access</span>
              </div>

              <div className="space-y-2">
                {/* Operator Profiles */}
                <div className="text-[13px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Operator Accounts (by Department):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableUsers
                    .filter((u) => u.role === 'operator')
                    .map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => onLogin(user)}
                        className="p-2 rounded-lg bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-slate-900 transition text-left flex items-center gap-2.5 group"
                      >
                        <div
                          className={`w-7 h-7 rounded-full ${user.avatarColor} text-slate-900 dark:text-white dark:text-white font-bold text-sm flex items-center justify-center shrink-0`}
                        >
                          {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900 dark:text-white dark:text-white group-hover:text-blue-400 truncate">
                            {user.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {user.department.replace(' (Permanent Way)', '')}
                          </div>
                        </div>
                      </button>
                    ))}
                </div>

                {/* Management Person Profiles */}
                <div className="text-[13px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider pt-2">
                  Management Person Accounts:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableUsers
                    .filter((u) => u.role === 'management')
                    .map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => onLogin(user)}
                        className="p-2 rounded-lg bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-slate-900 transition text-left flex items-center gap-2.5 group"
                      >
                        <div
                          className={`w-7 h-7 rounded-full ${user.avatarColor} text-slate-900 dark:text-white dark:text-white font-bold text-sm flex items-center justify-center shrink-0`}
                        >
                          {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900 dark:text-white dark:text-white group-hover:text-indigo-400 truncate">
                            {user.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {user.designation}
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-sm text-slate-400 dark:text-slate-500 mt-4">
          Integrated with Northern Railway Control Office • CRIS TMS • SMMS • TDMS
        </p>
      </div>

      {/* Master Accounts Excel Modal */}
      <AccountsExcelModal
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        users={availableUsers}
        onRefreshUsers={onRefreshUsers}
        onOpenRegister={() => setActiveTab('register')}
      />
    </div>
  );
};
