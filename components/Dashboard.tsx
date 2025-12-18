import React, { useState, useEffect, useCallback } from 'react';
import { ThingSpeakResponse, AppConfig, WidgetConfig } from '../types';
import { fetchChannelData } from '../services/thingspeak';
import { ChartWidget, StatWidget } from './Widgets';
import { LayoutGrid, RefreshCw, BarChart3, Activity, Sparkles, Loader2, Calendar } from 'lucide-react';
import { analyzeData } from '../services/gemini';
import { HistoryModal } from './HistoryModal';

interface DashboardProps {
  config: AppConfig;
}

const DEFAULT_COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f43f5e', // Rose
  '#eab308', // Yellow
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#ec4899', // Pink
];

export const Dashboard: React.FC<DashboardProps> = ({ config }) => {
  const [data, setData] = useState<ThingSpeakResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  
  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);

  // History Modal State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Initialize Widgets based on channel metadata
  const initializeWidgets = useCallback((channelData: ThingSpeakResponse) => {
    const newWidgets: WidgetConfig[] = [];
    let colorIndex = 0;

    // Check fields 1-8
    for (let i = 1; i <= 8; i++) {
      const fieldKey = `field${i}` as keyof typeof channelData.channel;
      const fieldName = channelData.channel[fieldKey];
      
      if (fieldName) {
        newWidgets.push({
          id: `w-${i}`,
          fieldKey: `field${i}` as any,
          label: fieldName as string,
          type: i === 1 ? 'area' : 'line', // Default first to area, rest line
          color: DEFAULT_COLORS[colorIndex % DEFAULT_COLORS.length],
          unit: '', // Units are hard to guess from raw data, left empty for user
          visible: true
        });
        colorIndex++;
      }
    }
    setWidgets(newWidgets);
  }, []);

  const loadData = useCallback(async (isInitial: boolean = false) => {
    if (!config.channelId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetchChannelData(config.channelId, config.readApiKey);
      setData(response);
      setLastRefreshed(new Date());

      if (isInitial) {
        initializeWidgets(response);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [config.channelId, config.readApiKey, initializeWidgets]);

  // Initial Load
  useEffect(() => {
    loadData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.channelId]);

  // Interval Refresh
  useEffect(() => {
    if (!config.channelId) return;
    
    const interval = setInterval(() => {
      loadData(false);
    }, config.refreshRate * 1000);

    return () => clearInterval(interval);
  }, [config.refreshRate, loadData, config.channelId]);

  const handleManualRefresh = () => {
    loadData(false);
  };

  const handleGenerateInsight = async () => {
    if (!data) return;
    setAiLoading(true);
    const activeFields = widgets.filter(w => w.visible).map(w => w.fieldKey as string);
    const result = await analyzeData(data, activeFields);
    setAiAnalysis(result);
    setAiLoading(false);
  };

  const toggleWidgetType = (id: string) => {
    setWidgets(prev => prev.map(w => {
      if (w.id === id) {
        const types: WidgetConfig['type'][] = ['line', 'area', 'bar', 'stat'];
        const nextIndex = (types.indexOf(w.type) + 1) % types.length;
        return { ...w, type: types[nextIndex] };
      }
      return w;
    }));
  };

  if (!config.channelId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <LayoutGrid className="w-16 h-16 text-slate-700 mb-4" />
        <h2 className="text-2xl font-bold text-slate-300">No Channel Configured</h2>
        <p className="text-slate-500 mt-2 max-w-md">
          Please click the settings icon in the top right to configure your ThingSpeak Channel ID.
        </p>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
          <Activity className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-red-500">Connection Error</h2>
        <p className="text-slate-500 mt-2 max-w-md">{error}</p>
        <button 
          onClick={handleManualRefresh}
          className="mt-6 px-4 py-2 bg-surfaceHighlight hover:bg-slate-700 rounded-lg text-white transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{data?.channel.name || 'Dashboard'}</h1>
          <p className="text-slate-400 mt-1 max-w-2xl text-sm leading-relaxed">
            {data?.channel.description || 'ThingSpeak Sensor Data'}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Updates ({config.refreshRate}s)
            <span className="text-slate-700 mx-1">|</span>
            Last Sync: {lastRefreshed.toLocaleTimeString()}
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-surfaceHighlight hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all text-sm font-medium border border-slate-700 hover:border-slate-600"
          >
            <Calendar className="w-4 h-4" />
            History
          </button>
           <button 
            onClick={handleGenerateInsight}
            disabled={aiLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 text-sm font-medium"
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            AI Insight
          </button>
          <button 
            onClick={handleManualRefresh}
            className="p-2 bg-surfaceHighlight hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* AI Insight Panel */}
      {aiAnalysis && (
        <div className="bg-gradient-to-br from-indigo-900/30 to-violet-900/30 border border-indigo-500/30 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-indigo-100">AI Analysis</h3>
              <div className="prose prose-invert prose-sm max-w-none text-indigo-200/80 leading-relaxed">
                {aiAnalysis}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {widgets.map((widget) => {
          // Calculate latest value for display in the header
          const latestFeed = data?.feeds && data.feeds.length > 0 ? data.feeds[data.feeds.length - 1] : null;
          const latestValue = latestFeed ? latestFeed[widget.fieldKey] : null;

          return (
            widget.visible && (
              <div 
                key={widget.id} 
                className="group bg-surface/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all duration-300 shadow-lg shadow-black/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full" style={{ backgroundColor: widget.color }}></div>
                    <h3 className="font-medium text-slate-200">{widget.label}</h3>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Show current value here if it is NOT a stat widget (which shows it in the body) */}
                    {widget.type !== 'stat' && latestValue != null && (
                       <span 
                         className="text-2xl font-bold tracking-tight font-mono animate-in fade-in zoom-in duration-300" 
                         style={{ color: widget.color }}
                       >
                         {latestValue}
                       </span>
                    )}

                    <button 
                      onClick={() => toggleWidgetType(widget.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-800 rounded-md text-slate-500 hover:text-slate-300"
                      title="Change Visualization"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="min-h-[200px]">
                  {widget.type === 'stat' ? (
                    <StatWidget data={data?.feeds || []} config={widget} />
                  ) : (
                    <ChartWidget data={data?.feeds || []} config={widget} />
                  )}
                </div>
              </div>
            )
          );
        })}
      </div>
      
      {/* History Modal */}
      <HistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)}
        channelId={config.channelId}
        readApiKey={config.readApiKey}
        widgets={widgets}
      />
    </div>
  );
};