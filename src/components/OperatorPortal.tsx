import React, { useState } from 'react';
import {
  UserAccount,
  DefectItem,
  BlockSection,
  DefectSeverity,
  FreeTimeSlotSuggestion,
  CorridorBlock,
} from '../types';
import { STANDARD_DEFECT_CATEGORIES, DETECTOR_ROLES } from '../data/initialData';
import { generateAiFreeTimeSlots } from '../utils/aiSlotGenerator';
import { AiCustomSlotNegotiator } from './AiCustomSlotNegotiator';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  FileText,
  MapPin,
  Ruler,
  Shield,
  UploadCloud,
  Clock,
  Send,
  Sparkles,
  Info,
  ChevronRight,
  Calendar,
  Briefcase,
  Check,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface OperatorPortalProps {
  currentUser: UserAccount;
  sections: BlockSection[];
  onAddDefect: (defect: DefectItem) => void;
  allDefects: DefectItem[];
  onAllotBlockSlot: (block: CorridorBlock, defectId: string, slotId: string) => void;
  onSelectSection?: (sectionId: string) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const OperatorPortal: React.FC<OperatorPortalProps> = ({
  currentUser,
  sections = [],
  onAddDefect,
  allDefects = [],
  onAllotBlockSlot,
  activeTab = 'register-complaint',
  setActiveTab,
}) => {
  // We use the prop to decide what mode we are in. If it isn't provided (e.g. standalone usage), we fall back.
  const operatorTab = activeTab === 'my-complaints' ? 'my-complaints' : 'register';

  const handleSetOperatorTab = (tab: 'register' | 'my-complaints') => {
    if (setActiveTab) {
      setActiveTab(tab === 'register' ? 'register-complaint' : 'my-complaints');
    }
  };

  // Form states for complaint registration
  const [section, setSection] = useState('BS1 (NDLS-GZB)');
  const [locationMarker, setLocationMarker] = useState('Km 14.8');
  const [trackLine, setTrackLine] = useState<'UP' | 'DOWN' | 'T1' | 'T2' | 'Both' | 'Yard/Loop'>('UP');
  const [defectCategory, setDefectCategory] = useState(STANDARD_DEFECT_CATEGORIES[0]);
  const [defectDescription, setDefectDescription] = useState('');

  const now = new Date();
  const defaultDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const [detectedDateTime, setDetectedDateTime] = useState(defaultDateTime);

  const [detectedBy, setDetectedBy] = useState(
    currentUser.designation.includes('Signal')
      ? 'SSE Signal & Interlocking'
      : currentUser.designation.includes('OHE')
      ? 'SSE Overhead Equipment (OHE)'
      : 'SSE P-Way (Civil Engineering)'
  );

  const [severity, setSeverity] = useState<DefectSeverity>('Critical');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [measurementParam, setMeasurementParam] = useState('Rail Gap / Stagger Value');
  const [measurementValue, setMeasurementValue] = useState('16.5');
  const [measurementUnit, setMeasurementUnit] = useState('mm');
  const [measurementLimit, setMeasurementLimit] = useState('10.0');

  const [immediateActionTaken, setImmediateActionTaken] = useState(
    'Temporary Speed Restriction (TSR) 30 km/h imposed on the spot; Caution flags placed; J-plate clamped.'
  );
  const [imposeTsr, setImposeTsr] = useState(true);
  const [tsrSpeed, setTsrSpeed] = useState('30');

  // Success & newly created complaint state with AI slots
  const [submittedDefect, setSubmittedDefect] = useState<DefectItem | null>(null);
  const [selectedSlotForDefect, setSelectedSlotForDefect] = useState<string | null>(null);

  // Selected complaint in the history view for expanding slots
  const [expandedDefectId, setExpandedDefectId] = useState<string | null>(null);

  // Handle Photo upload / tablet camera capture simulation
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setHasPhoto(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulatePhoto = () => {
    const svgData = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect width="400" height="260" fill="%231e293b"/><text x="20" y="36" fill="%23f8fafc" font-size="15" font-family="monospace" font-weight="bold">IR OPERATOR FIELD EVIDENCE</text><text x="20" y="65" fill="%2338bdf8" font-size="13" font-family="monospace">Dept: ${currentUser.department.slice(0, 30)}</text><text x="20" y="90" fill="%23fbbf24" font-size="13" font-family="monospace">Loc: ${locationMarker} [${trackLine} Line]</text><text x="20" y="115" fill="%23f87171" font-size="13" font-family="monospace">Defect: ${defectCategory.slice(0, 32)}</text><text x="20" y="140" fill="%23a78bfa" font-size="13" font-family="monospace">Value: ${measurementValue} ${measurementUnit} (Limit: ${measurementLimit} ${measurementUnit})</text><text x="20" y="165" fill="%2394a3b8" font-size="12" font-family="monospace">Operator: ${currentUser.name} (${currentUser.staffId})</text><rect x="40" y="185" width="320" height="40" rx="4" fill="%23334155" stroke="%233b82f6" stroke-width="2"/><text x="80" y="210" fill="%2360a5fa" font-size="14" font-family="monospace" font-weight="bold">IR-TAB TELEMETRY VERIFIED</text></svg>`;
    setPhotoPreview(svgData);
    setHasPhoto(true);
  };

  // Submit Complaint
  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();

    const newDefectId = `OP-DEF-${Date.now().toString().slice(-4)}`;
    const finalSection = section.split(' ')[0] || 'BS1';

    // Generate 4 to 5 free time slots tailored for this complaint with top 2 AI suggestions!
    const aiSlots = generateAiFreeTimeSlots({
      sectionId: finalSection,
      trackLine,
      severity,
      defectCategory,
      date: '2026-09-12',
    });

    const newDefect: DefectItem = {
      id: newDefectId,
      sourceSystem: 'Field Report',
      assetId: `TRK-${finalSection}-${locationMarker.replace(/[^a-zA-Z0-9]/g, '')}`,
      assetType: `${currentUser.department.split(' ')[0]} Asset`,
      section: finalSection,
      locationDetail: `${finalSection} ${locationMarker}`,
      trackLine,
      defectCategory,
      defectDescription:
        defectDescription ||
        `${defectCategory} detected at ${locationMarker} on ${trackLine} Line. Measured ${measurementParam}: ${measurementValue} ${measurementUnit} (Permissible Limit: ${measurementLimit} ${measurementUnit}).`,
      severity,
      reportedDate: detectedDateTime.split('T')[0],
      scheduledMaintenanceDate: detectedDateTime.split('T')[0],
      status: 'Pending',
      overdueDays: 0,
      detectedBy: `${detectedBy} - ${currentUser.name} (${currentUser.staffId})`,
      immediateActionTaken:
        immediateActionTaken || 'Site inspected, initial protection provided.',
      speedRestrictionKmph: imposeTsr && tsrSpeed ? parseInt(tsrSpeed, 10) : null,
      evidencePhoto: photoPreview || undefined,
      measurementEvidence: measurementValue
        ? {
            parameter: measurementParam,
            value: measurementValue,
            unit: measurementUnit,
            limit: measurementLimit,
          }
        : undefined,
      remarks: `Registered by Operator ${currentUser.name} (${currentUser.department}) via Operator Portal.`,
      // Operator and AI linkage
      reportedByOperatorName: currentUser.name,
      reportedByOperatorStaffId: currentUser.staffId,
      operatorDepartment: currentUser.department,
      aiSuggestedSlots: aiSlots,
      managementReviewStatus: 'Pending Review',
    };

    onAddDefect(newDefect);
    setSubmittedDefect(newDefect);
    setExpandedDefectId(newDefectId);
  };

  // When operator confirms an AI suggested slot or custom optimized slot
  const handleConfirmSlot = (defect: DefectItem, slot: FreeTimeSlotSuggestion) => {
    setSelectedSlotForDefect(slot.id);

    // If slot is a custom slot, ensure it is added to defect.aiSuggestedSlots
    const existingSlots = defect.aiSuggestedSlots || [];
    if (!existingSlots.some((s) => s.id === slot.id)) {
      defect.aiSuggestedSlots = [slot, ...existingSlots];
    }
    defect.selectedSlotId = slot.id;

    if (submittedDefect && submittedDefect.id === defect.id) {
      setSubmittedDefect({
        ...submittedDefect,
        aiSuggestedSlots: defect.aiSuggestedSlots,
        selectedSlotId: slot.id,
      });
    }

    const newBlock: CorridorBlock = {
      id: `BLK-${slot.id.slice(-6)}`,
      blockSectionId: slot.section,
      date: slot.date,
      blockStart: slot.start,
      blockEnd: slot.end,
      durationMin: slot.durationMin,
      blockType: 'Maintenance',
      reason: slot.isCustomOperatorSlot
        ? `Custom AI-Optimized Block (Maximized ${slot.durationMin}m window around requested ${slot.requestedTargetTime}, min delay ${slot.totalTrainDelayMinutes}m) for ${defect.defectCategory} at ${defect.locationDetail}`
        : `Block requested by Operator ${currentUser.name} (${currentUser.department}) for ${defect.defectCategory} at ${defect.locationDetail}`,
      requestingDept: currentUser.department,
      coordinatingDepts: slot.shadowBlockingPotential,
      trackLine: `${slot.trackLine} Line`,
      status: 'Proposed by AI',
      defectsAddressed: [defect.id],
      operationalImpact: slot.isCustomOperatorSlot
        ? `AI Custom Window: ${slot.aiRecommendationReason} [Total Train Regulation Delay: ${slot.totalTrainDelayMinutes}m only]`
        : `${slot.aiRecommendationReason} ${slot.freightThroughputImpact}`,
      isAiGenerated: true,
    };

    onAllotBlockSlot(newBlock, defect.id, slot.id);
  };

  // Filter complaints logged by or relevant to this operator / department
  const operatorComplaints = allDefects.filter(
    (d) =>
      d.reportedByOperatorStaffId === currentUser.staffId ||
      d.reportedByOperatorName === currentUser.name ||
      (d.operatorDepartment && d.operatorDepartment === currentUser.department) ||
      d.sourceSystem === 'Field Report'
  );

  return (
    <div className="space-y-6">
      {/* Operator Department Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-900/50 rounded-2xl p-5 shadow-lg text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-300 dark:border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-xl shadow-inner">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Operator Control & Complaint Portal
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[13px] font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                  Department Operator
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-0.5">
                Logged in as: <strong className="text-white">{currentUser.name}</strong> •{' '}
                <span className="text-blue-300 font-semibold">{currentUser.department}</span> •{' '}
                Staff ID: <span className="font-mono text-amber-300">{currentUser.staffId}</span> ({currentUser.headquarters})
              </p>
            </div>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex bg-white dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start md:self-auto">
            <button
              type="button"
              id="tab-operator-register"
              onClick={() => {
                handleSetOperatorTab('register');
                setSubmittedDefect(null);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold transition flex items-center gap-1.5 ${
                operatorTab === 'register'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Register New Complaint
            </button>
            <button
              type="button"
              id="tab-operator-complaints"
              onClick={() => handleSetOperatorTab('my-complaints')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold transition flex items-center gap-1.5 ${
                operatorTab === 'my-complaints'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              My Complaints & AI Slots ({operatorComplaints.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Mode 1: Register Complaint Form */}
      {operatorTab === 'register' && !submittedDefect && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-white dark:bg-slate-900/80 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Register Track / Asset Defect Complaint
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Complaints submitted here will immediately synchronize with the Management Person complaint list, and AI will calculate 4-5 free time slots with the best 2 recommendations.
              </p>
            </div>
            <span className="text-[13px] font-mono bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 px-2.5 py-1 rounded">
              Dept: {currentUser.department.split(' ')[0]}
            </span>
          </div>

          <form onSubmit={handleSubmitComplaint} className="p-6 space-y-6">
            {/* 1. Exact Location Section */}
            <div>
              <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                1. Exact Location & Track Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Corridor Block Section *
                  </label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-base text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {sections.map((sec) => (
                      <option key={sec.id} value={`${sec.id} (${sec.fromStation}-${sec.toStation})`}>
                        {sec.id} ({sec.fromStation} - {sec.toStation}) [{sec.distanceKm} Km]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Exact Location (Km / Chainage Marker) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Km 14.8 or Km 104/12-14"
                    value={locationMarker}
                    onChange={(e) => setLocationMarker(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-base text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Which Track (Line) *
                  </label>
                  <select
                    value={trackLine}
                    onChange={(e) => setTrackLine(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-base text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="UP">UP Line (Towards New Delhi)</option>
                    <option value="DOWN">DOWN Line (Towards Kanpur)</option>
                    <option value="T1">T1 (Third Running Line)</option>
                    <option value="T2">T2 (Fourth Line)</option>
                    <option value="Both">Both Lines (Double Line Block Required)</option>
                    <option value="Yard/Loop">Loop Line / Siding Track</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Type/Category of Defect */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                2. Type / Category of Defect & Description
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Defect Classification *
                  </label>
                  <select
                    value={defectCategory}
                    onChange={(e) => setDefectCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-base text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {STANDARD_DEFECT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Severity / Urgency Classification *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Critical', 'Major', 'Minor'] as DefectSeverity[]).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSeverity(lvl)}
                        className={`py-2 px-3 rounded-lg text-sm font-bold transition border ${
                          severity === lvl
                            ? lvl === 'Critical'
                              ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                              : lvl === 'Major'
                              ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                              : 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                            : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Defect Description & Visual Symptoms
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe exact physical condition, crack pattern, signal voltage drop, contact wire wear, or ballast deficiency..."
                  value={defectDescription}
                  onChange={(e) => setDefectDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-base text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 3. Date/Time & Accountability */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                3. Date/Time & Detection Accountability
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date & Time of Detection *
                  </label>
                  <input
                    type="datetime-local"
                    value={detectedDateTime}
                    onChange={(e) => setDetectedDateTime(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-base text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Detected By (Role / Machine) *
                  </label>
                  <select
                    value={detectedBy}
                    onChange={(e) => setDetectedBy(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-base text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {DETECTOR_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Reporting Operator
                  </label>
                  <div className="px-3 py-2.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                    <strong>{currentUser.name}</strong> ({currentUser.staffId})
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Measurement & Photographic Evidence */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Ruler className="w-4 h-4" />
                4. Measurement & Photographic Evidence
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Measured Parameter
                  </label>
                  <input
                    type="text"
                    value={measurementParam}
                    onChange={(e) => setMeasurementParam(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Observed Value
                  </label>
                  <input
                    type="text"
                    value={measurementValue}
                    onChange={(e) => setMeasurementValue(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit</label>
                  <input
                    type="text"
                    value={measurementUnit}
                    onChange={(e) => setMeasurementUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    IR Limit (Threshold)
                  </label>
                  <input
                    type="text"
                    value={measurementLimit}
                    onChange={(e) => setMeasurementLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-mono text-rose-400"
                  />
                </div>
              </div>

              {/* Photo Evidence upload / simulation */}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSimulatePhoto}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-sm font-medium border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-400" />
                  Capture Field Photo (IR-Tab Simulation)
                </button>

                <label className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-sm font-medium border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer transition">
                  <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                  Upload Photo File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                {hasPhoto && (
                  <span className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Evidence Photo Attached
                  </span>
                )}
              </div>

              {photoPreview && (
                <div className="mt-3 max-w-sm rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 shadow-md">
                  <img src={photoPreview} alt="Defect Evidence" className="w-full h-auto" />
                </div>
              )}
            </div>

            {/* 5. Immediate Action Taken */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                5. Immediate Action Taken & Speed Restrictions
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Immediate Safety Action Imposed on Site *
                  </label>
                  <textarea
                    rows={2}
                    value={immediateActionTaken}
                    onChange={(e) => setImmediateActionTaken(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-base text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-900 dark:text-white">
                    <input
                      type="checkbox"
                      checked={imposeTsr}
                      onChange={(e) => setImposeTsr(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                    />
                    Impose Temporary Speed Restriction (TSR Caution Order)
                  </label>

                  {imposeTsr && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Restricted Speed:</span>
                      <input
                        type="number"
                        value={tsrSpeed}
                        onChange={(e) => setTsrSpeed(e.target.value)}
                        className="w-20 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-sm font-mono font-bold text-amber-400 text-center"
                      />
                      <span className="text-sm text-slate-500 dark:text-slate-400">km/h</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                AI will immediately evaluate 4-5 free time slots with top 2 recommendations upon submission.
              </div>

              <button
                type="submit"
                id="btn-submit-complaint"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg hover:shadow-blue-500/20 transition flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Complaint & Generate AI Free Time Slots
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Success View with AI 4-5 Free Time Slots Display */}
      {submittedDefect && (
        <div className="space-y-6">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-5 rounded-2xl flex items-start gap-4 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-emerald-800 dark:text-emerald-300">
                  Complaint Successfully Registered! Synced with Management Person Screen
                </h3>
                <span className="text-sm font-mono bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-2.5 py-1 rounded">
                  ID: {submittedDefect.id}
                </span>
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-200/80 mt-1">
                The complaint is now visible to Management Person accounts with full measurement and evidence details.
                Below, the AI engine has calculated <strong>5 Free Time Slots</strong> for section{' '}
                <strong className="text-white">{submittedDefect.section}</strong>, with the{' '}
                <strong>Best Two Suggestions by AI</strong> highlighted for your review and slot allotment.
              </p>
            </div>
          </div>

          {/* AI Free Time Slots Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  AI Suggested Free Time Slots ({submittedDefect.aiSuggestedSlots?.length || 5} Candidate Windows)
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Evaluated against 12301/12302 Rajdhani, 12002 Shatabdi, Prayagraj Express, and freight train paths.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold px-2.5 py-1 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  ✨ Best 2 Suggestions by AI Highlighted
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedDefect(null);
                    setOperatorTab('my-complaints');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 transition"
                >
                  Go to My Complaints
                </button>
              </div>
            </div>

            {/* Slots Grid */}
            <div className="grid grid-cols-1 gap-4">
              {submittedDefect.aiSuggestedSlots?.map((slot) => {
                const isSelected = selectedSlotForDefect === slot.id;
                return (
                  <div
                    key={slot.id}
                    className={`rounded-xl p-5 border transition-all ${
                      slot.isBestPick
                        ? slot.bestRank === 1
                          ? 'bg-gradient-to-r from-amber-50 dark:from-amber-950/40 via-white dark:via-slate-900 to-white dark:to-slate-900 border-amber-300 dark:border-amber-500/60 shadow-lg ring-1 ring-amber-500/30'
                          : 'bg-gradient-to-r from-blue-50 dark:from-blue-950/40 via-white dark:via-slate-900 to-white dark:to-slate-900 border-blue-300 dark:border-blue-500/60 shadow-lg ring-1 ring-blue-500/30'
                        : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Timing and Ranking */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold shrink-0 ${
                            slot.isBestPick
                              ? slot.bestRank === 1
                                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40'
                                : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/40'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          <Clock className="w-5 h-5" />
                          <span className="text-xs font-mono">{slot.durationMin}m</span>
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                              {slot.start} - {slot.end}
                            </span>
                            <span className="text-sm text-slate-500 dark:text-slate-400">({slot.durationMin} Minutes)</span>

                            {/* Best 2 Suggestions by AI Badges */}
                            {slot.isBestPick && slot.bestRank === 1 && (
                              <span className="px-2.5 py-0.5 rounded-full text-sm font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md flex items-center gap-1 animate-pulse">
                                <Sparkles className="w-3.5 h-3.5 fill-current" />
                                AI BEST PICK #1 (Top Recommendation)
                              </span>
                            )}

                            {slot.isBestPick && slot.bestRank === 2 && (
                              <span className="px-2.5 py-0.5 rounded-full text-sm font-extrabold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5" />
                                AI BEST PICK #2 (Runner-Up Recommendation)
                              </span>
                            )}

                            <span className="px-2 py-0.5 rounded text-[13px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              Score: {slot.score}/100
                            </span>
                          </div>

                          <p className="text-sm text-slate-700 dark:text-slate-300 mt-1.5 font-medium">
                            {slot.aiRecommendationReason}
                          </p>

                          {/* Conflict Details */}
                          <div className="mt-2 text-[13px] text-slate-500 dark:text-slate-400 grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <strong className="text-slate-700 dark:text-slate-300">Passenger Conflict:</strong>{' '}
                              {slot.passengerConflictEvaluation}
                            </div>
                            <div>
                              <strong className="text-slate-700 dark:text-slate-300">Freight Regulation:</strong>{' '}
                              {slot.freightThroughputImpact}
                            </div>
                          </div>

                          {/* Shadow Blocking Potential */}
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">
                              Multi-Dept Shadow Blocking:
                            </span>
                            {slot.shadowBlockingPotential.map((dept) => (
                              <span
                                key={dept}
                                className="px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 text-blue-300 border border-slate-300 dark:border-slate-700"
                              >
                                {dept}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Slot Allotment Action */}
                      <div className="shrink-0 flex items-center gap-2">
                        {isSelected ? (
                          <div className="px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-600/30 border border-emerald-400 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300 text-sm font-bold flex items-center gap-1.5">
                            <Check className="w-4 h-4" />
                            Slot Selected
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleConfirmSlot(submittedDefect, slot)}
                            className={`px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition flex items-center gap-2 ${
                              slot.isBestPick
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-amber-500/20'
                                : 'bg-blue-600 hover:bg-blue-500 text-white'
                            }`}
                          >
                            <Calendar className="w-4 h-4" />
                            Select This Slot
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Custom Desired Time Slot Negotiator (Delay-Minimization Engine) */}
            <AiCustomSlotNegotiator
              defect={submittedDefect}
              currentUser={currentUser}
              onConfirmSlot={handleConfirmSlot}
              selectedSlotId={selectedSlotForDefect}
            />
          </div>
        </div>
      )}

      {/* Main Mode 2: My Complaints & AI Free Time Slots View */}
      {operatorTab === 'my-complaints' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Operator Complaint History & AI Free Time Slots
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  All complaints logged by your department. Click any complaint to inspect the 4-5 free time slots selected by AI with top 2 recommendations.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setOperatorTab('register');
                  setSubmittedDefect(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow transition flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                Register Another Complaint
              </button>
            </div>

            {operatorComplaints.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-base font-semibold">No complaints registered yet by your profile.</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                  Click "Register New Complaint" above to register track/asset defects.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {operatorComplaints.map((defect) => {
                  const isExpanded = expandedDefectId === defect.id;
                  const slots =
                    defect.aiSuggestedSlots ||
                    generateAiFreeTimeSlots({
                      sectionId: defect.section,
                      trackLine: defect.trackLine,
                      severity: defect.severity,
                      defectCategory: defect.defectCategory,
                    });

                  return (
                    <div
                      key={defect.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition"
                    >
                      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                              defect.severity === 'Critical'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : defect.severity === 'Major'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-200 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-sm font-bold text-slate-500 dark:text-slate-400">
                                {defect.id}
                              </span>
                              <h4 className="text-base font-bold text-slate-900 dark:text-white">
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
                              <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-950/80 text-blue-300 border border-blue-800">
                                {defect.status}
                              </span>
                            </div>

                            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                              Location: <strong className="text-slate-900 dark:text-white">{defect.locationDetail}</strong> • Track:{' '}
                              <strong className="text-amber-300">{defect.trackLine} Line</strong> • Detected:{' '}
                              {defect.reportedDate}
                            </p>
                            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {defect.defectDescription}
                            </p>
                          </div>
                        </div>

                        {/* Right: Slot toggle */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setExpandedDefectId(isExpanded ? null : defect.id)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-bold text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            {isExpanded ? 'Hide AI Time Slots' : 'View 4-5 AI Free Time Slots'}
                            <ChevronRight
                              className={`w-3.5 h-3.5 transition-transform ${
                                isExpanded ? 'rotate-90' : ''
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Section: 4-5 AI Free Time Slots with Best 2 Suggestions */}
                      {isExpanded && (
                        <div className="p-4 bg-white dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4" />
                              AI Candidate Free Time Slots for {defect.locationDetail} ({defect.trackLine} Line)
                            </span>
                            <span className="text-[13px] text-slate-500 dark:text-slate-400">
                              Top 2 best suggestions highlighted with badges
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-2.5">
                            {slots.map((slot) => {
                              const isSelected = defect.selectedSlotId === slot.id;
                              return (
                                <div
                                  key={slot.id}
                                  className={`p-3.5 rounded-xl border transition ${
                                    slot.isBestPick
                                      ? slot.bestRank === 1
                                        ? 'bg-amber-950/20 border-amber-500/50'
                                        : 'bg-blue-950/20 border-blue-500/50'
                                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                                  }`}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="space-y-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
                                          {slot.start} - {slot.end}
                                        </span>
                                        <span className="text-sm text-slate-500 dark:text-slate-400">({slot.durationMin}m)</span>

                                        {slot.isBestPick && slot.bestRank === 1 && (
                                          <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-500 text-slate-950">
                                            ✨ AI Best Pick #1 (Top Suggestion)
                                          </span>
                                        )}

                                        {slot.isBestPick && slot.bestRank === 2 && (
                                          <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-blue-500 text-white">
                                            ✨ AI Best Pick #2 (Runner-Up)
                                          </span>
                                        )}

                                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                          Score: {slot.score}/100
                                        </span>
                                      </div>

                                      <p className="text-sm text-slate-700 dark:text-slate-300">
                                        {slot.aiRecommendationReason}
                                      </p>
                                      <p className="text-[13px] text-slate-500 dark:text-slate-400">
                                        Traffic: {slot.passengerConflictEvaluation} • {slot.freightThroughputImpact}
                                      </p>
                                    </div>

                                    <div className="shrink-0">
                                      {isSelected ? (
                                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                          <Check className="w-3.5 h-3.5" /> Slot Assigned
                                        </span>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => handleConfirmSlot(defect, slot)}
                                          className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${
                                            slot.isBestPick
                                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                                              : 'bg-blue-600 hover:bg-blue-500 text-white'
                                          }`}
                                        >
                                          Select Slot
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Custom Time Slot Negotiator for this complaint */}
                          <AiCustomSlotNegotiator
                            defect={defect}
                            currentUser={currentUser}
                            onConfirmSlot={handleConfirmSlot}
                            selectedSlotId={defect.selectedSlotId}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
