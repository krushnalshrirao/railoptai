import React, { useState } from 'react';
import {
  DefectItem,
  FreeTimeSlotSuggestion,
  CorridorBlock,
  UserAccount,
} from '../types';
import { calculateAiCustomSlotAroundDesiredTime } from '../utils/aiSlotGenerator';
import {
  Clock,
  Sparkles,
  AlertTriangle,
  Check,
  Zap,
  RefreshCw,
  Cpu,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  TrendingDown,
  TrainTrack,
} from 'lucide-react';

interface AiCustomSlotNegotiatorProps {
  defect: DefectItem;
  currentUser: UserAccount;
  onConfirmSlot: (defect: DefectItem, slot: FreeTimeSlotSuggestion) => void;
  selectedSlotId?: string | null;
}

export const AiCustomSlotNegotiator: React.FC<AiCustomSlotNegotiatorProps> = ({
  defect,
  currentUser,
  onConfirmSlot,
  selectedSlotId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [desiredTime, setDesiredTime] = useState('10:00');
  const [targetMinDuration, setTargetMinDuration] = useState(120);
  const [operatorNote, setOperatorNote] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [customSlot, setCustomSlot] = useState<FreeTimeSlotSuggestion | null>(null);

  const thinkingSteps = [
    `Scanning timetable traffic graph for section ${defect.section}...`,
    `Evaluating Rajdhani (12301/02), Shatabdi (12002), and freight headways...`,
    `Simulating loop-line regulation to constrain train delay to absolute minimum...`,
    `Maximizing contiguous maintenance window on or around ${desiredTime}...`,
  ];

  const handleCalculateCustomSlot = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsThinking(true);
    setThinkingStep(0);

    // Step-by-step thinking simulation
    const interval = setInterval(() => {
      setThinkingStep((prev) => {
        if (prev < thinkingSteps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 450);

    try {
      // Attempt to query server endpoint if active, with instant heuristic fallback
      let calculatedResult: FreeTimeSlotSuggestion | null = null;
      try {
        const res = await fetch('/api/ai-custom-slot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            desiredTime,
            minDurationMin: targetMinDuration,
            sectionId: defect.section,
            trackLine: defect.trackLine,
            defectCategory: defect.defectCategory,
            severity: defect.severity,
            operatorNote,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.customSlot?.recommendedStart && data?.customSlot?.recommendedEnd) {
            const cs = data.customSlot;
            calculatedResult = {
              id: `SLOT-AI-CUSTOM-${Date.now().toString().slice(-5)}`,
              start: cs.recommendedStart,
              end: cs.recommendedEnd,
              durationMin: cs.durationMin || targetMinDuration,
              date: defect.reportedDate || '2026-09-12',
              trackLine: defect.trackLine,
              section: defect.section.split(' ')[0] || 'BS1',
              score: cs.score || 95,
              isBestPick: true,
              bestRank: 1,
              aiRecommendationReason: cs.reasoning || 'Optimized by AI for minimum train delay.',
              passengerConflictEvaluation: cs.passengerConflict || 'Minimal passenger delay.',
              freightThroughputImpact: cs.freightImpact || 'Goods rake regulated on siding.',
              shadowBlockingPotential: [
                'Civil Engineering (P-Way)',
                'Electrical Dept (OHE)',
                'Signal & Telecommunication (S&T)',
              ],
              isCustomOperatorSlot: true,
              requestedTargetTime: desiredTime,
              minTrainDelayRequirementMet: true,
              totalTrainDelayMinutes: cs.totalTrainDelayMinutes || 5,
              trainRegulationPlan: cs.trainRegulationPlan || [],
              aiThinkingReasoning: cs.reasoning,
              maximizedWindowNote: `Maximized to ${cs.durationMin || targetMinDuration}m around ${desiredTime} with minimum delay.`,
            };
          }
        }
      } catch (err) {
        // Fall through to deterministic local calculation
      }

      if (!calculatedResult) {
        calculatedResult = calculateAiCustomSlotAroundDesiredTime({
          desiredTime,
          minDurationMin: targetMinDuration,
          sectionId: defect.section,
          trackLine: defect.trackLine,
          severity: defect.severity,
          defectCategory: defect.defectCategory,
          date: defect.reportedDate || '2026-09-12',
          operatorNote,
        });
      }

      // Complete thinking animation
      setTimeout(() => {
        clearInterval(interval);
        setCustomSlot(calculatedResult);
        setIsThinking(false);
      }, 1600);
    } catch (err) {
      clearInterval(interval);
      setIsThinking(false);
    }
  };

  const handleApplyCustomSlot = () => {
    if (!customSlot) return;
    onConfirmSlot(defect, customSlot);
  };

  const isCurrentCustomSelected = customSlot && selectedSlotId === customSlot.id;

  return (
    <div className="mt-4 border border-blue-900/60 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 overflow-hidden shadow-lg">
      {/* Header Toggle */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h5 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>None of these 4 time slots convenient?</span>
                <span className="text-blue-400 font-normal text-sm">
                  Find Desired Time Slot
                </span>
              </h5>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                AI Delay-Minimization Engine
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-0.5">
              Specify your preferred time. AI will calculate the <strong>maximum window</strong> on/around that time with <strong>minimum train delay</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm font-semibold text-blue-400">
          <span>{isOpen ? 'Hide Options' : 'Configure Custom Time'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded Negotiator Drawer */}
      {isOpen && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4">
          {/* Input Form */}
          <form onSubmit={handleCalculateCustomSlot} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Desired Time Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Desired Time Slot (Start / Around) *
                </label>
                <input
                  type="time"
                  required
                  value={desiredTime}
                  onChange={(e) => setDesiredTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-base font-mono text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['08:30', '10:00', '12:30', '14:30', '16:00', '22:30'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDesiredTime(preset)}
                      className={`px-2 py-0.5 rounded text-[13px] font-mono transition border ${
                        desiredTime === preset
                          ? 'bg-blue-600 text-white border-blue-400'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Duration */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  Target / Desired Duration
                </label>
                <select
                  value={targetMinDuration}
                  onChange={(e) => setTargetMinDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-base text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value={90}>90 Minutes (Standard Maintenance Block)</option>
                  <option value={105}>105 Minutes (Extended Block)</option>
                  <option value={120}>120 Minutes (Heavy Track Machine Window)</option>
                  <option value={135}>135 Minutes (Mega Block Attention)</option>
                  <option value={150}>150 Minutes (Maximum Window Allocation)</option>
                </select>
                <p className="text-[13px] text-slate-400 mt-1">
                  AI will maximize the window to give you the longest contiguous time.
                </p>
              </div>

              {/* Specific Operational Reason */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                  Maintenance Crew Shift / Reason (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Tamping crew shifts at 10 AM, USFD daylight test..."
                  value={operatorNote}
                  onChange={(e) => setOperatorNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-base text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-slate-500"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setOperatorNote('Machine shift commences at this hour')}
                    className="text-xs text-blue-400 hover:underline"
                  >
                    + Machine shift
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => setOperatorNote('Daylight required for USFD flaw detection')}
                    className="text-xs text-blue-400 hover:underline"
                  >
                    + Daylight USFD
                  </button>
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                AI scans timetable headways & loop sidings to ensure minimum train delay.
              </p>

              <button
                type="submit"
                disabled={isThinking}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isThinking ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>AI is Thinking & Optimizing...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4 text-amber-300" />
                    <span>Let AI Think & Give Maximum Time (Min Delay)</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* AI Thinking Animation */}
          {isThinking && (
            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 space-y-3 animate-pulse">
              <div className="flex items-center justify-between text-sm text-blue-300 font-bold">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                  AI Chief Dispatcher Neural Model Thinking...
                </span>
                <span className="font-mono text-[13px] text-amber-300">
                  Step {thinkingStep + 1} of {thinkingSteps.length}
                </span>
              </div>
              <p className="text-sm font-mono text-slate-200">
                &gt; {thinkingSteps[thinkingStep]}
              </p>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-amber-400 h-1.5 transition-all duration-300"
                  style={{ width: `${((thinkingStep + 1) / thinkingSteps.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* AI Custom Slot Result Card */}
          {customSlot && !isThinking && (
            <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-950 border border-emerald-500/50 shadow-xl space-y-4">
              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-900/50 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-sm font-extrabold bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    AI Calculated Custom Slot (Operator Preferred Time)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[13px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    Targeted Around: {desiredTime}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Min Train Delay Met: Only {customSlot.totalTrainDelayMinutes}m Total
                  </span>
                  <span className="px-2 py-0.5 rounded text-[13px] font-mono font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                    Score: {customSlot.score}/100
                  </span>
                </div>
              </div>

              {/* Main Slot Information */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-2xl font-mono font-extrabold text-white">
                      {customSlot.start} - {customSlot.end}
                    </span>
                    <span className="text-base font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      ⚡ Maximum Window: {customSlot.durationMin} Minutes
                    </span>
                    <span className="text-sm text-slate-400">
                      ({defect.section} • {defect.trackLine} Line)
                    </span>
                  </div>

                  <p className="text-sm text-slate-200 font-medium">
                    {customSlot.aiRecommendationReason}
                  </p>

                  <div className="text-sm text-slate-300 bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-2">
                    <div className="font-bold text-emerald-400 text-[13px] uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                      Delay Minimization Execution Strategy:
                    </div>

                    {customSlot.trainRegulationPlan && customSlot.trainRegulationPlan.length > 0 ? (
                      <div className="space-y-1.5">
                        {customSlot.trainRegulationPlan.map((tr, idx) => (
                          <div
                            key={idx}
                            className="flex flex-wrap items-center justify-between text-[13px] border-b border-slate-800 pb-1 last:border-b-0"
                          >
                            <span className="font-semibold text-slate-200">
                              {tr.trainNo} {tr.trainName} ({tr.trainType}):
                            </span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-mono font-bold ${
                                  tr.delayMin === 0
                                    ? 'text-emerald-400'
                                    : 'text-amber-400'
                                }`}
                              >
                                {tr.delayMin === 0 ? '0 min delay' : `${tr.delayMin} min minimal holding`}
                              </span>
                              <span className="text-slate-400 text-xs">
                                ({tr.regulationMethod})
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">
                        {customSlot.passengerConflictEvaluation} • {customSlot.freightThroughputImpact}
                      </p>
                    )}
                  </div>
                </div>

                {/* Allot Custom Slot Action Button */}
                <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-end gap-2">
                  {isCurrentCustomSelected ? (
                    <div className="px-4 py-2.5 rounded-xl bg-emerald-600/30 border border-emerald-500 text-emerald-300 text-sm font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      Custom Slot Selected
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCustomSlot}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      Accept & Allot This AI Custom Slot
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setCustomSlot(null)}
                    className="text-sm text-slate-400 hover:text-slate-200 underline pt-1"
                  >
                    Adjust Time & Recalculate
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
