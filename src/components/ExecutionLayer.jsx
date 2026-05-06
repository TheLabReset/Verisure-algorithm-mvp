import { useState } from 'react';
import { DollarSign, TrendingUp, Target, Zap, Calendar, PlayCircle, AlertTriangle, Store, ChevronDown, ChevronUp, MessageCircle, Rocket, CheckCircle, ArrowRight, AlertCircle, FileText, Globe, Star, Lightbulb, CalendarDays } from 'lucide-react';
import { BUDGET_ALLOCATION, SERVICIOS_PERFORMANCE, SEDES_PERFORMANCE } from '../data/mockData';
import { LAYER_CONFIG } from '../data/config';
import { formatMoney } from '../utils/format';

export default function ExecutionLayer() {
  // Helper function to get monthly period (1st to today)
  const getMonthlyPeriod = () => {
    const now = new Date();
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `1-${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  };

  const monthlyPeriod = getMonthlyPeriod();

  const [showAllServicios, setShowAllServicios] = useState(false);

  const getStatusColor = (status) => {
    if (status === 'overperforming') return { bg: 'bg-fitzone-emerald/10', border: 'border-fitzone-emerald/30', text: 'text-fitzone-emerald', badge: 'bg-fitzone-emerald/20' };
    if (status === 'performing') return { bg: 'bg-fitzone-cyan/10', border: 'border-fitzone-cyan/30', text: 'text-fitzone-cyan', badge: 'bg-fitzone-cyan/20' };
    if (status === 'ontrack') return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-500/20' };
    return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-500/20' };
  };

  const getStatusIcon = (status) => {
    if (status === 'overperforming') return <Rocket className="w-2.5 h-2.5 sm:w-3 sm:h-3" />;
    if (status === 'performing') return <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />;
    if (status === 'ontrack') return <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />;
    return <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />;
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="bg-fitzone-slate rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 lg:p-6 border border-fitzone-purple/10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">
              {LAYER_CONFIG.execution.name}
            </h2>
            <p className="text-xs sm:text-sm text-fitzone-textGray">
              {LAYER_CONFIG.execution.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-fitzone-emerald/20 text-fitzone-emerald px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
              <CalendarDays className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">{monthlyPeriod}</span>
            </div>
            <span className="px-2 sm:px-3 py-1 bg-fitzone-emerald text-fitzone-charcoal rounded-full text-xs sm:text-sm font-medium flex items-center gap-1">
              <PlayCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              Live
            </span>
          </div>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="bg-fitzone-purple text-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <DollarSign className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold">Presupuesto Mensual Powerpay</h3>
              <p className="text-white/90 mt-0.5 sm:mt-1 text-xs sm:text-sm">Distribución inteligente por canal digital</p>
            </div>
          </div>

          <div className="text-left sm:text-center lg:text-right">
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span className="text-base sm:text-lg lg:text-xl text-white/80">$</span>
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold">{(BUDGET_ALLOCATION.total_budget / 1000).toFixed(0)}K</span>
            </div>
            <p className="text-white/80 mt-1 sm:mt-2 text-xs sm:text-sm">Total presupuesto mensual</p>
          </div>
        </div>

        {/* Budget Progress */}
        <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm font-medium">Ejecución del mes</span>
            <span className="text-lg sm:text-xl font-bold">
              ${(Object.values(BUDGET_ALLOCATION.distribution).reduce((sum, ch) => sum + ch.amount, 0)).toLocaleString()}
            </span>
          </div>
          <div className="w-full h-2 sm:h-3 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: '100%' }}></div>
          </div>
          <p className="text-xs text-white/70 mt-1.5 sm:mt-2">100% del presupuesto asignado</p>
        </div>
      </div>

      {/* Budget Allocation by Channel */}
      <div className="bg-fitzone-slate rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 lg:p-6 border border-fitzone-purple/10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-fitzone-cyan rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">Distribución por Canal Digital</h3>
            <p className="text-xs sm:text-sm text-fitzone-textGray">Performance y asignación para adquisición de cuentas Powerpay</p>
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4">
          {Object.entries(BUDGET_ALLOCATION.distribution).map(([key, channel]) => {
            const colors = getStatusColor(channel.status);
            return (
              <div key={key} className={`p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl border-2 ${colors.bg} ${colors.border}`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <h4 className="font-bold text-white text-sm sm:text-base">
                        {key === 'meta_ads' ? 'Meta Ads (FB + IG)' :
                         key === 'google_search' ? 'Google Search' :
                         key === 'google_display' ? 'Google Display' :
                         key === 'youtube' ? 'YouTube (Demand Gen)' : key}
                      </h4>
                      <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 ${colors.badge} ${colors.text}`}>
                        {getStatusIcon(channel.status)} {channel.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-fitzone-textGray mb-2 sm:mb-3">
                      <strong>KPI Principal:</strong> {channel.kpi}
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                      <div>
                        <p className="text-fitzone-textGray">Target</p>
                        <p className="font-semibold text-white">{channel.target}</p>
                      </div>
                      <div>
                        <p className="text-fitzone-textGray">Performance Actual</p>
                        <p className={`font-semibold ${colors.text}`}>{channel.current_performance}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-center lg:text-right lg:min-w-[180px] pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10 lg:border-none">
                    <div className="flex lg:flex-col items-center lg:items-end gap-2 lg:gap-0">
                      <div className="lg:mb-2">
                        <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{channel.percentage}%</span>
                      </div>
                      <div className="text-base sm:text-lg lg:text-xl font-bold text-fitzone-purple lg:mb-1">
                        ${channel.amount.toLocaleString()}
                      </div>
                    </div>
                    <p className="text-[10px] sm:text-xs text-fitzone-textGray hidden lg:block">del presupuesto total</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 sm:mt-4">
                  <div className="w-full h-1.5 sm:h-2 bg-fitzone-charcoal rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        channel.status === 'overperforming' ? 'bg-fitzone-emerald' :
                        channel.status === 'performing' ? 'bg-fitzone-cyan' :
                        channel.status === 'ontrack' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${channel.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Optimization Recommendations */}
      <div className="bg-fitzone-slate rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 lg:p-6 border border-fitzone-purple/10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-fitzone-amber rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">Recomendaciones de Optimización</h3>
            <p className="text-xs sm:text-sm text-fitzone-textGray">Ajustes sugeridos basados en performance</p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {BUDGET_ALLOCATION.recommendations.map((rec, idx) => (
            <div key={idx} className={`p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl border-2 ${
              rec.type === 'increase' ? 'bg-fitzone-emerald/10 border-fitzone-emerald/30' :
              rec.type === 'decrease' ? 'bg-red-500/10 border-red-500/30' :
              'bg-fitzone-cyan/10 border-fitzone-cyan/30'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                    rec.type === 'increase' ? 'bg-fitzone-emerald/30 text-fitzone-emerald' :
                    rec.type === 'decrease' ? 'bg-red-500/30 text-red-400' :
                    'bg-fitzone-cyan/30 text-fitzone-cyan'
                  }`}>
                    {rec.type === 'increase' ? 'Subida sugerida' :
                     rec.type === 'decrease' ? 'Bajada sugerida' : 'Sin cambios'}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-white uppercase">
                    {rec.channel === 'meta_ads' ? 'Meta Ads' :
                     rec.channel === 'google_search' ? 'Google Search' :
                     rec.channel === 'google_display' ? 'Google Display' :
                     rec.channel === 'youtube' ? 'YouTube' : rec.channel}
                  </span>
                </div>
                {rec.from && rec.to && (
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] sm:text-xs text-fitzone-textGray">Cambio</span>
                    <p className="font-bold text-white text-sm sm:text-base">{rec.from}% → {rec.to}%</p>
                  </div>
                )}
              </div>

              <p className="text-white font-medium text-xs sm:text-sm lg:text-base mb-2">{rec.reason}</p>
              {rec.impact && (
                <p className="text-xs sm:text-sm text-fitzone-emerald font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  Impacto: {rec.impact}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Servicios Performance */}
      <div className="bg-fitzone-slate rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 lg:p-6 border border-fitzone-purple/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-fitzone-purple rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <Store className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Performance por Categoría</h3>
              <p className="text-xs sm:text-sm text-fitzone-textGray">Rendimiento de campaña por categoría de comercio</p>
            </div>
          </div>
          <button
            onClick={() => setShowAllServicios(!showAllServicios)}
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-fitzone-purple text-white rounded-lg hover:bg-fitzone-darkPurple transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto"
          >
            {showAllServicios ? (
              <>
                <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                Mostrar top 4
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                Mostrar todos ({SERVICIOS_PERFORMANCE.length})
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {SERVICIOS_PERFORMANCE
            .slice(0, showAllServicios ? SERVICIOS_PERFORMANCE.length : 4)
            .map((servicio, idx) => {
            return (
              <div key={servicio.id} className={`p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl border-2 ${
                idx < 2 ? 'bg-fitzone-purple/5 border-fitzone-purple/30' : 'bg-fitzone-charcoal border-fitzone-slate'
              }`}>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h4 className="font-bold text-white text-sm sm:text-base">{servicio.nombre}</h4>
                  {idx < 2 && (
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-fitzone-purple/20 text-fitzone-lightPurple flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Destacado
                    </span>
                  )}
                </div>

                <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-fitzone-textGray">Leads</span>
                    <span className="font-semibold text-white">{servicio.leads}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-fitzone-textGray">Conversiones</span>
                    <span className="font-semibold text-fitzone-emerald">{servicio.conversiones}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-fitzone-textGray">CPL</span>
                    <span className="font-semibold text-fitzone-purple">{formatMoney(servicio.cpl)}</span>
                  </div>
                </div>

                {/* Lead Ads Metrics */}
                <div className="pt-2 sm:pt-3 border-t border-fitzone-slate mb-2 sm:mb-3">
                  <p className="text-[10px] sm:text-xs font-semibold text-fitzone-textGray mb-1.5 sm:mb-2 flex items-center gap-1">
                    <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Lead Ads (Meta)
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                    <div>
                      <p className="text-fitzone-textGray">Formularios</p>
                      <p className="font-semibold text-white">{servicio.leadAds.formularios}</p>
                    </div>
                    <div>
                      <p className="text-fitzone-textGray">Conv. Rate</p>
                      <p className="font-semibold text-fitzone-emerald">{servicio.leadAds.conversion_rate}%</p>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Metrics */}
                <div className="pt-2 sm:pt-3 border-t border-fitzone-slate">
                  <p className="text-[10px] sm:text-xs font-semibold text-fitzone-textGray mb-1.5 sm:mb-2 flex items-center gap-1">
                    <MessageCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-fitzone-emerald" />
                    WhatsApp
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                    <div>
                      <p className="text-fitzone-textGray">Conversaciones</p>
                      <p className="font-semibold text-white">{servicio.whatsapp.conversaciones}</p>
                    </div>
                    <div>
                      <p className="text-fitzone-textGray">Tasa Respuesta</p>
                      <p className="font-semibold text-fitzone-emerald">{servicio.whatsapp.tasa_respuesta}%</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timing Recommendations */}
      <div className="bg-fitzone-cyan text-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Calendar className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
          <h3 className="text-base sm:text-lg font-bold">Timing Óptimo de Campaña</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5">
            <h4 className="font-bold text-sm sm:text-base mb-2 sm:mb-3">Mejores horarios del día</h4>
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                <span className="text-white/90 text-xs sm:text-sm">7:00 - 10:00 AM (camino al trabajo)</span>
                <span className="px-2 py-0.5 sm:py-1 bg-white/20 rounded text-xs sm:text-sm font-bold w-fit">+0%</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                <span className="text-white/90 text-xs sm:text-sm">12:00 - 2:00 PM (almuerzo)</span>
                <span className="px-2 py-0.5 sm:py-1 bg-white/20 rounded text-xs sm:text-sm font-bold w-fit">+30%</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                <span className="text-white/90 text-xs sm:text-sm">6:00 - 10:00 PM (tarde-noche)</span>
                <span className="px-2 py-0.5 sm:py-1 bg-fitzone-emerald/30 rounded text-xs sm:text-sm font-bold w-fit">+60%</span>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-white/70 mt-2 sm:mt-3">Pico máximo: 6-10 PM, momento de compra reflexiva</p>
          </div>

          <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5">
            <h4 className="font-bold text-sm sm:text-base mb-2 sm:mb-3">Mejores días de la semana</h4>
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                <span className="text-white/90 text-xs sm:text-sm">Jueves</span>
                <span className="px-2 py-0.5 sm:py-1 bg-fitzone-emerald/30 rounded text-xs sm:text-sm font-bold w-fit">Muy Alta</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                <span className="text-white/90 text-xs sm:text-sm">Viernes</span>
                <span className="px-2 py-0.5 sm:py-1 bg-fitzone-emerald/30 rounded text-xs sm:text-sm font-bold w-fit">Muy Alta</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                <span className="text-white/90 text-xs sm:text-sm">Sábado</span>
                <span className="px-2 py-0.5 sm:py-1 bg-white/20 rounded text-xs sm:text-sm font-bold w-fit">Alta</span>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-white/70 mt-2 sm:mt-3">Pago de quincena impulsa el cierre</p>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white/20 rounded-lg sm:rounded-xl">
          <p className="text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
            <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4" /> Estacionalidad Powerpay:
          </p>
          <p className="text-xs sm:text-sm">Cyber Wow Julio (Fiestas Patrias), Cyber Wow Noviembre y Black Friday concentran los picos más fuertes. Día de la Madre (mayo), Cyber Days (marzo) y Navidad (diciembre) son ventanas secundarias relevantes para escalar inversión.</p>
        </div>
      </div>
    </div>
  );
}
