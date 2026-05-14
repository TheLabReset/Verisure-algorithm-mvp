// Configuración general de The Algorithm by Reset
// Textos, mensajes, secciones y configuración de UI

// ============================================================================
// BRAND CONFIGURATION - Configuración de producto y cliente
// ============================================================================
export const BRAND_CONFIG = {
  name: 'The Algorithm by Reset',
  tagline: 'Verisure Security Intelligence Platform',
  subtitle: 'Optimización de inversión digital para Verisure Perú en alarmas monitoreadas',
  product: 'Campaña Verisure Perú 2026',
  market: 'Perú (foco Lima Metropolitana)',
  client: 'Verisure Perú',
  agency: 'Reset Agency',
  isTemplate: false,
  version: '1.0.0',
  slogan: 'Protección residencial y empresarial con monitoreo continuo',
  founded: 1988,
};

// ============================================================================
// LAYER TITLES - Títulos y descripciones de las 4 capas
// ============================================================================
export const LAYER_CONFIG = {
  data: {
    id: 'data',
    name: 'Captura de Señales',
    subtitle: 'Monitoreo en tiempo real del ecosistema digital del sector seguridad y alarmas',
    description: 'Búsqueda, Tendencia, Intención, Engagement',
    icon: 'Search',
    color: 'from-fitzone-orange to-fitzone-darkOrange',
  },
  decision: {
    id: 'decision',
    name: 'Inteligencia de Mercado',
    subtitle: 'Insights automáticos para optimizar la captación de leads y el tráfico web',
    description: 'Análisis y definición de estrategia',
    icon: 'Target',
    color: 'from-fitzone-darkOrange to-fitzone-electric',
  },
  execution: {
    id: 'execution',
    name: 'Activación Estratégica',
    subtitle: 'Distribución sugerida de presupuesto, zonas de cobertura y contenido',
    description: 'Implementación en tiempo real',
    icon: 'Zap',
    color: 'from-fitzone-electric to-fitzone-lime',
  },
  optimization: {
    id: 'optimization',
    name: 'Performance & Optimización',
    subtitle: 'Resultados de leads en tiempo real y ajustes propuestos',
    description: 'Evaluación y redistribución',
    icon: 'TrendingUp',
    color: 'from-fitzone-lime to-fitzone-orange',
  },
};

// ============================================================================
// KEY MESSAGES - 5 pilares de comunicación Verisure
// ============================================================================
export const KEY_MESSAGES = {
  monitoreo_continuo: {
    title: 'Monitoreo desde Central propia',
    message: 'La Central Receptora de Alarmas opera las 24 horas, los 7 días, con personal especializado',
    description: 'Atención sostenida ante cualquier evento detectado',
  },
  doble_verificacion: {
    title: 'Doble verificación por imagen y audio',
    message: 'Antes de avisar a las autoridades se valida la intrusión por dos canales independientes',
    description: 'Reduce el ruido por falsas alarmas',
  },
  zerovision: {
    title: 'ZeroVision como capa diferencial',
    message: 'Al confirmarse intrusión se libera niebla densa que limita la visibilidad en segundos',
    description: 'Tecnología propietaria orientada a interrumpir el robo en curso',
  },
  respuesta_autoridades: {
    title: 'Conexión con fuerzas de seguridad',
    message: 'La Central coordina el aviso a la PNP y serenazgo del distrito ante un evento confirmado',
    description: 'Articulación con autoridades locales',
  },
  control_movil: {
    title: 'Control desde la app My Verisure',
    message: 'Activación, desactivación y consulta de estado desde el celular, con historial de eventos',
    description: 'Gestión del sistema sin depender del teclado físico',
  },
};

// ============================================================================
// DATA SOURCES - Configuración de fuentes de datos
// ============================================================================
export const DATA_SOURCES_CONFIG = {
  googleTrends: {
    enabled: true,
    name: 'Google Trends',
    description: 'Tendencias de búsqueda de alarmas, cámaras y seguridad residencial en tiempo real',
    icon: 'TrendingUp',
    color: 'text-fitzone-electric',
    bgColor: 'bg-fitzone-slate',
    region: 'PE',
    category: 'Home & Garden > Home Security',
    interval: 'hourly',
    status: 'active',
    geo: ['Lima', 'Callao', 'Lima Norte', 'Lima Sur'],
  },
  tiktok: {
    enabled: true,
    name: 'TikTok',
    description: 'Contenido viral de seguridad ciudadana, hogar protegido y testimonios',
    icon: 'Video',
    color: 'text-fitzone-lime',
    bgColor: 'bg-fitzone-slate',
    scraping: 'public',
    status: 'active',
  },
  meta: {
    enabled: true,
    name: 'Meta Platforms',
    description: 'Facebook e Instagram insights del sector seguridad para hogar y negocio',
    icon: 'Share2',
    color: 'text-fitzone-electric',
    bgColor: 'bg-fitzone-slate',
    platforms: ['Facebook', 'Instagram'],
    status: 'active',
  },
  youtube: {
    enabled: true,
    name: 'YouTube',
    description: 'Reseñas, demos y testimoniales de sistemas de alarma y videovigilancia',
    icon: 'Youtube',
    color: 'text-fitzone-orange',
    bgColor: 'bg-fitzone-slate',
    status: 'active',
  },
  sector: {
    enabled: true,
    name: 'Portales del Sector',
    description: 'INEI, SUCAMEC, IPSOS Observatorio del Crimen y reportes sectoriales de seguridad',
    icon: 'Globe',
    color: 'text-fitzone-lime',
    bgColor: 'bg-fitzone-slate',
    sources: ['INEI ENAPRES', 'SUCAMEC', 'IPSOS Observatorio del Crimen', 'APEIM'],
    status: 'active',
  },
  ga4: {
    enabled: false,
    name: 'Google Analytics 4',
    description: 'Tráfico web y consultas de cotización en verisure.pe',
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
    primary_kpi: 'Leads y tráfico web',
    description: 'Facebook e Instagram con lead ads y Reels testimoniales',
    subchannels: ['Lead campaigns', 'Click to WhatsApp', 'Reels Ads'],
  },
  google_search: {
    name: 'Google Search',
    icon: 'Search',
    color: 'text-fitzone-lime',
    bgColor: 'bg-fitzone-slate',
    primary_kpi: 'Leads de alta intención',
    description: 'Campañas brand y categoría con keywords de seguridad y alarmas',
  },
  google_display: {
    name: 'Google Display',
    icon: 'Monitor',
    color: 'text-fitzone-orange',
    bgColor: 'bg-fitzone-slate',
    primary_kpi: 'Remarketing y refuerzo',
    description: 'Red display contextual y remarketing de cierre de embudo',
  },
  youtube: {
    name: 'YouTube',
    icon: 'Youtube',
    color: 'text-fitzone-orange',
    bgColor: 'bg-fitzone-slate',
    primary_kpi: 'Awareness y consideración',
    description: 'TrueView for Action y Bumper Ads con piezas testimoniales',
  },
  tiktok_ads: {
    name: 'TikTok Ads',
    icon: 'Video',
    color: 'text-fitzone-lime',
    bgColor: 'bg-fitzone-slate',
    primary_kpi: 'Alcance segmento 30 a 45',
    description: 'Spark Ads y formato testimonial con creadores del nicho hogar',
  },
};

// ============================================================================
// SEDES - Zonas de cobertura de Verisure en Lima Metropolitana y Callao
// (reinterpretado: Verisure opera 100% remoto, las "sedes" son agrupaciones
// de distritos donde se entrega el servicio de monitoreo y soporte técnico)
// ============================================================================
export const SEDES_CONFIG = [
  { id: 1, nombre: 'Zona Lima Top', distrito: 'Miraflores, San Isidro, Barranco', nse: 'A', size: 'Premium', type: 'Cobertura residencial' },
  { id: 2, nombre: 'Zona Lima Moderna Este', distrito: 'Surco, La Molina, San Borja, Surquillo', nse: 'A/B', size: 'Premium', type: 'Cobertura residencial' },
  { id: 3, nombre: 'Zona Lima Moderna Norte', distrito: 'Magdalena, Jesús María, Pueblo Libre, San Miguel, Lince', nse: 'A/B', size: 'Premium', type: 'Cobertura residencial' },
  { id: 4, nombre: 'Zona Lima Norte', distrito: 'Los Olivos, San Martín de Porres, Independencia, Comas', nse: 'B/C+', size: 'Estándar', type: 'Cobertura mixta' },
  { id: 5, nombre: 'Zona Lima Este', distrito: 'San Juan de Lurigancho, Ate, Santa Anita', nse: 'B/C+', size: 'Estándar', type: 'Cobertura mixta' },
  { id: 6, nombre: 'Zona Lima Sur', distrito: 'Chorrillos, Villa El Salvador, Lurín, San Juan de Miraflores', nse: 'B/C+', size: 'Estándar', type: 'Cobertura mixta' },
  { id: 7, nombre: 'Zona Lima Centro', distrito: 'Cercado de Lima, Breña, La Victoria', nse: 'B/C', size: 'Estándar', type: 'Cobertura mixta' },
  { id: 8, nombre: 'Zona Callao', distrito: 'Callao, Bellavista, La Perla, Carmen de la Legua', nse: 'B/C', size: 'Estándar', type: 'Cobertura mixta' },
  { id: 9, nombre: 'Eje Comercial Gamarra', distrito: 'La Victoria (eje Gamarra)', nse: 'C', size: 'Estándar', type: 'Cobertura comercial' },
  { id: 10, nombre: 'Eje Sur Balnearios', distrito: 'Asia, Punta Hermosa, San Bartolo, Cerro Azul', nse: 'A', size: 'Premium', type: 'Cobertura estacional' },
];

// ============================================================================
// AUDIENCES - Audiencias objetivo (exactamente 2 perfiles principales)
// ============================================================================
export const TARGET_AUDIENCES = [
  {
    id: 'hogar_familiar_lima_moderna',
    name: 'Hogar Familiar Lima Moderna',
    description: '35 a 55 años, NSE A/B, distritos de Lima Top y Lima Moderna, decisión en pareja',
    size: '~480.000',
    age_range: '35 a 55',
    priority: 'high',
    segments: [
      {
        name: 'Padres con hijos en edad escolar',
        size: '~290.000',
        age: '35 a 45',
        characteristics: ['Detonante por robo en la cuadra o viajes', 'Búsqueda iniciada por la madre, cierre en pareja', 'Sensibles al servicio cercano y la doble verificación'],
      },
      {
        name: 'Adultos consolidados con vivienda propia',
        size: '~190.000',
        age: '46 a 55',
        characteristics: ['Buscan tranquilidad y respaldo ante imprevistos', 'Valoran la trayectoria de la marca', 'Influenciados por referidos del condominio'],
      },
    ],
    interests: ['Crianza y familia', 'Hogar inteligente', 'Viajes', 'Seguridad ciudadana'],
    message: 'Protección continua para la familia con verificación por imagen y audio antes de avisar a las autoridades',
    channels: {
      'Meta Ads': 42,
      'Google Search': 33,
      'YouTube': 15,
      'TikTok Ads': 10,
    },
    engagement_rate: 3.2,
    cpl_target: 22,
    conversion_funnel: {
      alcance: 2000000,
      visitas_landing: 30000,
      formularios: 950,
      trials: 0,
      miembros: 75,
    },
  },
  {
    id: 'negocio_pyme_lima',
    name: 'Negocio PyME Lima',
    description: '32 a 58 años, dueños de bodegas, farmacias, restaurantes y oficinas en Lima Norte, Este y comercial',
    size: '~310.000',
    age_range: '32 a 58',
    priority: 'medium',
    segments: [
      {
        name: 'Dueños de comercio en zonas de alta incidencia',
        size: '~190.000',
        age: '32 a 45',
        characteristics: ['Detonante por extorsión o asalto cercano', 'Decisión rápida después del evento', 'Sensibles al costo de instalación inicial'],
      },
      {
        name: 'Comercio establecido y oficinas',
        size: '~120.000',
        age: '46 a 58',
        characteristics: ['Buscan continuidad operativa', 'Evalúan integraciones con cámaras y control de accesos', 'Influenciados por gremios y asociaciones de bodegueros'],
      },
    ],
    interests: ['Emprendimiento PyME', 'Cámaras y videovigilancia', 'Asociaciones de bodegueros', 'Continuidad operativa'],
    message: 'Protección del negocio con monitoreo continuo, verificación por imagen y respuesta articulada con las autoridades',
    channels: {
      'Google Search': 45,
      'Meta Ads': 30,
      'TikTok Ads': 15,
      'YouTube': 10,
    },
    engagement_rate: 2.9,
    cpl_target: 18,
    conversion_funnel: {
      alcance: 800000,
      visitas_landing: 14000,
      formularios: 550,
      trials: 0,
      miembros: 45,
    },
  },
];

// ============================================================================
// TIMING - Mejores momentos para pauta (sector seguridad Lima)
// ============================================================================
export const OPTIMAL_TIMING = {
  dayparts: [
    { name: 'Mañana', hours: '7:00 a 10:00', performance: 'medium', multiplier: 1.0, audience: 'Salida laboral, exposición móvil baja' },
    { name: 'Mediodía', hours: '12:00 a 14:00', performance: 'high', multiplier: 1.3, audience: 'Pausa laboral, consumo móvil' },
    { name: 'Tarde noche', hours: '18:00 a 22:00', performance: 'very_high', multiplier: 1.8, audience: 'Hogar conectado, noticias en TV, planificación de compra' },
    { name: 'Madrugada', hours: '22:00 a 00:00', performance: 'high', multiplier: 1.2, audience: 'Insomnio asociado a inseguridad, picos de búsqueda' },
  ],
  weekdays: [
    { name: 'Lunes', performance: 'medium', recommended: true, note: 'Continuación de consultas del fin de semana' },
    { name: 'Martes', performance: 'high', recommended: true, note: 'Picos de tráfico web del sector' },
    { name: 'Miércoles', performance: 'high', recommended: true, note: 'Engagement sostenido a media semana' },
    { name: 'Jueves', performance: 'very_high', recommended: true, note: 'Alta consideración antes del fin de semana' },
    { name: 'Viernes', performance: 'very_high', recommended: true, note: 'Planificación de viajes y seguridad del hogar' },
    { name: 'Sábado', performance: 'high', recommended: true, note: 'Consumo familiar y comparación' },
    { name: 'Domingo', performance: 'medium', recommended: true, note: 'Investigación y decisión final' },
  ],
  seasonality: [
    { month: 'Enero', demand: 'very_high', note: 'Vacaciones de verano, hogares ausentes, búsqueda activa' },
    { month: 'Febrero', demand: 'high', note: 'Vuelta a clases, ajuste de rutinas y seguridad familiar' },
    { month: 'Marzo', demand: 'high', note: 'Estabilización del año, picos por noticias de inseguridad' },
    { month: 'Abril', demand: 'medium', note: 'Mes intermedio, valle relativo' },
    { month: 'Mayo', demand: 'medium', note: 'Demanda sostenida sin picos estacionales' },
    { month: 'Junio', demand: 'medium', note: 'Eventos deportivos, exposición prolongada en hogar' },
    { month: 'Julio', demand: 'high', note: 'Fiestas Patrias y feriados largos, hogares ausentes' },
    { month: 'Agosto', demand: 'low', note: 'Estabilización tras Fiestas Patrias' },
    { month: 'Septiembre', demand: 'medium', note: 'Recuperación previa a campañas de Q4' },
    { month: 'Octubre', demand: 'medium', note: 'Calentamiento previo al pico de fin de año' },
    { month: 'Noviembre', demand: 'very_high', note: 'Inicio del pico anual, refuerzo previo a Navidad' },
    { month: 'Diciembre', demand: 'very_high', note: 'Pico máximo: viajes de fin de año y aumento de incidencia delictiva' },
  ],
};

// ============================================================================
// SERVICIOS - Productos y servicios Verisure monitoreados (6 entradas)
// ============================================================================
export const SERVICIOS_CONFIG = [
  { id: 1, nombre: 'Alarma Residencial Esencial', revenue_pct: 30, cpl_target: 22, conversion: 5.2 },
  { id: 2, nombre: 'Alarma Residencial Plus con cámaras', revenue_pct: 22, cpl_target: 24, conversion: 4.8 },
  { id: 3, nombre: 'ZeroVision Residencial', revenue_pct: 14, cpl_target: 26, conversion: 4.2 },
  { id: 4, nombre: 'Alarma para Negocio PyME', revenue_pct: 18, cpl_target: 18, conversion: 6.5 },
  { id: 5, nombre: 'Cámaras de Videovigilancia', revenue_pct: 8, cpl_target: 19, conversion: 5.8 },
  { id: 6, nombre: 'Guardián Verisure con botón SOS', revenue_pct: 8, cpl_target: 16, conversion: 7.0 },
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
    title: 'CPL Promedio',
    description: 'Costo promedio por lead generado en el mes',
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
    title: 'Score de Oportunidad Verisure',
    description: 'Índice de oportunidad de captación en el sector seguridad',
    icon: 'Shield',
    color: 'fitzone-orange',
    gradient: 'from-fitzone-orange to-fitzone-lime',
  },
];

// ============================================================================
// CRM INTEGRATION - Umbrales de CPL por audiencia (USD)
// ============================================================================
export const CRM_CONFIG = {
  enabled: false,
  api_key: null,
  cpl_thresholds: {
    hogar_familiar_lima_moderna: {
      cpl_target: 22,
      cpl_alert: 32,
      cpl_pause: 45,
      max_cpl: 35,
    },
    negocio_pyme_lima: {
      cpl_target: 18,
      cpl_alert: 26,
      cpl_pause: 38,
      max_cpl: 30,
    },
  },
  conversion_tracking: {
    reach_unique: true,
    interactions: true,
    landing_page_visits: true,
    leads_formularios: true,
    instalaciones: true,
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
  loading: 'Cargando Verisure Algorithm...',
  lastUpdate: 'Última actualización',
  systemActive: 'Sistema activo',
  noData: 'No hay datos disponibles',
  error: 'Error al cargar datos',
  retry: 'Reintentar',

  footer: {
    copyright: '2026 Verisure Algorithm. Protección residencial y empresarial con monitoreo continuo',
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
