// Configuración general de The Algorithm by Reset
// Textos, mensajes, secciones y configuración de UI

// ============================================================================
// BRAND CONFIGURATION - Configuración de producto y cliente
// ============================================================================
export const BRAND_CONFIG = {
  name: 'The Algorithm by Reset',
  tagline: 'WIN Awareness Intelligence Platform',
  subtitle: 'Optimización de inversión digital para recordación de marca de WIN',
  product: 'Campaña de Marca WIN 2026',
  market: 'Perú (foco Lima Metropolitana)',
  client: 'WIN',
  agency: 'Reset Agency',
  isTemplate: false,
  version: '1.0.0',
  slogan: 'Internet 100% fibra óptica',
  founded: 2017,
};

// ============================================================================
// LAYER TITLES - Títulos y descripciones de las 4 capas
// ============================================================================
export const LAYER_CONFIG = {
  data: {
    id: 'data',
    name: 'Captura de Señales',
    subtitle: 'Monitoreo en tiempo real del ecosistema digital telco y fibra óptica',
    description: 'Búsqueda, Tendencia, Intención, Engagement',
    icon: 'Search',
    color: 'from-fitzone-orange to-fitzone-darkOrange',
  },
  decision: {
    id: 'decision',
    name: 'Inteligencia de Mercado',
    subtitle: 'Insights automáticos para optimizar inversión en recordación de marca',
    description: 'Análisis y definición de estrategia',
    icon: 'Target',
    color: 'from-fitzone-darkOrange to-fitzone-electric',
  },
  execution: {
    id: 'execution',
    name: 'Activación Estratégica',
    subtitle: 'Distribución inteligente de presupuesto, zonas y contenidos',
    description: 'Implementación en tiempo real',
    icon: 'Zap',
    color: 'from-fitzone-electric to-fitzone-lime',
  },
  optimization: {
    id: 'optimization',
    name: 'Performance & Optimización',
    subtitle: 'Resultados de awareness en tiempo real y ajustes automáticos',
    description: 'Evaluación y redistribución',
    icon: 'TrendingUp',
    color: 'from-fitzone-lime to-fitzone-orange',
  },
};

// ============================================================================
// KEY MESSAGES - Mensajes clave de comunicación WIN
// ============================================================================
export const KEY_MESSAGES = {
  fibra_pura: {
    title: 'Fibra 100% óptica hasta el hogar',
    message: 'Tecnología FTTH pura, sin tramos de cobre, con velocidad estable',
    description: 'Internet diseñado para el consumo digital actual',
  },
  velocidad_simetrica: {
    title: 'Velocidad simétrica 1:1',
    message: 'La misma velocidad de bajada y de subida en todos los planes',
    description: 'Ideal para teletrabajo, streaming y videollamadas',
  },
  satisfaccion_lider: {
    title: 'Líder en satisfacción al cliente',
    message: 'Reconocidos por OSIPTEL como el operador con mejor experiencia de servicio en fibra',
    description: 'Atención técnica local con soporte cercano',
  },
  instalacion_incluida: {
    title: 'Instalación gratuita incluida',
    message: 'Sin costo de instalación, equipo entregado y configurado en el hogar',
    description: 'Activación rápida, normalmente en pocos días',
  },
  cobertura_lima: {
    title: 'Cobertura en 40+ distritos de Lima',
    message: 'Red propia desplegada en Lima Metropolitana y 11 provincias del país',
    description: 'Una red en expansión continua',
  },
};

// ============================================================================
// DATA SOURCES - Configuración de fuentes de datos
// ============================================================================
export const DATA_SOURCES_CONFIG = {
  googleTrends: {
    enabled: true,
    name: 'Google Trends',
    description: 'Tendencias de búsqueda de internet hogar y fibra óptica en tiempo real',
    icon: 'TrendingUp',
    color: 'text-fitzone-electric',
    bgColor: 'bg-fitzone-slate',
    region: 'PE',
    category: 'Internet & Telecom',
    interval: 'hourly',
    status: 'active',
    geo: ['Lima', 'Callao', 'Arequipa', 'Trujillo'],
  },
  tiktok: {
    enabled: true,
    name: 'TikTok',
    description: 'Contenido viral telco, lifestyle digital y hashtags trending',
    icon: 'Video',
    color: 'text-fitzone-lime',
    bgColor: 'bg-fitzone-slate',
    scraping: 'public',
    status: 'active',
  },
  meta: {
    enabled: true,
    name: 'Meta Platforms',
    description: 'Facebook e Instagram insights del sector telco e internet hogar',
    icon: 'Share2',
    color: 'text-fitzone-electric',
    bgColor: 'bg-fitzone-slate',
    platforms: ['Facebook', 'Instagram'],
    status: 'active',
  },
  youtube: {
    enabled: true,
    name: 'YouTube',
    description: 'Reseñas de operadores, tests de velocidad y contenido educativo',
    icon: 'Youtube',
    color: 'text-fitzone-orange',
    bgColor: 'bg-fitzone-slate',
    status: 'active',
  },
  telco: {
    enabled: true,
    name: 'Portales del Sector',
    description: 'OSIPTEL, MTC y reportes públicos de telecomunicaciones en Perú',
    icon: 'Globe',
    color: 'text-fitzone-lime',
    bgColor: 'bg-fitzone-slate',
    sources: ['OSIPTEL', 'MTC', 'IAB Perú', 'IPSOS Perú'],
    status: 'active',
  },
  ga4: {
    enabled: false,
    name: 'Google Analytics 4',
    description: 'Tráfico web y consultas de planes',
    icon: 'BarChart3',
    color: 'text-fitzone-orange',
    bgColor: 'bg-fitzone-slate',
    mock_data: true,
    status: 'active',
  },
};

// ============================================================================
// CHANNELS - Canales de activación pagada
// ============================================================================
export const CHANNELS_CONFIG = {
  meta_ads: {
    name: 'Meta Ads',
    icon: 'Share2',
    color: 'text-fitzone-electric',
    bgColor: 'bg-fitzone-slate',
    primary_kpi: 'Alcance + Interacciones',
    description: 'Instagram y Facebook Ads orientados a awareness',
    subchannels: ['Reach campaigns', 'Engagement', 'Reels Ads'],
  },
  google_search: {
    name: 'Google Search',
    icon: 'Search',
    color: 'text-fitzone-lime',
    bgColor: 'bg-fitzone-slate',
    primary_kpi: 'Búsquedas de marca',
    description: 'Campañas Brand y categoría fibra óptica',
  },
  google_display: {
    name: 'Google Display',
    icon: 'Monitor',
    color: 'text-fitzone-orange',
    bgColor: 'bg-fitzone-slate',
    primary_kpi: 'Alcance + Frecuencia',
    description: 'Red de display contextual y geo Lima',
  },
  youtube: {
    name: 'YouTube',
    icon: 'Youtube',
    color: 'text-fitzone-orange',
    bgColor: 'bg-fitzone-slate',
    primary_kpi: 'Recordación + Consideración',
    description: 'Bumpers, in-stream y shorts para awareness',
  },
  tiktok_ads: {
    name: 'TikTok Ads',
    icon: 'Video',
    color: 'text-fitzone-lime',
    bgColor: 'bg-fitzone-slate',
    primary_kpi: 'Alcance audiencia joven',
    description: 'Spark Ads y TopView para audiencia 18-30',
  },
};

// ============================================================================
// SEDES - Centros de atención WIN en Lima Metropolitana y Callao
// ============================================================================
export const SEDES_CONFIG = [
  { id: 1, nombre: 'WIN Sede Central', distrito: 'Surquillo', nse: 'A/B', size: 'Corporativa', type: 'Sede principal' },
  { id: 2, nombre: 'WIN Surco', distrito: 'Santiago de Surco', nse: 'A/B', size: 'Premium', type: 'Centro de atención' },
  { id: 3, nombre: 'WIN Miraflores', distrito: 'Miraflores', nse: 'A', size: 'Premium', type: 'Centro de atención' },
  { id: 4, nombre: 'WIN San Miguel', distrito: 'San Miguel', nse: 'B', size: 'Estándar', type: 'Centro de atención' },
  { id: 5, nombre: 'WIN La Molina', distrito: 'La Molina', nse: 'A/B', size: 'Premium', type: 'Centro de atención' },
  { id: 6, nombre: 'WIN Los Olivos', distrito: 'Los Olivos', nse: 'B/C+', size: 'Estándar', type: 'Centro de atención' },
  { id: 7, nombre: 'WIN San Juan de Lurigancho', distrito: 'San Juan de Lurigancho', nse: 'C+/B', size: 'Estándar', type: 'Centro de atención' },
  { id: 8, nombre: 'WIN San Juan de Miraflores', distrito: 'San Juan de Miraflores', nse: 'C+/B', size: 'Estándar', type: 'Centro de atención' },
  { id: 9, nombre: 'WIN Comas', distrito: 'Comas', nse: 'C+/B', size: 'Estándar', type: 'Centro de atención' },
  { id: 10, nombre: 'WIN Callao', distrito: 'Bellavista (Callao)', nse: 'B/C+', size: 'Estándar', type: 'Centro de atención' },
];

// ============================================================================
// AUDIENCES - Audiencias objetivo (exactamente 2 perfiles principales)
// ============================================================================
export const TARGET_AUDIENCES = [
  {
    id: 'joven_lima_moderna',
    name: 'Joven Conectado Lima Moderna',
    description: '25-39 años, NSE A/B, distritos de Lima Moderna, alto consumo digital',
    size: '~620.000',
    age_range: '25-39',
    priority: 'high',
    segments: [
      {
        name: 'Profesional millennial digital',
        size: '~340.000',
        age: '25-32',
        characteristics: ['Teletrabajo y streaming intensivo', 'Decisión individual de contratación', 'Compara velocidades antes que precio'],
      },
      {
        name: 'Adulto joven gamer y creador',
        size: '~280.000',
        age: '28-39',
        characteristics: ['Gaming online y video en alta resolución', 'Valora velocidad de subida (simétrica)', 'Influenciado por reseñas en YouTube y TikTok'],
      },
    ],
    interests: ['Tecnología', 'Streaming', 'Gaming', 'Smart home', 'Teletrabajo'],
    message: 'Velocidad simétrica para teletrabajar, transmitir y jugar sin esperas',
    channels: {
      'Meta Ads': 50,
      'Google Display': 18,
      'YouTube': 18,
      'TikTok Ads': 14,
    },
    engagement_rate: 5.2,
    cpl_target: 0.12,
    conversion_funnel: {
      alcance: 1500000,
      visitas_landing: 22800,
      formularios: 870,
      trials: 0,
      miembros: 1500000,
    },
  },
  {
    id: 'familia_conectada',
    name: 'Familia Conectada Lima Norte y Sur',
    description: '35-55 años, NSE B/C+, distritos de Lima Norte, Este y Sur, decisión familiar',
    size: '~440.000',
    age_range: '35-55',
    priority: 'medium',
    segments: [
      {
        name: 'Padres millennials y Gen X',
        size: '~260.000',
        age: '35-45',
        characteristics: ['Decisión familiar de contratación', 'Hijos consumen streaming y gaming', 'Sensibles al servicio técnico local'],
      },
      {
        name: 'Adultos consolidados',
        size: '~180.000',
        age: '46-55',
        characteristics: ['Buscan estabilidad y soporte cercano', 'Valoran transparencia en cobros', 'Influenciados por referidos del barrio'],
      },
    ],
    interests: ['Streaming familiar', 'Educación de hijos', 'Series y deportes', 'Soporte técnico'],
    message: 'Internet estable y simétrico para todos en casa, con soporte local cercano',
    channels: {
      'Meta Ads': 58,
      'Google Search': 20,
      'YouTube': 14,
      'Google Display': 8,
    },
    engagement_rate: 3.6,
    cpl_target: 0.15,
    conversion_funnel: {
      alcance: 1000000,
      visitas_landing: 15200,
      formularios: 580,
      trials: 0,
      miembros: 1000000,
    },
  },
];

// ============================================================================
// TIMING - Mejores momentos para pauta (telco awareness Perú)
// ============================================================================
export const OPTIMAL_TIMING = {
  dayparts: [
    { name: 'Mañana', hours: '7:00 - 10:00', performance: 'medium', multiplier: 1.0, audience: 'Profesionales en teletrabajo' },
    { name: 'Mediodía', hours: '12:00 - 14:00', performance: 'high', multiplier: 1.3, audience: 'Pausa laboral, consumo móvil' },
    { name: 'Tarde-noche', hours: '18:00 - 22:00', performance: 'very_high', multiplier: 1.7, audience: 'Familia conectada, streaming' },
    { name: 'Madrugada', hours: '22:00 - 00:00', performance: 'high', multiplier: 1.2, audience: 'Joven digital, gaming' },
  ],
  weekdays: [
    { name: 'Lunes', performance: 'medium', recommended: true, note: 'Búsqueda y consideración de cambio' },
    { name: 'Martes', performance: 'high', recommended: true, note: 'Picos de tráfico web' },
    { name: 'Miércoles', performance: 'high', recommended: true, note: 'Engagement medio semana' },
    { name: 'Jueves', performance: 'very_high', recommended: true, note: 'Alta consideración pre-fin de semana' },
    { name: 'Viernes', performance: 'very_high', recommended: true, note: 'Pago de quincena, decisión' },
    { name: 'Sábado', performance: 'high', recommended: true, note: 'Consumo familiar y comparación' },
    { name: 'Domingo', performance: 'medium', recommended: true, note: 'Investigación y decisión final' },
  ],
  seasonality: [
    { month: 'Enero', demand: 'low', note: 'Post-Navidad, ajuste de presupuesto familiar' },
    { month: 'Febrero', demand: 'high', note: 'Regreso a clases, pico de búsqueda escolar' },
    { month: 'Marzo', demand: 'high', note: 'Ajuste de planes para año académico' },
    { month: 'Abril', demand: 'medium', note: 'Estabilización post escolar' },
    { month: 'Mayo', demand: 'low', note: 'Mes intermedio, valle natural' },
    { month: 'Junio', demand: 'medium', note: 'Recuperación y eventos deportivos' },
    { month: 'Julio', demand: 'very_high', note: 'Fiestas Patrias y vacaciones, alto consumo digital' },
    { month: 'Agosto', demand: 'medium', note: 'Estabilización post Fiestas Patrias' },
    { month: 'Septiembre', demand: 'medium', note: 'Pre-Cyber Days noviembre' },
    { month: 'Octubre', demand: 'medium', note: 'Calentamiento de campañas' },
    { month: 'Noviembre', demand: 'very_high', note: 'Cyber Days y Black Friday, pico anual' },
    { month: 'Diciembre', demand: 'very_high', note: 'Navidad y campañas de fin de año' },
  ],
};

// ============================================================================
// SERVICIOS - Planes y bundles WIN monitoreados (6 entradas)
// ============================================================================
export const SERVICIOS_CONFIG = [
  { id: 1, nombre: 'WIN Hogar 750 Mbps', revenue_pct: 22, cpl_target: 0.13, conversion: 5.4 },
  { id: 2, nombre: 'WIN Hogar 850 Mbps', revenue_pct: 26, cpl_target: 0.14, conversion: 6.1 },
  { id: 3, nombre: 'WIN Hogar 1 Gbps Premium', revenue_pct: 18, cpl_target: 0.16, conversion: 4.8 },
  { id: 4, nombre: 'WIN Gamer 600 Mbps', revenue_pct: 10, cpl_target: 0.12, conversion: 7.2 },
  { id: 5, nombre: 'WIN + WIN TV Premium', revenue_pct: 14, cpl_target: 0.15, conversion: 5.0 },
  { id: 6, nombre: 'WIN + L1MAX (Liga 1)', revenue_pct: 10, cpl_target: 0.17, conversion: 4.4 },
];

// ============================================================================
// METRIC CARDS - Configuración de tarjetas métricas principales
// ============================================================================
export const METRIC_CARDS_CONFIG = [
  {
    id: 'reach',
    title: 'Alcance Único',
    description: 'Personas únicas impactadas por la campaña este mes',
    icon: 'Eye',
    color: 'fitzone-orange',
    gradient: 'from-fitzone-orange to-fitzone-darkOrange',
  },
  {
    id: 'cpm',
    title: 'CPM Promedio',
    description: 'Costo por mil impresiones servidas',
    icon: 'DollarSign',
    color: 'fitzone-electric',
    gradient: 'from-fitzone-electric to-fitzone-cyan',
  },
  {
    id: 'engagement',
    title: 'Interacciones',
    description: 'Likes, comentarios, saves y compartidos',
    icon: 'ThumbsUp',
    color: 'fitzone-lime',
    gradient: 'from-fitzone-lime to-fitzone-green',
  },
  {
    id: 'opportunity',
    title: 'WIN Awareness Score',
    description: 'Índice de oportunidad de recordación de marca',
    icon: 'Zap',
    color: 'fitzone-orange',
    gradient: 'from-fitzone-orange to-fitzone-lime',
  },
];

// ============================================================================
// CRM INTEGRATION - Umbrales de CPI por audiencia (awareness)
// (las claves cpl_* se mantienen por compatibilidad; representan CPI en USD)
// ============================================================================
export const CRM_CONFIG = {
  enabled: false,
  api_key: null,
  cpl_thresholds: {
    joven_lima_moderna: {
      cpl_target: 0.12,
      cpl_alert: 0.18,
      cpl_pause: 0.25,
      max_cpl: 0.22,
    },
    familia_conectada: {
      cpl_target: 0.15,
      cpl_alert: 0.22,
      cpl_pause: 0.30,
      max_cpl: 0.27,
    },
  },
  conversion_tracking: {
    reach_unique: true,
    interactions: true,
    landing_page_visits: true,
    branded_search_lift: true,
    consideration: true,
  },
  alerts: {
    email: true,
    webhook: false,
    dashboard: true,
  },
};

// ============================================================================
// UI TEXT - Textos de interfaz
// ============================================================================
export const UI_TEXT = {
  loading: 'Cargando WIN Algorithm...',
  lastUpdate: 'Última actualización',
  systemActive: 'Sistema activo',
  noData: 'No hay datos disponibles',
  error: 'Error al cargar datos',
  retry: 'Reintentar',

  footer: {
    copyright: '2026 WIN Algorithm - Internet 100% fibra óptica',
    version: 'v1.0.0',
  },

  buttons: {
    viewDetails: 'Ver detalles',
    export: 'Exportar',
    refresh: 'Actualizar',
    filter: 'Filtrar',
    expandAll: 'Mostrar todas las categorías',
    collapseAll: 'Mostrar solo top 5',
  },
};

// ============================================================================
// EXPORT ALL
// ============================================================================
export default {
  BRAND_CONFIG,
  LAYER_CONFIG,
  KEY_MESSAGES,
  DATA_SOURCES_CONFIG,
  CHANNELS_CONFIG,
  SEDES_CONFIG,
  TARGET_AUDIENCES,
  OPTIMAL_TIMING,
  SERVICIOS_CONFIG,
  METRIC_CARDS_CONFIG,
  CRM_CONFIG,
  UI_TEXT,
};
