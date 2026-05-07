// Mock Data para WIN - Dashboard Demo Comercial
// Datos simulados realistas para campaña de awareness telco fibra óptica en Lima

// ============================================================================
// MOCK GA4 DATA - Google Analytics 4 simulado
// ============================================================================
export const MOCK_GA4_DATA = {
  sessions: {
    total: 245000,
    new_users: 165000,
    returning: 80000,
    avg_session_duration: '2:32',
    pages_per_session: 3.2,
    bounce_rate: 38.4,
  },

  top_pages: [
    {
      page: '/',
      title: 'WIN - Internet 100% fibra óptica',
      views: 78400,
      bounce_rate: 28,
      avg_time: '2:48',
    },
    {
      page: '/planes',
      title: 'Planes de internet hogar WIN',
      views: 53900,
      bounce_rate: 24,
      avg_time: '3:12',
    },
    {
      page: '/planes/900mbps',
      title: 'Plan WIN 1 Gbps Premium',
      views: 24500,
      bounce_rate: 32,
      avg_time: '3:42',
    },
    {
      page: '/cobertura',
      title: 'Cobertura WIN en Lima',
      views: 27000,
      bounce_rate: 35,
      avg_time: '2:20',
    },
    {
      page: '/win-tv',
      title: 'WIN TV Premium y L1MAX',
      views: 19600,
      bounce_rate: 30,
      avg_time: '3:05',
    },
  ],

  conversions: {
    registros_iniciados: 1450,
    kyc_completados: 1050,
    primera_transaccion: 95,
    clic_a_tiendas: 18500,
    descargas_app: 6800,
    consultas_atencion: 1240,
  },

  traffic_sources: {
    organic_search: { percentage: 22, sessions: 53900, label: 'Búsqueda Orgánica' },
    paid_search: { percentage: 27, sessions: 66150, label: 'Google Ads' },
    social_media: { percentage: 38, sessions: 93100, label: 'Meta Ads' },
    direct: { percentage: 9, sessions: 22050, label: 'Directo' },
    referral: { percentage: 4, sessions: 9800, label: 'Referidos' },
  },

  devices: {
    mobile: { percentage: 82, sessions: 200900, label: 'Mobile' },
    desktop: { percentage: 14, sessions: 34300, label: 'Desktop' },
    tablet: { percentage: 4, sessions: 9800, label: 'Tablet' },
  },

  locations: [
    { distrito: 'Lima Moderna', sessions: 93100, conversions: 551, percentage: 38 },
    { distrito: 'Lima Norte', sessions: 53900, conversions: 319, percentage: 22 },
    { distrito: 'Lima Sur', sessions: 44100, conversions: 261, percentage: 18 },
    { distrito: 'Lima Este', sessions: 29400, conversions: 174, percentage: 12 },
    { distrito: 'Callao', sessions: 14700, conversions: 87, percentage: 6 },
    { distrito: 'Otros', sessions: 9800, conversions: 58, percentage: 4 },
  ],
};

// ============================================================================
// PERFORMANCE KPIs - Métricas principales del dashboard (awareness telco)
// Las claves del objeto se mantienen como históricas; cambia label y description.
// ============================================================================
export const PERFORMANCE_KPIS = {
  nuevos_miembros: {
    current: 2500000,
    previous: 1900000,
    change: '+31.6',
    trend: 'up',
    label: 'Alcance Único',
    description: 'Personas únicas impactadas por la campaña este mes',
  },

  leads: {
    qualified: 1050,
    total: 1450,
    qualification_rate: 72.4,
    cost_per_lead: 9.31,
    trend: '+22.9%',
    trend_value: 22.9,
  },

  alcance: {
    current: 2500000,
    previous: 1900000,
    change: '+31.6',
    trend: 'up',
    label: 'Alcance Único',
    description: 'Personas únicas impactadas por la campaña este mes',
  },

  reach: {
    unique_reach: 2500000,
    impressions: 3750000,
    frequency: 1.5,
    trend: '+31.6%',
    trend_value: 31.6,
  },

  engagement: {
    total_interactions: 110000,
    engagement_rate: 4.4,
    shares: 12500,
    trend: '+26.4%',
    trend_value: 26.4,
  },

  budget: {
    total_budget: 15000,
    total_spent: 13500,
    spent_percentage: 90.0,
    cost_per_click: 0.42,
    trend: 'on-track',
  },

  cpl: {
    current: 9.31,
    previous: 11.20,
    change: '-16.9',
    trend: 'down',
    label: 'Costo por Lead',
    description: 'Costo promedio por consulta cualificada',
    currency: '$',
  },

  trials: {
    current: 110000,
    previous: 87000,
    change: '+26.4',
    trend: 'up',
    label: 'Interacciones',
    description: 'Likes, comentarios, saves y compartidos en la campaña',
  },

  whatsapp: {
    current: 4.00,
    previous: 5.20,
    change: '-23.1',
    trend: 'down',
    label: 'CPM Promedio',
    description: 'Costo por mil impresiones servidas',
    currency: '$',
  },

  retention: {
    current: 0.14,
    previous: 0.18,
    change: '-22.2',
    trend: 'down',
    label: 'CPI Promedio',
    description: 'Costo por interacción (likes, comentarios, saves, clics)',
    currency: '$',
  },
};

// ============================================================================
// WIN AWARENESS SCORE - Índice de oportunidad de recordación de marca
// ============================================================================
export const OPPORTUNITY_SCORE = {
  current_score: 76,
  trend: '+4.8%',
  components: {
    search_interest: {
      score: 84,
      weight: 0.25,
      contribution: 21.0,
      insight: 'Búsquedas de "internet fibra óptica" subieron 18% vs. mes anterior, con creciente interés geo-localizado en Lima Moderna',
    },
    social_engagement: {
      score: 76,
      weight: 0.20,
      contribution: 15.2,
      insight: '#FibraOptica e #InternetPeru suman más de 95.000 menciones por semana en Perú, con engagement creciente en Reels',
    },
    competitor_gap: {
      score: 72,
      weight: 0.20,
      contribution: 14.4,
      insight: 'Movistar y Wow concentran share of voice en bundles y entretenimiento; se observa espacio para reforzar el mensaje de fibra 100% pura',
    },
    seasonal_index: {
      score: 80,
      weight: 0.15,
      contribution: 12.0,
      insight: 'Cyber Days de noviembre y campañas de fin de año en ventana inmediata, con pico de búsqueda confirmado en sector internet hogar',
    },
    conversion_efficiency: {
      score: 68,
      weight: 0.20,
      contribution: 13.6,
      insight: 'CPM actual $4.00 dentro del rango favorable ($3-7) y CPI $0.14 en línea con benchmarks del sector telco en Perú',
    },
  },
  recommendation: {
    message: 'Se observa una ventana favorable para reforzar inversión en Meta Ads y YouTube orientados a awareness en Lima Moderna durante los próximos sesenta días. La keyword "internet fibra óptica" muestra intención sostenida y los distritos de Lima Norte y Sur presentan engagement creciente con costos por interacción por debajo del target.',
    confidence: '86%',
    priority: 'high',
    actions: [
      'Se sugiere reforzar Meta Reels con creatividades enfocadas en "fibra 100% pura y velocidad simétrica"',
      'Se recomienda evaluar una capa de YouTube bumpers para amplificar recordación en Lima Moderna',
      'Se propone explorar piezas educativas que comparen fibra óptica frente a tecnologías híbridas',
      'Se observa la conveniencia de priorizar creators locales de tecnología y gaming en TikTok Spark Ads',
    ],
  },
};

// ============================================================================
// PRODUCTOS PERFORMANCE - Rendimiento por plan/producto WIN
// ============================================================================
export const SERVICIOS_PERFORMANCE = [
  {
    id: 1,
    nombre: 'WIN Hogar 750 Mbps',
    demanda: 'Alta',
    leads: 320,
    conversiones: 17,
    conversion_rate: '5.4%',
    cpl: 9.20,
    revenue: 34880,
    trend: '+14%',
    precio: 'S/ 109/mes',
    leadAds: { formularios: 420, conversion_rate: 32, cpl: 7.80 },
    whatsapp: { conversaciones: 175, respondidas: 138, tasa_respuesta: 79 },
  },
  {
    id: 2,
    nombre: 'WIN Hogar 850 Mbps',
    demanda: 'Muy Alta',
    leads: 380,
    conversiones: 23,
    conversion_rate: '6.1%',
    cpl: 8.50,
    revenue: 45220,
    trend: '+22%',
    precio: 'S/ 119/mes',
    leadAds: { formularios: 500, conversion_rate: 36, cpl: 7.10 },
    whatsapp: { conversaciones: 215, respondidas: 178, tasa_respuesta: 83 },
  },
  {
    id: 3,
    nombre: 'WIN Hogar 1 Gbps Premium',
    demanda: 'Alta',
    leads: 260,
    conversiones: 13,
    conversion_rate: '4.8%',
    cpl: 10.80,
    revenue: 36140,
    trend: '+18%',
    precio: 'S/ 139/mes',
    leadAds: { formularios: 340, conversion_rate: 28, cpl: 9.20 },
    whatsapp: { conversaciones: 145, respondidas: 118, tasa_respuesta: 81 },
  },
  {
    id: 4,
    nombre: 'WIN Gamer 600 Mbps',
    demanda: 'Media-Alta',
    leads: 145,
    conversiones: 11,
    conversion_rate: '7.2%',
    cpl: 7.40,
    revenue: 14490,
    trend: '+26%',
    precio: 'S/ 99.90/mes',
    leadAds: { formularios: 195, conversion_rate: 35, cpl: 5.80 },
    whatsapp: { conversaciones: 88, respondidas: 74, tasa_respuesta: 84 },
  },
  {
    id: 5,
    nombre: 'WIN + WIN TV Premium',
    demanda: 'Media-Alta',
    leads: 200,
    conversiones: 10,
    conversion_rate: '5.0%',
    cpl: 9.90,
    revenue: 21980,
    trend: '+12%',
    precio: 'desde S/ 109.90/mes',
    leadAds: { formularios: 265, conversion_rate: 30, cpl: 8.40 },
    whatsapp: { conversaciones: 110, respondidas: 88, tasa_respuesta: 80 },
  },
  {
    id: 6,
    nombre: 'WIN + L1MAX (Liga 1)',
    demanda: 'Media',
    leads: 145,
    conversiones: 6,
    conversion_rate: '4.4%',
    cpl: 11.40,
    revenue: 21520,
    trend: '+8%',
    precio: 'desde S/ 148.50/mes',
    leadAds: { formularios: 190, conversion_rate: 24, cpl: 9.80 },
    whatsapp: { conversaciones: 78, respondidas: 60, tasa_respuesta: 77 },
  },
];

// ============================================================================
// SEDES PERFORMANCE - Rendimiento por centro de atención WIN
// (en awareness, "miembros" se reinterpreta como menciones / consultas por sede)
// ============================================================================
export const SEDES_PERFORMANCE = [
  { id: 1, nombre: 'WIN Sede Central', miembros: 2150, nuevos: 168, ocupacion: 78, revenue: 95000, trend: 'up' },
  { id: 2, nombre: 'WIN Surco', miembros: 1820, nuevos: 142, ocupacion: 72, revenue: 84500, trend: 'up' },
  { id: 3, nombre: 'WIN Miraflores', miembros: 1650, nuevos: 128, ocupacion: 70, revenue: 78200, trend: 'up' },
  { id: 4, nombre: 'WIN San Miguel', miembros: 1280, nuevos: 95, ocupacion: 64, revenue: 52400, trend: 'up' },
  { id: 5, nombre: 'WIN La Molina', miembros: 1520, nuevos: 118, ocupacion: 68, revenue: 68400, trend: 'up' },
  { id: 6, nombre: 'WIN Los Olivos', miembros: 1380, nuevos: 112, ocupacion: 66, revenue: 48600, trend: 'up' },
  { id: 7, nombre: 'WIN San Juan de Lurigancho', miembros: 1620, nuevos: 138, ocupacion: 74, revenue: 54200, trend: 'up' },
  { id: 8, nombre: 'WIN San Juan de Miraflores', miembros: 1180, nuevos: 95, ocupacion: 62, revenue: 42800, trend: 'stable' },
  { id: 9, nombre: 'WIN Comas', miembros: 1250, nuevos: 102, ocupacion: 64, revenue: 45200, trend: 'up' },
  { id: 10, nombre: 'WIN Callao', miembros: 980, nuevos: 78, ocupacion: 58, revenue: 36400, trend: 'stable' },
];

// ============================================================================
// COMPETENCIA - Operadores de fibra óptica en Lima
// ============================================================================
export const COMPETENCIA = [
  {
    name: 'Movistar Hogar',
    full_name: 'Movistar Hogar (Telefónica del Perú)',
    market_share: 24,
    sedes: 60,
    rank: 1,
    type: 'Operador integrado nacional',
    precio: 'S/ 39.95 a S/ 145+',
    fortalezas: ['Cobertura amplia en distritos premium', 'Bundle TV + internet consolidado', 'Marca corporativa con presencia histórica'],
    debilidades: ['Coexistencia de redes mixtas (cobre y fibra)', 'Procesos de atención percibidos como largos'],
  },
  {
    name: 'Wow Perú',
    full_name: 'Wow Perú (Grupo Wow)',
    market_share: 22,
    sedes: 40,
    rank: 2,
    type: 'Operador independiente fibra',
    precio: 'S/ 64.90 a S/ 143.90',
    fortalezas: ['Bundle DGO con películas y deportes', 'Crecimiento acelerado en Lima', 'Comunicación digital activa en Meta y TikTok'],
    debilidades: ['Marca relativamente nueva en consideración', 'Cobertura aún en expansión en algunos distritos'],
  },
  {
    name: 'WIN',
    full_name: 'WIN-NET TELECOM (Grupo WIN)',
    market_share: 21,
    sedes: 100,
    rank: 3,
    type: 'Operador 100% fibra óptica',
    precio: 'S/ 99.90 a S/ 148.50',
    fortalezas: ['Fibra 100% óptica FTTH', 'Velocidad simétrica 1:1', 'Líder OSIPTEL en satisfacción al cliente', 'Soporte técnico local cercano'],
    debilidades: ['Awareness en construcción frente a marcas históricas', 'Cobertura concentrada en Lima y 11 provincias'],
  },
  {
    name: 'Claro Hogar',
    full_name: 'Claro Hogar (América Móvil)',
    market_share: 7,
    sedes: 50,
    rank: 4,
    type: 'Operador integrado nacional',
    precio: 'S/ 65 a S/ 150',
    fortalezas: ['Cobertura nacional amplia', 'Integración con servicios móviles Claro', 'Marca multinacional reconocida'],
    debilidades: ['Foco diversificado entre móvil y fijo', 'Percepción de variabilidad en velocidad real entregada'],
  },
  {
    name: 'Fiberlux',
    full_name: 'Fiberlux Group',
    market_share: 4,
    sedes: 25,
    rank: 5,
    type: 'Operador premium B2B y residencial',
    precio: 'S/ 149 a S/ 299',
    fortalezas: ['Infraestructura propia con 15.000+ km de fibra', 'Origen B2B con foco técnico', 'Oferta de simetría 1:1 a nivel residencial'],
    debilidades: ['Posicionamiento premium con menor escala residencial', 'Menos presencia en comunicación masiva'],
  },
  {
    name: 'Otros operadores',
    full_name: 'Operadores regionales y nicho',
    market_share: 22,
    sedes: 80,
    rank: 6,
    type: 'Operadores regionales (Fiberpro, Optical Networks y similares)',
    precio: 'S/ 55 a S/ 199',
    fortalezas: ['Precios competitivos en segmentos específicos', 'Atención local y barrial'],
    debilidades: ['Cobertura geográficamente limitada', 'Marcas con menor reconocimiento en awareness'],
  },
];

// ============================================================================
// CRM MOCKUP - Datos simulados de campañas activas (awareness)
// ============================================================================
export const CRM_MOCKUP = {
  campaigns: [
    {
      id: 'camp_001',
      name: 'Brand Awareness Hogares Lima Moderna',
      status: 'active',
      budget: 5700,
      spent: 5380,
      leads: 540,
      cpl: 9.96,
      alert_status: 'normal',
      platform: 'Meta Ads',
      audience: 'Joven Conectado Lima Moderna',
    },
    {
      id: 'camp_002',
      name: 'Recordación Familias Conectadas Lima Norte y Sur',
      status: 'active',
      budget: 3300,
      spent: 3140,
      leads: 360,
      cpl: 8.72,
      alert_status: 'normal',
      platform: 'Meta Ads',
      audience: 'Familia Conectada Lima Norte y Sur',
    },
    {
      id: 'camp_003',
      name: 'YouTube Brand WIN Fibra 100%',
      status: 'active',
      budget: 3300,
      spent: 3150,
      leads: 280,
      cpl: 11.25,
      alert_status: 'normal',
      platform: 'YouTube',
      audience: 'Mixta',
    },
    {
      id: 'camp_004',
      name: 'TikTok Spark Awareness Joven',
      status: 'active',
      budget: 1950,
      spent: 1830,
      leads: 270,
      cpl: 6.78,
      alert_status: 'warning',
      platform: 'TikTok Ads',
      audience: 'Joven Conectado Lima Moderna',
    },
  ],
  alerts: [
    {
      type: 'success',
      message: 'Campaña "Brand Awareness Lima Moderna" superando objetivos: CPI $0.12 frente al target $0.15',
      campaign_id: 'camp_001',
      timestamp: '2026-05-04T14:30:00',
    },
    {
      type: 'warning',
      message: 'TikTok Spark con frecuencia 5.2 (cap recomendado 4). Se sugiere refrescar creatividades',
      campaign_id: 'camp_004',
      timestamp: '2026-05-04T11:15:00',
    },
  ],
  lead_quality: {
    avg_score: 73,
    distribution: {
      hot: 30,
      warm: 46,
      cold: 24,
    },
  },
};

// ============================================================================
// BUDGET ALLOCATION - Distribución de presupuesto por canal (awareness)
// Mix balanceado Meta + Google + complemento TikTok para audiencia joven
// ============================================================================
export const BUDGET_ALLOCATION = {
  total_budget: 15000,
  currency: 'USD',
  period: 'monthly',
  distribution: {
    meta_ads: {
      amount: 8100,
      percentage: 54,
      status: 'overperforming',
      kpi: 'CPM y CPI',
      target: 'CPM $5 o menos',
      current_performance: 'CPM $4.20 / CPI $0.13',
      platforms: ['Instagram', 'Facebook'],
    },
    youtube: {
      amount: 2100,
      percentage: 14,
      status: 'performing',
      kpi: 'Recordación + View-through rate',
      target: 'VTR 25% o más',
      current_performance: 'VTR 28.4%',
    },
    google_search: {
      amount: 1950,
      percentage: 13,
      status: 'performing',
      kpi: 'Búsquedas de marca',
      target: '+15% mes a mes',
      current_performance: '+18%',
    },
    google_display: {
      amount: 1800,
      percentage: 12,
      status: 'ontrack',
      kpi: 'CPM y frecuencia',
      target: 'CPM $3 o menos',
      current_performance: 'CPM $2.80',
    },
    tiktok_ads: {
      amount: 1050,
      percentage: 7,
      status: 'ontrack',
      kpi: 'Alcance audiencia 18-30',
      target: 'CPM $4 o menos',
      current_performance: 'CPM $3.70',
    },
  },
  recommendations: [
    {
      type: 'increase',
      channel: 'meta_ads',
      from: 54,
      to: 58,
      reason: 'Meta supera el CPM objetivo en 16% con engagement rate 4.4%; el rendimiento sostenido permite escalar inversión hacia Cyber Days',
      impact: '+250.000 personas alcanzadas estimadas',
    },
    {
      type: 'maintain',
      channel: 'youtube',
      reason: 'YouTube muestra VTR 28.4% con bumpers de 6 segundos enfocados en fibra simétrica; el canal aporta recordación con frecuencia controlada',
      impact: 'Mantener volumen actual',
    },
    {
      type: 'decrease',
      channel: 'google_display',
      from: 12,
      to: 10,
      reason: 'Display muestra frecuencia elevada en algunos placements; se sugiere reducir y reasignar a Meta para mantener freshness creativa',
      impact: 'Redistribución hacia canal de mejor rendimiento',
    },
  ],
};

// ============================================================================
// CONTENT PILLARS - Pilares de contenido WIN (awareness)
// ============================================================================
export const CONTENT_PILLARS = [
  {
    id: 1,
    title: 'Educación digital y conectividad',
    description: 'Qué es fibra óptica pura, diferencias frente a redes híbridas y por qué la velocidad simétrica importa',
    status: 'performing',
    performance: {
      engagement_rate: 6.8,
      reach: 480000,
      conversions: 145,
    },
    recommended_budget: 0.20,
    formats: ['Reels educativos', 'Carruseles explicativos', 'Stories Q&A', 'Lives con expertos'],
  },
  {
    id: 2,
    title: 'Estacionalidad y momentos clave',
    description: 'Activaciones de regreso a clases, Cyber Days, Fiestas Patrias y campañas de fin de año',
    status: 'overperforming',
    performance: {
      engagement_rate: 9.2,
      reach: 720000,
      conversions: 320,
    },
    recommended_budget: 0.30,
    formats: ['Reels con cuenta regresiva', 'Stories de oferta', 'Spark Ads', 'Bumpers YouTube'],
  },
  {
    id: 3,
    title: 'Casos de uso reales',
    description: 'Gaming, streaming, teletrabajo, smart home y educación en línea con piezas dedicadas',
    status: 'performing',
    performance: {
      engagement_rate: 7.4,
      reach: 395000,
      conversions: 198,
    },
    recommended_budget: 0.20,
    formats: ['Reels con creators', 'Carruseles comparativos', 'Posts producto'],
  },
  {
    id: 4,
    title: 'Diferenciadores WIN',
    description: 'Fibra 100% pura, velocidad simétrica y reconocimiento OSIPTEL en satisfacción al cliente',
    status: 'ontrack',
    performance: {
      engagement_rate: 5.6,
      reach: 280000,
      conversions: 112,
    },
    recommended_budget: 0.15,
    formats: ['Carruseles comparativos', 'Reels narrativos', 'Posts informativos'],
  },
  {
    id: 5,
    title: 'Comunidad y zonas',
    description: 'Cobertura en distritos de Lima, testimonios locales y nuevas zonas habilitadas',
    status: 'performing',
    performance: {
      engagement_rate: 6.4,
      reach: 320000,
      conversions: 165,
    },
    recommended_budget: 0.15,
    formats: ['Posts de cobertura', 'Stories con códigos por zona', 'Reels testimoniales'],
  },
];

// ============================================================================
// ALERTS - Alertas automáticas del sistema
// ============================================================================
export const ALERTS = [
  {
    id: 1,
    severity: 'high',
    title: 'Pico estacional pre Cyber Days detectado',
    message: 'Las búsquedas de "internet fibra óptica" subieron 18% esta semana y los topics de gaming y teletrabajo crecieron 24% en Meta. La ventana de Cyber Days se acerca.',
    action: 'Se sugiere reforzar Meta Ads y YouTube durante los próximos diez días, priorizando creatividades sobre velocidad simétrica y fibra pura.',
    timestamp: '2026-05-04T09:00:00',
  },
  {
    id: 2,
    severity: 'medium',
    title: 'Movimiento competitivo en Wow Perú',
    message: 'Wow Perú anunció una ampliación de su bundle DGO con una campaña activa en Meta y TikTok, concentrando inversión en distritos de Lima Moderna.',
    action: 'Se recomienda revisar el mensaje diferenciador de WIN en torno a "fibra 100% óptica" y "velocidad simétrica 1:1".',
    timestamp: '2026-05-03T15:30:00',
  },
  {
    id: 3,
    severity: 'low',
    title: 'Oportunidad en Lima Norte y Sur',
    message: 'El tráfico desde San Juan de Lurigancho, Comas y San Juan de Miraflores creció 22% en el último mes con CPI promedio de $0,11, por debajo del target.',
    action: 'Se sugiere evaluar segmentación geo dedicada en Meta Ads para escalar awareness fuera de Lima Moderna.',
    timestamp: '2026-05-03T11:45:00',
  },
  {
    id: 4,
    severity: 'high',
    title: 'Contenido viral con creator local',
    message: 'Un Reel orgánico de un creator de tecnología sobre "cómo es trabajar con fibra simétrica" alcanzó 620K vistas y 14.200 saves en una semana.',
    action: 'Se sugiere amplificar la pieza con Spark Ads y abrir conversación de colaboración pagada.',
    timestamp: '2026-05-02T18:00:00',
  },
];

// ============================================================================
// COMPETITOR INSIGHTS - Análisis de competencia telco fibra Lima
// ============================================================================
export const COMPETITOR_INSIGHTS = [
  {
    brand: 'Movistar Hogar',
    full_name: 'Movistar Hogar (Telefónica del Perú)',
    location: 'Lima Metropolitana',
    share_of_voice: 24,
    sentiment: 70,
    threat_level: 'high',
    trending_topics: ['bundle TV', 'streaming en hogar', 'cobertura premium', 'soporte 24/7'],
    description: 'Operador integrado con foco en bundles TV+internet y cobertura amplia en distritos premium de Lima',
    opportunity: 'Se observa la oportunidad de comunicar la simplicidad de la oferta de WIN basada en fibra 100% pura, sin atadura a paquetes televisivos',
  },
  {
    brand: 'Wow Perú',
    full_name: 'Wow Perú (Grupo Wow)',
    location: 'Lima Metropolitana',
    share_of_voice: 22,
    sentiment: 76,
    threat_level: 'high',
    trending_topics: ['DGO bundle', 'streaming deportes', 'Reels en Lima', 'crecimiento Lima Moderna'],
    description: 'Operador independiente con comunicación digital activa y bundle de entretenimiento DGO',
    opportunity: 'Se sugiere posicionar a WIN en estabilidad de red y soporte técnico local, atributos donde la marca tiene reconocimiento OSIPTEL',
  },
  {
    brand: 'WIN',
    full_name: 'WIN-NET TELECOM (Grupo WIN)',
    location: 'Lima Metropolitana y provincias',
    share_of_voice: 21,
    sentiment: 82,
    threat_level: null,
    trending_topics: ['fibra 100% óptica', 'velocidad simétrica', 'líder satisfacción OSIPTEL', 'instalación gratis'],
    description: 'Operador 100% fibra óptica, reconocido por OSIPTEL en satisfacción al cliente, con red en expansión',
    opportunity: 'Se sugiere reforzar awareness y consolidar el mensaje de fibra 100% pura junto al respaldo OSIPTEL',
  },
  {
    brand: 'Claro Hogar',
    full_name: 'Claro Hogar (América Móvil)',
    location: 'Perú nacional',
    share_of_voice: 7,
    sentiment: 65,
    threat_level: 'medium',
    trending_topics: ['cobertura nacional', 'bundle móvil', 'planes familia', 'paquetes integrados'],
    description: 'Operador integrado nacional con cobertura amplia y enfoque en bundle móvil + hogar',
    opportunity: 'Se observa la oportunidad de profundizar en distritos donde WIN tiene presencia consolidada con red propia',
  },
  {
    brand: 'Fiberlux',
    full_name: 'Fiberlux Group',
    location: 'Lima Metropolitana',
    share_of_voice: 4,
    sentiment: 72,
    threat_level: 'low',
    trending_topics: ['fibra dedicada', 'B2B residencial', 'simetría 1:1', 'redes propias'],
    description: 'Operador con origen B2B y foco premium en infraestructura propia',
    opportunity: 'Se sugiere atender al segmento residencial mainstream con la misma calidad técnica a precios accesibles',
  },
  {
    brand: 'Otros operadores',
    full_name: 'Operadores regionales y nicho (Fiberpro, Optical Networks y similares)',
    location: 'Lima Metropolitana y regiones',
    share_of_voice: 22,
    sentiment: 60,
    threat_level: 'low',
    trending_topics: ['precios bajos', 'cobertura local', 'instalación rápida'],
    description: 'Operadores regionales con presencia geográficamente limitada y foco en precio',
    opportunity: 'Se observa la oportunidad de ofrecer una propuesta de calidad técnica reconocida con cobertura más amplia y soporte estandarizado',
  },
];

// ============================================================================
// TRENDING SOUNDS - Sonidos relevantes para contenido (TikTok / Reels)
// ============================================================================
export const TRENDING_SOUNDS = [
  { name: 'Voices (Øneheart)', type: 'Lifestyle', usage: 'Transformación digital y velocidad', popularity: 92 },
  { name: 'Levitating (Dua Lipa)', type: 'Pop celebración', usage: 'Lifestyle conectado y entretenimiento', popularity: 85 },
  { name: 'Tití Me Preguntó (Bad Bunny)', type: 'LATAM evergreen', usage: 'Audiencia joven y storytelling', popularity: 88 },
  { name: 'Voiceover narrativo PE (creators tech)', type: 'Storytime', usage: 'Educación sobre fibra y conectividad', popularity: 70 },
  { name: 'Beat estacional Cyber Wow Perú', type: 'Estacional', usage: 'Cyber Days y campañas de fin de año', popularity: 75 },
];

// ============================================================================
// EXPORTS
// ============================================================================
export default {
  MOCK_GA4_DATA,
  PERFORMANCE_KPIS,
  OPPORTUNITY_SCORE,
  SERVICIOS_PERFORMANCE,
  SEDES_PERFORMANCE,
  COMPETENCIA,
  CRM_MOCKUP,
  BUDGET_ALLOCATION,
  CONTENT_PILLARS,
  ALERTS,
  COMPETITOR_INSIGHTS,
  TRENDING_SOUNDS,
};
