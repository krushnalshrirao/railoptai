import React, { useState, useEffect } from 'react';
import {
  UserAccount,
  DefectItem,
  CorridorBlock,
  BlockSection,
  CorridorStation,
  TimetableEntry,
  GoodsForecast,
  OptimizationResult,
  DefectStatus,
} from './types';
import {
  INITIAL_USERS,
  INITIAL_BLOCK_SECTIONS,
  INITIAL_CORRIDOR_STATIONS,
  INITIAL_DEFECTS,
  INITIAL_PASSENGER_TIMETABLE,
  INITIAL_GOODS_FORECASTS,
  INITIAL_CORRIDOR_BLOCKS,
} from './data/initialData';
import { LoginPage } from './components/LoginPage';
import { OperatorPortal } from './components/OperatorPortal';
import { ManagementPortal } from './components/ManagementPortal';
import { Navbar } from './components/Navbar';
import { AccountModal } from './components/AccountModal';
import { CorridorMap } from './components/CorridorMap';
import { OperatorDashboard } from './components/OperatorDashboard';
import { IntegratedDataFeeds } from './components/IntegratedDataFeeds';
import { BlockEditorModal } from './components/BlockEditorModal';
import { AccountsExcelModal } from './components/AccountsExcelModal';
import {
  subscribeToCloudUsers,
  saveUserToCloud,
  fetchAllUsers,
} from './services/userService';

export default function App() {
  // All Registered Users (Operators + Management) - synchronized across devices via Firebase
  const [allUsers, setAllUsers] = useState<UserAccount[]>(INITIAL_USERS);

  // Authentication state: Starts at the Login/Register page as requested!
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Modals
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<string>('register-complaint');

  // Master Data State
  const [defects, setDefects] = useState<DefectItem[]>(INITIAL_DEFECTS);
  const [blocks, setBlocks] = useState<CorridorBlock[]>(INITIAL_CORRIDOR_BLOCKS);
  const [timetable] = useState<TimetableEntry[]>(INITIAL_PASSENGER_TIMETABLE);
  const [goodsForecasts] = useState<GoodsForecast[]>(INITIAL_GOODS_FORECASTS);
  const [sections] = useState<BlockSection[]>(INITIAL_BLOCK_SECTIONS);
  const [stations] = useState<CorridorStation[]>(INITIAL_CORRIDOR_STATIONS);

  // Schematic Map selection
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Optimization Result
  const [activeOptimization, setActiveOptimization] = useState<OptimizationResult | null>(null);

  // Block Editor Modal State
  const [isBlockEditorOpen, setIsBlockEditorOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<CorridorBlock | null>(null);

  // Real-time synchronization: Subscribes to Firestore cloud database so any new account
  // registered on a friend's laptop or another browser instantly appears on this device's screen & Excel sheet
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Apply dark mode class to HTML element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    const unsubscribe = subscribeToCloudUsers((cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        setAllUsers(cloudUsers);
        if (currentUser) {
          const updatedCurrent = cloudUsers.find((u) => u.id === currentUser.id);
          if (updatedCurrent) {
            setCurrentUser(updatedCurrent);
          }
        }
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  // Refresh handler for manual sync button
  const handleRefreshUsers = async () => {
    try {
      const freshUsers = await fetchAllUsers();
      if (freshUsers && freshUsers.length > 0) {
        setAllUsers(freshUsers);
      }
    } catch (err) {
      console.warn('Manual refresh users error:', err);
    }
  };

  // Login Handler
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    if (user.role === 'management') {
      setActiveTab('management-complaints');
    } else {
      setActiveTab('register-complaint');
    }
  };

  // Register Handler: immediately saves to persistent cloud Firestore so anyone on other devices gets it
  const handleRegister = async (newUser: UserAccount) => {
    setAllUsers((prev) => {
      const exists = prev.some((u) => u.id === newUser.id || (u.staffId && u.staffId === newUser.staffId));
      return exists ? prev : [...prev, newUser];
    });
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    if (newUser.role === 'management') {
      setActiveTab('management-complaints');
    } else {
      setActiveTab('register-complaint');
    }
    // Instant Cloud Firestore persistence across devices
    await saveUserToCloud(newUser);
  };

  // Logout Handler (returns to Login / Register page)
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  // Switch Role Toggle between Operator and Management
  const handleToggleRole = () => {
    if (!currentUser) return;
    if (currentUser.role === 'operator') {
      const mgmt = allUsers.find((u) => u.role === 'management') || INITIAL_USERS[2];
      setCurrentUser(mgmt);
      setActiveTab('management-complaints');
    } else {
      const op = allUsers.find((u) => u.role === 'operator') || INITIAL_USERS[0];
      setCurrentUser(op);
      setActiveTab('register-complaint');
    }
  };

  // Operator registers new complaint (with all details & AI free time slots)
  // This automatically adds it to the master list so it is immediately visible on the Management screen!
  const handleAddDefect = (newDefect: DefectItem) => {
    setDefects((prev) => [newDefect, ...prev]);
  };

  // Operator or Management confirms block slot
  const handleAllotBlockSlot = (block: CorridorBlock, defectId: string, _slotId: string) => {
    setBlocks((prev) => [block, ...prev]);
    setDefects((prev) =>
      prev.map((d) =>
        d.id === defectId
          ? {
              ...d,
              status: 'Scheduled',
              blockId: block.id,
              managementReviewStatus: 'Approved by Management',
            }
          : d
      )
    );
  };

  // Management updates defect status or appends executive directives
  const handleUpdateDefectStatus = (
    defectId: string,
    newStatus: DefectStatus,
    managementNotes?: string
  ) => {
    setDefects((prev) =>
      prev.map((d) =>
        d.id === defectId
          ? {
              ...d,
              status: newStatus,
              managementReviewStatus:
                newStatus === 'Resolved'
                  ? 'Resolved'
                  : newStatus === 'Scheduled'
                  ? 'Approved by Management'
                  : d.managementReviewStatus,
              managementNotes: managementNotes !== undefined ? managementNotes : d.managementNotes,
            }
          : d
      )
    );
  };

  // Block management
  const handleSaveBlock = (updatedBlock: CorridorBlock) => {
    setBlocks((prev) => {
      const exists = prev.some((b) => b.id === updatedBlock.id);
      if (exists) {
        return prev.map((b) => (b.id === updatedBlock.id ? updatedBlock : b));
      }
      return [updatedBlock, ...prev];
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  };

  const handleCreateNewBlock = () => {
    const newBlock: CorridorBlock = {
      id: `BLK-${Date.now().toString().slice(-4)}`,
      blockSectionId: selectedSection || 'BS1',
      date: '2026-09-12',
      blockStart: '05:00',
      blockEnd: '06:30',
      durationMin: 90,
      blockType: 'Maintenance',
      reason: 'Manual Section Block Allotment',
      requestingDept: currentUser?.department || 'Civil Engineering (P-Way)',
      coordinatingDepts: ['Engineering Dept (P-Way)', 'Electrical Dept (OHE)'],
      trackLine: 'UP Line',
      status: 'Pending Review',
      defectsAddressed: [],
      operationalImpact: 'Low-headway window between Mail/Express services.',
    };
    setEditingBlock(newBlock);
    setIsBlockEditorOpen(true);
  };

  const handleEditExistingBlock = (block: CorridorBlock) => {
    setEditingBlock(block);
    setIsBlockEditorOpen(true);
  };

  const handleScheduleFromDefect = (defect: DefectItem) => {
    const newBlock: CorridorBlock = {
      id: `BLK-${Date.now().toString().slice(-4)}`,
      blockSectionId: defect.section.split(' ')[0] || 'BS1',
      date: '2026-09-12',
      blockStart: '04:30',
      blockEnd: '06:00',
      durationMin: 90,
      blockType: 'Maintenance',
      reason: `Attention to ${defect.defectCategory} at ${defect.locationDetail}`,
      requestingDept: defect.sourceSystem === 'SMMS' ? 'S&T Dept (Signal & Telecom)' : 'Engineering Dept (P-Way)',
      coordinatingDepts: [
        'Engineering Dept (P-Way)',
        defect.sourceSystem === 'SMMS' ? 'S&T Dept (Signal & Telecom)' : 'Electrical Dept (OHE)',
      ],
      trackLine: `${defect.trackLine} Line`,
      status: 'Pending Review',
      defectsAddressed: [defect.id],
      operationalImpact: 'Coordinated multi-department shadow block.',
    };
    setEditingBlock(newBlock);
    setIsBlockEditorOpen(true);
  };

  // Metrics
  const tsrCount = defects.filter((d) => d.speedRestrictionKmph && d.status !== 'Resolved').length;
  const unresolvedCount = defects.filter((d) => d.status !== 'Resolved').length;

  // 1. Initial Gate: If not authenticated, render Login / Register Page
  if (!isAuthenticated || !currentUser) {
    return (
      <LoginPage
        allUsers={allUsers}
        availableUsers={allUsers}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onRefreshUsers={handleRefreshUsers}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
    );
  }

  // 2. Authenticated Portal: Operator or Management
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onSwitchRole={handleToggleRole}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unresolvedCount={unresolvedCount}
        tsrCount={tsrCount}
        onOpenExcelModal={() => setIsExcelModalOpen(true)}
        allUsersCount={allUsers.length}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Active Role Quick Banner */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                currentUser.role === 'management' ? 'bg-indigo-400 animate-pulse' : 'bg-blue-400 animate-pulse'
              }`}
            />
            <div className="text-sm text-slate-700 dark:text-slate-300">
              Active Session:{' '}
              <strong className="text-slate-900 dark:text-white">
                {currentUser.role === 'management' ? 'Management Person' : 'Operator'}
              </strong>{' '}
              ({currentUser.name} • {currentUser.designation} • {currentUser.department || 'Northern Railway'})
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleRole}
              className="text-sm font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
            >
              Switch to {currentUser.role === 'management' ? 'Operator View' : 'Management View'}
            </button>
            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="text-sm font-semibold px-2.5 py-1 rounded bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 transition cursor-pointer"
            >
              Switch Account Profile
            </button>
            <button
              onClick={() => setIsExcelModalOpen(true)}
              className="text-sm font-semibold px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 transition cursor-pointer flex items-center gap-1.5"
            >
              <span>Excel Accounts ({allUsers.length})</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* OPERATOR WORKFLOW: Register Complaint & AI Free Time Slots */}
        {/* ========================================================= */}
        {currentUser.role === 'operator' && (
          <>
            {(activeTab === 'register-complaint' || activeTab === 'my-complaints') && (
              <OperatorPortal
                currentUser={currentUser}
                sections={sections}
                onAddDefect={handleAddDefect}
                allDefects={defects}
                onAllotBlockSlot={handleAllotBlockSlot}
                onSelectSection={setSelectedSection}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            )}
          </>
        )}

        {/* ========================================================= */}
        {/* MANAGEMENT WORKFLOW: All Complaints Register (New & Old) */}
        {/* ========================================================= */}
        {currentUser.role === 'management' && (
          <>
            {activeTab === 'management-complaints' && (
              <ManagementPortal
                currentUser={currentUser}
                allDefects={defects}
                allBlocks={blocks}
                sections={sections}
                onUpdateDefectStatus={handleUpdateDefectStatus}
                onOpenBlockEditor={handleScheduleFromDefect}
                onOpenExcelModal={() => setIsExcelModalOpen(true)}
                allUsersCount={allUsers.length}
              />
            )}
          </>
        )}

        {/* Common / Shared Views (Corridor Monitor, Feeds, AI Optimizer) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <CorridorMap
              stations={stations}
              sections={sections}
              defects={defects}
              blocks={blocks}
              selectedSection={selectedSection}
              onSelectSection={setSelectedSection}
            />

            <IntegratedDataFeeds
              defects={defects}
              goodsForecasts={goodsForecasts}
              timetable={timetable}
              sections={sections}
              stations={stations}
              onScheduleDefectBlock={handleScheduleFromDefect}
            />
          </div>
        )}

        {activeTab === 'feeds' && (
          <IntegratedDataFeeds
            defects={defects}
            goodsForecasts={goodsForecasts}
            timetable={timetable}
            sections={sections}
            stations={stations}
            onScheduleDefectBlock={handleScheduleFromDefect}
          />
        )}

        {(activeTab === 'ai-optimizer' || activeTab === 'schedule') && (
          <OperatorDashboard
            currentUser={currentUser}
            blocks={blocks}
            defects={defects}
            goodsForecasts={goodsForecasts}
            timetable={timetable}
            sections={sections}
            onOpenBlockEditor={handleEditExistingBlock}
            onCreateNewBlock={handleCreateNewBlock}
            onApplyOptimization={setActiveOptimization}
            activeOptimization={activeOptimization}
            activeTab={activeTab}
          />
        )}
      </main>

      {/* Account Switching Modal */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        currentUser={currentUser}
        allUsers={allUsers}
        onOpenExcelModal={() => setIsExcelModalOpen(true)}
        onSelectUser={(u) => {
          setCurrentUser(u);
          if (u.role === 'management') setActiveTab('management-complaints');
          else setActiveTab('register-complaint');
        }}
        onCreateUser={(newUser) => {
          setAllUsers((prev) => {
            const exists = prev.some((u) => u.id === newUser.id || (u.staffId && u.staffId === newUser.staffId));
            return exists ? prev : [...prev, newUser];
          });
          setCurrentUser(newUser);
          if (newUser.role === 'management') setActiveTab('management-complaints');
          else setActiveTab('register-complaint');
          saveUserToCloud(newUser);
        }}
      />

      {/* Master Accounts Excel Spreadsheet Modal */}
      <AccountsExcelModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        users={allUsers}
        onRefreshUsers={handleRefreshUsers}
      />

      {/* Manual Slot Allotment Modal */}
      <BlockEditorModal
        isOpen={isBlockEditorOpen}
        onClose={() => {
          setIsBlockEditorOpen(false);
          setEditingBlock(null);
        }}
        block={editingBlock}
        sections={sections}
        timetable={timetable}
        goodsForecasts={goodsForecasts}
        allDefects={defects}
        onSaveBlock={handleSaveBlock}
        onDeleteBlock={handleDeleteBlock}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 py-5 text-center text-sm text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">Indian Railways</span>
            <span>•</span>
            <span>Automatic Block Planning System (IR-ABPS)</span>
            <span>•</span>
            <span className="font-mono text-[13px] text-slate-500 dark:text-slate-400">TMS • SMMS • TDMS • COIS Integration</span>
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-[13px]">
            New Delhi - Kanpur Central Main Corridor (Northern & North Central Railway)
          </div>
        </div>
      </footer>
    </div>
  );
}
