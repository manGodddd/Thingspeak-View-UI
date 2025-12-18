import React, { useState } from 'react';
import { AppConfig } from '../types';
import { Settings, Check, X } from 'lucide-react';

interface ConfigPanelProps {
  currentConfig: AppConfig;
  onSave: (config: AppConfig) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ currentConfig, onSave, isOpen, onClose }) => {
  const [formData, setFormData] = useState<AppConfig>(currentConfig);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-surface border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-surfaceHighlight/50">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Configuration
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">ThingSpeak Channel ID</label>
            <input 
              type="text" 
              required
              value={formData.channelId}
              onChange={(e) => setFormData({...formData, channelId: e.target.value})}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-600"
              placeholder="e.g. 123456"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Read API Key <span className="text-slate-600 normal-case">(Optional for Public Channels)</span>
            </label>
            <input 
              type="text" 
              value={formData.readApiKey}
              onChange={(e) => setFormData({...formData, readApiKey: e.target.value})}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-600"
              placeholder="e.g. A1B2C3D4E5"
            />
          </div>

          <div className="space-y-2">
             <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Auto-Refresh Rate (seconds)</label>
             <input 
              type="number"
              min="15"
              max="3600" 
              value={formData.refreshRate}
              onChange={(e) => setFormData({...formData, refreshRate: parseInt(e.target.value) || 15})}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-primary hover:bg-indigo-600 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            <Check className="w-4 h-4" />
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};