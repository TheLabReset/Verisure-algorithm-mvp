import { useState, useEffect } from 'react';
import { Search, TrendingUp, Video, Share2, Shield, RefreshCw, ChevronDown, ChevronUp, BarChart3, Info, Music, Target, DollarSign, Layers, Lightbulb, Users, Globe, MapPin, Eye, Clock, MousePointer, Smartphone, Monitor, ExternalLink, Calendar } from 'lucide-react';
import { GoogleIcon, TikTokIcon, MetaIcon, GoogleAnalyticsIcon } from './PlatformIcons';
import { formatES, formatMoney, formatPercent, formatThousands } from '../utils/format';

export default function DataLayer() {
  const getWeekPeriod = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);

    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatDate = (date) => date.getDate();
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();

    return {
      weekNumber,
      range: `${formatDate(monday)}-${formatDate(sunday)} ${month} ${year}`
    };
  };

  const weekPeriod = getWeekPeriod();

  const [trendsData, setTrendsData] = useState(null);
  const [tiktokData, setTiktokData] = useState(null);
  const [metaData, setMetaData] = useState(null);
  const [ga4Data, setGA4Data] = useState(null);
  const [mlData, setMLData] = useState(null);
  const [mlInsights, setMLInsights] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  const [expandedSections, setExpandedSections] = useState({
    trends: false,
    tiktok: false,
    meta: false,
    ga4: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const basePath = `/data`;
      const [trends, tiktok, meta, ga4, mlPredictions, mlInsightsData] = await Promise.all([
        fetch(`${basePath}/trends/latest.json`).then(r => r.json()).catch(() => null),
        fetch(`${basePath}/tiktok/latest.json`).then(r => r.json()).catch(() => null),
        fetch(`${basePath}/meta/latest.json`).then(r => r.json()).catch(() => null),
        fetch(`${basePath}/mock/ga4_data.json`).then(r => r.json()).catch(() => null),
        fetch(`${basePath}/ml/predictions.json`).then(r => r.json()).catch(() => null),
        fetch(`${basePath}/ml/insights.json`).then(r => r.json()).catch(() => null)
      ]);

      setTrendsData(trends);
      setTiktokData(tiktok);
      setMetaData(meta);
      setGA4Data(ga4);
      setMLData(mlPredictions);
      setMLInsights(mlInsightsData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getInsightIcon = (type) => {
    const iconMap = {
      trend: TrendingUp,
      social: Users,
      tiktok: Video,
      intent: Target,
      budget: DollarSign,
      multi_source: Layers
    };
    return iconMap[type] || Lightbulb;
  };

  const calculateScores = () => {
    const fmt = (v, fallback) => v !== undefined && v !== null
      ? formatES(Number(v), 1)
      : fallback;

    if (mlData?.scores?.individual) {
      return {
        overall: fmt(mlData.scores.overall, '7.6'),
        search: fmt(mlData.scores.individual.search?.final, '8.5'),
        trend: fmt(mlData.scores.individual.trend?.final, '7.6'),
        social: fmt(mlData.scores.individual.social?.final, '7.7'),
        intent: fmt(mlData.scores.individual.intent?.final, '6.8'),
        isML: true,
        weights: mlData.scores.weights
      };
    }

    return {
      overall: '7.6',
      search: '8.5',
      trend: '7.6',
      social: '7.7',
      intent: '6.8',
      isML: false
    };
  };

  const scores = calculateScores();

  const generateInsights = () => {
    return [
      {
        source: 'Google Trends',
        IconComponent: GoogleIcon,
        text: '"cámaras de seguridad" encabeza el interés con 92/100 y "alarma para casa" sostiene 88/100. La marca "verisure peru" sube 42% en los últimos tres meses.',
      },
      {
        source: 'TikTok',
        IconComponent: TikTokIcon,
        text: '#SeguridadEnElHogar alcanza 6,4M de views en Perú con +36% de crecimiento. El contenido de seguridad ciudadana y testimoniales muestra engagement entre 7,4 y 8,6 sobre 10.',
      },
      {
        source: 'Meta',
        IconComponent: MetaIcon,
        text: 'Conversación social sostenida en torno a protección del hogar y cámaras de seguridad. "Inseguridad ciudadana y protección" concentra 18,4K menciones con 86/100 de engagement.',
      },
      {
        source: 'GA4',
        IconComponent: GoogleAnalyticsIcon,
        text: '70K sesiones derivaron en 1.500 solicitudes de cotización y 1.050 leads calificados (tasa de calificación 70%). La página /precio-alarma muestra 5,8% de tasa de conversión.',
      },
    ];
  };

  const multiSourceInsight = {
    source: 'Análisis Multi-Fuente',
    IconComponent: Layers,
    text: 'Las cuatro fuentes coinciden en una ventana favorable hacia el cierre de año y vacaciones de verano. La combinación de búsquedas en alza, engagement social sostenido, presencia viral de contenido sobre robos en TikTok y tráfico web creciente sugiere un momento favorable para reforzar lead generation. Se observa una oportunidad de posicionar el mensaje de doble verificación, monitoreo continuo y ZeroVision como capa diferencial.',
    recommendation: 'Se sugiere reforzar Meta lead ads en torno a vacaciones seguras y protección de negocio, y amplificar Google Search en términos de "alarma para casa" y "alarma para negocio" durante la ventana estacional.'
  };

  const insights = generateInsights();

  const ga4Pages = [
    { page: '/', title: 'Verisure Perú. Alarmas con monitoreo continuo', views: 25000, sessions: 20800, avgTime: '2:52', bounceRate: 30, conversions: 600, convRate: 2.40 },
    { page: '/precio-alarma', title: 'Cotiza tu alarma Verisure', views: 15000, sessions: 12400, avgTime: '3:25', bounceRate: 22, conversions: 870, convRate: 5.80 },
    { page: '/nuestra-alarma', title: 'Cómo funciona la alarma Verisure', views: 12000, sessions: 9800, avgTime: '3:08', bounceRate: 28, conversions: 410, convRate: 3.40 },
    { page: '/alarmas-negocio', title: 'Alarmas para negocio y comercio', views: 10000, sessions: 8200, avgTime: '3:14', bounceRate: 26, conversions: 460, convRate: 4.60 },
    { page: '/servicios/zerovision', title: 'ZeroVision. Neutralización por niebla', views: 8000, sessions: 6600, avgTime: '2:40', bounceRate: 34, conversions: 160, convRate: 2.00 },
    { page: '/servicios/camaras', title: 'Cámaras de videovigilancia Verisure', views: 7200, sessions: 5900, avgTime: '2:48', bounceRate: 32, conversions: 215, convRate: 2.98 },
    { page: '/cobertura-lima', title: 'Cobertura Verisure en Lima', views: 5400, sessions: 4500, avgTime: '2:32', bounceRate: 36, conversions: 110, convRate: 2.04 },
    { page: '/guardian-verisure', title: 'Guardián Verisure con botón SOS', views: 4800, sessions: 4000, avgTime: '2:20', bounceRate: 38, conversions: 95, convRate: 1.98 },
    { page: '/preguntas-frecuentes', title: 'Preguntas frecuentes', views: 4200, sessions: 3500, avgTime: '4:05', bounceRate: 32, conversions: 60, convRate: 1.43 },
    { page: '/atencion-cliente', title: 'Atención al cliente Verisure', views: 2800, sessions: 2300, avgTime: '2:05', bounceRate: 45, conversions: 40, convRate: 1.43 },
  ];

  const tiktokHashtags = [
    { hashtag: '#SeguridadEnElHogar', views: '6,4M', posts: '28,4K', growth: '+36%', region: 'Perú', engagement: 8.2 },
    { hashtag: '#CamarasDeSeguridad', views: '5,8M', posts: '21,2K', growth: '+32%', region: 'Perú', engagement: 8.0 },
    { hashtag: '#SeguridadCiudadana', views: '4,7M', posts: '18,6K', growth: '+28%', region: 'Perú', engagement: 7.6 },
    { hashtag: '#RobosEnLima', views: '3,2M', posts: '9,4K', growth: '+44%', region: 'Perú', engagement: 8.4 },
    { hashtag: '#Verisure', views: '185K', posts: '620', growth: '+58%', region: 'Perú', engagement: 8.6 },
    { hashtag: '#ProtegeTuFamilia', views: '1,9M', posts: '7,2K', growth: '+24%', region: 'LATAM', engagement: 7.4 },
    { hashtag: '#NegocioSeguro', views: '780K', posts: '3,4K', growth: '+22%', region: 'Perú', engagement: 7.0 },
    { hashtag: '#LimaPeru', views: '8,7M', posts: '34,5K', growth: '+12%', region: 'Perú', engagement: 7.8 },
  ];

  const tiktokSounds = [
    { name: 'Las Limeñitas (orgullo limeño)', type: 'Local PE', usage: '1,4M', trend: '+24%' },
    { name: 'POV ruido en la noche (suspense)', type: 'Suspense', usage: '820K', trend: '+42%' },
    { name: 'Pelotero a la Bola (reedición)', type: 'Familia', usage: '1,3M', trend: '+16%' },
    { name: 'Voiceover narrativo PE seguridad', type: 'Storytime', usage: '210K', trend: '+34%' },
    { name: 'Audio evergreen Kreepa (humor)', type: 'Humor', usage: '920K', trend: '+12%' },
    { name: 'Beat estacional fin de año Perú', type: 'Estacional', usage: '340K', trend: '+58%' },
  ];

  const metaTopics = [
    { topic: 'Inseguridad ciudadana y protección del hogar', mentions: 18420, engagement: 8.6, sentiment: 62, growth: '+58%', brands: 'Prosegur, Verisure, Securitas, Liderman' },
    { topic: 'Cámaras de seguridad y videovigilancia', mentions: 12680, engagement: 8.2, sentiment: 82, growth: '+44%', brands: 'Verisure, Prosegur, Liderman, Hikvision' },
    { topic: 'Extorsión y protección de negocios', mentions: 8540, engagement: 7.8, sentiment: 46, growth: '+62%', brands: 'Asoc. Bodegueros, Verisure, Prosegur, Cám. Comercio' },
    { topic: 'Vacaciones, viajes y hogar protegido', mentions: 5980, engagement: 7.4, sentiment: 84, growth: '+34%', brands: 'Verisure, Prosegur, Indecopi, Mininter' },
    { topic: 'Tecnología y monitoreo continuo', mentions: 3640, engagement: 7.0, sentiment: 80, growth: '+28%', brands: 'Verisure, Prosegur, Ajax Systems, Alarm.com' },
    { topic: 'Comparativas operadores de alarmas', mentions: 2180, engagement: 6.4, sentiment: 70, growth: '+18%', brands: 'Verisure, Prosegur, Securitas, Liderman' },
  ];

  const metaAdPerformance = [
    { campaign: 'Meta Lead Ads Hogar Familiar Lima Moderna', platform: 'Instagram', reach: 1350000, clicks: 19800, ctr: 1.47, cpl: 21.67, status: 'Activa' },
    { campaign: 'Google Search Categoría y Brand', platform: 'Google Search', reach: 0, clicks: 14200, ctr: 4.20, cpl: 36.52, status: 'Activa' },
    { campaign: 'YouTube TrueView Brand Verisure Lima', platform: 'YouTube', reach: 620000, clicks: 4800, ctr: 0.77, cpl: 75.00, status: 'Activa' },
    { campaign: 'TikTok Spark Negocio PyME y Hogar 30 a 45', platform: 'TikTok', reach: 410000, clicks: 7200, ctr: 1.76, cpl: 52.50, status: 'En prueba' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header & Score Summary */}
      <div className="bg-fitzone-charcoal rounded-2xl shadow-fitzone-lg p-4 sm:p-6 lg:p-8 text-white border border-fitzone-purple/20">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-fitzone-purple rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-xl font-bold mb-1">
                  Capa de Data. Captura de Señales
                </h2>
                <p className="text-fitzone-textGray text-xs sm:text-base">
                  Monitoreo en tiempo real del ecosistema digital de seguridad y alarmas en Lima
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 bg-fitzone-cyan/20 text-fitzone-cyan px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-semibold">Sem {weekPeriod.weekNumber}</span>
              <span className="text-[10px] sm:text-xs opacity-80 hidden xs:inline">| {weekPeriod.range}</span>
            </div>
            <div className="text-right">
              <p className="text-fitzone-textGray text-[10px] sm:text-xs uppercase font-semibold mb-0.5 sm:mb-1">Score Global</p>
              <p className="text-2xl sm:text-3xl font-bold text-fitzone-purple">{scores.overall}</p>
              <p className="text-[10px] sm:text-xs text-fitzone-textGray">de 10.0</p>
            </div>
            <button
              onClick={loadData}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-fitzone-purple/20 text-fitzone-lightPurple rounded-lg hover:bg-fitzone-purple/30 transition disabled:opacity-50 text-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>
        </div>

        {/* Data Sources Status */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-fitzone-slate rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-fitzone-emerald rounded-full"></div>
            <span className="text-[10px] sm:text-xs text-fitzone-textGray">Trends</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 bg-fitzone-slate rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-fitzone-emerald rounded-full"></div>
            <span className="text-[10px] sm:text-xs text-fitzone-textGray">TikTok</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 bg-fitzone-slate rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-fitzone-emerald rounded-full"></div>
            <span className="text-[10px] sm:text-xs text-fitzone-textGray">Meta</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 bg-fitzone-slate rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-fitzone-emerald rounded-full"></div>
            <span className="text-[10px] sm:text-xs text-fitzone-textGray">GA4</span>
          </div>
          {lastRefresh && (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-fitzone-slate rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 ml-auto">
              <span className="text-[10px] sm:text-xs text-fitzone-textGray">
                {lastRefresh.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Insights Clave del Mercado */}
      <div className="bg-fitzone-slate rounded-2xl shadow-fitzone-lg p-4 sm:p-6 lg:p-8 border border-fitzone-purple/10">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-fitzone-purple rounded-xl flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-lg font-bold text-white">Insights Clave del Mercado de Seguridad</h3>
            <p className="text-xs sm:text-sm text-fitzone-textGray">Análisis automático y multifuente</p>
          </div>
        </div>

        {/* Individual Source Insights - 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
          {insights.map((insight, idx) => {
            const colorScheme =
              insight.source === 'Google Trends' ? { bg: 'bg-platform-google/10', text: 'text-platform-google', icon: 'bg-platform-google', badge: 'bg-platform-google/20 text-platform-google' } :
              insight.source === 'TikTok' ? { bg: 'bg-platform-tiktok/10', text: 'text-fitzone-lightGray', icon: 'bg-platform-tiktok', badge: 'bg-fitzone-textGray/20 text-fitzone-lightGray' } :
              insight.source === 'Meta' ? { bg: 'bg-platform-meta/10', text: 'text-platform-meta', icon: 'bg-platform-meta', badge: 'bg-platform-meta/20 text-platform-meta' } :
              insight.source === 'GA4' ? { bg: 'bg-platform-ga4/10', text: 'text-platform-ga4', icon: 'bg-platform-ga4', badge: 'bg-platform-ga4/20 text-platform-ga4' } :
              { bg: 'bg-fitzone-cyan/10', text: 'text-fitzone-cyan', icon: 'bg-fitzone-cyan', badge: 'bg-fitzone-cyan/20 text-fitzone-cyan' };

            const sourceScore =
              insight.source === 'Google Trends' ? scores.search :
              insight.source === 'TikTok' ? scores.trend :
              insight.source === 'Meta' ? scores.social :
              insight.source === 'GA4' ? scores.intent : null;

            const InsightIcon = insight.IconComponent || Lightbulb;

            return (
              <div key={idx} className={`relative ${colorScheme.bg} rounded-xl p-3 sm:p-5 border border-fitzone-slate hover:border-fitzone-purple/30 transition-all duration-300`}>
                <div className="flex items-start gap-2 sm:gap-4">
                  <div className={`w-9 h-9 sm:w-12 sm:h-12 ${colorScheme.icon} rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <InsightIcon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                      <p className={`text-[10px] sm:text-xs font-bold ${colorScheme.text} uppercase tracking-wider`}>{insight.source}</p>
                      {sourceScore && (
                        <span className={`${colorScheme.badge} px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold`}>
                          {sourceScore}/10
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-fitzone-lightGray leading-relaxed font-medium">{insight.text}</p>
                  </div>
                </div>
                <div className={`absolute top-0 left-0 w-1 h-full ${colorScheme.icon} rounded-l-xl`}></div>
              </div>
            );
          })}
        </div>

        {/* Multi-Source Analysis */}
        <div className="relative bg-fitzone-purple/15 rounded-xl p-3 sm:p-6 border border-fitzone-purple/30">
          <div className="flex items-start gap-2 sm:gap-4">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-fitzone-purple rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <Layers className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <p className="text-xs sm:text-sm font-bold text-fitzone-lightPurple uppercase tracking-wider">{multiSourceInsight.source}</p>
                <span className="bg-fitzone-purple/30 text-fitzone-lightPurple px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold">
                  Consolidado
                </span>
              </div>
              <p className="text-xs sm:text-sm text-fitzone-lightGray leading-relaxed mb-2 sm:mb-3">{multiSourceInsight.text}</p>
              <div className="bg-fitzone-charcoal/50 rounded-lg p-2 sm:p-3 border border-fitzone-purple/20">
                <p className="text-xs sm:text-sm text-fitzone-emerald font-semibold flex items-start sm:items-center gap-1.5 sm:gap-2">
                  <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <span>{multiSourceInsight.recommendation}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-1 sm:w-1.5 h-full bg-fitzone-purple rounded-l-xl"></div>
        </div>
      </div>

      {/* Google Trends Section */}
      <div className="bg-fitzone-slate rounded-xl shadow-lg overflow-hidden border border-fitzone-purple/10">
        <button
          onClick={() => toggleSection('trends')}
          className="w-full bg-platform-google text-white p-3 sm:p-4 flex items-center justify-between hover:brightness-110 transition"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <GoogleIcon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" size={24} />
            <div className="text-left min-w-0">
              <h3 className="text-sm sm:text-base font-bold">Google Trends</h3>
              <p className="text-[10px] sm:text-xs text-white/90">Keywords del sector seguridad. Score: {scores.search}/10</p>
            </div>
          </div>
          {expandedSections.trends ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
        </button>

        {expandedSections.trends && (
          <div className="p-3 sm:p-6 space-y-3 sm:space-y-4 bg-fitzone-charcoal">
            <div className="bg-fitzone-cyan/10 border border-fitzone-cyan/30 rounded-lg p-3 sm:p-4 flex gap-2 sm:gap-3">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-fitzone-cyan flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-fitzone-lightGray">
                <p className="font-semibold mb-1 text-fitzone-cyan">Cómo se calcula el score:</p>
                <p>Promedio del "interés de búsqueda" (0 a 100) de keywords del sector seguridad y alarmas monitoreadas en Perú.</p>
                <p className="mt-2 text-[10px] sm:text-xs text-fitzone-textGray hidden sm:block">
                  <strong>Fuente:</strong> Google Trends API (Perú). <strong>Actualización:</strong> Semanal
                </p>
              </div>
            </div>

            <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
              <table className="w-full min-w-[400px]">
                <thead className="bg-fitzone-slate border-b border-fitzone-purple/20">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase">Término</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase">Interés</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase">Crec.</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase">Tendencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fitzone-slate">
                  {[
                    { keyword: 'camaras de seguridad', interest: 92, growth: '+28%', trend: 'rising' },
                    { keyword: 'alarma para casa', interest: 88, growth: '+34%', trend: 'rising' },
                    { keyword: 'prosegur alarmas', interest: 78, growth: '+14%', trend: 'stable' },
                    { keyword: 'alarmas monitoreadas', interest: 74, growth: '+30%', trend: 'rising' },
                    { keyword: 'alarma para negocio', interest: 70, growth: '+38%', trend: 'rising' },
                    { keyword: 'verisure peru', interest: 68, growth: '+42%', trend: 'rising' },
                    { keyword: 'monitoreo 24 horas', interest: 60, growth: '+22%', trend: 'rising' },
                    { keyword: 'seguridad para bodega', interest: 54, growth: '+44%', trend: 'rising' },
                  ].map((kw, idx) => (
                    <tr key={idx} className="hover:bg-fitzone-slate/50 transition">
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white">{kw.keyword}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                        <span className="text-xs sm:text-sm font-bold text-fitzone-cyan">{kw.interest}/100</span>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                        <span className="text-xs sm:text-sm font-bold text-fitzone-emerald">{kw.growth}</span>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full ${
                          kw.trend === 'rising' ? 'bg-fitzone-emerald/20 text-fitzone-emerald' : 'bg-fitzone-slate text-fitzone-textGray'
                        }`}>
                          {kw.trend === 'rising' ? '↑' : '·'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* TikTok Section */}
      <div className="bg-fitzone-slate rounded-xl shadow-lg overflow-hidden border border-fitzone-purple/10">
        <button
          onClick={() => toggleSection('tiktok')}
          className="w-full bg-platform-tiktok text-white p-3 sm:p-4 flex items-center justify-between hover:brightness-125 transition"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <TikTokIcon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" size={24} />
            <div className="text-left min-w-0">
              <h3 className="text-sm sm:text-base font-bold">TikTok Creative Center</h3>
              <p className="text-[10px] sm:text-xs text-white/90">Hashtags virales. Score: {scores.trend}/10</p>
            </div>
          </div>
          {expandedSections.tiktok ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
        </button>

        {expandedSections.tiktok && (
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-fitzone-charcoal">
            <div className="bg-fitzone-emerald/10 border border-fitzone-emerald/30 rounded-lg p-3 sm:p-4 flex gap-2 sm:gap-3">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-fitzone-emerald flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-fitzone-lightGray">
                <p className="font-semibold mb-1 text-fitzone-emerald">Cómo se calcula el score:</p>
                <p>Promedio del "relevance score" (0 a 100) de hashtags de seguridad y hogar protegido virales en Perú.</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fitzone-emerald" />
                Hashtags Trending Seguridad y Hogar Protegido
              </h4>
              <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                <table className="w-full min-w-[450px]">
                  <thead className="bg-fitzone-slate border-b border-fitzone-purple/20">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase">Hashtag</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase">Vistas</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase hidden sm:table-cell">Posts</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase">Crec.</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase">Región</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-fitzone-slate">
                    {tiktokHashtags.map((tag, idx) => (
                      <tr key={idx} className="hover:bg-fitzone-slate/50 transition">
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white">{tag.hashtag}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                          <span className="text-xs sm:text-sm font-bold text-fitzone-emerald">{tag.views}</span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center hidden sm:table-cell">
                          <span className="text-xs sm:text-sm text-fitzone-textGray">{tag.posts}</span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                          <span className="text-xs sm:text-sm font-bold text-fitzone-emerald">{tag.growth}</span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                          <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full ${
                            tag.region === 'Perú' ? 'bg-fitzone-emerald/20 text-fitzone-emerald' :
                            tag.region === 'LATAM' ? 'bg-fitzone-purple/20 text-fitzone-lightPurple' :
                            'bg-fitzone-slate text-fitzone-textGray'
                          }`}>
                            <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span className="hidden sm:inline">{tag.region}</span>
                            <span className="sm:hidden">{tag.region === 'Global' ? 'GL' : tag.region === 'LATAM' ? 'LA' : 'PE'}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">
                <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fitzone-emerald" />
                Sonidos Trending para Contenido Verisure
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                {tiktokSounds.map((sound, idx) => (
                  <div key={idx} className="bg-fitzone-slate rounded-xl p-3 sm:p-4 border border-fitzone-emerald/20 hover:border-fitzone-emerald/40 transition">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-fitzone-emerald rounded-lg flex items-center justify-center flex-shrink-0">
                        <Music className="w-4 h-4 sm:w-5 sm:h-5 text-fitzone-charcoal" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs sm:text-sm font-semibold text-white truncate">{sound.name}</h5>
                        <p className="text-[10px] sm:text-xs text-fitzone-textGray">{sound.type}</p>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                          <span className="text-[10px] sm:text-xs font-medium text-fitzone-emerald">{sound.usage}</span>
                          <span className="text-[10px] sm:text-xs text-fitzone-purple">{sound.trend}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Meta Section */}
      <div className="bg-fitzone-slate rounded-xl shadow-lg overflow-hidden border border-fitzone-purple/10">
        <button
          onClick={() => toggleSection('meta')}
          className="w-full bg-platform-meta text-white p-3 sm:p-4 flex items-center justify-between hover:brightness-110 transition"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <MetaIcon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" size={24} />
            <div className="text-left min-w-0">
              <h3 className="text-sm sm:text-base font-bold">Meta / Facebook</h3>
              <p className="text-[10px] sm:text-xs text-white/90">Redes sociales. Score: {scores.social}/10</p>
            </div>
          </div>
          {expandedSections.meta ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
        </button>

        {expandedSections.meta && (
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-fitzone-charcoal">
            <div className="bg-fitzone-purple/10 border border-fitzone-purple/30 rounded-lg p-3 sm:p-4 flex gap-2 sm:gap-3">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-fitzone-lightPurple flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-fitzone-lightGray">
                <p className="font-semibold mb-1 text-fitzone-lightPurple">Cómo se calcula el score:</p>
                <p>Promedio del "engagement score" (0 a 10) de temas de seguridad y hogar protegido en Facebook e Instagram.</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fitzone-lightPurple" />
                Temas Trending en Redes Sociales
              </h4>
              <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                <table className="w-full min-w-[500px]">
                  <thead className="bg-fitzone-slate border-b border-fitzone-purple/20">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase">Tema</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase">Menc.</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase">Eng.</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase">Sent.</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase">Crec.</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase hidden lg:table-cell">Marcas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-fitzone-slate">
                    {metaTopics.map((topic, idx) => (
                      <tr key={idx} className="hover:bg-fitzone-slate/50 transition">
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white">{topic.topic}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                          <span className="text-xs sm:text-sm font-bold text-fitzone-lightPurple">{(topic.mentions / 1000).toFixed(0)}K</span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                          <span className="text-xs sm:text-sm font-bold text-white">{formatES(topic.engagement, 1)}</span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full ${
                            topic.sentiment >= 80 ? 'bg-fitzone-emerald/20 text-fitzone-emerald' :
                            topic.sentiment >= 60 ? 'bg-fitzone-amber/20 text-fitzone-amber' :
                            'bg-fitzone-red/20 text-fitzone-red'
                          }`}>
                            {topic.sentiment}%
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                          <span className="text-xs sm:text-sm font-bold text-fitzone-emerald">{topic.growth}</span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-fitzone-textGray hidden lg:table-cell">{topic.brands}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fitzone-lightPurple" />
                Rendimiento de Campañas Activas
              </h4>
              <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                <table className="w-full min-w-[500px]">
                  <thead className="bg-fitzone-slate border-b border-fitzone-purple/20">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase">Campaña</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase hidden sm:table-cell">Platf.</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase">Alcance</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase hidden sm:table-cell">Clicks</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase">CTR</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase">CPL</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-fitzone-slate">
                    {metaAdPerformance.map((ad, idx) => (
                      <tr key={idx} className="hover:bg-fitzone-slate/50 transition">
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white">{ad.campaign}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-fitzone-textGray hidden sm:table-cell">{ad.platform}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                          <span className="text-xs sm:text-sm text-white">{(ad.reach / 1000).toFixed(0)}K</span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center hidden sm:table-cell">
                          <span className="text-xs sm:text-sm text-white">{ad.clicks.toLocaleString('en-US')}</span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                          <span className={`text-xs sm:text-sm font-bold ${ad.ctr >= 1.5 ? 'text-fitzone-emerald' : 'text-fitzone-amber'}`}>{formatPercent(ad.ctr, 2)}</span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                          <span className={`text-xs sm:text-sm font-bold ${ad.cpl <= 25 ? 'text-fitzone-emerald' : ad.cpl <= 40 ? 'text-fitzone-amber' : 'text-fitzone-red'}`}>{formatMoney(ad.cpl)}</span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full ${
                            ad.status === 'Activa' ? 'bg-fitzone-emerald/20 text-fitzone-emerald' : 'bg-fitzone-slate text-fitzone-textGray'
                          }`}>
                            {ad.status === 'Activa' ? '●' : '○'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GA4 Section */}
      <div className="bg-fitzone-slate rounded-xl shadow-lg overflow-hidden border border-fitzone-purple/10">
        <button
          onClick={() => toggleSection('ga4')}
          className="w-full bg-platform-ga4 text-white p-3 sm:p-4 flex items-center justify-between hover:brightness-110 transition"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <GoogleAnalyticsIcon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" size={24} />
            <div className="text-left min-w-0">
              <h3 className="text-sm sm:text-base font-bold">Google Analytics 4</h3>
              <p className="text-[10px] sm:text-xs text-white/90">Conversión. Score: {scores.intent}/10</p>
            </div>
          </div>
          {expandedSections.ga4 ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
        </button>

        {expandedSections.ga4 && (
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-fitzone-charcoal">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              <div className="bg-fitzone-slate rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fitzone-textGray" />
                  <p className="text-[10px] sm:text-xs text-fitzone-textGray">Usuarios</p>
                </div>
                <p className="text-lg sm:text-xl font-bold text-white">56,8K</p>
                <p className="text-[10px] sm:text-xs text-fitzone-emerald">+24%</p>
              </div>
              <div className="bg-fitzone-slate rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fitzone-textGray" />
                  <p className="text-[10px] sm:text-xs text-fitzone-textGray">Sesiones</p>
                </div>
                <p className="text-lg sm:text-xl font-bold text-white">70K</p>
                <p className="text-[10px] sm:text-xs text-fitzone-emerald">+28%</p>
              </div>
              <div className="bg-fitzone-slate rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                  <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fitzone-textGray" />
                  <p className="text-[10px] sm:text-xs text-fitzone-textGray">Cotizaciones</p>
                </div>
                <p className="text-lg sm:text-xl font-bold text-fitzone-purple">1.500</p>
                <p className="text-[10px] sm:text-xs text-fitzone-emerald">+18,2%</p>
              </div>
              <div className="bg-fitzone-slate rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fitzone-textGray" />
                  <p className="text-[10px] sm:text-xs text-fitzone-textGray">Conv.</p>
                </div>
                <p className="text-lg sm:text-xl font-bold text-fitzone-emerald">2,14%</p>
                <p className="text-[10px] sm:text-xs text-fitzone-textGray">Target: 1,80%</p>
              </div>
            </div>

            {/* Device & Traffic Source */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-fitzone-slate rounded-lg p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fitzone-amber" />
                  Dispositivos
                </h4>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-fitzone-textGray">Mobile</span>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-20 sm:w-32 h-1.5 sm:h-2 bg-fitzone-charcoal rounded-full overflow-hidden">
                        <div className="h-full bg-fitzone-purple rounded-full" style={{ width: '80%' }}></div>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-white w-8 text-right">80%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-fitzone-textGray">Desktop</span>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-20 sm:w-32 h-1.5 sm:h-2 bg-fitzone-charcoal rounded-full overflow-hidden">
                        <div className="h-full bg-fitzone-cyan rounded-full" style={{ width: '16%' }}></div>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-white w-8 text-right">16%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-fitzone-textGray">Tablet</span>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-20 sm:w-32 h-1.5 sm:h-2 bg-fitzone-charcoal rounded-full overflow-hidden">
                        <div className="h-full bg-fitzone-emerald rounded-full" style={{ width: '4%' }}></div>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-white w-8 text-right">4%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-fitzone-slate rounded-lg p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fitzone-amber" />
                  Fuentes de Tráfico
                </h4>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-fitzone-textGray">Google Ads</span>
                    <span className="text-xs sm:text-sm font-bold text-fitzone-purple">35%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-fitzone-textGray">Meta Ads</span>
                    <span className="text-xs sm:text-sm font-bold text-white">30%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-fitzone-textGray">Orgánico</span>
                    <span className="text-xs sm:text-sm font-bold text-white">22%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-fitzone-textGray">Directo</span>
                    <span className="text-xs sm:text-sm font-bold text-white">9%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-fitzone-textGray">Referidos</span>
                    <span className="text-xs sm:text-sm font-bold text-white">4%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pages Table */}
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fitzone-amber" />
                Páginas de verisure.pe
              </h4>
              <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                <table className="w-full min-w-[550px]">
                  <thead className="bg-fitzone-slate border-b border-fitzone-purple/20">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase">Página</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase">Vistas</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase hidden sm:table-cell">Tiempo</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase hidden lg:table-cell">Rebote</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase">Conv.</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-fitzone-textGray uppercase">Tasa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-fitzone-slate">
                    {ga4Pages.slice(0, 6).map((page, idx) => (
                      <tr key={idx} className="hover:bg-fitzone-slate/50 transition">
                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-white truncate max-w-[120px] sm:max-w-none">{page.title}</p>
                            <p className="text-[10px] sm:text-xs text-fitzone-textGray hidden sm:block">{page.page}</p>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                          <span className="text-xs sm:text-sm text-white">{formatES(page.views / 1000, 1)}K</span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center hidden sm:table-cell">
                          <span className="text-xs sm:text-sm text-white">{page.avgTime}</span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center hidden lg:table-cell">
                          <span className={`text-xs sm:text-sm ${page.bounceRate <= 30 ? 'text-fitzone-emerald' : page.bounceRate <= 40 ? 'text-fitzone-amber' : 'text-fitzone-red'}`}>{page.bounceRate}%</span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                          <span className="text-xs sm:text-sm font-bold text-fitzone-purple">{formatThousands(page.conversions)}</span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                          <span className={`text-xs sm:text-sm font-bold ${page.convRate >= 2.5 ? 'text-fitzone-emerald' : 'text-white'}`}>{formatPercent(page.convRate, 2)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Keywords Reference */}
      <div className="bg-fitzone-purple rounded-xl p-4 sm:p-6 text-white">
        <h3 className="text-sm sm:text-base font-bold mb-3 sm:mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
          Keywords Monitoreadas. Verisure
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <p className="text-xs sm:text-sm text-white/70 mb-1.5 sm:mb-2 font-semibold">Marca Verisure:</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 rounded-full text-xs sm:text-sm">Verisure</span>
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 rounded-full text-xs sm:text-sm">ZeroVision</span>
            </div>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-white/70 mb-1.5 sm:mb-2 font-semibold">Categoría seguridad:</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 rounded-full text-xs sm:text-sm">Alarma para casa</span>
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 rounded-full text-xs sm:text-sm">Cámaras de seguridad</span>
            </div>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-white/70 mb-1.5 sm:mb-2 font-semibold">Competencia:</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 rounded-full text-xs sm:text-sm">Prosegur</span>
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 rounded-full text-xs sm:text-sm">Securitas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
