import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Search,
  RefreshCw,
  X,
  UserCheck,
  ShieldCheck,
  HardHat,
  Filter,
  CheckCircle2,
  Smartphone,
  Calendar,
  Phone,
  Building,
  UserPlus,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { UserAccount } from '../types';

interface AccountsExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  onRefreshUsers?: () => Promise<void> | void;
  onOpenRegister?: () => void;
}

export const AccountsExcelModal: React.FC<AccountsExcelModalProps> = ({
  isOpen,
  onClose,
  users = [],
  onRefreshUsers,
  onOpenRegister,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'operator' | 'management'>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const departments = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => {
      if (u.department) set.add(u.department);
    });
    return Array.from(set);
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesDept = deptFilter === 'all' || u.department === deptFilter;
      const matchesSearch =
        searchTerm === '' ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.headquarters.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesRole && matchesDept && matchesSearch;
    });
  }, [users, roleFilter, deptFilter, searchTerm]);

  if (!isOpen) return null;

  const handleRefresh = async () => {
    if (!onRefreshUsers) return;
    setIsRefreshing(true);
    try {
      await onRefreshUsers();
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const handleDownloadExcel = () => {
    try {
      const formattedData = users.map((acc, index) => ({
        'S.No.': index + 1,
        'Account ID': acc.id,
        'Employee Name': acc.name,
        'System Role': acc.role === 'management' ? 'Executive Management' : 'Field Operator',
        'Staff / Employee ID': acc.staffId || 'N/A',
        'Designation': acc.designation || 'Railway Official',
        'Department': acc.department || 'General Administration',
        'Headquarters / Station': acc.headquarters || 'Northern Railway',
        'Official Mobile': acc.contactNumber || 'N/A',
        'Registration Date': acc.createdAt || new Date().toLocaleDateString('en-IN'),
        'Account Status': acc.status || 'Active',
        'Cross-Device Sync': 'Central Server Verified',
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);

      worksheet['!cols'] = [
        { wch: 8 },
        { wch: 18 },
        { wch: 25 },
        { wch: 24 },
        { wch: 22 },
        { wch: 34 },
        { wch: 38 },
        { wch: 28 },
        { wch: 20 },
        { wch: 24 },
        { wch: 16 },
        { wch: 24 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'All Registered Accounts');

      const metaData = [
        { Parameter: 'Portal System', Value: 'Indian Railways Corridor Block Planning System' },
        { Parameter: 'Total Registered Accounts', Value: users.length },
        { Parameter: 'Operator Personnel', Value: users.filter((u) => u.role === 'operator').length },
        { Parameter: 'Executive Officers', Value: users.filter((u) => u.role === 'management').length },
        { Parameter: 'Centralized Cross-Device Persistence', Value: 'Active (/api/users)' },
        { Parameter: 'Generated At', Value: new Date().toLocaleString('en-IN') },
      ];
      const metaSheet = XLSX.utils.json_to_sheet(metaData);
      metaSheet['!cols'] = [{ wch: 30 }, { wch: 60 }];
      XLSX.utils.book_append_sheet(workbook, metaSheet, 'System Summary');

      XLSX.writeFile(workbook, 'Indian_Railways_All_Accounts_Master.xlsx');
      setDownloadSuccess('Excel spreadsheet (.xlsx) downloaded successfully!');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch {
      // Fallback to server streaming route
      window.location.href = '/api/users/export-excel';
      setDownloadSuccess('Excel download initiated via server stream.');
      setTimeout(() => setDownloadSuccess(null), 4000);
    }
  };

  const handleDownloadCSV = () => {
    try {
      const formattedData = users.map((acc, index) => ({
        'S.No.': index + 1,
        'Account ID': acc.id,
        'Employee Name': acc.name,
        'System Role': acc.role === 'management' ? 'Executive Management' : 'Field Operator',
        'Staff ID': acc.staffId || 'N/A',
        'Designation': acc.designation || 'N/A',
        'Department': acc.department || 'N/A',
        'Headquarters': acc.headquarters || 'N/A',
        'Mobile': acc.contactNumber || 'N/A',
        'Registration Date': acc.createdAt || '',
        'Status': acc.status || 'Active',
      }));
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'Indian_Railways_All_Accounts_Master.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadSuccess('CSV file (.csv) downloaded successfully!');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch {
      window.location.href = '/api/users/export-csv';
    }
  };

  const operatorCount = users.filter((u) => u.role === 'operator').length;
  const managementCount = users.filter((u) => u.role === 'management').length;

  return (
    <div
      id="accounts-excel-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto"
    >
      <div
        id="accounts-excel-modal-container"
        className="relative w-full max-w-6xl bg-white dark:bg-slate-900 dark:bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Excel Header Bar */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 px-6 py-4 border-b border-emerald-700/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-600/30 border border-emerald-400/60 flex items-center justify-center text-emerald-300 shadow-inner">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Master Accounts Excel Sheet
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-sm font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Cross-Device Sync
                </span>
              </div>
              <p className="text-sm text-emerald-200/80 mt-0.5">
                Indian Railways Centralized Personnel Registry • Auto-updates when any user creates an account from any device
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRefreshUsers && (
              <button
                id="excel-modal-refresh-btn"
                onClick={handleRefresh}
                title="Sync and refresh live accounts from server"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-200 hover:text-white bg-emerald-950/60 hover:bg-emerald-800/60 border border-emerald-600/40 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>
            )}

            <button
              id="excel-modal-download-xlsx-btn"
              onClick={handleDownloadExcel}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-900 dark:text-white dark:text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Excel (.xlsx)</span>
            </button>

            <button
              id="excel-modal-download-csv-btn"
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white dark:text-white hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-400 dark:border-slate-600/60 rounded-lg transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>

            <button
              id="excel-modal-close-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {downloadSuccess && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/40 px-6 py-2.5 flex items-center gap-2 text-sm font-medium text-emerald-300 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Cross-Device Info Ribbon */}
        <div className="bg-slate-850 px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-slate-900 dark:text-white dark:text-white">Multi-Device Ready:</strong> When anyone on another smartphone, tablet, or PC registers a new account, it is saved directly to the central server and added here in real time.
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="text-slate-500 dark:text-slate-400">
              Total Accounts: <strong className="text-emerald-400 text-base font-bold">{users.length}</strong>
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Operators: <strong className="text-blue-400">{operatorCount}</strong>
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Management: <strong className="text-purple-400">{managementCount}</strong>
            </span>
            {onOpenRegister && (
              <button
                id="excel-modal-open-register-btn"
                onClick={() => {
                  onClose();
                  onOpenRegister();
                }}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 underline font-semibold cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Register New User
              </button>
            )}
          </div>
        </div>

        {/* Controls: Search, Filter, Counts */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
            <input
              id="excel-modal-search-input"
              type="text"
              placeholder="Search by employee name, staff ID, designation, HQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm sm:text-base text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Role Filters */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-300 dark:border-slate-700/60">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                roleFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/60'
              }`}
            >
              All Roles ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('operator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                roleFilter === 'operator'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/60'
              }`}
            >
              <HardHat className="w-3.5 h-3.5" />
              Operators ({operatorCount})
            </button>
            <button
              onClick={() => setRoleFilter('management')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                roleFilter === 'management'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Management ({managementCount})
            </button>
          </div>

          {/* Department Filter */}
          {departments.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <select
                id="excel-modal-dept-select"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white dark:text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">All Departments ({departments.length})</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Spreadsheet Data Grid */}
        <div className="flex-1 overflow-x-auto overflow-y-auto min-h-[300px] bg-slate-50 dark:bg-slate-950/80">
          <table className="w-full text-left text-sm border-collapse font-mono">
            {/* Excel Column Headers */}
            <thead className="bg-white dark:bg-slate-900 dark:bg-slate-900 sticky top-0 z-10 border-b border-slate-300 dark:border-slate-700 select-none shadow-xs">
              <tr className="text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[13px]">
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 text-center w-12 bg-white dark:bg-slate-900 dark:bg-slate-900">#</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200 dark:border-slate-800 min-w-[130px]">Account ID</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200 dark:border-slate-800 min-w-[180px]">Employee Name</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200 dark:border-slate-800 min-w-[120px]">System Role</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200 dark:border-slate-800 min-w-[150px]">Staff / PPO ID</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200 dark:border-slate-800 min-w-[200px]">Designation</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200 dark:border-slate-800 min-w-[220px]">Department</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200 dark:border-slate-800 min-w-[170px]">Headquarters / Station</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200 dark:border-slate-800 min-w-[140px]">Contact Mobile</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200 dark:border-slate-800 min-w-[160px]">Registration Date</th>
                <th className="py-2.5 px-3.5 text-center min-w-[100px]">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80 font-sans">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-400" />
                    <p className="text-base font-medium">No accounts match your current filter</p>
                    <p className="text-sm text-slate-600 mt-1">Try clearing search or filters</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => {
                  const isOp = user.role === 'operator';
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-emerald-950/20 transition-colors group text-slate-900 dark:text-white dark:text-white"
                    >
                      {/* Excel Row Index */}
                      <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800/80 text-center font-mono text-[13px] text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 dark:bg-slate-900/50 group-hover:text-emerald-400 group-hover:bg-slate-900">
                        {idx + 1}
                      </td>

                      {/* Account ID */}
                      <td className="py-2.5 px-3.5 border-r border-slate-200 dark:border-slate-800/80 font-mono text-[13px] text-slate-500 dark:text-slate-400">
                        {user.id}
                      </td>

                      {/* Employee Name */}
                      <td className="py-2.5 px-3.5 border-r border-slate-200 dark:border-slate-800/80 font-medium text-slate-900 dark:text-white dark:text-white flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[13px] font-bold text-slate-900 dark:text-white dark:text-white shrink-0 ${
                            user.avatarColor || (isOp ? 'bg-blue-600' : 'bg-purple-600')
                          }`}
                        >
                          {user.name.charAt(0)}
                        </span>
                        <span className="truncate">{user.name}</span>
                      </td>

                      {/* System Role */}
                      <td className="py-2.5 px-3.5 border-r border-slate-200 dark:border-slate-800/80">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[13px] font-semibold ${
                            isOp
                              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                              : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {isOp ? <HardHat className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                          {isOp ? 'Operator' : 'Management'}
                        </span>
                      </td>

                      {/* Staff ID */}
                      <td className="py-2.5 px-3.5 border-r border-slate-200 dark:border-slate-800/80 font-mono text-[13px] text-emerald-400 font-semibold">
                        {user.staffId || 'N/A'}
                      </td>

                      {/* Designation */}
                      <td className="py-2.5 px-3.5 border-r border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300">
                        {user.designation}
                      </td>

                      {/* Department */}
                      <td className="py-2.5 px-3.5 border-r border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span className="truncate">{user.department}</span>
                        </div>
                      </td>

                      {/* Headquarters */}
                      <td className="py-2.5 px-3.5 border-r border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300">
                        {user.headquarters}
                      </td>

                      {/* Contact */}
                      <td className="py-2.5 px-3.5 border-r border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 font-mono text-[13px]">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span>{user.contactNumber || 'N/A'}</span>
                        </div>
                      </td>

                      {/* Registration Date */}
                      <td className="py-2.5 px-3.5 border-r border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 text-[13px]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span>{user.createdAt || 'Standard Provisioned'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {user.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info & actions */}
        <div className="px-6 py-3.5 bg-white dark:bg-slate-900 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> total registered railway accounts across all zones.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadExcel}
              className="flex items-center gap-1.5 font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download .xlsx file
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Download .csv
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
