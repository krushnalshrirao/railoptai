import React, { useState } from 'react';
import { UserAccount, DefectItem, BlockSection, DefectSeverity } from '../types';
import { STANDARD_DEFECT_CATEGORIES, DETECTOR_ROLES } from '../data/initialData';
import {
  AlertTriangle,
  Camera,
  CheckCircle,
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
  Trash2,
} from 'lucide-react';

interface WorkerDashboardProps {
  currentUser: UserAccount;
  sections: BlockSection[];
  onAddDefect: (defect: DefectItem) => void;
  myDefects: DefectItem[];
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  currentUser,
  sections,
  onAddDefect,
  myDefects,
}) => {
  const [activeWorkerTab, setActiveWorkerTab] = useState<'form' | 'history'>('form');

  // Form states matching user requirements exactly:
  // 1. Exact location: km/chainage marker, section, and which track (up/down line)
  const [section, setSection] = useState('BS1 (NDLS-GZB)');
  const [locationMarker, setLocationMarker] = useState('Km 14.8');
  const [trackLine, setTrackLine] = useState<'UP' | 'DOWN' | 'T1' | 'T2' | 'Both' | 'Yard/Loop'>('UP');

  // 2. Type/category of defect - from standard list
  const [defectCategory, setDefectCategory] = useState(STANDARD_DEFECT_CATEGORIES[0]);
  const [defectDescription, setDefectDescription] = useState('');

  // 3. Date and time of detection
  const now = new Date();
  const defaultDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const [detectedDateTime, setDetectedDateTime] = useState(defaultDateTime);

  // 4. Detected by whom (accountability trail)
  const [detectedBy, setDetectedBy] = useState(
    currentUser.designation.includes('Patrolman')
      ? 'Patrolman (Keyman)'
      : 'SSE P-Way (Civil Engineering)'
  );
  const [staffReportingName, setStaffReportingName] = useState(
    `${currentUser.name} (${currentUser.staffId})`
  );

  // 5. Severity/urgency classification
  const [severity, setSeverity] = useState<DefectSeverity>('Critical');

  // 6. Photographic or measurement evidence (especially mobile/tablet entry)
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [measurementParam, setMeasurementParam] = useState('Rail Crack Length / Gap');
  const [measurementValue, setMeasurementValue] = useState('16.5');
  const [measurementUnit, setMeasurementUnit] = useState('mm');
  const [measurementLimit, setMeasurementLimit] = useState('10.0');

  // 7. Immediate action taken, if any (e.g. speed restriction already imposed on the spot)
  const [immediateActionTaken, setImmediateActionTaken] = useState(
    'Temporary Speed Restriction (TSR) 30 km/h imposed with caution indicator boards placed at 30m/600m/1200m; Joggled fishplate clamped with 4 bolts.'
  );
  const [imposeTsr, setImposeTsr] = useState(true);
  const [tsrSpeed, setTsrSpeed] = useState('30');

  const [submittedSuccess, setSubmittedSuccess] = useState(false);

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
    // Generate an illustrative placeholder evidence photo
    const svgData = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect width="400" height="260" fill="%231e293b"/><text x="20" y="40" fill="%23f8fafc" font-size="16" font-family="monospace" font-weight="bold">IR FIELD EVIDENCE CAPTURE</text><text x="20" y="70" fill="%2338bdf8" font-size="13" font-family="monospace">Loc: ${locationMarker} [${trackLine} Line]</text><text x="20" y="95" fill="%23fbbf24" font-size="13" font-family="monospace">Defect: ${defectCategory.slice(0, 30)}</text><text x="20" y="120" fill="%23f87171" font-size="13" font-family="monospace">Value: ${measurementValue} ${measurementUnit} (Limit: ${measurementLimit} ${measurementUnit})</text><text x="20" y="145" fill="%2394a3b8" font-size="12" font-family="monospace">Staff: ${staffReportingName.slice(0, 30)}</text><rect x="50" y="170" width="300" height="40" rx="4" fill="%23334155" stroke="%23e11d48" stroke-width="2"/><text x="110" y="196" fill="%23e11d48" font-size="15" font-family="monospace" font-weight="bold">DEFECT VERIFIED (IR-TAB)</text></svg>`;
    setPhotoPreview(svgData);
    setHasPhoto(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newDefectId = `WRK-${Date.now().toString().slice(-4)}`;
    const finalSection = section.split(' ')[0] || 'BS1';

    const newDefect: DefectItem = {
      id: newDefectId,
      sourceSystem: 'Field Report',
      assetId: `TRK-${finalSection}-${locationMarker.replace(/[^a-zA-Z0-9]/g, '')}`,
      assetType: 'Track (P-Way Asset)',
      section: finalSection,
      locationDetail: `${finalSection} ${locationMarker}`,
      trackLine,
      defectCategory,
      defectDescription:
        defectDescription ||
        `${defectCategory} observed at ${locationMarker}. Recorded value: ${measurementValue} ${measurementUnit}.`,
      severity,
      reportedDate: detectedDateTime.split('T')[0],
      scheduledMaintenanceDate: detectedDateTime.split('T')[0],
      status: 'Pending',
      overdueDays: 0,
      detectedBy: `${detectedBy} - ${staffReportingName}`,
      immediateActionTaken: immediateActionTaken || 'Inspected on site, logged for block attention.',
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
      remarks: `Field report logged by ${currentUser.name} (${currentUser.designation}) via IR-RailOpt Field Portal.`,
    };

    onAddDefect(newDefect);
    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setActiveWorkerTab('history');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Account Identity */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-5 border border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                Field Inspection & Complaint Registration Portal
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Worker Mode
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-0.5">
              Logged in as <strong className="text-white">{currentUser.name}</strong> •{' '}
              {currentUser.designation} • HQ: {currentUser.headquarters} ({currentUser.staffId})
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-300 dark:border-slate-700">
          <button
            id="worker-btn-register"
            onClick={() => setActiveWorkerTab('form')}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition ${
              activeWorkerTab === 'form'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-white'
            }`}
          >
            Register New Complaint
          </button>
          <button
            id="worker-btn-history"
            onClick={() => setActiveWorkerTab('history')}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition flex items-center gap-1.5 ${
              activeWorkerTab === 'history'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Field Reports & History ({myDefects.length})
          </button>
        </div>
      </div>

      {submittedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-4 flex items-center gap-3 shadow-xs animate-in fade-in">
          <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <div className="font-bold text-base">Complaint Registered Successfully!</div>
            <div className="text-sm text-emerald-700">
              Your defect report has been transmitted to Section Control Office (DRM NDLS) and queued for AI Block Scheduling.
            </div>
          </div>
        </div>
      )}

      {activeWorkerTab === 'form' ? (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              New Safety Defect / Track Maintenance Complaint
            </h3>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Fill all required accountability and engineering parameters as per Indian Railways Permanent Way & S&T Manual.
            </p>
          </div>

          {/* Section 1: Exact Location (Required by prompt) */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-emerald-600" />
              1. Exact Location & Track Identification
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Corridor Section *
                </label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full px-3 py-2 text-base border border-slate-300 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="BS1 (NDLS-GZB)">BS1: New Delhi (NDLS) - Ghaziabad (GZB)</option>
                  <option value="BS2 (GZB-ALJN)">BS2: Ghaziabad (GZB) - Aligarh Jn (ALJN)</option>
                  <option value="BS3 (ALJN-TDL)">BS3: Aligarh Jn (ALJN) - Tundla Jn (TDL)</option>
                  <option value="BS4 (TDL-ETW)">BS4: Tundla Jn (TDL) - Etawah (ETW)</option>
                  <option value="BS5 (ETW-CNB)">BS5: Etawah (ETW) - Kanpur Central (CNB)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Km / Chainage Marker *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Km 12.4 or Km 104/12-14"
                  value={locationMarker}
                  onChange={(e) => setLocationMarker(e.target.value)}
                  className="w-full px-3 py-2 text-base border border-slate-300 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Which Track (Line) *
                </label>
                <select
                  value={trackLine}
                  onChange={(e) => setTrackLine(e.target.value as any)}
                  className="w-full px-3 py-2 text-base border border-slate-300 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="UP">UP Line (Towards NDLS)</option>
                  <option value="DOWN">DOWN Line (Towards CNB)</option>
                  <option value="T1">T1 (Quadruple UP Fast)</option>
                  <option value="T2">T2 (Quadruple DOWN Fast)</option>
                  <option value="Both">Both Lines (Interlocking/Crossover)</option>
                  <option value="Yard/Loop">Station Yard / Loop Line</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Type/Category & Description (Required by prompt) */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              2. Defect Category & Severity Urgency
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type / Category of Defect (Standard List) *
                </label>
                <select
                  value={defectCategory}
                  onChange={(e) => setDefectCategory(e.target.value)}
                  className="w-full px-3 py-2 text-base border border-slate-300 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {STANDARD_DEFECT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Severity / Urgency Classification *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSeverity('Critical')}
                    className={`py-2 text-sm font-bold rounded-lg border transition ${
                      severity === 'Critical'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-rose-700 border-rose-200 hover:bg-rose-50'
                    }`}
                  >
                    Critical (Immediate)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeverity('Major')}
                    className={`py-2 text-sm font-bold rounded-lg border transition ${
                      severity === 'Major'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-amber-700 border-amber-200 hover:bg-amber-50'
                    }`}
                  >
                    Major (Urgent)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeverity('Minor')}
                    className={`py-2 text-sm font-bold rounded-lg border transition ${
                      severity === 'Minor'
                        ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-blue-700 border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    Minor (Routine)
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Detailed Observation / Defect Description *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Detail the exact condition (e.g. Transverse fatigue crack detected on 52kg rail head; gauge widening by 7mm; point machine slipping under lock bar)..."
                value={defectDescription}
                onChange={(e) => setDefectDescription(e.target.value)}
                className="w-full px-3 py-2 text-base border border-slate-300 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              ></textarea>
            </div>
          </div>

          {/* Section 3: Detection Date, Time & Accountability Trail (Required by prompt) */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider">
              <Clock className="w-4 h-4 text-blue-600" />
              3. Detection Timestamp & Accountability Trail
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date & Time of Detection *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={detectedDateTime}
                  onChange={(e) => setDetectedDateTime(e.target.value)}
                  className="w-full px-3 py-2 text-base border border-slate-300 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Detected By Whom (Category) *
                </label>
                <select
                  value={detectedBy}
                  onChange={(e) => setDetectedBy(e.target.value)}
                  className="w-full px-3 py-2 text-base border border-slate-300 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {DETECTOR_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reporting Staff Name & PF/ID *
                </label>
                <input
                  type="text"
                  required
                  value={staffReportingName}
                  onChange={(e) => setStaffReportingName(e.target.value)}
                  className="w-full px-3 py-2 text-base border border-slate-300 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Evidence (Measurement & Photographic) (Required by prompt) */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider">
              <Ruler className="w-4 h-4 text-indigo-600" />
              4. Measurement & Photographic Evidence (Tablet / Mobile Assisted)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Measurement Parameter
                </label>
                <input
                  type="text"
                  placeholder="e.g. Crack Length, Wear"
                  value={measurementParam}
                  onChange={(e) => setMeasurementParam(e.target.value)}
                  className="w-full px-3 py-2 text-base border border-slate-300 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Observed Value *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 16.5"
                  value={measurementValue}
                  onChange={(e) => setMeasurementValue(e.target.value)}
                  className="w-full px-3 py-2 text-base border border-slate-300 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Unit
                </label>
                <input
                  type="text"
                  placeholder="mm, mm/m, A, V"
                  value={measurementUnit}
                  onChange={(e) => setMeasurementUnit(e.target.value)}
                  className="w-full px-3 py-2 text-base border border-slate-300 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Permissible Safety Limit
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10.0 mm"
                  value={measurementLimit}
                  onChange={(e) => setMeasurementLimit(e.target.value)}
                  className="w-full px-3 py-2 text-base border border-slate-300 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-rose-700"
                />
              </div>
            </div>

            {/* Photographic Attachment */}
            <div className="pt-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Photographic Evidence (Mobile / Tablet Camera or Gallery)
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <label className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 cursor-pointer transition flex items-center gap-1.5 shadow-2xs">
                  <UploadCloud className="w-4 h-4 text-blue-600" />
                  Upload Photo from Device
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleSimulatePhoto}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold hover:bg-slate-900 transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Camera className="w-4 h-4 text-amber-400" />
                  Use Tablet Field Camera (Simulate Stamp)
                </button>

                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null);
                      setHasPhoto(false);
                    }}
                    className="text-sm text-rose-600 hover:text-rose-800 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Photo
                  </button>
                )}
              </div>

              {photoPreview && (
                <div className="mt-3 p-2 bg-white dark:bg-slate-900 rounded-lg inline-block border border-slate-300 dark:border-slate-700">
                  <img
                    src={photoPreview}
                    alt="Evidence Preview"
                    referrerPolicy="no-referrer"
                    className="max-h-48 rounded border border-slate-400 dark:border-slate-600"
                  />
                  <div className="text-xs text-emerald-400 font-mono mt-1 text-center">
                    Geo-Tagged & Timestamped Evidence Attached
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Immediate Action Taken (Required by prompt) */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-600" />
              5. Immediate On-Spot Action & Speed Restriction (TSR)
            </div>

            <div className="flex items-center gap-4 mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={imposeTsr}
                  onChange={(e) => setImposeTsr(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Impose Temporary Speed Restriction (TSR) on the Spot
                </span>
              </label>

              {imposeTsr && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Restricted Speed:</span>
                  <select
                    value={tsrSpeed}
                    onChange={(e) => setTsrSpeed(e.target.value)}
                    className="px-2 py-1 text-sm border border-rose-300 bg-rose-50 text-rose-800 font-bold rounded focus:outline-none"
                  >
                    <option value="15">15 km/h (Dead Slow)</option>
                    <option value="20">20 km/h (Stop Dead & Proceed)</option>
                    <option value="30">30 km/h (Standard Rail Crack / Point TSR)</option>
                    <option value="45">45 km/h</option>
                    <option value="50">50 km/h (Geometry Caution)</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Immediate Action Taken Description *
              </label>
              <textarea
                rows={2}
                required
                value={immediateActionTaken}
                onChange={(e) => setImmediateActionTaken(e.target.value)}
                placeholder="e.g. Speed restriction 30kmph imposed; red banner flag posted; emergency clamps fitted on web; station master notified via VHF..."
                className="w-full px-3 py-2 text-base border border-slate-300 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              ></textarea>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-between">
            <div className="text-sm text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-500" />
              Direct integration: Auto-syncs into TDMS/SMMS and notifies Section Controller.
            </div>

            <button
              id="btn-submit-defect"
              type="submit"
              className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold shadow-md transition flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Submit Defect & Notify Control Office
            </button>
          </div>
        </form>
      ) : (
        /* History & Field Inspection Records Tab */
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                My Registered Field Complaints & Inspection Log
              </h3>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Track status of complaints logged by your crew and whether block allotment has been scheduled by Control.
              </p>
            </div>
            <button
              onClick={() => setActiveWorkerTab('form')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition flex items-center gap-1"
            >
              + Log New Defect
            </button>
          </div>

          {myDefects.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Shield className="w-12 h-12 mx-auto text-slate-700 dark:text-slate-300 mb-2" />
              <div className="text-base font-medium text-slate-600">No complaints registered in this session yet</div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Click "Register New Complaint" above to log a safety observation from the field.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myDefects.map((defect) => (
                <div
                  key={defect.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition bg-slate-50/50 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm bg-slate-200 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded">
                          {defect.id}
                        </span>
                        <span className="font-bold text-base text-slate-900 dark:text-white">
                          {defect.defectCategory}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                            defect.severity === 'Critical'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : defect.severity === 'Major'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {defect.severity}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${
                            defect.status === 'Resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : defect.status === 'Scheduled'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          Status: {defect.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 mt-1 flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          📍 {defect.locationDetail} ({defect.trackLine} Line)
                        </span>
                        <span>•</span>
                        <span>Reported: {defect.reportedDate}</span>
                        <span>•</span>
                        <span>Accountability: {defect.detectedBy}</span>
                      </div>
                    </div>

                    {defect.speedRestrictionKmph && (
                      <span className="bg-rose-50 text-rose-700 border border-rose-200 font-bold px-2 py-1 rounded text-sm">
                        ⚠️ TSR {defect.speedRestrictionKmph} km/h
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-700 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200">
                    {defect.defectDescription}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    {defect.measurementEvidence && (
                      <div className="bg-slate-100 p-2 rounded">
                        <span className="font-semibold text-slate-700">Measurement: </span>
                        {defect.measurementEvidence.parameter}:{' '}
                        <strong className="text-slate-900 dark:text-white">
                          {defect.measurementEvidence.value} {defect.measurementEvidence.unit}
                        </strong>{' '}
                        (Limit: {defect.measurementEvidence.limit} {defect.measurementEvidence.unit})
                      </div>
                    )}
                    {defect.immediateActionTaken && (
                      <div className="bg-slate-100 p-2 rounded">
                        <span className="font-semibold text-slate-700">Immediate Action: </span>
                        {defect.immediateActionTaken}
                      </div>
                    )}
                  </div>

                  {defect.evidencePhoto && (
                    <div className="mt-2">
                      <div className="text-[13px] font-semibold text-slate-400 dark:text-slate-500 mb-1">
                        Attached Field Photo:
                      </div>
                      <img
                        src={defect.evidencePhoto}
                        alt="Defect Evidence"
                        referrerPolicy="no-referrer"
                        className="h-28 rounded-md border border-slate-300 object-contain bg-slate-50 dark:bg-slate-950"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
