import React, { useState } from 'react';
import {
  UserAccount,
  DefectItem,
  CorridorBlock,
  BlockSection,
  DefectSeverity,
  DefectStatus,
} from '../types';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Ruler,
  Camera,
  FileText,
  Search,
  Filter,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Calendar,
  Building2,
  ExternalLink,
  MessageSquare,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';

interface ManagementPortalProps {
  currentUser: UserAccount;
  allDefects: DefectItem[];
  allBlocks: CorridorBlock[];
  sections: BlockSection[];
  onUpdateDefectStatus: (defectId: string, newStatus: DefectStatus, managementNotes?: string) => void;
  onOpenBlockEditor?: (defect: DefectItem) => void;
  onOpenExcelModal?: () => void;
  allUsersCount?: number;
}

export const ManagementPortal: React.FC<ManagementPortalProps> = ({
  currentUser,
  allDefects = [],
  allBlocks = [],
  sections = [],
  onUpdateDefectStatus,
  onOpenBlockEditor,
  onOpenExcelModal,
  allUsersCount = 0,
}) => {
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [filterSource, setFilterSource] = useState<string>('All');
  const [filterDept, setFilterDept] = useState<string>('All');

  // Expanded Complaint ID for deep inspection
  const [expandedComplaintId, setExpandedComplaintId] = useState<string | null>(null);

  // Management Directive Modal / Note editing
  const [activeNoteDefectId, setActiveNoteDefectId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Selected Evidence Photo for modal view
  const [modalPhoto, setModalPhoto] = useState<string | null>(null);

  // Statistics calculation
  const totalComplaints = allDefects.length;
  const criticalComplaints = allDefects.filter((d) => d.severity === 'Critical').length;
  const overdueComplaints = allDefects.filter((d) => d.status === 'Overdue' || d.overdueDays > 0).length;
  const newOperatorComplaints = allDefects.filter((d) => d.sourceSystem === 'Field Report').length;
  const resolvedComplaints = allDefects.filter((d) => d.status === 'Resolved').length;

  // Filter complaints
  const filteredComplaints = allDefects.filter((item) => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.id.toLowerCase().includes(q) ||
        item.assetId.toLowerCase().includes(q) ||
        item.locationDetail.toLowerCase().includes(q) ||
        item.defectCategory.toLowerCase().includes(q) ||
        item.defectDescription.toLowerCase().includes(q) ||
        (item.reportedByOperatorName && item.reportedByOperatorName.toLowerCase().includes(q)) ||
        item.detectedBy.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filterStatus !== 'All') {
      if (filterStatus === 'Overdue') {
        if (item.status !== 'Overdue' && item.overdueDays <= 0) return false;
      } else if (item.status !== filterStatus) {
        return false;
      }
    }

    // Severity filter
    if (filterSeverity !== 'All' && item.severity !== filterSeverity) {
      return false;
    }

    // Source filter
    if (filterSource !== 'All') {
      if (filterSource === 'Field Report' && item.sourceSystem !== 'Field Report') return false;
      if (filterSource === 'TMS' && item.sourceSystem !== 'TMS') return false;
      if (filterSource === 'SMMS' && item.sourceSystem !== 'SMMS') return false;
      if (filterSource === 'TDMS' && item.sourceSystem !== 'TDMS') return false;
    }

    // Department filter
    if (filterDept !== 'All') {
      const deptMatch =
        (item.operatorDepartment && item.operatorDepartment.includes(filterDept)) ||
        (item.remarks && item.remarks.includes(filterDept)) ||
        (item.assetType && item.assetType.includes(filterDept));
      if (!deptMatch) return false;
    }

    return true;
  });

  const handleSaveDirective = (defectId: string) => {
    onUpdateDefectStatus(defectId, 'Approved for Block' as any, noteText);
    setActiveNoteDefectId(null);
    setNoteText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Executive Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-2xl shadow-inner">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Management Safety & Complaint Control Center
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-sm font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  DRM Executive Desk
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-300 mt-1">
                Executive Officer: <strong className="text-white">{currentUser.name}</strong> •{' '}
                <span className="text-indigo-300 font-semibold">{currentUser.designation}</span> •{' '}
                {currentUser.department} ({currentUser.headquarters})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-50 dark:bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm flex items-center gap-3">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-xs uppercase">Corridor Status</span>
                <span className="text-emerald-400 font-bold">Trunk Line Operational</span>
              </div>
              <div className="h-6 w-px bg-slate-100 dark:bg-slate-800" />
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-xs uppercase">Asset Availability</span>
                <span className="text-amber-400 font-bold font-mono">92.4% (+34.8% Gain)</span>
              </div>
            </div>

            {onOpenExcelModal && (
              <button
                type="button"
                id="mgmt-excel-sheet-btn"
                onClick={onOpenExcelModal}
                className="px-3.5 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-sm transition flex items-center gap-2 shadow-sm border border-emerald-400/40 cursor-pointer"
                title="View and download complete Excel spreadsheet of all accounts"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
                <span>Accounts Excel Sheet ({allUsersCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* 5 Executive Dashboard Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-indigo-900/40">
          <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
            <span className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Complaints (All)
            </span>
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white dark:text-white mt-1 block">
              {totalComplaints}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">New + Historical Feeds</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/70 border border-rose-900/40 p-3 rounded-xl">
            <span className="text-[13px] font-semibold text-rose-400 uppercase tracking-wider block">
              Critical Defects
            </span>
            <span className="text-2xl font-black font-mono text-rose-400 mt-1 block">
              {criticalComplaints}
            </span>
            <span className="text-xs text-rose-400/80">Immediate Safety Attention</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/70 border border-amber-900/40 p-3 rounded-xl">
            <span className="text-[13px] font-semibold text-amber-400 uppercase tracking-wider block">
              Overdue Maintenance
            </span>
            <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">
              {overdueComplaints}
            </span>
            <span className="text-xs text-amber-400/80">TMS/SMMS/TDMS Past Due</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/70 border border-blue-900/40 p-3 rounded-xl">
            <span className="text-[13px] font-semibold text-blue-400 uppercase tracking-wider block">
              Operator Field Reports
            </span>
            <span className="text-2xl font-black font-mono text-blue-400 mt-1 block">
              {newOperatorComplaints}
            </span>
            <span className="text-xs text-blue-300">Synchronized from Field</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/70 border border-emerald-900/40 p-3 rounded-xl">
            <span className="text-[13px] font-semibold text-emerald-400 uppercase tracking-wider block">
              Resolved Defects
            </span>
            <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">
              {resolvedComplaints}
            </span>
            <span className="text-xs text-emerald-300">Blocks Completed</span>
          </div>
        </div>
      </div>

      {/* Main Complaints Register Section */}
      <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Section Header & Search/Filters */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Comprehensive Complaint Master Register (All New & Old Reports)
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Displays all complaints logged by field operators, as well as imported TMS, SMMS, and TDMS maintenance records with complete details, evidence, and status.
              </p>
            </div>
            <span className="text-sm font-mono font-bold px-3 py-1.5 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800 self-start sm:self-auto">
              Showing {filteredComplaints.length} of {allDefects.length} Records
            </span>
          </div>

          {/* Search bar + Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by ID, location (Km), category, operator, or asset..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending Review</option>
                <option value="Overdue">Overdue Backlog</option>
                <option value="Scheduled">Block Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="Major">Major</option>
                <option value="Minor">Minor</option>
              </select>
            </div>

            {/* Source Filter */}
            <div>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="All">All Data Sources</option>
                <option value="Field Report">Operator Field Reports</option>
                <option value="TDMS">TDMS (Track Defects)</option>
                <option value="SMMS">SMMS (Signals & Telecom)</option>
                <option value="TMS">TMS (Rolling Stock & OHE)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Complaints Master List */}
        <div className="p-6 divide-y divide-slate-800 space-y-4">
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="text-base font-semibold">No complaints found matching the selected filters.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('All');
                  setFilterSeverity('All');
                  setFilterSource('All');
                  setFilterDept('All');
                }}
                className="mt-2 text-sm text-indigo-400 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredComplaints.map((defect) => {
              const isExpanded = expandedComplaintId === defect.id;
              const isOperatorReport = defect.sourceSystem === 'Field Report';

              return (
                <div key={defect.id} className="pt-4 first:pt-0">
                  <div
                    className={`rounded-2xl border transition-all ${
                      defect.severity === 'Critical'
                        ? 'bg-slate-50 dark:bg-slate-950 border-rose-900/50 hover:border-rose-700'
                        : defect.status === 'Overdue' || defect.overdueDays > 0
                        ? 'bg-slate-50 dark:bg-slate-950 border-amber-900/50 hover:border-amber-700'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Summary Row */}
                    <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Status / Severity Icon */}
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base shrink-0 shadow-inner ${
                            defect.severity === 'Critical'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : defect.severity === 'Major'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          }`}
                        >
                          <AlertTriangle className="w-5 h-5" />
                        </div>

                        {/* Core Details */}
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm font-bold text-slate-500 dark:text-slate-400">
                              {defect.id}
                            </span>

                            {isOperatorReport ? (
                              <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                ⚡ Field Operator Report
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                Source: {defect.sourceSystem}
                              </span>
                            )}

                            <h4 className="text-base font-bold text-slate-900 dark:text-white dark:text-white">
                              {defect.defectCategory}
                            </h4>

                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold ${
                                defect.severity === 'Critical'
                                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                                  : defect.severity === 'Major'
                                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                              }`}
                            >
                              {defect.severity}
                            </span>

                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold ${
                                defect.status === 'Resolved'
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                                  : defect.status === 'Scheduled'
                                  ? 'bg-blue-950/80 text-blue-300 border border-blue-800'
                                  : defect.status === 'Overdue' || defect.overdueDays > 0
                                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                              }`}
                            >
                              Status: {defect.status}
                            </span>

                            {defect.overdueDays > 0 && (
                              <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-900/60 text-rose-200 border border-rose-700">
                                {defect.overdueDays} Days Overdue
                              </span>
                            )}
                          </div>

                          {/* Location, Track, and Detection Date */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-700 dark:text-slate-300">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-blue-400" />
                              Section: <strong className="text-slate-900 dark:text-white dark:text-white">{defect.locationDetail}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              Track Line:{' '}
                              <strong className="text-amber-300">{defect.trackLine} Line</strong>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                              Detected: {defect.reportedDate}
                            </span>
                            {defect.reportedByOperatorName && (
                              <>
                                <span>•</span>
                                <span className="text-blue-300 font-semibold">
                                  Operator: {defect.reportedByOperatorName} (
                                  {defect.operatorDepartment || 'Field'})
                                </span>
                              </>
                            )}
                          </div>

                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {defect.defectDescription}
                          </p>

                          {/* Quick Badges: TSR or Immediate Action */}
                          {defect.speedRestrictionKmph && (
                            <div className="pt-1 flex items-center gap-2 text-sm">
                              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                Active TSR: {defect.speedRestrictionKmph} km/h Caution Order
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {/* 1-Click Status buttons for Management */}
                        {defect.status !== 'Resolved' && (
                          <button
                            type="button"
                            onClick={() => onUpdateDefectStatus(defect.id, 'Resolved')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow transition flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Mark Resolved
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setActiveNoteDefectId(activeNoteDefectId === defect.id ? null : defect.id);
                            setNoteText(defect.managementNotes || '');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-900/70 hover:bg-indigo-800 text-indigo-200 text-sm font-semibold border border-indigo-700 flex items-center gap-1 transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Directive / Note
                        </button>

                        <button
                          type="button"
                          onClick={() => setExpandedComplaintId(isExpanded ? null : defect.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-semibold text-slate-900 dark:text-white dark:text-white border border-slate-300 dark:border-slate-700 flex items-center gap-1 transition"
                        >
                          {isExpanded ? 'Hide Details' : 'Full Details & Evidence'}
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Management Directive Input Box */}
                    {activeNoteDefectId === defect.id && (
                      <div className="p-4 bg-indigo-950/40 border-t border-indigo-900/60 flex flex-col sm:flex-row items-center gap-3">
                        <input
                          type="text"
                          placeholder="Add management executive directive (e.g. Sanctioned for Sunday Mega Block; depute welding crew)..."
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 dark:bg-slate-900 border border-indigo-700 rounded-lg text-sm text-slate-900 dark:text-white dark:text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveDirective(defect.id)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-lg shadow"
                        >
                          Save Directive
                        </button>
                      </div>
                    )}

                    {/* Expandable Full Complaint Details */}
                    {isExpanded && (
                      <div className="p-5 bg-white dark:bg-slate-900 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 space-y-4 text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Col 1: Exact Location & Asset */}
                          <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                              📍 1. Exact Location & Asset Specifications
                            </span>
                            <div className="space-y-1 text-slate-700 dark:text-slate-300">
                              <div>
                                <span className="text-slate-500 dark:text-slate-400">Section:</span>{' '}
                                <strong className="text-slate-900 dark:text-white dark:text-white">{defect.section}</strong> (NDLS-CNB Corridor)
                              </div>
                              <div>
                                <span className="text-slate-500 dark:text-slate-400">Location Marker:</span>{' '}
                                <strong className="text-slate-900 dark:text-white dark:text-white">{defect.locationDetail}</strong>
                              </div>
                              <div>
                                <span className="text-slate-500 dark:text-slate-400">Track Line:</span>{' '}
                                <strong className="text-amber-300">{defect.trackLine} Line</strong>
                              </div>
                              <div>
                                <span className="text-slate-500 dark:text-slate-400">Asset ID:</span>{' '}
                                <span className="font-mono text-slate-900 dark:text-white dark:text-white">{defect.assetId}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 dark:text-slate-400">Asset Type:</span> {defect.assetType}
                              </div>
                            </div>
                          </div>

                          {/* Col 2: Detection & Accountability Trail */}
                          <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                              👤 2. Detection & Accountability Trail
                            </span>
                            <div className="space-y-1 text-slate-700 dark:text-slate-300">
                              <div>
                                <span className="text-slate-500 dark:text-slate-400">Detected By:</span>{' '}
                                <strong className="text-slate-900 dark:text-white dark:text-white">{defect.detectedBy}</strong>
                              </div>
                              <div>
                                <span className="text-slate-500 dark:text-slate-400">Date/Time Detected:</span>{' '}
                                <span className="font-mono text-slate-900 dark:text-white dark:text-white">{defect.reportedDate}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 dark:text-slate-400">Scheduled Date:</span>{' '}
                                <span className="font-mono text-slate-900 dark:text-white dark:text-white">
                                  {defect.scheduledMaintenanceDate}
                                </span>
                              </div>
                              {defect.reportedByOperatorName && (
                                <div>
                                  <span className="text-slate-500 dark:text-slate-400">Reporting Operator:</span>{' '}
                                  <span className="text-blue-300 font-semibold">
                                    {defect.reportedByOperatorName} ({defect.reportedByOperatorStaffId})
                                  </span>
                                </div>
                              )}
                              <div>
                                <span className="text-slate-500 dark:text-slate-400">Department:</span>{' '}
                                {defect.operatorDepartment || 'Engineering Dept'}
                              </div>
                            </div>
                          </div>

                          {/* Col 3: Immediate Action & Restrictions */}
                          <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                              🛡️ 3. Immediate Action & Caution Orders
                            </span>
                            <div className="space-y-1 text-slate-700 dark:text-slate-300">
                              <div>
                                <span className="text-slate-500 dark:text-slate-400">Action on Site:</span>{' '}
                                <span className="text-slate-900 dark:text-white dark:text-white">
                                  {defect.immediateActionTaken || 'Initial inspection performed.'}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500 dark:text-slate-400">Caution Order:</span>{' '}
                                {defect.speedRestrictionKmph ? (
                                  <strong className="text-amber-400">
                                    TSR {defect.speedRestrictionKmph} km/h ACTIVE
                                  </strong>
                                ) : (
                                  <span className="text-slate-500 dark:text-slate-400">None</span>
                                )}
                              </div>
                              {defect.managementNotes && (
                                <div className="mt-2 p-2 bg-indigo-950/60 rounded border border-indigo-800 text-indigo-200">
                                  <strong className="text-slate-900 dark:text-white dark:text-white block">Executive Directive:</strong>
                                  {defect.managementNotes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Measurement Evidence and Photo Evidence */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          {/* Measurement parameters */}
                          <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
                              📏 Measurement Evidence (Field Telemetry)
                            </span>
                            {defect.measurementEvidence ? (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                                <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 p-2 rounded">
                                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Parameter</span>
                                  <strong className="text-slate-900 dark:text-white dark:text-white text-sm">
                                    {defect.measurementEvidence.parameter}
                                  </strong>
                                </div>
                                <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 p-2 rounded">
                                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Observed Value</span>
                                  <strong className="text-amber-400 font-mono text-base">
                                    {defect.measurementEvidence.value} {defect.measurementEvidence.unit}
                                  </strong>
                                </div>
                                <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 p-2 rounded">
                                  <span className="text-xs text-slate-500 dark:text-slate-400 block">IR Tolerance Limit</span>
                                  <strong className="text-rose-400 font-mono text-base">
                                    {defect.measurementEvidence.limit} {defect.measurementEvidence.unit}
                                  </strong>
                                </div>
                                <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 p-2 rounded">
                                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Deviation</span>
                                  <strong className="text-rose-400 font-mono text-sm">Exceeded Limit</strong>
                                </div>
                              </div>
                            ) : (
                              <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                                Standard visual inspection report; numeric gauge within normal tolerance.
                              </p>
                            )}
                          </div>

                          {/* Photographic Evidence */}
                          <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
                              📷 Photographic Evidence
                            </span>
                            {defect.evidencePhoto ? (
                              <div className="flex items-center gap-3">
                                <img
                                  src={defect.evidencePhoto}
                                  alt="Defect Evidence"
                                  className="w-28 h-20 object-cover rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer"
                                  onClick={() => setModalPhoto(defect.evidencePhoto || null)}
                                />
                                <div className="text-sm text-slate-700 dark:text-slate-300">
                                  <p className="font-semibold text-slate-900 dark:text-white dark:text-white">IR-Tab Field Photo Captured</p>
                                  <p className="text-slate-500 dark:text-slate-400 text-[13px] mt-0.5">
                                    Click image to inspect high-resolution verification frame.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                                No photographic attachment supplied with this defect record.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* AI Suggested Free Time Slots attached to complaint */}
                        {defect.aiSuggestedSlots && defect.aiSuggestedSlots.length > 0 && (
                          <div className="pt-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                AI Free Time Slots Available ({defect.aiSuggestedSlots.length} Slots Evaluated)
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                At least 4 Candidate Windows
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {defect.aiSuggestedSlots.map((slot) => {
                                const isSelected = defect.selectedSlotId === slot.id;
                                return (
                                  <div
                                    key={slot.id}
                                    className={`p-3 rounded-lg border transition ${
                                      slot.isCustomOperatorSlot
                                        ? 'bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border-emerald-500/50'
                                        : isSelected
                                        ? 'bg-blue-950/30 border-blue-500/50'
                                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                                    }`}
                                  >
                                    <div>
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="font-mono font-bold text-slate-900 dark:text-white dark:text-white text-sm">
                                          {slot.start} - {slot.end} ({slot.durationMin}m)
                                        </span>

                                        {slot.isCustomOperatorSlot && (
                                          <span className="px-1.5 py-0.5 rounded text-[11px] font-extrabold bg-emerald-500 text-slate-950 flex items-center gap-1">
                                            ⚡ Custom Slot (Min Delay: {slot.totalTrainDelayMinutes}m)
                                          </span>
                                        )}

                                        {slot.isBestPick && slot.bestRank === 1 && !slot.isCustomOperatorSlot && (
                                          <span className="px-1.5 py-0.5 rounded text-[11px] font-extrabold bg-amber-500 text-slate-950">
                                            ✨ Best Pick #1
                                          </span>
                                        )}
                                        {slot.isBestPick && slot.bestRank === 2 && !slot.isCustomOperatorSlot && (
                                          <span className="px-1.5 py-0.5 rounded text-[11px] font-extrabold bg-blue-500 text-white">
                                            ✨ Best Pick #2
                                          </span>
                                        )}

                                        {isSelected && (
                                          <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-blue-600/30 border border-blue-500/50 text-blue-300">
                                            ✓ Operator Selected
                                          </span>
                                        )}
                                      </div>

                                      <p className="text-[13px] text-slate-700 dark:text-slate-300 mt-1">
                                        {slot.aiRecommendationReason}
                                      </p>

                                      {slot.trainRegulationPlan && slot.trainRegulationPlan.length > 0 && (
                                        <div className="mt-1.5 text-xs text-emerald-400 font-mono bg-white dark:bg-slate-900 dark:bg-slate-900/80 p-1.5 rounded border border-slate-200 dark:border-slate-800">
                                          Delay Plan: {slot.trainRegulationPlan.map((t) => `${t.trainNo} (${t.delayMin}m)`).join(', ')}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Photo Modal */}
      {modalPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setModalPhoto(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl p-4 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-base font-bold text-slate-900 dark:text-white dark:text-white">Field Photographic Evidence Verification</h4>
              <button
                type="button"
                onClick={() => setModalPhoto(null)}
                className="text-slate-500 dark:text-slate-400 hover:text-white text-base font-bold"
              >
                ✕ Close
              </button>
            </div>
            <div className="mt-3">
              <img src={modalPhoto} alt="Evidence" className="w-full h-auto rounded-lg border border-slate-300 dark:border-slate-700" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
