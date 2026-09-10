import React from 'react';
import { CorridorStation, BlockSection, DefectItem, CorridorBlock } from '../types';
import { AlertTriangle, Clock, Activity, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

interface CorridorMapProps {
  stations: CorridorStation[];
  sections: BlockSection[];
  defects: DefectItem[];
  blocks: CorridorBlock[];
  selectedSection: string | null;
  onSelectSection: (sectionId: string | null) => void;
}

export const CorridorMap: React.FC<CorridorMapProps> = ({
  stations = [],
  sections = [],
  defects = [],
  blocks = [],
  selectedSection,
  onSelectSection,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              High-Density Corridor Schematic Monitor
            </h3>
            <span className="px-2 py-0.5 text-[13px] font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
              Live Interlocking Feed
            </span>
          </div>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            New Delhi (NDLS) to Kanpur Central (CNB) — 440 km Golden Quadrilateral Core Route
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500"></span>
            <span>Normal Line (130 km/h)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500"></span>
            <span>Active TSR / Caution</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500"></span>
            <span>Scheduled Block Window</span>
          </div>
          {selectedSection && (
            <button
              onClick={() => onSelectSection(null)}
              className="text-sm text-blue-600 font-semibold hover:underline"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Schematic Linear Track Visualization */}
      <div className="overflow-x-auto pb-4 pt-2">
        <div className="min-w-[840px] px-4 py-2">
          {/* Track Lines and Stations */}
          <div className="relative">
            {/* Horizontal Track rail representation */}
            <div className="absolute top-[42px] left-8 right-8 h-2 bg-slate-300 rounded-full"></div>
            <div className="absolute top-[48px] left-8 right-8 h-1 bg-slate-400"></div>

            {/* Stations and Section Segments Grid */}
            <div className="relative flex justify-between items-start">
              {stations.map((station, index) => {
                const nextStation = stations[index + 1];
                const section = sections.find(
                  (s) => s.fromStation === station.code && nextStation && s.toStation === nextStation.code
                );

                // Check section attributes
                const sectionDefects = section
                  ? defects.filter(
                      (d) =>
                        d.section.includes(section.id) ||
                        d.section.includes(`${section.fromStation}-${section.toStation}`) ||
                        d.locationDetail.includes(`${section.fromStation}-${section.toStation}`)
                    )
                  : [];

                const criticalDefects = sectionDefects.filter((d) => d.severity === 'Critical');
                const activeTSRs = sectionDefects.filter((d) => d.speedRestrictionKmph);
                const sectionBlocks = section
                  ? blocks.filter((b) => b.blockSectionId === section.id)
                  : [];

                const isSelected = selectedSection === section?.id;

                return (
                  <React.Fragment key={station.code}>
                    {/* Station Node */}
                    <div className="flex flex-col items-center z-10 w-24">
                      {/* Station Marker */}
                      <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 dark:bg-slate-900 border-3 border-white shadow-md flex items-center justify-center text-amber-400 font-bold text-sm">
                        {station.code}
                      </div>
                      <div className="text-center mt-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block">
                          {station.name}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          Km {station.kmFromNdls}
                        </span>
                      </div>
                    </div>

                    {/* Block Section Segment (between this and next station) */}
                    {nextStation && section && (
                      <div
                        onClick={() => onSelectSection(isSelected ? null : section.id)}
                        className={`flex-1 mx-2 -mt-1 p-2 rounded-lg border transition cursor-pointer relative group ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 shadow-md ring-2 ring-blue-300'
                            : activeTSRs.length > 0
                            ? 'bg-amber-50/70 border-amber-300 hover:border-amber-400'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-100/70'
                        }`}
                      >
                        {/* Section Header */}
                        <div className="flex items-center justify-between text-[13px] mb-1">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {section.id}: {section.fromStation}-{section.toStation}
                          </span>
                          <span className="text-slate-400 dark:text-slate-500 font-mono">
                            {section.distanceKm} km • {section.noOfLines}
                          </span>
                        </div>

                        {/* Status badges row */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs">
                          {/* Speed Limit */}
                          <span className="bg-slate-200 text-slate-700 font-medium px-1.5 py-0.5 rounded">
                            Max {section.maxSpeedKmph} km/h
                          </span>

                          {/* Caution order / TSR */}
                          {activeTSRs.length > 0 && (
                            <span className="bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded border border-amber-300 flex items-center gap-1 animate-pulse">
                              <ShieldAlert className="w-3 h-3 text-amber-600" />
                              TSR {activeTSRs[0].speedRestrictionKmph} km/h
                            </span>
                          )}

                          {/* Active Blocks */}
                          {sectionBlocks.length > 0 && (
                            <span className="bg-blue-100 text-blue-800 font-medium px-1.5 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-blue-600" />
                              {sectionBlocks.length} Block{sectionBlocks.length > 1 ? 's' : ''}
                            </span>
                          )}

                          {/* Defects count */}
                          {criticalDefects.length > 0 && (
                            <span className="bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded border border-rose-300 flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              {criticalDefects.length} Crit
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-blue-600 font-semibold mt-1.5 opacity-0 group-hover:opacity-100 transition text-right">
                          {isSelected ? 'Click to deselect' : 'Click to filter section'}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
