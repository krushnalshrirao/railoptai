import React, { useState, useEffect } from 'react';
import { CorridorBlock, BlockSection, TimetableEntry, GoodsForecast, DefectItem } from '../types';
import { detectBlockConflicts, SlotConflict } from '../utils/optimizationEngine';
import { AlertTriangle, Clock, X, Check, Calendar, ShieldCheck, Users, Layers } from 'lucide-react';

interface BlockEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  block: CorridorBlock | null;
  sections: BlockSection[];
  timetable: TimetableEntry[];
  goodsForecasts: GoodsForecast[];
  allDefects: DefectItem[];
  onSaveBlock: (updatedBlock: CorridorBlock) => void;
  onDeleteBlock?: (blockId: string) => void;
}

export const BlockEditorModal: React.FC<BlockEditorModalProps> = ({
  isOpen,
  onClose,
  block,
  sections,
  timetable,
  goodsForecasts,
  allDefects,
  onSaveBlock,
  onDeleteBlock,
}) => {
  if (!isOpen || !block) return null;

  const [formData, setFormData] = useState<CorridorBlock>({ ...block });
  const [conflicts, setConflicts] = useState<SlotConflict[]>([]);

  // Update conflicts whenever time or section changes
  useEffect(() => {
    const detected = detectBlockConflicts(
      formData.blockSectionId,
      formData.blockStart,
      formData.blockEnd,
      timetable,
      sections,
      goodsForecasts
    );
    setConflicts(detected);
  }, [formData.blockSectionId, formData.blockStart, formData.blockEnd, timetable, sections, goodsForecasts]);

  const handleTimeChange = (start: string, end: string) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let dur = (eh * 60 + em) - (sh * 60 + sm);
    if (dur < 0) dur += 1440;
    setFormData({
      ...formData,
      blockStart: start,
      blockEnd: end,
      durationMin: dur || 60,
    });
  };

  const handleDeptToggle = (dept: string) => {
    const current = [...formData.coordinatingDepts];
    const index = current.indexOf(dept);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(dept);
    }
    setFormData({ ...formData, coordinatingDepts: current });
  };

  const handleDefectToggle = (defectId: string) => {
    const current = [...formData.defectsAddressed];
    const index = current.indexOf(defectId);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(defectId);
    }
    setFormData({ ...formData, defectsAddressed: current });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBlock({
      ...formData,
      status: 'Manually Overridden',
    });
    onClose();
  };

  const availableDepts = [
    'Engineering Dept (P-Way)',
    'Electrical Dept (OHE)',
    'S&T Dept (Signal & Telecom)',
    'Mechanical Dept (C&W)',
    'Operating / Traffic Dept',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 text-slate-900 dark:text-white dark:text-white px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded text-sm font-bold">
                {formData.id}
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white dark:text-white">
                Manual Slot Allotment & Corridor Block Control
              </h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Operator manual override, multi-department coordination, and real-time conflict evaluation
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-white p-1 rounded-md transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {/* Section & Track */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Block Section *
              </label>
              <select
                value={formData.blockSectionId}
                onChange={(e) => setFormData({ ...formData, blockSectionId: e.target.value })}
                className="w-full px-3 py-2 text-base border border-slate-300 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.id}: {sec.fromStation}-{sec.toStation} ({sec.distanceKm} km)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Track / Line *
              </label>
              <input
                type="text"
                value={formData.trackLine}
                onChange={(e) => setFormData({ ...formData, trackLine: e.target.value })}
                placeholder="e.g. T1 UP Line, DOWN Line"
                className="w-full px-3 py-2 text-base border border-slate-300 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-base border border-slate-300 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Time Slot Controls */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                Slot Time Allotment & Duration
              </span>
              <span className="text-sm font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                Duration: {formData.durationMin} minutes
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[13px] text-slate-600 mb-0.5">Start Time</label>
                <input
                  type="time"
                  required
                  value={formData.blockStart}
                  onChange={(e) => handleTimeChange(e.target.value, formData.blockEnd)}
                  className="w-full px-2.5 py-1.5 text-base border border-slate-300 rounded-md bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-[13px] text-slate-600 mb-0.5">End Time</label>
                <input
                  type="time"
                  required
                  value={formData.blockEnd}
                  onChange={(e) => handleTimeChange(formData.blockStart, e.target.value)}
                  className="w-full px-2.5 py-1.5 text-base border border-slate-300 rounded-md bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-[13px] text-slate-600 mb-0.5">Block Type</label>
                <select
                  value={formData.blockType}
                  onChange={(e) => setFormData({ ...formData, blockType: e.target.value as any })}
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md bg-white dark:bg-slate-900"
                >
                  <option value="Maintenance">Maintenance</option>
                  <option value="Traffic Block">Traffic Block</option>
                  <option value="Power/OHE Block">Power/OHE Block</option>
                  <option value="Integrated Mega Block">Integrated Mega Block</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] text-slate-600 mb-0.5">Approval Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md bg-white dark:bg-slate-900 font-bold"
                >
                  <option value="Approved">Approved</option>
                  <option value="Manually Overridden">Manually Overridden</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Real-time Conflict Alert Box */}
          {conflicts.length > 0 ? (
            <div className="bg-rose-50 border border-rose-300 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Live Timetable Conflict Alert ({conflicts.length} conflict{conflicts.length > 1 ? 's' : ''})
              </div>
              <div className="space-y-1 text-sm text-rose-800">
                {conflicts.map((c, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="font-bold text-[13px] bg-rose-200 text-rose-900 px-1.5 rounded mt-0.5">
                      {c.severity}
                    </span>
                    <span>{c.message}</span>
                  </div>
                ))}
              </div>
              <div className="text-[13px] text-rose-700 italic pt-1">
                Recommendation: Adjust start/end time outside the train transit window, or issue train diversion via chord line.
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center gap-2 text-emerald-800 text-sm font-semibold">
              <Check className="w-4 h-4 text-emerald-600" />
              Green Path: Conflict-free slot identified. No Rajdhani, Shatabdi or High-priority freight clashes detected.
            </div>
          )}

          {/* Reason & Operational Impact */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Primary Reason & Purpose of Block *
            </label>
            <input
              type="text"
              required
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="e.g. Rail fracture repair & tamping with OHE isolation"
              className="w-full px-3 py-2 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Operational Traffic Impact & Train Regulation Plan
            </label>
            <textarea
              rows={2}
              value={formData.operationalImpact || ''}
              onChange={(e) => setFormData({ ...formData, operationalImpact: e.target.value })}
              placeholder="e.g. Passenger train 64 regulated by 10 mins at Khurja loop; UP Rajdhani cleared normally on T3 line..."
              className="w-full px-3 py-2 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            ></textarea>
          </div>

          {/* Multi-Department Coordination (Shadow Block) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              Multi-Department Coordinated Work (Shadow Blocking)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableDepts.map((dept) => {
                const isSelected = formData.coordinatingDepts.includes(dept);
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => handleDeptToggle(dept)}
                    className={`px-2.5 py-1.5 rounded text-sm font-semibold border text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-100 text-blue-900 border-blue-400'
                        : 'bg-white dark:bg-slate-900 text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{dept}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-700 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Link Section Defects to this Block */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Link TMS / SMMS / TDMS Defects to Attend During This Block
            </label>
            <div className="max-h-36 overflow-y-auto space-y-1.5 border border-slate-200 rounded-lg p-2 bg-slate-50">
              {allDefects
                .filter(
                  (d) =>
                    d.section.includes(formData.blockSectionId) ||
                    d.status === 'Pending' ||
                    d.status === 'Overdue'
                )
                .slice(0, 10)
                .map((defect) => {
                  const isLinked = formData.defectsAddressed.includes(defect.id);
                  return (
                    <label
                      key={defect.id}
                      className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 hover:bg-slate-100/70 cursor-pointer text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isLinked}
                          onChange={() => handleDefectToggle(defect.id)}
                          className="w-3.5 h-3.5 text-blue-600 rounded"
                        />
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{defect.id}</span>
                        <span className="text-slate-600 truncate max-w-[280px]">
                          {defect.defectCategory} - {defect.locationDetail}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold px-1.5 py-0.2 rounded ${
                          defect.severity === 'Critical'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {defect.severity}
                      </span>
                    </label>
                  );
                })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            {onDeleteBlock && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Cancel and remove block ${formData.id}?`)) {
                    onDeleteBlock(formData.id);
                    onClose();
                  }
                }}
                className="text-sm text-rose-600 hover:text-rose-800 font-semibold"
              >
                Delete Slot
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Apply Manual Allotment
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
