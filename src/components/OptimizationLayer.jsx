import { TrendingUp, BarChart3, RefreshCw, Award, Target, Users, ThumbsUp, Zap, AlertCircle, Shield, Bell, Globe, FileText, CheckCircle, Lightbulb, Activity, UserPlus, Calendar, Store, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ResponsiveFunnel } from '@nivo/funnel';
import { PERFORMANCE_KPIS, ALERTS, COMPETITOR_INSIGHTS, CRM_MOCKUP } from '../data/mockData';
import { LAYER_CONFIG, CRM_CONFIG } from '../data/config';
import { formatES, formatThousands, formatMoney, formatPercent, formatCompact } from '../utils/format';

// Custom SVG layer para el funnel: renderiza el valor real (no el inflado)
const FunnelValueLabels = ({ parts }) => {
  if (!parts || !parts.length) return null;
  return (
    <g>
      {parts.map((part) => {
        const realVal = part.data.realValue;
        if (realVal == null) return null;
        return (
          <text
            key={part.data.id}
            x={part.x}
            y={part.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#ffffff"
            fontSize={14}
            fontWeight={700}
            stroke="#00000055"
            strokeWidth={0.5}
          >
            {Number(realVal).toLocaleString('es-PE')}
          </text>
        );
      })}
    </g>
  );
};

export default function OptimizationLayer() {
  const getMonthlyPeriod = () => {
    const now = new Date();
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `1 al ${now.getDate()} de ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  };

  const monthlyPeriod = getMonthlyPeriod();

  // Performance últimos 7 días, Verisure lead generation
  // Spent diario ≈ $45.000/30 ≈ $1.500 promedio
  // Leads diarios ≈ 1.500/30 ≈ 50 promedio
  const performanceData = [
    { date: '30 Abr', leads: 44, reach: 380000, engagement: 11400, spent: 1420 },
    { date: '01 May', leads: 56, reach: 412000, engagement: 13600, spent: 1560 },
    { date: '02 May', leads: 48, reach: 396000, engagement: 12200, spent: 1485 },
    { date: '03 May', leads: 62, reach: 428000, engagement: 14400, spent: 1620 },
    { date: '04 May', leads: 54, reach: 408000, engagement: 13100, spent: 1545 },
    { date: '05 May', leads: 60, reach: 442000, engagement: 14800, spent: 1610 },
    { date: '06 May', leads: 50, reach: 392000, engagement: 12500, spent: 1510 }
  ];

  // Channel performance, Verisure (mix Meta + Google Search + TikTok + YouTube)
  // Suma percentages = 100, suma leads = 1.500 (= leads.total)
  const channelData = [
    { name: 'Meta Ads', value: 40, leads: 780, color: '#ED002F' },
    { name: 'Google Search', value: 35, leads: 420, color: '#06B6D4' },
    { name: 'YouTube', value: 10, leads: 60, color: '#FF5C7A' },
    { name: 'TikTok Ads', value: 10, leads: 70, color: '#10B981' },
    { name: 'Google Display', value: 5, leads: 40, color: '#F59E0B' }
  ];

  // Funnel de captación Verisure, rango amplio (~23.000x), escala log obligatoria
  const funnelSteps = [
    { stage: 'Alcance Único', value: 2800000, conversionRate: 1.57 },
    { stage: 'Visitas Web', value: 44000, conversionRate: 3.41 },
    { stage: 'Leads Capturados', value: 1500, conversionRate: 70.0 },
    { stage: 'Leads Calificados', value: 1050, conversionRate: 11.43 },
    { stage: 'Instalaciones', value: 120, conversionRate: null }
  ];

  // Paleta funnel: rojo Verisure (claro a oscuro) y cierre en cyan/emerald
  const funnelColors = ['#FF5C7A', '#ED002F', '#B30024', '#06B6D4', '#10B981'];

  // Escala logarítmica para preservar diferencias entre etapas (rango 1.700x)
  const funnelLogVals = funnelSteps.map(s => Math.log10(s.value));
  const funnelLogMin = Math.min(...funnelLogVals);
  const funnelLogMax = Math.max(...funnelLogVals);
  const funnelLogRange = funnelLogMax - funnelLogMin || 1;
  const funnelChartData = funnelSteps.map((step, i) => ({
    id: step.stage,
    value: Math.round(175 + ((funnelLogVals[i] - funnelLogMin) / funnelLogRange) * 825),
    label: step.stage,
    realValue: step.value,
  }));

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
        {/* Alcance Único */}
        <div className="bg-fitzone-purple text-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
            <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold ${
              PERFORMANCE_KPIS.reach.trend_value > 0 ? 'bg-fitzone-emerald text-fitzone-charcoal' : 'bg-fitzone-red'
            }`}>
              {PERFORMANCE_KPIS.reach.trend}
            </span>
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-white/90 mb-0.5 sm:mb-1">Alcance Único</h3>
          <p className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{formatCompact(PERFORMANCE_KPIS.reach.unique_reach)}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xs sm:text-sm text-white/90">Impresiones: {formatCompact(PERFORMANCE_KPIS.reach.impressions)}</span>
          </div>
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/20">
            <div className="flex justify-between text-xs">
              <span className="text-white/90">Frecuencia</span>
              <span className="font-bold">{formatES(PERFORMANCE_KPIS.reach.frequency, 1)}</span>
            </div>
          </div>
        </div>

        {/* Interacciones */}
        <div className="bg-fitzone-cyan text-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <ThumbsUp className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
            <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold ${
              PERFORMANCE_KPIS.engagement.trend_value > 0 ? 'bg-fitzone-emerald text-fitzone-charcoal' : 'bg-fitzone-red'
            }`}>
              {PERFORMANCE_KPIS.engagement.trend}
            </span>
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-white/90 mb-0.5 sm:mb-1">Interacciones</h3>
          <p className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{formatCompact(PERFORMANCE_KPIS.engagement.total_interactions)}</p>
          <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
            <span className="text-xs sm:text-sm text-white/90">Engagement Rate</span>
            <span className="text-xs bg-white/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">{formatPercent(PERFORMANCE_KPIS.engagement.engagement_rate, 1)}</span>
          </div>
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/20">
            <div className="flex justify-between text-xs">
              <span className="text-white/90">Compartidos</span>
              <span className="font-bold">{formatCompact(PERFORMANCE_KPIS.engagement.shares)}</span>
            </div>
          </div>
        </div>

        {/* CPM Promedio */}
        <div className="bg-fitzone-emerald text-fitzone-charcoal rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold bg-fitzone-charcoal text-fitzone-emerald">
              {PERFORMANCE_KPIS.whatsapp.change}%
            </span>
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-fitzone-charcoal/90 mb-0.5 sm:mb-1">CPL Promedio</h3>
          <p className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{formatMoney(PERFORMANCE_KPIS.leads.cost_per_lead)}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xs sm:text-sm text-fitzone-charcoal/90">CPM: {formatMoney(PERFORMANCE_KPIS.whatsapp.current)}</span>
          </div>
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-fitzone-charcoal/20">
            <div className="flex justify-between text-xs">
              <span className="text-fitzone-charcoal/90">Leads</span>
              <span className="font-bold">{formatThousands(PERFORMANCE_KPIS.leads.total)}</span>
            </div>
          </div>
        </div>

        {/* Presupuesto */}
        <div className="bg-fitzone-slate text-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-lg border border-fitzone-purple/30">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <Award className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-fitzone-purple" />
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold bg-fitzone-emerald text-fitzone-charcoal">
              {formatES(PERFORMANCE_KPIS.budget.spent_percentage, 0)}%
            </span>
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-fitzone-textGray mb-0.5 sm:mb-1">Presupuesto Ejecutado</h3>
          <p className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-fitzone-purple">${formatCompact(PERFORMANCE_KPIS.budget.total_spent, 1)}</p>
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
            <p className="text-xs sm:text-sm text-fitzone-textGray">Evolución de métricas clave de captación</p>
          </div>
          <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-fitzone-purple"></div>
              <span className="text-fitzone-textGray">Leads</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-fitzone-cyan"></div>
              <span className="text-fitzone-textGray">Interacciones</span>
            </div>
          </div>
        </div>

        <div className="w-full h-[200px] sm:h-[250px] lg:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '10px' }} tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" stroke="#9CA3AF" style={{ fontSize: '10px' }} tick={{ fontSize: 10 }} width={35} />
              <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" style={{ fontSize: '10px' }} tick={{ fontSize: 10 }} width={45} />
              <Tooltip
                contentStyle={{ backgroundColor: '#141826', border: '1px solid #ED002F', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '8px', color: '#ED002F' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line yAxisId="left" type="monotone" dataKey="leads" stroke="#ED002F" strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="#06B6D4" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Channel Distribution */}
      <div className="bg-fitzone-slate rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-fitzone-purple/20">
        <h3 className="text-sm sm:text-base font-bold text-white mb-4 sm:mb-6 lg:mb-8 text-center md:text-left">Distribución por Canal Digital</h3>

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
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#141826', border: '1px solid #ED002F', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value, name) => {
                    const channel = channelData.find(c => c.name === name);
                    return [`${value}% (${channel?.leads ?? 0} leads)`, name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Divider */}
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
                  <span className="text-xs sm:text-sm font-bold text-white">{formatThousands(channel.leads)}</span>
                  <span className="text-xs sm:text-sm font-bold text-white bg-fitzone-darkPurple px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md min-w-[40px] sm:min-w-[48px] text-center">
                    {channel.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Funnel de Awareness WIN con @nivo/funnel vertical (escala log) */}
      <div className="bg-fitzone-slate rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 border border-fitzone-purple/20">
        <h3 className="text-sm sm:text-base font-bold text-white mb-4 sm:mb-6">Funnel de Captación Verisure</h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <div style={{ height: 540 }}>
              <ResponsiveFunnel
                data={funnelChartData}
                direction="vertical"
                margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
                colors={funnelColors}
                borderWidth={0}
                enableLabel={false}
                layers={['parts', FunnelValueLabels, 'annotations']}
                spacing={2}
                shapeBlending={0.65}
                valueFormat={v => v.toLocaleString('es-PE')}
                motionConfig="gentle"
                tooltip={({ part }) => {
                  const idx = funnelChartData.findIndex(d => d.id === part.data.id);
                  const next = funnelSteps[idx + 1];
                  const stepRate = next ? (next.value / part.data.realValue) * 100 : null;
                  return (
                    <div style={{
                      background: '#141826',
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #ED002F',
                      fontSize: '13px',
                    }}>
                      <strong>{part.data.label}</strong>
                      <br />
                      {Number(part.data.realValue).toLocaleString('es-PE')}
                      {stepRate != null && (
                        <>
                          <br />
                          <span style={{ color: '#94A3B8' }}>→ {formatES(stepRate, 1)}% a la siguiente</span>
                        </>
                      )}
                    </div>
                  );
                }}
              />
            </div>
          </div>

          {/* Métricas laterales */}
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-fitzone-purple/10 rounded-lg p-3 sm:p-4 border border-fitzone-purple/20">
              <p className="text-xs text-fitzone-textGray mb-0.5 sm:mb-1">Conversión global</p>
              <p className="text-xl sm:text-2xl font-bold text-fitzone-lightPurple">0,004%</p>
              <p className="text-xs text-fitzone-textGray mt-1">Alcance hasta Instalaciones</p>
            </div>
            <div className="bg-fitzone-emerald/10 rounded-lg p-3 sm:p-4 border border-fitzone-emerald/20">
              <p className="text-xs text-fitzone-textGray mb-0.5 sm:mb-1">Calidad de leads</p>
              <p className="text-xl sm:text-2xl font-bold text-fitzone-emerald">70,0%</p>
              <p className="text-xs text-fitzone-textGray mt-1">Leads que califican (MQL)</p>
            </div>
            <div className="bg-fitzone-cyan/10 rounded-lg p-3 sm:p-4 border border-fitzone-cyan/20">
              <p className="text-xs text-fitzone-textGray mb-0.5 sm:mb-1">Cierre de instalación</p>
              <p className="text-xl sm:text-2xl font-bold text-fitzone-cyan">11,4%</p>
              <p className="text-xs text-fitzone-textGray mt-1">Calificados que se instalan</p>
            </div>
            <div className="bg-fitzone-amber/10 rounded-lg p-3 sm:p-4 border border-fitzone-amber/20">
              <p className="text-xs text-fitzone-textGray mb-0.5 sm:mb-1">Mayor caída</p>
              <p className="text-xl sm:text-2xl font-bold text-fitzone-amber">96,6%</p>
              <p className="text-xs text-fitzone-textGray mt-1">Alcance hasta Visitas Web</p>
            </div>
          </div>
        </div>
      </div>

      {/* CRM Monitoring - CPI Alerts por Audiencia */}
      <div className="bg-fitzone-purple text-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Bell className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
            <div>
              <h3 className="text-sm sm:text-base lg:text-lg font-bold">CRM. Monitoreo CPL por Audiencia</h3>
              <p className="text-xs sm:text-sm text-white/90">Alertas automáticas de costo por lead</p>
            </div>
          </div>
          <span className="px-2 sm:px-3 py-1 bg-white/20 rounded-full text-xs font-bold self-start sm:self-auto">
            {CRM_CONFIG.enabled ? 'ACTIVO' : 'MONITOREO'}
          </span>
        </div>

        {/* CPI Thresholds by Audience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <h4 className="font-bold text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              Hogar Familiar Lima Moderna
            </h4>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>CPL Target</span>
                <span className="font-bold">{formatMoney(CRM_CONFIG.cpl_thresholds.hogar_familiar_lima_moderna.cpl_target, 0)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Alerta en</span>
                <span className="font-bold text-fitzone-amber">{formatMoney(CRM_CONFIG.cpl_thresholds.hogar_familiar_lima_moderna.cpl_alert, 0)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Pausar en</span>
                <span className="font-bold text-fitzone-red">{formatMoney(CRM_CONFIG.cpl_thresholds.hogar_familiar_lima_moderna.cpl_pause, 0)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <h4 className="font-bold text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
              <Store className="w-4 h-4 sm:w-5 sm:h-5" />
              Negocio PyME Lima
            </h4>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>CPL Target</span>
                <span className="font-bold">{formatMoney(CRM_CONFIG.cpl_thresholds.negocio_pyme_lima.cpl_target, 0)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Alerta en</span>
                <span className="font-bold text-fitzone-amber">{formatMoney(CRM_CONFIG.cpl_thresholds.negocio_pyme_lima.cpl_alert, 0)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Pausar en</span>
                <span className="font-bold text-fitzone-red">{formatMoney(CRM_CONFIG.cpl_thresholds.negocio_pyme_lima.cpl_pause, 0)}</span>
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
                alert.type === 'critical' ? 'bg-fitzone-red/30 border border-fitzone-red' :
                alert.type === 'warning' ? 'bg-fitzone-amber/30 border border-fitzone-amber' :
                'bg-fitzone-emerald/30 border border-fitzone-emerald'
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

      {/* Alertas del Mercado */}
      <div className="bg-fitzone-slate rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 border border-fitzone-purple/20">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-fitzone-purple" />
          <h3 className="text-sm sm:text-base font-bold text-white">Alertas del Mercado de Seguridad</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {ALERTS.slice(0, 3).map((alert) => (
            <div key={alert.id} className={`p-3 sm:p-4 rounded-lg border-l-4 ${
              alert.severity === 'high' ? 'bg-fitzone-red/10 border-fitzone-red' :
              alert.severity === 'medium' ? 'bg-fitzone-amber/10 border-fitzone-amber' :
              'bg-fitzone-cyan/10 border-fitzone-cyan'
            }`}>
              <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                <h4 className="font-bold text-white text-xs sm:text-sm">{alert.title}</h4>
                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-bold flex-shrink-0 ${
                  alert.severity === 'high' ? 'bg-fitzone-red/30 text-fitzone-red' :
                  alert.severity === 'medium' ? 'bg-fitzone-amber/30 text-fitzone-amber' :
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
        <h3 className="text-sm sm:text-base font-bold text-white mb-3 sm:mb-4">Análisis de Competencia</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {COMPETITOR_INSIGHTS.filter(c => c.brand !== 'Verisure Perú').map((comp, idx) => (
            <div key={idx} className="p-3 sm:p-4 bg-fitzone-charcoal border-2 border-fitzone-slate rounded-lg hover:border-fitzone-purple/50 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <h4 className="font-bold text-white text-sm sm:text-base truncate">{comp.brand}</h4>
                  <p className="text-xs text-fitzone-textGray">{comp.location}</p>
                </div>
                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-bold flex-shrink-0 ${
                  comp.threat_level === 'high' ? 'bg-fitzone-red/30 text-fitzone-red' :
                  comp.threat_level === 'medium' ? 'bg-fitzone-amber/30 text-fitzone-amber' :
                  'bg-fitzone-emerald/30 text-fitzone-emerald'
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

        {/* Verisure Comparison */}
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 lg:p-5 bg-fitzone-purple text-white rounded-lg sm:rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <h4 className="font-bold text-sm sm:text-base mb-1 flex items-center gap-1.5 sm:gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                Verisure Perú
              </h4>
              <p className="text-xs text-white/90 mb-2">Operador europeo de alarmas monitoreadas con tecnología propietaria ZeroVision, doble verificación por imagen y audio y app My Verisure</p>
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <div>
                  <p className="text-xs text-white/90">Share of Voice</p>
                  <p className="text-lg sm:text-xl font-bold">34%</p>
                </div>
                <div>
                  <p className="text-xs text-white/90">Sentimiento</p>
                  <p className="text-lg sm:text-xl font-bold">78%</p>
                </div>
                <div>
                  <p className="text-xs text-white/90">Zonas Lima</p>
                  <p className="text-lg sm:text-xl font-bold">10</p>
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
