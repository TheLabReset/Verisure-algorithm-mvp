// Configuración general de The Algorithm by Reset
// Textos, mensajes, secciones y configuración de UI

// ============================================================================
// BRAND CONFIGURATION - Configuración de producto y cliente
// ============================================================================
export const BRAND_CONFIG = {
  name: 'The Algorithm by Reset',
  tagline: 'Powerpay Intelligence Platform',
  subtitle: 'Optimización automática de inversión digital en adquisición de cuentas',
  product: 'Cuentas Powerpay 2026',
  market: 'Perú (digital nacional, foco Lima)',
  client: 'Powerpay',
  agency: 'Reset Agency',
  isTemplate: false,
  version: '1.0.0',
  slogan: 'El poder de elegir',
  founded: 2022,
};

// ============================================================================
// LAYER TITLES - Títulos y descripciones de las 4 capas
// ============================================================================
export const LAYER_CONFIG = {
  data: {
    id: 'data',
    name: 'Captura de Señales',
    subtitle: 'Monitoreo en tiempo real del ecosistema digital fintech y BNPL',
    description: 'Búsqueda, Tendencia, Intención, Engagement',
    icon: 'Search',
    color: 'from-fitzone-orange to-fitzone-darkOrange',
  },
  decision: {
    id: 'decision',
    name: 'Inteligencia de Mercado',
    subtitle: 'Insights automáticos para optimizar inversión en captación de cuentas',
    description: 'Análisis y definición de estrategia',
    icon: 'Target',
    color: 'from-fitzone-darkOrange to-fitzone-electric',
  },
  execution: {
    id: 'execution',
    name: 'Activación Estratégica',
    subtitle: 'Distribución inteligente de presupuesto, comercios y contenidos',
    description: 'Implementación en tiempo real',
    icon: 'Zap',
    color: 'from-fitzone-electric to-fitzone-lime',
  },
  optimization: {
    id: 'optimization',
    name: 'Performance & Optimización',
    subtitle: 'Resultados en tiempo real y ajustes automáticos',
    description: 'Evaluación y redistribución',
    icon: 'TrendingUp',
    color: 'from-fitzone-lime to-fitzone-orange',
  },
};

// ============================================================================
// KEY MESSAGES - Mensajes clave de comunicación Powerpay
// ============================================================================
export const KEY_MESSAGES = {
  linea: {
    title: 'Sin afectar tu línea de crédito',
    message: 'Las cuotas se debitan automáticamente, sin consumir el cupo de tu tarjeta',
    description: 'Conserva tu línea disponible para lo que tú decidas',
  },
  cualquier_tarjeta: {
    title: 'Funciona con cualquier tarjeta',
    message: 'Acepta cualquier tarjeta de crédito o débito del mercado peruano',
    description: 'Sin importar el banco emisor',
  },
  sin_intereses: {
    title: 'Cuotas sin intereses disponibles',
    message: 'Hasta en 12 cuotas desde 0% de interés en comercios seleccionados',
    description: 'Solo se paga la primera cuota al comprar',
  },
  transparencia: {
    title: 'Transparencia total',
    message: 'Sin letras chicas: la información completa antes de pagar',
    description: 'Cuotas, fechas y montos siempre visibles',
  },
  comercios: {
    title: 'Más de 300 comercios afiliados',
    message: 'Tecnología, electrohogar, moda, viajes, belleza y mucho más',
    description: 'Una red en crecimiento permanente',
  },
};

// ============================================================================
// DATA SOURCES - Configuración de fuentes de datos
// ============================================================================
export const DATA_SOURCES_CONFIG = {
  googleTrends: {
    enabled: true,
    name: 'Google Trends',
    description: 'Tendencias de búsqueda fintech y cuotas en tiempo real',
    icon: 'TrendingUp',
    color: 'text-fitzone-electric',
    bgColor: 'bg-fitzone-slate',
    region: 'PE',
    category: 'Finance',
    interval: 'hourly',
    status: 'active',
    geo: ['Lima', 'Arequipa', 'Trujillo', 'Chiclayo'],
  },
  tiktok: {
    enabled: true,
    name: 'TikTok',
    description: 'Contenido viral fintech y hashtags trending',
    icon: 'Video',
    color: 'text-fitzone-lime',
    bgColor: 'bg-fitzone-slate',
    scraping: 'public',
    status: 'active',
  },
  meta: {
    enabled: true,
    name: 'Meta Platforms',
    description: 'Facebook e Instagram insights del sector financiero',
    icon: 'Share2',
    color: 'text-fitzone-electric',
    bgColor: 'bg-fitzone-slate',
    platforms: ['Facebook', 'Instagram'],
    status: 'active',
  },
  youtube: {
    enabled: true,
    name: 'YouTube',
    description: 'Reseñas, comparativas y educación financiera',
    icon: 'Youtube',
    color: 'text-fitzone-orange',
    bgColor: 'bg-fitzone-slate',
    status: 'active',
  },
  fintech: {
    enabled: true,
    name: 'Portales Fintech',
    description: 'ASBANC, BCRP, Niubiz, reportes del sector financiero',
    icon: 'Globe',
    color: 'text-fitzone-lime',
    bgColor: 'bg-fitzone-slate',
    sources: ['ASBANC', 'BCRP', 'Niubiz', 'IAB Perú'],
    status: 'active',
  },
  ga4: {
    enabled: false,
    name: 'Google Analytics 4',
    description: 'Tráfico web y registros',
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
    primary_kpi: 'Registros + Awareness',
    description: 'Instagram y Facebook Ads',
    subchannels: ['Lead Ads', 'Conversions API', 'Tráfico a web'],
  },
  google_search: {
    name: 'Google Search',
    icon: 'Search',
    color: 'text-fitzone-lime',
    bgColor: 'bg-fitzone-slate',
    primary_kpi: 'Intención de compra',
    description: 'Campañas Brand, Generic y Competitor',
  },
  google_display: {
    name: 'Google Display',
    icon: 'Monitor',
    color: 'text-fitzone-orange',
    bgColor: 'bg-fitzone-slate',
    primary_kpi: 'Remarketing + Awareness',
    description: 'Red de display y banners contextuales',
  },
  youtube: {
    name: 'YouTube (Demand Gen)',
    icon: 'Youtube',
    color: 'text-fitzone-orange',
    bgColor: 'bg-fitzone-slate',
    primary_kpi: 'Awareness + Consideración',
    description: 'Demand Gen y bumpers educativos',
  },
};

// ============================================================================
// COMERCIOS PARTNERS - Top retailers afiliados a Powerpay
// (reinterpretación de "sedes" para una marca 100% digital con red de comercios)
// ============================================================================
export const SEDES_CONFIG = [
  { id: 1, nombre: 'Samsung Store', distrito: 'Tecnología', nse: 'A/B', size: 'S/2.500', type: 'Smartphones y TV' },
  { id: 2, nombre: 'iShop Perú', distrito: 'Tecnología', nse: 'A', size: 'S/3.800', type: 'Apple Premium' },
  { id: 3, nombre: 'Mac Center', distrito: 'Tecnología', nse: 'A/B', size: 'S/3.200', type: 'Apple multi-tienda' },
  { id: 4, nombre: 'PC Factory', distrito: 'Tecnología', nse: 'B/C+', size: 'S/2.100', type: 'Computación' },
  { id: 5, nombre: 'Sony Store', distrito: 'Electrohogar', nse: 'A/B', size: 'S/2.800', type: 'Audio y video' },
  { id: 6, nombre: 'iRobot Perú', distrito: 'Electrohogar', nse: 'A/B', size: 'S/2.300', type: 'Hogar inteligente' },
  { id: 7, nombre: 'Aldo & Co.', distrito: 'Moda', nse: 'A/B', size: 'S/650', type: 'Calzado premium' },
  { id: 8, nombre: 'Footloose', distrito: 'Moda', nse: 'B/C+', size: 'S/420', type: 'Calzado urbano' },
  { id: 9, nombre: 'Coliseum', distrito: 'Deportes', nse: 'B/C+', size: 'S/580', type: 'Indumentaria deportiva' },
  { id: 10, nombre: 'Teleticket', distrito: 'Entretenimiento', nse: 'B/C+', size: 'S/380', type: 'Eventos y conciertos' },
  { id: 11, nombre: 'NuSkin Perú', distrito: 'Belleza', nse: 'A/B', size: 'S/890', type: 'Skincare premium' },
  { id: 12, nombre: 'Thermomix', distrito: 'Hogar', nse: 'A', size: 'S/5.200', type: 'Cocina premium' },
];

// ============================================================================
// AUDIENCES - Audiencias objetivo (exactamente 2 perfiles principales)
// ============================================================================
export const TARGET_AUDIENCES = [
  {
    id: 'joven_digital',
    name: 'Joven Digital Primer-Usuario',
    description: '22-30 años, primer crédito o débito, compra impulsiva en marketplaces',
    size: '~620.000',
    age_range: '22-30',
    priority: 'high',
    segments: [
      {
        name: 'Universitario tardío y primer empleo',
        size: '~340.000',
        age: '22-26',
        characteristics: ['Primera tarjeta', 'Sensibilidad a la cuota mensual', 'Influenciado por reseñas TikTok'],
      },
      {
        name: 'Joven profesional digital',
        size: '~280.000',
        age: '27-30',
        characteristics: ['Compra tech y moda en marketplaces', 'Valora rapidez de checkout', 'Compara cuotas vs. precio'],
      },
    ],
    interests: ['Tecnología', 'Lanzamientos', 'Marketplaces', 'Lifestyle digital'],
    message: 'La libertad de comprar hoy y pagar cómo mejor se acomode',
    channels: {
      'Meta Ads': 55,
      'Google Search': 25,
      'Google Display': 12,
      'YouTube': 8,
    },
    engagement_rate: 4.8,
    cpl_target: 9,
    conversion_funnel: {
      alcance: 1080000,
      visitas_landing: 16200,
      formularios: 870,
      trials: 630,
      miembros: 630,
    },
  },
  {
    id: 'adulto_planificador',
    name: 'Adulto Bancarizado Planificador',
    description: '32-45 años, NSE A/B, financia electro, viajes y tecnología premium',
    size: '~440.000',
    age_range: '32-45',
    priority: 'medium',
    segments: [
      {
        name: 'Profesional urbano',
        size: '~260.000',
        age: '32-38',
        characteristics: ['Tarjeta(s) activa(s)', 'Planifica compras grandes', 'Cuida su línea de crédito'],
      },
      {
        name: 'Adulto consolidado',
        size: '~180.000',
        age: '39-45',
        characteristics: ['Renueva electro y tecnología', 'Compara TCEA y comisiones', 'Valora transparencia'],
      },
    ],
    interests: ['Electrodomésticos', 'Tecnología premium', 'Viajes', 'Educación familiar'],
    message: 'Financiamiento para lo importante, sin tocar la línea de tu tarjeta principal',
    channels: {
      'Meta Ads': 45,
      'Google Search': 35,
      'Google Display': 12,
      'YouTube': 8,
    },
    engagement_rate: 3.4,
    cpl_target: 11.5,
    conversion_funnel: {
      alcance: 720000,
      visitas_landing: 10800,
      formularios: 580,
      trials: 420,
      miembros: 420,
    },
  },
];

// ============================================================================
// TIMING - Mejores momentos para pauta (BNPL Perú)
// ============================================================================
export const OPTIMAL_TIMING = {
  dayparts: [
    { name: 'Mañana', hours: '7:00 - 10:00', performance: 'medium', multiplier: 1.0, audience: 'Profesionales' },
    { name: 'Mediodía', hours: '12:00 - 14:00', performance: 'high', multiplier: 1.3, audience: 'Oficinistas' },
    { name: 'Tarde-noche', hours: '18:00 - 22:00', performance: 'very_high', multiplier: 1.6, audience: 'Todos' },
    { name: 'Madrugada', hours: '22:00 - 00:00', performance: 'high', multiplier: 1.2, audience: 'Joven digital' },
  ],
  weekdays: [
    { name: 'Lunes', performance: 'medium', recommended: true, note: 'Búsqueda y consideración' },
    { name: 'Martes', performance: 'high', recommended: true, note: 'Cierres de carrito' },
    { name: 'Miércoles', performance: 'high', recommended: true, note: 'Ofertas mid-week' },
    { name: 'Jueves', performance: 'very_high', recommended: true, note: 'Pre-quincena, mayor conversión' },
    { name: 'Viernes', performance: 'very_high', recommended: true, note: 'Pago de quincena' },
    { name: 'Sábado', performance: 'high', recommended: true, note: 'Compra planificada' },
    { name: 'Domingo', performance: 'medium', recommended: true, note: 'Comparación y decisión' },
  ],
  seasonality: [
    { month: 'Enero', demand: 'medium', note: 'Vuelta al cole y verano' },
    { month: 'Febrero', demand: 'medium', note: 'Verano, estabilización' },
    { month: 'Marzo', demand: 'high', note: 'Cyber Days marzo y back-to-school' },
    { month: 'Abril', demand: 'medium', note: 'Pre Día de la Madre' },
    { month: 'Mayo', demand: 'high', note: 'Día de la Madre, pico retail' },
    { month: 'Junio', demand: 'medium', note: 'Pre Cyber Wow' },
    { month: 'Julio', demand: 'very_high', note: 'Cyber Wow y Fiestas Patrias' },
    { month: 'Agosto', demand: 'medium', note: 'Estabilización' },
    { month: 'Septiembre', demand: 'medium', note: 'Lanzamientos tech' },
    { month: 'Octubre', demand: 'medium', note: 'Pre-Cyber Wow noviembre' },
    { month: 'Noviembre', demand: 'very_high', note: 'Cyber Wow y Black Friday' },
    { month: 'Diciembre', demand: 'very_high', note: 'Navidad y campaña fin de año' },
  ],
};

// ============================================================================
// SERVICIOS - Categorías de comercios monitoreadas (6)
// ============================================================================
export const SERVICIOS_CONFIG = [
  { id: 1, nombre: 'Tecnología', revenue_pct: 32, cpl_target: 7, conversion: 6.5 },
  { id: 2, nombre: 'Electrohogar', revenue_pct: 22, cpl_target: 9, conversion: 5.2 },
  { id: 3, nombre: 'Moda y calzado', revenue_pct: 16, cpl_target: 8, conversion: 8.0 },
  { id: 4, nombre: 'Entretenimiento y viajes', revenue_pct: 12, cpl_target: 10, conversion: 9.0 },
  { id: 5, nombre: 'Belleza y salud', revenue_pct: 10, cpl_target: 11, conversion: 8.5 },
  { id: 6, nombre: 'Lifestyle premium', revenue_pct: 8, cpl_target: 13, conversion: 4.0 },
];

// ============================================================================
// METRIC CARDS - Configuración de tarjetas métricas principales
// ============================================================================
export const METRIC_CARDS_CONFIG = [
  {
    id: 'nuevos_miembros',
    title: 'Cuentas Creadas',
    description: 'Registros activos de Powerpay este mes',
    icon: 'Users',
    color: 'fitzone-orange',
    gradient: 'from-fitzone-orange to-fitzone-darkOrange',
  },
  {
    id: 'reach',
    title: 'Alcance Total',
    description: 'Usuarios únicos impactados a nivel nacional',
    icon: 'Eye',
    color: 'fitzone-electric',
    gradient: 'from-fitzone-electric to-fitzone-cyan',
  },
  {
    id: 'engagement',
    title: 'Interacciones',
    description: 'Likes, comentarios, saves y compartidos',
    icon: 'Heart',
    color: 'fitzone-lime',
    gradient: 'from-fitzone-lime to-fitzone-green',
  },
  {
    id: 'opportunity',
    title: 'Powerpay Opportunity Score',
    description: 'Índice de oportunidad de inversión BNPL',
    icon: 'Zap',
    color: 'fitzone-orange',
    gradient: 'from-fitzone-orange to-fitzone-lime',
  },
];

// ============================================================================
// CRM INTEGRATION - Configuración de alertas CPL
// ============================================================================
export const CRM_CONFIG = {
  enabled: false,
  api_key: null,
  cpl_thresholds: {
    joven_digital: {
      cpl_target: 9,
      cpl_alert: 12,
      cpl_pause: 16,
      max_cpl: 14,
    },
    adulto_planificador: {
      cpl_target: 11.5,
      cpl_alert: 14,
      cpl_pause: 18,
      max_cpl: 16,
    },
  },
  conversion_tracking: {
    lead_ads: true,
    web_registrations: true,
    landing_page_visits: true,
    kyc_completed: true,
    first_transaction: true,
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
  loading: 'Cargando Powerpay Algorithm...',
  lastUpdate: 'Última actualización',
  systemActive: 'Sistema activo',
  noData: 'No hay datos disponibles',
  error: 'Error al cargar datos',
  retry: 'Reintentar',

  footer: {
    copyright: '2026 Powerpay Algorithm - El poder de elegir',
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
