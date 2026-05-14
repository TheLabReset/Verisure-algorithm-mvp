import { Target, Users, MessageSquare, TrendingUp, Lightbulb, Zap, AlertCircle, Shield, ShieldCheck, Camera, Bell, Smartphone, Flame, BarChart3, CheckCircle, FlaskConical, Calendar, Award, MapPin, Gauge, Activity, Globe2 } from 'lucide-react';
import { OPPORTUNITY_SCORE } from '../data/mockData';
import { LAYER_CONFIG, KEY_MESSAGES, TARGET_AUDIENCES } from '../data/config';
import { formatMoney, formatPercent } from '../utils/format';

export default function DecisionLayer() {
  const getMonthlyPeriod = () => {
    const now = new Date();
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `1 al ${now.getDate()} de ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  };

  const monthlyPeriod = getMonthlyPeriod();

  const recommendations = [
    {
      priority: 'high',
      category: 'Meta Lead Ads',
      action: 'Se sugiere reforzar Meta Lead Ads con creatividades sobre doble verificación y monitoreo continuo, sosteniendo CPL cerca de $22 en Hogar Familiar Lima Moderna',
      impact: 'Subida sugerida de aproximadamente 180 leads mensuales en la ventana estacional',
      confidence: 88
    },
    {
      priority: 'high',
      category: 'Google Search',
      action: 'Se recomienda escalar la cobertura SEM en keywords transaccionales (alarma para casa, cámaras de seguridad, alarma para negocio) durante el pico de fin de año',
      impact: 'CPL acercándose al target $30 con leads de mayor calificación',
      confidence: 86
    },
    {
      priority: 'medium',
      category: 'Mensaje',
      action: 'Se sugiere posicionar ZeroVision y la doble verificación por imagen y audio como capas diferenciales frente a la promesa básica de monitoreo de la competencia',
      impact: 'Mayor consideración en audiencia Hogar Familiar Lima Moderna',
      confidence: 84
    },
    {
      priority: 'medium',
      category: 'TikTok',
      action: 'Se observa una oportunidad de pilotar Spark Ads con creadores del nicho seguridad ciudadana y hogar para amplificar contenido testimonial en sub-segmento 30 a 45',
      impact: 'Apertura de un canal adicional con CPL exploratorio en Lima',
      confidence: 78
    },
    {
      priority: 'low',
      category: 'Geo PyME',
      action: 'Se sugiere evaluar segmentación geo dedicada en Lima Este (SJL, Ate) y Lima Norte (Los Olivos, Comas) con foco en hotspots delictivos para captar Negocio PyME',
      impact: 'Captura adicional del segmento PyME post evento delictivo',
      confidence: 74
    }
  ];

  const audiences = TARGET_AUDIENCES.map(aud => ({
    name: aud.name,
    size: aud.size,
    engagement: formatPercent(aud.engagement_rate),
    status: 'active',
    description: aud.description + ` - ${aud.interests.slice(0, 3).join(', ')}`,
    message: aud.message,
    age_range: aud.age_range,
    cpl_target: aud.cpl_target
  }));

  const getScoreGrade = (score) => {
    if (score >= 85) return 'A+';
    if (score >= 75) return 'A';
    if (score >= 65) return 'B+';
    if (score >= 55) return 'B';
    return 'C';
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="bg-fitzone-slate rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 border border-fitzone-purple/10">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">
              {LAYER_CONFIG.decision.name}
            </h2>
            <p className="text-sm sm:text-base text-fitzone-textGray">
              {LAYER_CONFIG.decision.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-fitzone-purple/20 text-fitzone-lightPurple px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">{monthlyPeriod}</span>
            </div>
            <span className="px-2 sm:px-3 py-1 bg-fitzone-purple text-white rounded-full text-xs sm:text-sm font-medium">
              IA Activa
            </span>
          </div>
        </div>
      </div>

      {/* Verisure Awareness Score */}
      <div className="bg-fitzone-purple text-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <Zap className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold">Verisure Awareness Score</h3>
              <p className="text-white/90 mt-0.5 sm:mt-1 text-xs sm:text-sm">Índice de oportunidad para inversión en captación de leads</p>
            </div>
          </div>

          <div className="text-left sm:text-center lg:text-right w-full sm:w-auto">
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-bold">{OPPORTUNITY_SCORE.current_score}</span>
              <span className="text-base sm:text-lg lg:text-xl text-white/80">/100</span>
            </div>
            <div className="flex flex-wrap items-center justify-start sm:justify-center lg:justify-end gap-2 sm:gap-3 mt-2">
              <span className={`px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-lg text-sm sm:text-base font-bold ${
                OPPORTUNITY_SCORE.current_score >= 75 ? 'bg-fitzone-emerald text-fitzone-charcoal' :
                OPPORTUNITY_SCORE.current_score >= 60 ? 'bg-fitzone-amber text-fitzone-charcoal' : 'bg-fitzone-red'
              }`}>
                Grado {getScoreGrade(OPPORTUNITY_SCORE.current_score)}
              </span>
              <span className="text-fitzone-emerald font-semibold text-xs sm:text-sm">
                {OPPORTUNITY_SCORE.trend} vs. período anterior
              </span>
            </div>
          </div>
        </div>

        {/* Score Components */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Object.entries(OPPORTUNITY_SCORE.components).map(([key, component]) => (
            <div key={key} className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h4 className="font-semibold text-xs sm:text-sm text-white/90">
                  {key === 'search_interest' ? 'Interés de Búsqueda' :
                   key === 'social_engagement' ? 'Engagement Social' :
                   key === 'competitor_gap' ? 'Gap Competitivo' :
                   key === 'seasonal_index' ? 'Índice Estacional' :
                   key === 'conversion_efficiency' ? 'Eficiencia de CPL' : key}
                </h4>
                <span className="text-xs bg-white/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                  {(component.weight * 100).toFixed(0)}% peso
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{component.score}</div>
              <div className="text-xs text-white/90">
                {component.insight}
              </div>
            </div>
          ))}
        </div>

        {/* Main Recommendation */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 lg:p-5 bg-white/20 rounded-lg sm:rounded-xl border-2 border-white/30">
          <div className="flex items-start gap-2 sm:gap-3">
            <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5 sm:mt-1" />
            <div className="min-w-0">
              <p className="font-semibold mb-1 sm:mb-2 text-xs sm:text-sm">Recomendación automática:</p>
              <p className="text-sm sm:text-base">{OPPORTUNITY_SCORE.recommendation.message}</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                {OPPORTUNITY_SCORE.recommendation.actions.map((action, idx) => (
                  <span key={idx} className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 rounded-lg text-xs font-medium">
                    {action}
                  </span>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-white/90 mt-2 sm:mt-3">
                Confianza: {OPPORTUNITY_SCORE.recommendation.confidence} |
                Prioridad: {OPPORTUNITY_SCORE.recommendation.priority === 'high' ? 'ALTA' :
                            OPPORTUNITY_SCORE.recommendation.priority === 'medium' ? 'MEDIA' : 'BAJA'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Recommendations */}
      <div className="bg-fitzone-slate rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 border border-fitzone-purple/10">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-fitzone-purple rounded-lg sm:rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">Recomendaciones Estratégicas</h3>
            <p className="text-xs sm:text-sm text-fitzone-textGray">Acciones sugeridas a partir de señales del sector seguridad</p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {recommendations.map((rec, idx) => (
            <div key={idx} className={`p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl border-2 ${
              rec.priority === 'high'
                ? 'bg-fitzone-purple/10 border-fitzone-purple/30'
                : rec.priority === 'medium'
                ? 'bg-fitzone-amber/10 border-fitzone-amber/30'
                : 'bg-fitzone-cyan/10 border-fitzone-cyan/30'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    rec.priority === 'high'
                      ? 'bg-fitzone-purple/30 text-fitzone-lightPurple'
                      : rec.priority === 'medium'
                      ? 'bg-fitzone-amber/30 text-fitzone-amber'
                      : 'bg-fitzone-cyan/30 text-fitzone-cyan'
                  }`}>
                    {rec.priority === 'high' ? <><Flame className="w-3 h-3" /> ALTA</> :
                     rec.priority === 'medium' ? <><Zap className="w-3 h-3" /> MEDIA</> : <><BarChart3 className="w-3 h-3" /> BAJA</>}
                  </span>
                  <span className="text-xs font-semibold text-fitzone-textGray uppercase">{rec.category}</span>
                </div>
                <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                  <p className="text-xs text-fitzone-textGray">Confianza</p>
                  <p className="text-sm sm:text-base font-bold text-white">{rec.confidence}%</p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-white font-medium mb-1 sm:mb-2">{rec.action}</p>
              <p className="text-xs sm:text-sm text-fitzone-emerald font-semibold flex items-center gap-1">
                <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {rec.impact}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Target Audiences */}
      <div className="bg-fitzone-slate rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 border border-fitzone-purple/10">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-fitzone-cyan rounded-lg sm:rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">Audiencias Objetivo Verisure</h3>
            <p className="text-xs sm:text-sm text-fitzone-textGray">Segmentación sugerida para captación de leads 2026</p>
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4">
          {audiences.map((aud, idx) => (
            <div key={idx} className="p-3 sm:p-4 lg:p-5 bg-fitzone-charcoal rounded-lg sm:rounded-xl border border-fitzone-slate hover:border-fitzone-purple/30 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <h4 className="font-bold text-white text-sm sm:text-base">{aud.name}</h4>
                    <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                      aud.status === 'active' ? 'bg-fitzone-emerald/20 text-fitzone-emerald' : 'bg-fitzone-amber/20 text-fitzone-amber'
                    }`}>
                      {aud.status === 'active' ? <><CheckCircle className="w-3 h-3" /> ACTIVA</> : <><FlaskConical className="w-3 h-3" /> EN PRUEBA</>}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-fitzone-textGray">{aud.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 sm:gap-4 lg:gap-6 mt-3 sm:mt-4 pb-3 sm:pb-4 border-b border-fitzone-slate">
                <div>
                  <p className="text-xs text-fitzone-textGray">Tamaño Potencial</p>
                  <p className="text-lg sm:text-xl font-bold text-white">{aud.size}</p>
                </div>
                <div>
                  <p className="text-xs text-fitzone-textGray">Engagement Rate</p>
                  <p className="text-lg sm:text-xl font-bold text-fitzone-cyan">{aud.engagement}</p>
                </div>
                <div>
                  <p className="text-xs text-fitzone-textGray">CPL Target</p>
                  <p className="text-lg sm:text-xl font-bold text-fitzone-purple">{formatMoney(aud.cpl_target)}</p>
                </div>
              </div>

              <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-fitzone-slate/50 rounded-lg">
                <p className="text-xs text-fitzone-textGray mb-0.5 sm:mb-1">Mensaje recomendado:</p>
                <p className="text-xs sm:text-sm font-semibold text-white">{aud.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Pillars */}
      <div className="bg-fitzone-charcoal text-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-fitzone-purple/20">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-fitzone-purple" />
          <h3 className="text-base sm:text-lg font-bold">Pilares de Contenido Sugeridos</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-fitzone-slate rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 border border-fitzone-purple/20">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-fitzone-purple" />
              <p className="text-fitzone-textGray text-xs sm:text-sm font-semibold">Pilar 1: {KEY_MESSAGES.monitoreo_continuo.title}</p>
            </div>
            <p className="text-sm sm:text-base font-bold mb-1 sm:mb-2">"{KEY_MESSAGES.monitoreo_continuo.message}"</p>
            <p className="text-fitzone-textGray text-xs sm:text-sm mb-2 sm:mb-3">{KEY_MESSAGES.monitoreo_continuo.description}</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-fitzone-purple/20 rounded text-xs">Central propia</span>
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-fitzone-purple/20 rounded text-xs">24/7</span>
            </div>
          </div>

          <div className="bg-fitzone-slate rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 border border-fitzone-purple/20">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-fitzone-purple" />
              <p className="text-fitzone-textGray text-xs sm:text-sm font-semibold">Pilar 2: {KEY_MESSAGES.doble_verificacion.title}</p>
            </div>
            <p className="text-sm sm:text-base font-bold mb-1 sm:mb-2">"{KEY_MESSAGES.doble_verificacion.message}"</p>
            <p className="text-fitzone-textGray text-xs sm:text-sm mb-2 sm:mb-3">{KEY_MESSAGES.doble_verificacion.description}</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-fitzone-purple/20 rounded text-xs">Imagen</span>
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-fitzone-purple/20 rounded text-xs">Audio</span>
            </div>
          </div>

          <div className="bg-fitzone-slate rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 border border-fitzone-purple/20">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-fitzone-purple" />
              <p className="text-fitzone-textGray text-xs sm:text-sm font-semibold">Pilar 3: {KEY_MESSAGES.zerovision.title}</p>
            </div>
            <p className="text-sm sm:text-base font-bold mb-1 sm:mb-2">"{KEY_MESSAGES.zerovision.message}"</p>
            <p className="text-fitzone-textGray text-xs sm:text-sm mb-2 sm:mb-3">{KEY_MESSAGES.zerovision.description}</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-fitzone-purple/20 rounded text-xs">Niebla densa</span>
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-fitzone-purple/20 rounded text-xs">Tecnología propietaria</span>
            </div>
          </div>

          <div className="bg-fitzone-slate rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 border border-fitzone-purple/20">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-fitzone-purple" />
              <p className="text-fitzone-textGray text-xs sm:text-sm font-semibold">Pilar 4: {KEY_MESSAGES.respuesta_autoridades.title}</p>
            </div>
            <p className="text-sm sm:text-base font-bold mb-1 sm:mb-2">"{KEY_MESSAGES.respuesta_autoridades.message}"</p>
            <p className="text-fitzone-textGray text-xs sm:text-sm mb-2 sm:mb-3">{KEY_MESSAGES.respuesta_autoridades.description}</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-fitzone-purple/20 rounded text-xs">PNP</span>
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-fitzone-purple/20 rounded text-xs">Serenazgo</span>
            </div>
          </div>

          <div className="bg-fitzone-slate rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 border border-fitzone-purple/20 sm:col-span-2">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-fitzone-purple" />
              <p className="text-fitzone-textGray text-xs sm:text-sm font-semibold">Pilar 5: {KEY_MESSAGES.control_movil.title}</p>
            </div>
            <p className="text-sm sm:text-base font-bold mb-1 sm:mb-2">"{KEY_MESSAGES.control_movil.message}"</p>
            <p className="text-fitzone-textGray text-xs sm:text-sm mb-2 sm:mb-3">{KEY_MESSAGES.control_movil.description}</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-fitzone-purple/20 rounded text-xs">My Verisure</span>
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-fitzone-purple/20 rounded text-xs">Activación remota</span>
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-fitzone-purple/20 rounded text-xs">Historial de eventos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
