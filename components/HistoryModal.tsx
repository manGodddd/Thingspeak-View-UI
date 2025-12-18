import React, { useState, useEffect, useMemo } from 'react';
import { ThingSpeakResponse, WidgetConfig } from '../types';
import { fetchHistoryData } from '../services/thingspeak';
import { X, Calendar, ArrowDown, ArrowUp, Loader2, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelId: string;
  readApiKey: string;
  widgets: WidgetConfig[]; // To get field labels
}

interface DailyStats {
  fieldKey: string;
  label: string;
  min: number | null;
  max: number | null;
  avg: number | null;
  unit: string;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ 
  isOpen, onClose, channelId, readApiKey, widgets 
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [showIgnored, setShowIgnored] = useState(false);

  // Helper to determine if a field should be hidden (Water/Level)
  const isIgnoredField = (label: string) => {
    const l = label.toLowerCase();
    return l.includes('water') || l.includes('level');
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data: ThingSpeakResponse = await fetchHistoryData(channelId, new Date(selectedDate), readApiKey);
      
      const newStats: DailyStats[] = [];

      widgets.forEach(widget => {
        // Collect all valid numerical values for this field
        const values = data.feeds
          .map(f => f[widget.fieldKey])
          .filter(v => v !== null && v !== undefined && v !== '')
          .map(v => Number(v))
          .filter(n => !isNaN(n));

        if (values.length > 0) {
          const min = Math.min(...values);
          const max = Math.max(...values);
          const sum = values.reduce((a, b) => a + b, 0);
          const avg = sum / values.length;

          newStats.push({
            fieldKey: widget.fieldKey as string,
            label: widget.label,
            min,
            max,
            avg: parseFloat(avg.toFixed(2)),
            unit: widget.unit
          });
        } else {
           // No data for this field on this day
           newStats.push({
            fieldKey: widget.fieldKey as string,
            label: widget.label,
            min: null,
            max: null,
            avg: null,
            unit: widget.unit
           });
        }
      });

      setStats(newStats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, selectedDate]);

  if (!isOpen) return null;

  const displayedStats = stats.filter(s => showIgnored || !isIgnoredField(s.label));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-surface border border-slate-700 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-slate-700 bg-surfaceHighlight/50 gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/20 rounded-lg text-primary">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">History Analysis</h2>
              <p className="text-xs text-slate-400">Daily Min/Max Statistics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
            />
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-background/50">
          
          {/* Controls */}
          <div className="flex justify-end mb-4">
            <button 
              onClick={() => setShowIgnored(!showIgnored)}
              className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-full border transition-all ${showIgnored ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'}`}
            >
              <Filter className="w-3 h-3" />
              {showIgnored ? 'Hiding Water/Level' : 'Show All Sensors'}
            </button>
          </div>

          {loading ? (
             <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-3">
               <Loader2 className="w-8 h-8 animate-spin text-primary" />
               <p>Fetching historical data...</p>
             </div>
          ) : displayedStats.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500">
               <p>No data found for this date.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedStats.map((stat) => (
                <div key={stat.fieldKey} className="bg-surface border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                     <h3 className="font-medium text-slate-200">{stat.label}</h3>
                     {stat.avg !== null && (
                       <span className="text-xs font-mono bg-slate-800 text-slate-400 px-2 py-1 rounded">Avg: {stat.avg}</span>
                     )}
                  </div>

                  {stat.min !== null ? (
                    <div className="grid grid-cols-2 gap-4">
                      {/* Lowest */}
                      <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50">
                        <div className="flex items-center gap-1.5 text-xs text-sky-400 mb-1 uppercase tracking-wider font-semibold">
                          <ArrowDown className="w-3 h-3" />
                          Lowest
                        </div>
                        <div className="text-2xl font-bold text-white font-mono">
                          {stat.min}
                        </div>
                      </div>

                      {/* Highest */}
                      <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50">
                        <div className="flex items-center gap-1.5 text-xs text-rose-400 mb-1 uppercase tracking-wider font-semibold">
                          <ArrowUp className="w-3 h-3" />
                          Highest
                        </div>
                        <div className="text-2xl font-bold text-white font-mono">
                          {stat.max}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-sm text-slate-500 italic">
                      No readings available
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};