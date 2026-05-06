import { useState, useEffect } from 'react';
import { TrendingUp, Search, Target, Zap, Calendar, CreditCard } from 'lucide-react';
import DataLayer from './DataLayer';
import DecisionLayer from './DecisionLayer';
import ExecutionLayer from './ExecutionLayer';
import OptimizationLayer from './OptimizationLayer';
import { BRAND_CONFIG, LAYER_CONFIG, UI_TEXT } from '../data/config';

export default function Dashboard() {
  const [activeLayer, setActiveLayer] = useState('data');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga inicial
    setTimeout(() => setLoading(false), 800);

    // Actualizar timestamp cada minuto
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const iconMap = {
    Search,
    Target,
    Zap,
    TrendingUp,
  };

  const layers = [
    {
      id: 'data',
      name: LAYER_CONFIG.data.name,
      icon: iconMap[LAYER_CONFIG.data.icon],
      description: LAYER_CONFIG.data.description,
      color: 'bg-fitzone-purple'
    },
    {
      id: 'decision',
      name: LAYER_CONFIG.decision.name,
      icon: iconMap[LAYER_CONFIG.decision.icon],
      description: LAYER_CONFIG.decision.description,
      color: 'bg-fitzone-cyan'
    },
    {
      id: 'execution',
      name: LAYER_CONFIG.execution.name,
      icon: iconMap[LAYER_CONFIG.execution.icon],
      description: LAYER_CONFIG.execution.description,
      color: 'bg-fitzone-emerald'
    },
    {
      id: 'optimization',
      name: LAYER_CONFIG.optimization.name,
      icon: iconMap[LAYER_CONFIG.optimization.icon],
      description: LAYER_CONFIG.optimization.description,
      color: 'bg-fitzone-amber'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-fitzone-charcoal flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-fitzone-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">{UI_TEXT.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fitzone-charcoal">
      {/* Header */}
      <header className="bg-fitzone-slate text-white shadow-lg border-b border-fitzone-purple/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-fitzone-purple rounded-xl flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold truncate">{BRAND_CONFIG.name}</h1>
                <p className="text-fitzone-lightPurple text-xs sm:text-sm mt-1 font-medium">
                  {BRAND_CONFIG.tagline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-auto">
              <div className="text-right">
                <p className="text-xs text-fitzone-textGray flex items-center justify-end gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{UI_TEXT.lastUpdate}</span>
                  <span className="sm:hidden">Actualizado</span>
                </p>
                <p className="text-xs sm:text-sm font-medium text-white whitespace-nowrap">
                  {lastUpdate.toLocaleString('es-PE', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="w-10 h-10 bg-fitzone-purple/20 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0 hover:bg-fitzone-purple/30 transition-colors">
                <Zap className="w-5 h-5 text-fitzone-purple" fill="currentColor" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Layer Navigation */}
      <div className="bg-fitzone-darkSlate border-b border-fitzone-purple/10 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3 overflow-x-auto py-4 scrollbar-hide">
            {layers.map((layer) => {
              const Icon = layer.icon;
              const isActive = activeLayer === layer.id;

              return (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`
                    flex-shrink-0 flex items-center gap-3 px-5 py-3.5 rounded-xl font-medium transition-all duration-300
                    ${isActive
                      ? `${layer.color} text-white shadow-lg`
                      : 'bg-fitzone-charcoal text-fitzone-textGray hover:bg-fitzone-slate hover:text-white border border-fitzone-slate hover:border-fitzone-purple/30'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? '' : 'opacity-70'}`} />
                  <div className="text-left min-w-0">
                    <p className="text-xs font-semibold whitespace-nowrap">{layer.name}</p>
                    <p className={`text-[10px] whitespace-nowrap ${isActive ? 'text-white/80' : 'text-fitzone-textGray'}`}>
                      {layer.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fadeIn">
          {activeLayer === 'data' && <DataLayer />}
          {activeLayer === 'decision' && <DecisionLayer />}
          {activeLayer === 'execution' && <ExecutionLayer />}
          {activeLayer === 'optimization' && <OptimizationLayer />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-fitzone-darkSlate border-t border-fitzone-slate mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <p className="text-xs sm:text-sm text-center sm:text-left text-fitzone-textGray">
              {UI_TEXT.footer.copyright}
            </p>
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="flex items-center gap-2 text-xs sm:text-sm text-fitzone-textGray">
                <div className="w-2 h-2 bg-fitzone-emerald rounded-full animate-pulse"></div>
                {UI_TEXT.systemActive}
              </span>
              <span className="text-fitzone-purple font-semibold text-xs sm:text-sm">{UI_TEXT.footer.version}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
