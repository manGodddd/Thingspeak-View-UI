import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { ConfigPanel } from './components/ConfigPanel';
import { AppConfig } from './types';
import { Settings, Cpu, Github, Smartphone, Download } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'novaspeak_config';

const DEFAULT_CONFIG: AppConfig = {
  channelId: '',
  readApiKey: '',
  refreshRate: 15
};

export default function App() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    // Load config
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved config");
      }
    }
    setHasInitialized(true);

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleSaveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newConfig));
  };

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  if (!hasInitialized) return null;

  return (
    <div className="min-h-screen bg-background text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-surface/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-violet-600 p-2 rounded-lg shadow-lg shadow-primary/20">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                NovaSpeak
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {installPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-500/20 animate-in fade-in zoom-in"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Install App</span>
                </button>
              )}

              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer"
                className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
                <span>Source</span>
              </a>
              <div className="h-6 w-px bg-slate-800 hidden md:block"></div>
              <button 
                onClick={() => setIsConfigOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surfaceHighlight hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700 hover:border-slate-600"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Config</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard config={config} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 mt-12 py-8">
         <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
           <p>© 2025 NovaSpeak Analytics. Powered by Gemini & React.</p>
         </div>
      </footer>

      <ConfigPanel 
        currentConfig={config} 
        onSave={handleSaveConfig} 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
      />
    </div>
  );
}