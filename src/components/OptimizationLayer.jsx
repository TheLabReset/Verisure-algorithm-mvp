import { TrendingUp, BarChart3, RefreshCw, Award, Target, Users, ThumbsUp, Zap, AlertCircle, Wifi, Bell, Globe, FileText, CheckCircle, Lightbulb, Activity, UserPlus, Calendar, Store, DollarSign } from 'lucide-react';
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
            {Number(realVal).toLocaleString('en-US')}
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
    return `1-${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  };

  const monthlyPeriod = getMonthlyPeriod();

  // Performance últimos 7 días - WIN awareness
  // Spent diario ≈ $13.500/30 ≈ $450 promedio
  // Leads diarios ≈ 1.450/30 ≈ 48 promedio
  const performanceData = [
    { date: '30 Abr', leads: 42, reach: 358000, engagement: 14200, spent: 432 },
    { date: '01 May', leads: 52, reach: 392000, engagement: 16800, spent: 468 },
    { date: '02 May', leads: 46, reach: 372000, engagement: 15500, spent: 445 },
    { date: '03 May', leads: 58, reach: 408000, engagement: 17900, spent: 482 },
    { date: '04 May', leads: 54, reach: 396000, engagement: 17200, spent: 465 },
    { date: '05 May', leads: 62, reach: 425000, engagement: 18600, spent: 498 },
    { date: '06 May', leads: 48, reach: 380000, engagement: 15800, spent: 455 }
  ];

  // Channel performance - WIN (mix Meta + Google + TikTok)
  // Suma percentages = 100, suma leads = 1.450 (= leads.total)
  const channelData = [
    { name: 'Meta Ads', value: 54, leads: 870, color: '#F26A1F' },
    { name: 'YouTube', value: 14, leads: 105, color: '#FF8A4D' },
    { name: 'Google Search', value: 13, leads: 320, color: '#06B6D4' },
    { name: 'Google Display', value: 12, leads: 105, color: '#F4B842' },
    { name: 'TikTok Ads', value: 7, leads: 50, color: '#10B981' }
  ];

  // Funnel awareness WIN - rango amplio (~1.700x), escala log obligatoria
  const funnelSteps = [
    { stage: 'Alcance Único', value: 2500000, conversionRate: 38.0 },
    { stage: 'Frecuencia 3+ (recordación)', value: 950000, conversionRate: 11.6 },
    { stage: 'Interacciones', value: 110000, conversionRate: 34.5 },
    { stage: 'Visitas Web', value: 38000, conversionRate: 3.8 },
    { stage: 'Consultas Cualificadas', value: 1450, conversionRate: null }
  ];

  // Paleta funnel: gradiente naranja WIN → cyan → amber (cierre)
  const funnelColors = ['#FF8A4D', '#F26A1F', '#C44E0E', '#06B6D4', '#F4B842'];

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
          <h3 className="text-xs sm:text-sm font-medium text-fitzone-charcoal/90 mb-0.5 sm:mb-1">CPM Promedio</h3>
          <p className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{formatMoney(PERFORMANCE_KPIS.whatsapp.current)}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xs sm:text-sm text-fitzone-charcoal/90">CPI: {formatMoney(PERFORMANCE_KPIS.retention.current)}</span>
          </div>
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-fitzone-charcoal/20">
            <div className="flex justify-between text-xs">
              <span className="text-fitzone-charcoal/90">Consultas</span>
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
            <p className="text-xs sm:text-sm text-fitzone-textGray">Evolución de métricas clave de awareness</p>
          </div>
          <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-fitzone-purple"></div>
              <span className="text-fitzone-textGray">Consultas</span>
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
                contentStyle={{ backgroundColor: '#1F0F0A', border: '1px solid #F26A1F', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '8px', color: '#F26A1F' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line yAxisId="left" type="monotone" dataKey="leads" stroke="#F26A1F" strokeWidth={2} dot={{ r: 3 }} />
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
                  contentStyle={{ backgroundColor: '#1F0F0A', border: '1px solid #F26A1F', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value, name) => {
                    const channel = channelData.find(c => c.name === name);
                    return [`${value}% (${channel?.leads ?? '-'} consultas)`, name];
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
        <h3 className="text-sm sm:text-base font-bold text-white mb-4 sm:mb-6">Funnel de Awareness WIN</h3>

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
                valueFormat={v => v.toLocaleString('en-US')}
                motionConfig="gentle"
                tooltip={({ part }) => {
                  const idx = funnelChartData.findIndex(d => d.id === part.data.id);
                  const next = funnelSteps[idx + 1];
                  const stepRate = next ? (next.value / part.data.realValue) * 100 : null;
                  return (
                    <div style={{
                      background: '#1F0F0A',
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #F26A1F',
                      fontSize: '13px',
                    }}>
                      <strong>{part.data.label}</strong>
                      <br />
                      {Number(part.data.realValue).toLocaleString('en-US')}
                      {stepRate != null && (
                        <>
                          <br />
                          <span style={{ color: '#C7B5A8' }}>→ {formatES(stepRate, 1)}% a la siguiente</span>
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
              <p className="text-xs text-fitzone-textGray mb-0.5 sm:mb-1">Conversión Global</p>
              <p className="text-xl sm:text-2xl font-bold text-fitzone-lightPurple">0.058%</p>
              <p className="text-xs text-fitzone-textGray mt-1">Alcance → Consultas</p>
            </div>
            <div className="bg-fitzone-emerald/10 rounded-lg p-3 sm:p-4 border border-fitzone-emerald/20">
              <p className="text-xs text-fitzone-textGray mb-0.5 sm:mb-1">Recordación efectiva</p>
              <p className="text-xl sm:text-2xl font-bold text-fitzone-emerald">38.0%</p>
              <p className="text-xs text-fitzone-textGray mt-1">Alcance → Frecuencia 3+</p>
            </div>
            <div className="bg-fitzone-cyan/10 rounded-lg p-3 sm:p-4 border border-fitzone-cyan/20">
              <p className="text-xs text-fitzone-textGray mb-0.5 sm:mb-1">Interacción → Web</p>
              <p className="text-xl sm:text-2xl font-bold text-fitzone-cyan">34.5%</p>
              <p className="text-xs text-fitzone-textGray mt-1">Engagement a visitas web</p>
            </div>
            <div className="bg-fitzone-amber/10 rounded-lg p-3 sm:p-4 border border-fitzone-amber/20">
              <p className="text-xs text-fitzone-textGray mb-0.5 sm:mb-1">Mayor caída</p>
              <p className="text-xl sm:text-2xl font-bold text-fitzone-amber">96.2%</p>
              <p className="text-xs text-fitzone-textGray mt-1">Visitas Web → Consultas</p>
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
              <h3 className="text-sm sm:text-base lg:text-lg font-bold">CRM - Monitoreo CPI por Audiencia</h3>
              <p className="text-xs sm:text-sm text-white/90">Alertas automáticas de costo por interacción</p>
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
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              Joven Conectado
            </h4>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>CPI Target</span>
                <span className="font-bold">{formatMoney(CRM_CONFIG.cpl_thresholds.joven_lima_moderna.cpl_target)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Alerta en</span>
                <span className="font-bold text-fitzone-amber">{formatMoney(CRM_CONFIG.cpl_thresholds.joven_lima_moderna.cpl_alert)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Pausar en</span>
                <span className="font-bold text-fitzone-red">{formatMoney(CRM_CONFIG.cpl_thresholds.joven_lima_moderna.cpl_pause)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <h4 className="font-bold text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
              <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              Familia Conectada
            </h4>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>CPI Target</span>
                <span className="font-bold">{formatMoney(CRM_CONFIG.cpl_thresholds.familia_conectada.cpl_target)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Alerta en</span>
                <span className="font-bold text-fitzone-amber">{formatMoney(CRM_CONFIG.cpl_thresholds.familia_conectada.cpl_alert)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Pausar en</span>
                <span className="font-bold text-fitzone-red">{formatMoney(CRM_CONFIG.cpl_thresholds.familia_conectada.cpl_pause)}</span>
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
            <span><strong>Nota:</strong> Sistema de alertas automáticas configurado para notificación en tiempo real cuando el CPI supera los umbrales por audiencia.</span>
          </p>
        </div>
      </div>

      {/* Alertas del Mercado */}
      <div className="bg-fitzone-slate rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 border border-fitzone-purple/20">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-fitzone-purple" />
          <h3 className="text-sm sm:text-base font-bold text-white">Alertas del Mercado Telco</h3>
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
        <h3 className="text-sm sm:text-base font-bold text-white mb-3 sm:mb-4">Análisis de Competencia Telco</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {COMPETITOR_INSIGHTS.filter(c => c.brand !== 'WIN').map((comp, idx) => (
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

        {/* WIN Comparison */}
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 lg:p-5 bg-fitzone-purple text-white rounded-lg sm:rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <h4 className="font-bold text-sm sm:text-base mb-1 flex items-center gap-1.5 sm:gap-2">
                <Wifi className="w-4 h-4 sm:w-5 sm:h-5" />
                WIN
              </h4>
              <p className="text-xs text-white/90 mb-2">Operador 100% fibra óptica, reconocido por OSIPTEL en satisfacción al cliente, con red en expansión en Lima Metropolitana</p>
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <div>
                  <p className="text-xs text-white/90">Share of Voice</p>
                  <p className="text-lg sm:text-xl font-bold">21%</p>
                </div>
                <div>
                  <p className="text-xs text-white/90">Sentimiento</p>
                  <p className="text-lg sm:text-xl font-bold">82%</p>
                </div>
                <div>
                  <p className="text-xs text-white/90">Distritos</p>
                  <p className="text-lg sm:text-xl font-bold">40+</p>
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
