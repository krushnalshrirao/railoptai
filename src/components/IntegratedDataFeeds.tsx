import React, { useState } from 'react';
import { DefectItem, GoodsForecast, TimetableEntry, BlockSection, CorridorStation } from '../types';
import {
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Train,
  Box,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface IntegratedDataFeedsProps {
  defects: DefectItem[];
  goodsForecasts: GoodsForecast[];
  timetable: TimetableEntry[];
  sections: BlockSection[];
  stations: CorridorStation[];
  onScheduleDefectBlock?: (defect: DefectItem) => void;
}

export const IntegratedDataFeeds: React.FC<IntegratedDataFeedsProps> = ({
  defects = [],
  goodsForecasts = [],
  timetable = [],
  sections = [],
  stations = [],
  onScheduleDefectBlock,
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'defects' | 'goods' | 'timetable'>('defects');

  // Defect filters
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'TMS' | 'SMMS' | 'TDMS' | 'Field Report'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'Critical' | 'Major' | 'Minor' | 'Overdue'>('ALL');
  const [sectionFilter, setSectionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Timetable view state
  const [expandedTrain, setExpandedTrain] = useState<string | null>('12301');

  // Filter defects
  const filteredDefects = defects.filter((item) => {
    if (sourceFilter !== 'ALL' && item.sourceSystem !== sourceFilter) return false;
    if (severityFilter === 'Overdue') {
      if (item.status !== 'Overdue' && item.overdueDays <= 0) return false;
    } else if (severityFilter !== 'ALL' && item.severity !== severityFilter) {
      return false;
    }
    if (sectionFilter !== 'ALL' && !item.section.includes(sectionFilter)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.id.toLowerCase().includes(q) ||
        item.assetId.toLowerCase().includes(q) ||
        item.defectDescription.toLowerCase().includes(q) ||
        item.locationDetail.toLowerCase().includes(q) ||
        item.defectCategory.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Top Header & Tab switcher */}
      <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 text-slate-900 dark:text-white dark:text-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white dark:text-white">
                Multi-System Data Integration Hub
              </h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Live synchronized feeds from TMS (Rolling Stock), SMMS (Signals), TDMS (Track), Train Time Table & Freight Control
            </p>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-300 dark:border-slate-700">
            <button
              onClick={() => setActiveMainTab('defects')}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold transition flex items-center gap-1.5 ${
                activeMainTab === 'defects'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              TMS / SMMS / TDMS Defects ({defects.length})
            </button>
            <button
              onClick={() => setActiveMainTab('goods')}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold transition flex items-center gap-1.5 ${
                activeMainTab === 'goods'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-amber-400" />
              Goods Trains Forecast ({goodsForecasts.length})
            </button>
            <button
              onClick={() => setActiveMainTab('timetable')}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold transition flex items-center gap-1.5 ${
                activeMainTab === 'timetable'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-white'
              }`}
            >
              <Train className="w-3.5 h-3.5 text-emerald-400" />
              Train Time Table ({timetable.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content depending on tab */}
      {activeMainTab === 'defects' && (
        <div className="p-5 space-y-4">
          {/* Controls / Filter row */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              {/* System Filter */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-300 rounded-md px-2 py-1 text-sm">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Source:</span>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value as any)}
                  className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="ALL">All Systems (TMS/SMMS/TDMS)</option>
                  <option value="TMS">TMS (Track & Rolling Stock)</option>
                  <option value="SMMS">SMMS (Signal & Telecom)</option>
                  <option value="TDMS">TDMS (Track Defects)</option>
                  <option value="Field Report">Field Worker Reports</option>
                </select>
              </div>

              {/* Severity Filter */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-300 rounded-md px-2 py-1 text-sm">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Severity:</span>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value as any)}
                  className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="ALL">All Severities</option>
                  <option value="Critical">Critical Only</option>
                  <option value="Major">Major</option>
                  <option value="Minor">Minor</option>
                  <option value="Overdue">⚠️ Overdue Only</option>
                </select>
              </div>

              {/* Section Filter */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-300 rounded-md px-2 py-1 text-sm">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Section:</span>
                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="ALL">All Sections (BS1 - BS5)</option>
                  <option value="NDLS-GZB">BS1: NDLS-GZB</option>
                  <option value="GZB-ALJN">BS2: GZB-ALJN</option>
                  <option value="ALJN-TDL">BS3: ALJN-TDL</option>
                  <option value="TDL-ETW">BS4: TDL-ETW</option>
                  <option value="ETW-CNB">BS5: ETW-CNB</option>
                  <option value="BCT-BRC">BCT-BRC (Western)</option>
                  <option value="MAS-AJJ">MAS-AJJ (Southern)</option>
                  <option value="HWH-BWN">HWH-BWN (Eastern)</option>
                </select>
              </div>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search Asset, Defect, Km..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 rounded-md bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Table of Integrated Defects */}
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider text-[13px]">
                <tr>
                  <th className="py-2.5 px-3">Record / System</th>
                  <th className="py-2.5 px-3">Asset ID & Type</th>
                  <th className="py-2.5 px-3">Section / Location</th>
                  <th className="py-2.5 px-3">Defect Description</th>
                  <th className="py-2.5 px-3">Severity & Status</th>
                  <th className="py-2.5 px-3">Overdue</th>
                  <th className="py-2.5 px-3">Remarks / Action</th>
                  {onScheduleDefectBlock && <th className="py-2.5 px-3 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {filteredDefects.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                      No defects match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredDefects.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 dark:text-white block">{d.id}</span>
                        <span
                          className={`text-xs font-bold px-1.5 py-0.2 rounded uppercase ${
                            d.sourceSystem === 'TDMS'
                              ? 'bg-amber-100 text-amber-800'
                              : d.sourceSystem === 'SMMS'
                              ? 'bg-purple-100 text-purple-800'
                              : d.sourceSystem === 'TMS'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {d.sourceSystem}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-medium text-slate-900 dark:text-white">{d.assetId}</div>
                        <div className="text-[13px] text-slate-400 dark:text-slate-500">{d.assetType}</div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-medium text-slate-900 dark:text-white">{d.locationDetail}</div>
                        <div className="text-[13px] text-slate-400 dark:text-slate-500 font-mono">
                          Sec: {d.section} ({d.trackLine})
                        </div>
                      </td>

                      <td className="py-2.5 px-3 max-w-xs">
                        <div className="font-medium text-slate-900 dark:text-white truncate" title={d.defectDescription}>
                          {d.defectDescription}
                        </div>
                        {d.speedRestrictionKmph && (
                          <span className="text-xs text-rose-700 font-bold bg-rose-50 px-1 py-0.2 rounded">
                            TSR: {d.speedRestrictionKmph} km/h
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                              d.severity === 'Critical'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : d.severity === 'Major'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {d.severity}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                              d.status === 'Overdue'
                                ? 'bg-rose-50 text-rose-700'
                                : d.status === 'Scheduled'
                                ? 'bg-purple-50 text-purple-700'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {d.status}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap font-mono">
                        {d.overdueDays > 0 ? (
                          <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            +{d.overdueDays} days
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">0 days</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-[13px] text-slate-600 max-w-[200px] truncate" title={d.remarks || d.immediateActionTaken}>
                        {d.remarks || d.immediateActionTaken || 'Standard inspection item'}
                      </td>

                      {onScheduleDefectBlock && (
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => onScheduleDefectBlock(d)}
                            className="px-2.5 py-1 text-[13px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200 transition"
                          >
                            Plan Slot
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Goods Trains Forecast Tab */}
      {activeMainTab === 'goods' && (
        <div className="p-5 space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Control Office Goods Freight Demand Schedule — BOXN (Coal), BCN (Foodgrains/Cement), Tank (POL), Container Rakes.
            </div>
            <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded">
              Total Rakes: {goodsForecasts.reduce((acc, g) => acc + g.noOfRakes, 0)}
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider text-[13px]">
                <tr>
                  <th className="py-2.5 px-3">Forecast ID</th>
                  <th className="py-2.5 px-3">Commodity & Rake</th>
                  <th className="py-2.5 px-3">Route (From - To)</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Requested Date</th>
                  <th className="py-2.5 px-3">Departure Window</th>
                  <th className="py-2.5 px-3">Transit Time</th>
                  <th className="py-2.5 px-3">Rakes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {goodsForecasts.map((g) => (
                  <tr key={g.forecastId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {g.forecastId}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">{g.commodity}</div>
                      <div className="text-[13px] text-slate-400 dark:text-slate-500">{g.rakeType}</div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {g.fromStation} ➔ {g.toStation}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                          g.priority === 'High'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : g.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {g.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      {g.requestedDate}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 dark:text-white">
                      {g.earliestDeparture} - {g.latestDeparture}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {Math.floor(g.expectedTransitMin / 60)}h {g.expectedTransitMin % 60}m ({g.expectedTransitMin} min)
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">
                      {g.noOfRakes} rake
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Train Timetable Tab */}
      {activeMainTab === 'timetable' && (
        <div className="p-5 space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-sm text-slate-600">
            Passenger Train Time Table (Howrah Rajdhani, Bhopal Shatabdi, Prayagraj Exp, Shiv Ganga Exp, MEMU & Goods paths). Click any train to view station arrival & departure halts.
          </div>

          <div className="space-y-3">
            {timetable.map((train) => {
              const isExpanded = expandedTrain === train.trainNo;
              return (
                <div
                  key={train.trainNo}
                  className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-2xs"
                >
                  <div
                    onClick={() => setExpandedTrain(isExpanded ? null : train.trainNo)}
                    className="p-3.5 flex flex-wrap items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-base bg-white dark:bg-slate-900 dark:bg-slate-900 text-amber-400 px-2.5 py-1 rounded">
                        {train.trainNo}
                      </span>
                      <div>
                        <div className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                          {train.trainName}
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              train.trainType === 'Rajdhani'
                                ? 'bg-rose-100 text-rose-800'
                                : train.trainType === 'Shatabdi'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {train.trainType}
                          </span>
                        </div>
                        <div className="text-sm text-slate-400 dark:text-slate-500">
                          Direction: {train.direction} Line • Frequency: {train.daysOfRun} • Stoppages: {train.stops.length}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 font-medium">
                      <span>{isExpanded ? 'Hide Halts' : 'View Halts'}</span>
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 p-4">
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                          <thead className="text-[13px] font-semibold text-slate-600 uppercase border-b border-slate-200 dark:border-slate-800 pb-1">
                            <tr>
                              <th className="py-1 px-3">Station</th>
                              <th className="py-1 px-3">Scheduled Arrival</th>
                              <th className="py-1 px-3">Scheduled Departure</th>
                              <th className="py-1 px-3">Halt</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {train.stops.map((st) => (
                              <tr key={st.stationCode} className="hover:bg-white dark:bg-slate-900 transition">
                                <td className="py-1.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                                  {st.stationName} ({st.stationCode})
                                </td>
                                <td className="py-1.5 px-3 font-mono text-slate-700">
                                  {st.schedArrival}
                                </td>
                                <td className="py-1.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                                  {st.schedDeparture}
                                </td>
                                <td className="py-1.5 px-3 text-slate-600">
                                  {st.haltMin > 0 ? `${st.haltMin} min` : '--'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
