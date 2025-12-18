import React from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { ThingSpeakFeed, WidgetConfig } from '../types';
import { format } from 'date-fns';

interface ChartWidgetProps {
  data: ThingSpeakFeed[];
  config: WidgetConfig;
}

const formatTime = (timeStr: string) => {
  try {
    return format(new Date(timeStr), 'HH:mm');
  } catch (e) {
    return timeStr;
  }
};

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surfaceHighlight border border-slate-700 p-2 rounded shadow-xl text-xs">
        <p className="text-slate-400 mb-1">{format(new Date(label), 'MMM d, HH:mm:ss')}</p>
        <p className="text-slate-100 font-semibold">
          {payload[0].value} {unit}
        </p>
      </div>
    );
  }
  return null;
};

export const ChartWidget: React.FC<ChartWidgetProps> = ({ data, config }) => {
  const chartHeight = 200;

  // Filter out null/undefined values for cleaner charts
  const cleanData = data.filter(d => d[config.fieldKey] !== null && d[config.fieldKey] !== undefined);

  if (cleanData.length === 0) {
    return <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">No Data Available</div>;
  }

  const commonProps = {
    data: cleanData,
    margin: { top: 10, right: 10, left: -20, bottom: 0 },
  };

  const renderChart = () => {
    switch (config.type) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={`color${config.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={config.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="created_at" 
              tickFormatter={formatTime} 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip unit={config.unit} />} cursor={{ stroke: '#475569' }} />
            <Area 
              type="monotone" 
              dataKey={config.fieldKey} 
              stroke={config.color} 
              fillOpacity={1} 
              fill={`url(#color${config.id})`} 
              strokeWidth={2}
              animationDuration={1000}
            />
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="created_at" 
              tickFormatter={formatTime} 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip unit={config.unit} />} cursor={{ fill: '#334155', opacity: 0.4 }} />
            <Bar dataKey={config.fieldKey} fill={config.color} radius={[4, 4, 0, 0]} animationDuration={1000} />
          </BarChart>
        );
      case 'line':
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="created_at" 
              tickFormatter={formatTime} 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip unit={config.unit} />} cursor={{ stroke: '#475569' }} />
            <Line 
              type="monotone" 
              dataKey={config.fieldKey} 
              stroke={config.color} 
              strokeWidth={2} 
              dot={false}
              activeDot={{ r: 4, fill: '#fff' }}
              animationDuration={1000}
            />
          </LineChart>
        );
    }
  };

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      {renderChart()}
    </ResponsiveContainer>
  );
};

export const StatWidget: React.FC<ChartWidgetProps> = ({ data, config }) => {
  const latest = data[data.length - 1];
  const value = latest ? latest[config.fieldKey] : '--';
  
  // Calculate trend
  let trend: 'up' | 'down' | 'neutral' = 'neutral';
  if (data.length >= 2) {
    const prev = Number(data[data.length - 2][config.fieldKey]);
    const curr = Number(value);
    if (!isNaN(prev) && !isNaN(curr)) {
      if (curr > prev) trend = 'up';
      else if (curr < prev) trend = 'down';
    }
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <div className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-100" style={{ color: config.color }}>
        {value}
      </div>
      <div className="text-slate-400 text-sm mt-2 font-medium uppercase tracking-widest">{config.unit}</div>
      <div className="mt-4 flex items-center space-x-2 text-xs text-slate-500 bg-surfaceHighlight px-3 py-1 rounded-full">
         <span>Last updated: {latest ? format(new Date(latest.created_at), 'HH:mm:ss') : '--'}</span>
         {trend === 'up' && <span className="text-emerald-400">↑</span>}
         {trend === 'down' && <span className="text-rose-400">↓</span>}
      </div>
    </div>
  );
};