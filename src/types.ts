export type AccountRole = 'operator' | 'management';

export type OperatorDepartment =
  | 'Civil Engineering (Permanent Way)'
  | 'Signal & Telecommunication (S&T)'
  | 'Electrical Traction & OHE'
  | 'Mechanical / Rolling Stock (C&W)'
  | 'Operating & Train Control';

export interface UserAccount {
  id: string;
  name: string;
  role: AccountRole;
  designation: string;
  department: string;
  headquarters: string;
  staffId: string;
  contactNumber: string;
  avatarColor: string;
  password?: string;
  createdAt?: string;
  status?: string;
}

export interface TrainRegulationImpact {
  trainNo: string;
  trainName: string;
  trainType: string;
  delayMin: number;
  regulationMethod: string;
  location: string;
}

export interface FreeTimeSlotSuggestion {
  id: string;
  start: string;
  end: string;
  durationMin: number;
  date: string;
  trackLine: string;
  section: string;
  score: number; // 0-100 quality score
  isBestPick: boolean;
  bestRank?: 1 | 2; // 1 = Top 1 best suggestion, 2 = Top 2 best suggestion
  aiRecommendationReason: string;
  passengerConflictEvaluation: string;
  freightThroughputImpact: string;
  shadowBlockingPotential: string[];
  // Dynamic Operator Desired Time Optimization fields
  isCustomOperatorSlot?: boolean;
  requestedTargetTime?: string;
  minTrainDelayRequirementMet?: boolean;
  totalTrainDelayMinutes?: number;
  trainRegulationPlan?: TrainRegulationImpact[];
  aiThinkingReasoning?: string;
  maximizedWindowNote?: string;
}

export type DefectSource = 'TMS' | 'SMMS' | 'TDMS' | 'Field Report';

export type DefectSeverity = 'Critical' | 'Major' | 'Minor';

export type DefectStatus = 'Pending' | 'Overdue' | 'Scheduled' | 'In Progress' | 'Resolved';

export interface DefectItem {
  id: string;
  sourceSystem: DefectSource;
  assetId: string;
  assetType: string;
  section: string; // e.g., 'NDLS-GZB' or 'BS1'
  locationDetail: string; // e.g., 'Km 12.4'
  trackLine: 'UP' | 'DOWN' | 'T1' | 'T2' | 'Both' | 'Yard/Loop';
  defectCategory: string;
  defectDescription: string;
  severity: DefectSeverity;
  reportedDate: string;
  scheduledMaintenanceDate: string;
  status: DefectStatus;
  overdueDays: number;
  detectedBy: string;
  immediateActionTaken?: string;
  speedRestrictionKmph?: number | null;
  evidencePhoto?: string;
  measurementEvidence?: {
    parameter: string;
    value: string;
    unit: string;
    limit: string;
  };
  remarks?: string;
  assignedBlockId?: string;
  // Operator & AI Assignment Fields
  reportedByOperatorName?: string;
  reportedByOperatorStaffId?: string;
  operatorDepartment?: string;
  aiSuggestedSlots?: FreeTimeSlotSuggestion[];
  selectedSlotId?: string;
  managementReviewStatus?: 'Pending Review' | 'Approved for Block' | 'Block Scheduled' | 'Resolved';
  managementNotes?: string;
}

export interface CorridorStation {
  code: string;
  name: string;
  kmFromNdls: number;
}

export interface BlockSection {
  id: string; // BS1, BS2, etc.
  fromStation: string;
  toStation: string;
  distanceKm: number;
  noOfLines: string;
  maxSpeedKmph: number;
  activeBlocksCount?: number;
  hasTSR?: boolean;
}

export interface TimetableEntry {
  trainNo: string;
  trainName: string;
  trainType: 'Rajdhani' | 'Shatabdi' | 'Express' | 'Passenger' | 'MEMU' | 'Goods';
  direction: 'UP' | 'DOWN';
  daysOfRun: string;
  stops: {
    stationCode: string;
    stationName: string;
    schedArrival: string;
    schedDeparture: string;
    haltMin: number;
  }[];
}

export interface GoodsForecast {
  forecastId: string;
  commodity: string;
  rakeType: string;
  fromStation: string;
  toStation: string;
  priority: 'High' | 'Medium' | 'Low';
  requestedDate: string;
  earliestDeparture: string;
  latestDeparture: string;
  expectedTransitMin: number;
  noOfRakes: number;
  status?: 'Scheduled' | 'Window Identified' | 'Regulated';
}

export interface CorridorBlock {
  id: string;
  blockSectionId: string;
  date: string;
  blockStart: string;
  blockEnd: string;
  durationMin: number;
  blockType: 'Maintenance' | 'Traffic Block' | 'Power/OHE Block' | 'Integrated Mega Block';
  reason: string;
  requestingDept: 'Engineering Dept' | 'Electrical Dept' | 'S&T Dept' | 'Multi-Dept Coordinated' | 'Mechanical Dept' | string;
  coordinatingDepts: string[];
  trackLine: string;
  status: 'Approved' | 'Proposed by AI' | 'Manually Overridden' | 'Pending Review' | 'Active' | 'Completed';
  defectsAddressed: string[];
  operationalImpact?: string;
  isAiGenerated?: boolean;
}

export interface OptimizationResult {
  summary: string;
  shadowBlockingStrategy: string;
  recommendedSlots: {
    section: string;
    track: string;
    recommendedStart: string;
    recommendedEnd: string;
    durationMin: number;
    departments: string[];
    defectsCovered: string[];
    impactMitigation: string;
    priority: DefectSeverity;
  }[];
  freightPunctualityImpact: string;
  safetyAdvisory: string;
  assetUptimeGainPct?: number;
  totalHoursSaved?: number;
}
