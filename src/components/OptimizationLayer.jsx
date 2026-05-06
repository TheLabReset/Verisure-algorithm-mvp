import { TrendingUp, BarChart3, RefreshCw, Award, Target, Users, Heart, Zap, AlertCircle, CreditCard, Bell, Globe, FileText, CheckCircle, Lightbulb, Activity, UserPlus, Calendar, Store } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PERFORMANCE_KPIS, ALERTS, COMPETITOR_INSIGHTS, CRM_MOCKUP } from '../data/mockData';
import { LAYER_CONFIG, CRM_CONFIG } from '../data/config';
import { formatES, formatThousands, formatMoney, formatPercent, formatCompact } from '../utils/format';

export default function OptimizationLayer() {
  // Helper function to get monthly period (1st to today)
  const getMonthlyPeriod = () => {
    const now = new Date();
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `1-${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  };

  const monthlyPeriod = getMonthlyPeriod();

  // Performance últimos 7 días - Powerpay BNPL
  const performanceData = [
    { date: '30 Abr', leads: 42, reach: 56000, engagement: 2200, spent: 480 },
    { date: '01 May', leads: 52, reach: 62000, engagement: 2680, spent: 510 },
    { date: '02 May', leads: 46, reach: 58000, engagement: 2480, spent: 495 },
    { date: '03 May', leads: 58, reach: 65000, engagement: 2950, spent: 525 },
    { date: '04 May', leads: 54, reach: 63000, engagement: 2820, spent: 515 },
    { date: '05 May', leads: 62, reach: 68000, engagement: 3150, spent: 540 },
    { date: '06 May', leads: 48, reach: 60000, engagement: 2520, spent: 500 }
  ];

  // Channel performance distribution - Powerpay (sin TikTok / sin influencers)
  const channelData = [
    { name: 'Meta Ads', value: 60, leads: 870, color: '#7B2CBF' },
    { name: 'Google Search', value: 27, leads: 391, color: '#06B6D4' },
    { name: 'Google Display', value: 8, leads: 116, color: '#F4B842' },
    { name: 'YouTube', value: 5, leads: 73, color: '#EF4444' }
  ];

  // Funnel de conversión Powerpay - Journey del usuario
  const funnelSteps = [
    { stage: 'Alcance', value: 1800000, conversionRate: 1.5, IconComponent: Users, bgColor: 'bg-fitzone-purple' },
    { stage: 'Visitas Web', value: 27000, conversionRate: 68.5, IconComponent: Globe, bgColor: 'bg-fitzone-darkPurple' },
    { stage: 'Visitas a Tiendas', value: 18500, conversionRate: 7.8, IconComponent: Store, bgColor: 'bg-fitzone-cyan' },
    { stage: 'Registros Iniciados', value: 1450, conversionRate: 72.4, IconComponent: Activity, bgColor: 'bg-fitzone-emerald' },
    { stage: 'Cuentas Creadas', value: 1050, conversionRate: null, IconComponent: CheckCircle, bgColor: 'bg-green-500' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="bg-fitzone-slate rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 border border-fitzone-purple/20">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">
              {LAYER_CONFIG.optimization.name}
            </h2>
            <p className="text-xs sm:text-sm text-fitzone-textGray">
              {LAYER_CONFIG.optimization.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-fitzone-amber/20 text-fitzone-amber px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">{monthlyPeriod}</span>
            </div>
            <span className="px-2 sm:px-3 py-1 bg-fitzone-purple text-white rounded-full text-xs sm:text-sm font-medium flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Auto-optimización activa</span>
              <span className="sm:hidden">Activa</span>
            </span>
          </div>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {/* Nuevos Miembros */}
        <div className="bg-fitzone-purple text-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <UserPlus className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
            <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold ${
              PERFORMANCE_KPIS.leads.trend_value > 0 ? 'bg-fitzone-emerald text-fitzone-charcoal' : 'bg-red-400'
            }`}>
              {PERFORMANCE_KPIS.leads.trend}
            </span>
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-white/80 mb-0.5 sm:mb-1">Cuentas Creadas</h3>
          <p className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{formatThousands(PERFORMANCE_KPIS.nuevos_miembros.current)}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xs sm:text-sm text-white/70">{formatThousands(PERFORMANCE_KPIS.leads.total)} registros iniciados</span>
          </div>
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/20">
            <div className="flex justify-between text-xs">
              <span className="text-white/70">CPL Promedio</span>
              <span className="font-bold">{formatMoney(PERFORMANCE_KPIS.leads.cost_per_lead)}</span>
            </div>
          </div>
        </div>

        {/* Alcance */}
        <div className="bg-fitzone-cyan text-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
            <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold ${
              PERFORMANCE_KPIS.reach.trend_value > 0 ? 'bg-fitzone-emerald text-fitzone-charcoal' : 'bg-red-400'
            }`}>
              {PERFORMANCE_KPIS.reach.trend}
            </span>
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-white/80 mb-0.5 sm:mb-1">Alcance Único</h3>
          <p className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{formatCompact(PERFORMANCE_KPIS.reach.unique_reach)}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xs sm:text-sm text-white/70">Impresiones: {formatCompact(PERFORMANCE_KPIS.reach.impressions)}</span>
          </div>
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/20">
            <div className="flex justify-between text-xs">
              <span className="text-white/70">Frecuencia</span>
              <span className="font-bold">{formatES(PERFORMANCE_KPIS.reach.frequency)}</span>
            </div>
          </div>
        </div>

        {/* Engagement */}
        <div className="bg-fitzone-emerald text-fitzone-charcoal rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <Heart className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
            <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold ${
              PERFORMANCE_KPIS.engagement.trend_value > 0 ? 'bg-fitzone-charcoal text-fitzone-emerald' : 'bg-red-400 text-white'
            }`}>
              {PERFORMANCE_KPIS.engagement.trend}
            </span>
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-fitzone-charcoal/80 mb-0.5 sm:mb-1">Interacciones Totales</h3>
          <p className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{formatCompact(PERFORMANCE_KPIS.engagement.total_interactions)}</p>
          <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
            <span className="text-xs sm:text-sm text-fitzone-charcoal/70">Engagement Rate</span>
            <span className="text-xs bg-fitzone-charcoal/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">{formatPercent(PERFORMANCE_KPIS.engagement.engagement_rate)}</span>
          </div>
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-fitzone-charcoal/20">
            <div className="flex justify-between text-xs">
              <span className="text-fitzone-charcoal/70">Shares</span>
              <span className="font-bold">{formatCompact(PERFORMANCE_KPIS.engagement.shares)}</span>
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="bg-fitzone-slate text-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-lg border border-fitzone-purple/30">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <Award className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-fitzone-purple" />
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold bg-fitzone-emerald text-fitzone-charcoal">
              {PERFORMANCE_KPIS.budget.spent_percentage.toFixed(0)}%
            </span>
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-fitzone-textGray mb-0.5 sm:mb-1">Presupuesto Ejecutado</h3>
          <p className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-fitzone-purple">${formatCompact(PERFORMANCE_KPIS.budget.total_spent)}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xs sm:text-sm text-fitzone-textGray">de ${formatCompact(PERFORMANCE_KPIS.budget.total_budget, 0)} total</span>
          </div>
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-fitzone-purple/20">
            <div className="flex justify-between text-xs">
              <span className="text-fitzone-textGray">CPC Promedio</span>
              <span className="font-bold text-fitzone-purple">{formatMoney(PERFORMANCE_KPIS.budget.cost_per_click)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="bg-fitzone-slate rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 border border-fitzone-purple/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">Performance Últimos 7 Días</h3>
            <p className="text-xs sm:text-sm text-fitzone-textGray">Evolución de métricas clave</p>
          </div>
          <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-fitzone-purple"></div>
              <span className="text-fitzone-textGray">Leads</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-fitzone-cyan"></div>
              <span className="text-fitzone-textGray">Engagement (K)</span>
            </div>
          </div>
        </div>

        <div className="w-full h-[200px] sm:h-[250px] lg:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '10px' }} tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" stroke="#9CA3AF" style={{ fontSize: '10px' }} tick={{ fontSize: 10 }} width={35} />
              <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" style={{ fontSize: '10px' }} tick={{ fontSize: 10 }} width={35} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1A0F26', border: '1px solid #7B2CBF', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '8px', color: '#7B2CBF' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line yAxisId="left" type="monotone" dataKey="leads" stroke="#7B2CBF" strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="#06B6D4" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Channel Distribution */}
      <div className="bg-fitzone-slate rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-fitzone-purple/20">
        <h3 className="text-sm sm:text-base font-bold text-white mb-4 sm:mb-6 lg:mb-8 text-center md:text-left">Distribución de Leads por Canal</h3>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-12">
          {/* Pie Chart */}
          <div className="flex-shrink-0 w-full max-w-[280px] sm:max-w-[320px]">
            <ResponsiveContainer width="100%" aspect={1}>
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius="80%"
                  fill="#8884d8"
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A0F26', border: '1px solid #7B2CBF', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value, name, props) => {
                    const channel = channelData.find(c => c.name === name);
                    return [`${value}% (${channel?.leads ?? '-'} leads)`, name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Divider - only visible on desktop */}
          <div className="hidden lg:block w-px h-64 bg-fitzone-purple/20"></div>

          {/* Legend */}
          <div className="flex-1 w-full max-w-md space-y-2 sm:space-y-3">
            {channelData.map((channel, idx) => (
              <div key={idx} className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-fitzone-charcoal rounded-lg hover:bg-fitzone-charcoal/80 transition-all duration-200 border border-fitzone-purple/10 hover:border-fitzone-purple/30">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: channel.color }}></div>
                  <span className="text-xs sm:text-sm font-medium text-white truncate">{channel.name}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2 sm:ml-4">
                  <span className="text-xs sm:text-sm font-bold text-white">{channel.leads}</span>
                  <span className="text-xs sm:text-sm font-bold text-white bg-fitzone-darkPurple px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md min-w-[40px] sm:min-w-[48px] text-center">
                    {channel.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Funnel de Conversion - Responsive */}
      <div className="bg-fitzone-slate rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 border border-fitzone-purple/20">
        <h3 className="text-sm sm:text-base font-bold text-white mb-4 sm:mb-6">Funnel de Conversión Powerpay</h3>

        {/* Mobile: Vertical Stack, Desktop: Horizontal Flow */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 sm:gap-3 lg:gap-3 overflow-x-auto pb-2 lg:pb-4">
          {funnelSteps.map((step, idx) => (
            <div key={idx} className="flex flex-row lg:flex-row items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Step Card */}
              <div className={`${step.bgColor} rounded-lg sm:rounded-xl p-3 sm:p-4 text-white shadow-md flex-1 lg:flex-initial lg:min-w-[120px] xl:min-w-[140px]`}>
                <div className="flex lg:flex-col items-center lg:text-center gap-3 lg:gap-0">
                  <div className="flex-shrink-0 lg:mb-2">
                    <step.IconComponent className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                  </div>
                  <div className="flex-1 lg:flex-initial">
                    <p className="text-xs font-medium text-white/80 uppercase tracking-wide mb-0.5 sm:mb-1">{step.stage}</p>
                    <p className="text-base sm:text-lg font-bold">{formatThousands(step.value)}</p>
                  </div>
                  {/* Mobile: Show conversion rate inline */}
                  {idx < funnelSteps.length - 1 && (
                    <div className="lg:hidden flex-shrink-0 text-right">
                      <span className="text-xs sm:text-sm font-bold bg-white/20 px-2 py-1 rounded">{formatPercent(step.conversionRate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Arrow with conversion rate - Desktop only */}
              {idx < funnelSteps.length - 1 && (
                <div className="hidden lg:flex flex-col items-center justify-center min-w-[50px] xl:min-w-[60px]">
                  <div className="text-xs xl:text-sm font-bold text-fitzone-purple mb-1">{formatPercent(step.conversionRate)}</div>
                  <svg className="w-6 h-6 xl:w-8 xl:h-8 text-fitzone-textGray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-fitzone-purple/20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-fitzone-purple/10 rounded-lg p-3 border border-fitzone-purple/20">
              <p className="text-xs text-fitzone-textGray mb-0.5 sm:mb-1">Conversión Global</p>
              <p className="text-lg sm:text-xl font-bold text-fitzone-purple">0,058%</p>
              <p className="text-xs text-fitzone-textGray">Alcance - Cuentas Creadas</p>
            </div>
            <div className="bg-fitzone-emerald/10 rounded-lg p-3 border border-fitzone-emerald/20">
              <p className="text-xs text-fitzone-textGray mb-0.5 sm:mb-1">Registro - KYC</p>
              <p className="text-lg sm:text-xl font-bold text-fitzone-emerald">72,4%</p>
              <p className="text-xs text-fitzone-textGray">Validación de identidad</p>
            </div>
            <div className="bg-fitzone-cyan/10 rounded-lg p-3 border border-fitzone-cyan/20">
              <p className="text-xs text-fitzone-textGray mb-0.5 sm:mb-1">Tasa Conversión Web</p>
              <p className="text-lg sm:text-xl font-bold text-fitzone-cyan">5,4%</p>
              <p className="text-xs text-fitzone-textGray">Tiendas - Registros</p>
            </div>
          </div>
        </div>
      </div>

      {/* CRM Monitoring - CPL Alerts */}
      <div className="bg-fitzone-purple text-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Bell className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
            <div>
              <h3 className="text-sm sm:text-base lg:text-lg font-bold">CRM - Monitoreo CPL por Audiencia</h3>
              <p className="text-xs sm:text-sm text-white/90">Alertas automáticas de costo por lead</p>
            </div>
          </div>
          <span className="px-2 sm:px-3 py-1 bg-white/20 rounded-full text-xs font-bold self-start sm:self-auto">
            {CRM_CONFIG.enabled ? 'ACTIVO' : 'MONITOREO'}
          </span>
        </div>

        {/* CPL Thresholds by Audience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <h4 className="font-bold text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              Joven Digital
            </h4>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>CPL Target</span>
                <span className="font-bold">${CRM_CONFIG.cpl_thresholds.joven_digital.cpl_target}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Alerta en</span>
                <span className="font-bold text-yellow-300">${CRM_CONFIG.cpl_thresholds.joven_digital.cpl_alert}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Pausar en</span>
                <span className="font-bold text-red-300">${CRM_CONFIG.cpl_thresholds.joven_digital.cpl_pause}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <h4 className="font-bold text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
              <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              Adulto Planificador
            </h4>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>CPL Target</span>
                <span className="font-bold">{formatMoney(CRM_CONFIG.cpl_thresholds.adulto_planificador.cpl_target)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Alerta en</span>
                <span className="font-bold text-yellow-300">{formatMoney(CRM_CONFIG.cpl_thresholds.adulto_planificador.cpl_alert)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Pausar en</span>
                <span className="font-bold text-red-300">{formatMoney(CRM_CONFIG.cpl_thresholds.adulto_planificador.cpl_pause)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas Recientes */}
        {CRM_MOCKUP && CRM_MOCKUP.alerts && CRM_MOCKUP.alerts.length > 0 && (
          <div className="space-y-1.5 sm:space-y-2">
            <h4 className="font-bold text-xs sm:text-sm mb-1.5 sm:mb-2">Alertas Recientes:</h4>
            {CRM_MOCKUP.alerts.slice(0, 2).map((alert, idx) => (
              <div key={idx} className={`p-2 sm:p-3 rounded-lg ${
                alert.type === 'critical' ? 'bg-red-500/30 border border-red-300' :
                alert.type === 'warning' ? 'bg-yellow-500/30 border border-yellow-300' :
                'bg-green-500/30 border border-green-300'
              }`}>
                <p className="text-xs sm:text-sm font-medium">{alert.message}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-white/20 rounded-lg">
          <p className="text-xs flex items-start sm:items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5 sm:mt-0" />
            <span><strong>Nota:</strong> Sistema de alertas automáticas configurado para notificación en tiempo real cuando el CPL supera los umbrales por audiencia.</span>
          </p>
        </div>
      </div>

      {/* Alertas Automaticas */}
      <div className="bg-fitzone-slate rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 border border-fitzone-purple/20">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-fitzone-purple" />
          <h3 className="text-sm sm:text-base font-bold text-white">Alertas del Mercado BNPL</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {ALERTS.slice(0, 3).map((alert) => (
            <div key={alert.id} className={`p-3 sm:p-4 rounded-lg border-l-4 ${
              alert.severity === 'high' ? 'bg-red-500/10 border-red-500' :
              alert.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500' :
              'bg-fitzone-cyan/10 border-fitzone-cyan'
            }`}>
              <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                <h4 className="font-bold text-white text-xs sm:text-sm">{alert.title}</h4>
                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-bold flex-shrink-0 ${
                  alert.severity === 'high' ? 'bg-red-500/30 text-red-300' :
                  alert.severity === 'medium' ? 'bg-yellow-500/30 text-yellow-300' :
                  'bg-fitzone-cyan/30 text-fitzone-cyan'
                }`}>
                  {alert.severity === 'high' ? 'ALTA' : alert.severity === 'medium' ? 'MEDIA' : 'BAJA'}
                </span>
              </div>
              <p className="text-xs text-fitzone-textGray mb-1.5 sm:mb-2">{alert.message}</p>
              <p className="text-xs font-semibold text-fitzone-purple">
                Acción: {alert.action}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Competitor Analysis */}
      <div className="bg-fitzone-slate rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 border border-fitzone-purple/20">
        <h3 className="text-sm sm:text-base font-bold text-white mb-3 sm:mb-4">Análisis de Competencia BNPL</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {COMPETITOR_INSIGHTS.filter(c => c.brand !== 'Powerpay').map((comp, idx) => (
            <div key={idx} className="p-3 sm:p-4 bg-fitzone-charcoal border-2 border-fitzone-slate rounded-lg hover:border-fitzone-purple/50 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <h4 className="font-bold text-white text-sm sm:text-base truncate">{comp.brand}</h4>
                  <p className="text-xs text-fitzone-textGray">{comp.location}</p>
                </div>
                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-bold flex-shrink-0 ${
                  comp.threat_level === 'high' ? 'bg-red-500/30 text-red-300' :
                  comp.threat_level === 'medium' ? 'bg-yellow-500/30 text-yellow-300' :
                  'bg-green-500/30 text-green-300'
                }`}>
                  {comp.threat_level === 'high' ? 'Alta' : comp.threat_level === 'medium' ? 'Media' : 'Baja'}
                </span>
              </div>

              <p className="text-xs text-fitzone-textGray mb-2 sm:mb-3 leading-relaxed line-clamp-2">{comp.description}</p>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div>
                  <p className="text-xs text-fitzone-textGray">Share of Voice</p>
                  <p className="text-sm sm:text-base font-bold text-white">{comp.share_of_voice}%</p>
                </div>
                <div>
                  <p className="text-xs text-fitzone-textGray">Sentimiento</p>
                  <p className="text-sm sm:text-base font-bold text-fitzone-cyan">{comp.sentiment}%</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-fitzone-textGray mb-1">Temas Trending</p>
                <div className="flex flex-wrap gap-1">
                  {comp.trending_topics.slice(0, 3).map((topic, topicIdx) => (
                    <span key={topicIdx} className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-fitzone-slate rounded text-xs text-fitzone-textGray">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Powerpay Comparison */}
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 lg:p-5 bg-fitzone-purple text-white rounded-lg sm:rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <h4 className="font-bold text-sm sm:text-base mb-1 flex items-center gap-1.5 sm:gap-2">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                Powerpay
              </h4>
              <p className="text-xs text-white/70 mb-2">BNPL puro independiente respaldado por BBVA y Breca, funciona con cualquier tarjeta y no consume la línea de crédito</p>
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <div>
                  <p className="text-xs text-white/70">Share of Voice</p>
                  <p className="text-lg sm:text-xl font-bold">10%</p>
                </div>
                <div>
                  <p className="text-xs text-white/70">Sentimiento</p>
                  <p className="text-lg sm:text-xl font-bold">76%</p>
                </div>
                <div>
                  <p className="text-xs text-white/70">Comercios</p>
                  <p className="text-lg sm:text-xl font-bold">300+</p>
                </div>
              </div>
            </div>
            <div className="sm:text-right">
              <span className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white/20 rounded-lg text-xs sm:text-sm font-bold inline-block">
                Nuestra Marca
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
