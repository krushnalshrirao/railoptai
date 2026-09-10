import React from 'react';
import {
  Train,
  ShieldCheck,
  User,
  Users,
  AlertCircle,
  AlertTriangle,
  Cpu,
  Clock,
  Layers,
  ArrowRightLeft,
  PlusCircle,
  LogOut,
  Sparkles,
  FileText,
  Briefcase,
  Shield,
  FileSpreadsheet,
  Moon,
  Sun,
} from 'lucide-react';
import { UserAccount } from '../types';

interface NavbarProps {
  currentUser: UserAccount;
  onSwitchRole: () => void;
  onOpenAccountModal: () => void;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unresolvedCount: number;
  tsrCount: number;
  onOpenExcelModal?: () => void;
  allUsersCount?: number;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchRole,
  onOpenAccountModal,
  onLogout,
  activeTab,
  setActiveTab,
  unresolvedCount,
  tsrCount,
  onOpenExcelModal,
  allUsersCount = 0,
  isDarkMode = true,
  toggleTheme = () => {},
}) => {
  return (
    <header className="bg-white dark:bg-slate-900 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:text-white sticky top-0 z-40 shadow-md">
      {/* Top emergency & system banner */}
      <div className="bg-slate-50 dark:bg-slate-950 px-4 py-1.5 text-sm border-b border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            System Online
          </span>
          <span className="text-slate-400 dark:text-slate-500">|</span>
          <span className="text-slate-700 dark:text-slate-300 hidden sm:inline">
            Northern Corridor (NDLS-CNB)
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
          {tsrCount > 0 && (
            <span className="inline-flex items-center gap-1 bg-amber-950/70 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded text-[13px] font-semibold">
              <AlertCircle className="w-3 h-3 text-amber-400" />
              {tsrCount} Active TSRs (Caution Orders)
            </span>
          )}
          <span className="text-slate-500 dark:text-slate-400 hidden md:inline">
            Control Desk: DRM Office New Delhi
          </span>
          <span className="text-emerald-400 font-mono text-[13px] hidden md:inline">
            2026-09-08 IST
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab(currentUser.role === 'management' ? 'management-complaints' : 'register-complaint')}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-700 to-indigo-900 border border-blue-500/40 flex items-center justify-center shadow-inner">
              <Train className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                  RailOpt
                </span>
                <span className="px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">
                  AI
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 hidden xl:block whitespace-nowrap">
                Automatic Block Planning & Coordination
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {currentUser.role === 'management' ? (
              <>
                <button
                  id="nav-tab-mgmt-complaints"
                  onClick={() => setActiveTab('management-complaints')}
                  className={`px-3 py-1.5 rounded-md text-base font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'management-complaints'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Complaints
                  {unresolvedCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-rose-500/80 text-white rounded-full">
                      {unresolvedCount}
                    </span>
                  )}
                </button>
                <button
                  id="nav-tab-ai-optimizer"
                  onClick={() => setActiveTab('ai-optimizer')}
                  className={`px-3 py-1.5 rounded-md text-base font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'ai-optimizer'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  AI Block Strategy
                </button>
                <button
                  id="nav-tab-schedule"
                  onClick={() => setActiveTab('schedule')}
                  className={`px-3 py-1.5 rounded-md text-base font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'schedule'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Slots
                </button>
                <button
                  id="nav-tab-corridor-view"
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1.5 rounded-md text-base font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Monitor
                </button>
                <button
                  id="nav-tab-feeds"
                  onClick={() => setActiveTab('feeds')}
                  className={`px-3 py-1.5 rounded-md text-base font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'feeds'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-4 h-4 text-blue-400" />
                  Feeds
                </button>
              </>
            ) : (
              /* Operator Navigation */
              <>
                <button
                  id="nav-tab-register-complaint"
                  onClick={() => setActiveTab('register-complaint')}
                  className={`px-3 py-1.5 rounded-md text-base font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'register-complaint'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  Register Complaint
                </button>
                <button
                  id="nav-tab-my-complaints"
                  onClick={() => setActiveTab('my-complaints')}
                  className={`px-3 py-1.5 rounded-md text-base font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'my-complaints'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  My Complaints
                </button>
                <button
                  id="nav-tab-corridor-view"
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1.5 rounded-md text-base font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Monitor
                </button>
                <button
                  id="nav-tab-feeds"
                  onClick={() => setActiveTab('feeds')}
                  className={`px-3 py-1.5 rounded-md text-base font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'feeds'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-4 h-4 text-blue-400" />
                  Feeds
                </button>
              </>
            )}
          </nav>

          {/* User Profile, Theme Toggle, Role Switcher, and Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title="Toggle Dark/Light Mode"
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Role Badge & Switch */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700/80 rounded-lg p-1">
              <button
                id="btn-switch-role"
                onClick={onSwitchRole}
                title="Click to switch role (Operator vs Management Person)"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-semibold transition-all hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 dark:text-slate-200 cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Role:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[13px] uppercase tracking-wider ${
                    currentUser.role === 'management'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold'
                  }`}
                >
                  {currentUser.role === 'management' ? 'Management' : 'Operator'}
                </span>
              </button>
            </div>

            {/* Master Accounts Excel Sheet Button */}
            {onOpenExcelModal && (
              <button
                id="nav-btn-excel-sheet"
                onClick={onOpenExcelModal}
                title="Open Master Accounts Excel Sheet & Download (.xlsx / .csv)"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-600/50 text-emerald-300 hover:text-white transition-all text-sm font-semibold cursor-pointer shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden lg:inline">Excel Sheet</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  {allUsersCount}
                </span>
              </button>
            )}

            {/* Profile Avatar & Account Menu Trigger */}
            <button
              id="btn-account-modal"
              onClick={onOpenAccountModal}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-700 transition"
              title="Account management & Switch Profile"
            >
              <div
                className={`w-8 h-8 rounded-full ${currentUser.avatarColor} flex items-center justify-center text-slate-900 dark:text-white dark:text-white font-bold text-sm shadow-sm`}
              >
                {currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200 dark:text-slate-200 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight truncate max-w-[130px]">
                  {currentUser.department || currentUser.designation}
                </div>
              </div>
            </button>

            {/* Sign Out Button to return to Login/Register page */}
            <button
              id="btn-logout"
              onClick={onLogout}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-950/60 text-slate-500 dark:text-slate-400 hover:text-rose-400 border border-slate-300 dark:border-slate-700 transition flex items-center gap-1 text-sm"
              title="Sign Out / Switch User"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-2 border-t border-slate-200 dark:border-slate-800/80 text-sm no-scrollbar">
          {currentUser.role === 'management' ? (
            <>
              <button
                onClick={() => setActiveTab('management-complaints')}
                className={`px-2.5 py-1 rounded whitespace-nowrap ${
                  activeTab === 'management-complaints' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
                }`}
              >
                All Complaints ({unresolvedCount})
              </button>
              <button
                onClick={() => setActiveTab('ai-optimizer')}
                className={`px-2.5 py-1 rounded whitespace-nowrap flex items-center gap-1 ${
                  activeTab === 'ai-optimizer' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                AI Strategy
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-2.5 py-1 rounded whitespace-nowrap ${
                  activeTab === 'schedule' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
                }`}
              >
                Slot Allotments
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-2.5 py-1 rounded whitespace-nowrap ${
                  activeTab === 'overview' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
                }`}
              >
                Corridor View
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('register-complaint')}
                className={`px-2.5 py-1 rounded whitespace-nowrap flex items-center gap-1 ${
                  activeTab === 'register-complaint'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Register Complaint
              </button>
              <button
                onClick={() => setActiveTab('my-complaints')}
                className={`px-2.5 py-1 rounded whitespace-nowrap flex items-center gap-1 ${
                  activeTab === 'my-complaints'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                My Complaints & AI Slots
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-2.5 py-1 rounded whitespace-nowrap ${
                  activeTab === 'overview' ? 'bg-blue-600 text-white font-medium' : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
                }`}
              >
                Corridor Status
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

