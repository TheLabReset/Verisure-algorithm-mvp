// Mock Data para Powerpay - Dashboard Demo Comercial
// Datos simulados realistas para fintech BNPL en Perú

// ============================================================================
// MOCK GA4 DATA - Google Analytics 4 simulado
// ============================================================================
export const MOCK_GA4_DATA = {
  sessions: {
    total: 165000,
    new_users: 105000,
    returning: 60000,
    avg_session_duration: '2:48',
    pages_per_session: 3.6,
    bounce_rate: 41.2,
  },

  top_pages: [
    {
      page: '/registrarme',
      title: 'Crear cuenta Powerpay',
      views: 28500,
      bounce_rate: 22,
      avg_time: '3:48',
    },
    {
      page: '/como-funciona',
      title: 'Cómo funciona Powerpay',
      views: 22400,
      bounce_rate: 28,
      avg_time: '3:12',
    },
    {
      page: '/tiendas/tecnologia',
      title: 'Tiendas de Tecnología',
      views: 19800,
      bounce_rate: 35,
      avg_time: '2:42',
    },
    {
      page: '/tiendas/electrohogar',
      title: 'Tiendas de Electrohogar',
      views: 14600,
      bounce_rate: 38,
      avg_time: '2:35',
    },
    {
      page: '/preguntas-frecuentes',
      title: 'Preguntas frecuentes',
      views: 12200,
      bounce_rate: 32,
      avg_time: '4:05',
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
    organic_search: { percentage: 22, sessions: 36300, label: 'Búsqueda Orgánica' },
    paid_search: { percentage: 27, sessions: 44550, label: 'Google Ads' },
    social_media: { percentage: 38, sessions: 62700, label: 'Meta Ads' },
    direct: { percentage: 9, sessions: 14850, label: 'Directo' },
    referral: { percentage: 4, sessions: 6600, label: 'Comercios partners' },
  },

  devices: {
    mobile: { percentage: 82, sessions: 135300, label: 'Mobile' },
    desktop: { percentage: 14, sessions: 23100, label: 'Desktop' },
    tablet: { percentage: 4, sessions: 6600, label: 'Tablet' },
  },

  locations: [
    { distrito: 'Lima Metropolitana', sessions: 99000, conversions: 870, percentage: 60 },
    { distrito: 'Arequipa', sessions: 16500, conversions: 145, percentage: 10 },
    { distrito: 'Trujillo', sessions: 11550, conversions: 102, percentage: 7 },
    { distrito: 'Chiclayo', sessions: 9900, conversions: 87, percentage: 6 },
    { distrito: 'Piura', sessions: 8250, conversions: 72, percentage: 5 },
    { distrito: 'Cusco', sessions: 6600, conversions: 58, percentage: 4 },
    { distrito: 'Huancayo', sessions: 4950, conversions: 44, percentage: 3 },
    { distrito: 'Otros', sessions: 8250, conversions: 72, percentage: 5 },
  ],
};

// ============================================================================
// PERFORMANCE KPIs - Métricas principales del dashboard
// ============================================================================
export const PERFORMANCE_KPIS = {
  nuevos_miembros: {
    current: 1050,
    previous: 880,
    change: '+19,3',
    trend: 'up',
    label: 'Cuentas Creadas',
    description: 'Cuentas con registro y KYC completos',
  },

  leads: {
    qualified: 1050,
    total: 1450,
    qualification_rate: 72.4,
    cost_per_lead: 9.93,
    trend: '+22,9%',
    trend_value: 22.9,
  },

  alcance: {
    current: 1800000,
    previous: 1400000,
    change: '+28,6',
    trend: 'up',
    label: 'Alcance Total',
    description: 'Usuarios únicos impactados a nivel nacional',
  },

  reach: {
    unique_reach: 1800000,
    impressions: 6300000,
    frequency: 3.5,
    trend: '+28,6%',
    trend_value: 28.6,
  },

  engagement: {
    total_interactions: 75000,
    engagement_rate: 4.2,
    shares: 8500,
    trend: '+15,3%',
    trend_value: 15.3,
  },

  budget: {
    total_budget: 15000,
    total_spent: 14400,
    spent_percentage: 96.0,
    cost_per_click: 0.42,
    trend: 'on-track',
  },

  cpl: {
    current: 9.93,
    previous: 11.20,
    change: '-11,3',
    trend: 'down',
    label: 'Costo por Lead',
    description: 'Costo promedio por registro iniciado',
    currency: '$',
  },

  trials: {
    current: 1050,
    previous: 880,
    change: '+19,3',
    trend: 'up',
    label: 'KYC Completados',
    description: 'Cuentas con identidad validada y tarjeta vinculada',
  },

  whatsapp: {
    current: 870,
    previous: 690,
    change: '+26,1',
    trend: 'up',
    label: 'Leads Meta Ads',
    description: 'Registros iniciados desde campañas Meta',
  },

  retention: {
    current: 9.0,
    previous: 7.4,
    change: '+1,6',
    trend: 'up',
    label: 'Tasa de primera transacción',
    description: 'Cuentas que realizan su primera compra en 30 días',
  },
};

// ============================================================================
// POWERPAY OPPORTUNITY SCORE - Índice de oportunidad BNPL
// ============================================================================
export const OPPORTUNITY_SCORE = {
  current_score: 78,
  trend: '+5,2%',
  components: {
    search_interest: {
      score: 84,
      weight: 0.25,
      contribution: 21.0,
      insight: 'Búsquedas de "cuotas sin intereses" subieron 24% vs. mes anterior',
    },
    social_engagement: {
      score: 72,
      weight: 0.20,
      contribution: 14.4,
      insight: '#CyberWow y #CuotasSinIntereses suman más de 120K menciones por semana en Perú',
    },
    competitor_gap: {
      score: 76,
      weight: 0.20,
      contribution: 15.2,
      insight: 'Yape y Cuotéalo concentran billetera y crédito bancario; Powerpay diferencia con BNPL puro independiente del banco emisor',
    },
    seasonal_index: {
      score: 88,
      weight: 0.15,
      contribution: 13.2,
      insight: 'Cyber Wow Noviembre y Black Friday en ventana inmediata, pico estacional confirmado',
    },
    conversion_efficiency: {
      score: 71,
      weight: 0.20,
      contribution: 14.2,
      insight: 'CPL actual $9,93 dentro del rango target ($9-12), con margen para escalar',
    },
  },
  recommendation: {
    message: 'Se observa una ventana favorable para ampliar inversión en Meta Ads orientada a la audiencia adulta planificadora durante Cyber Wow. La keyword "cuotas sin intereses" muestra intención sostenida y los comercios de tecnología y electrohogar suelen concentrar tickets promedio más altos.',
    confidence: '88%',
    priority: 'high',
    actions: [
      'Se sugiere reforzar Meta Ads con creatividades enfocadas en "no consume tu línea de crédito"',
      'Se recomienda evaluar una campaña Search en torno a Cyber Wow con landing por categoría',
      'Se propone explorar piezas educativas que comparen Powerpay frente a la cuota tradicional con tarjeta',
      'Se observa la conveniencia de priorizar comercios de tecnología y electrohogar en pauta y co-branding',
    ],
  },
};

// ============================================================================
// CATEGORIAS PERFORMANCE - Rendimiento por categoría de comercios
// ============================================================================
export const SERVICIOS_PERFORMANCE = [
  {
    id: 1,
    nombre: 'Tecnología',
    demanda: 'Alta',
    leads: 465,
    conversiones: 30,
    conversion_rate: '6,5%',
    cpl: 7.50,
    revenue: 28500,
    trend: '+18%',
    precio: 'S/1.500-4.000',
    leadAds: { formularios: 612, conversion_rate: 38, cpl: 6.20 },
    whatsapp: { conversaciones: 245, respondidas: 198, tasa_respuesta: 81 },
  },
  {
    id: 2,
    nombre: 'Electrohogar',
    demanda: 'Alta',
    leads: 320,
    conversiones: 17,
    conversion_rate: '5,2%',
    cpl: 9.20,
    revenue: 22400,
    trend: '+14%',
    precio: 'S/1.200-5.500',
    leadAds: { formularios: 420, conversion_rate: 32, cpl: 7.80 },
    whatsapp: { conversaciones: 175, respondidas: 138, tasa_respuesta: 79 },
  },
  {
    id: 3,
    nombre: 'Moda y calzado',
    demanda: 'Alta',
    leads: 230,
    conversiones: 18,
    conversion_rate: '8,0%',
    cpl: 8.10,
    revenue: 11200,
    trend: '+11%',
    precio: 'S/250-900',
    leadAds: { formularios: 305, conversion_rate: 30, cpl: 6.90 },
    whatsapp: { conversaciones: 132, respondidas: 108, tasa_respuesta: 82 },
  },
  {
    id: 4,
    nombre: 'Entretenimiento y viajes',
    demanda: 'Media-Alta',
    leads: 175,
    conversiones: 16,
    conversion_rate: '9,0%',
    cpl: 10.20,
    revenue: 8200,
    trend: '+22%',
    precio: 'S/180-1.500',
    leadAds: { formularios: 230, conversion_rate: 28, cpl: 8.40 },
    whatsapp: { conversaciones: 95, respondidas: 78, tasa_respuesta: 82 },
  },
  {
    id: 5,
    nombre: 'Belleza y salud',
    demanda: 'Media',
    leads: 145,
    conversiones: 12,
    conversion_rate: '8,5%',
    cpl: 11.10,
    revenue: 6900,
    trend: '+9%',
    precio: 'S/350-1.200',
    leadAds: { formularios: 190, conversion_rate: 26, cpl: 9.20 },
    whatsapp: { conversaciones: 78, respondidas: 60, tasa_respuesta: 77 },
  },
  {
    id: 6,
    nombre: 'Lifestyle premium',
    demanda: 'Media',
    leads: 115,
    conversiones: 5,
    conversion_rate: '4,0%',
    cpl: 13.20,
    revenue: 5400,
    trend: '+6%',
    precio: 'S/600-5.000',
    leadAds: { formularios: 150, conversion_rate: 22, cpl: 11.20 },
    whatsapp: { conversaciones: 64, respondidas: 47, tasa_respuesta: 73 },
  },
];

// ============================================================================
// COMERCIOS PARTNERS PERFORMANCE - Rendimiento por comercio
// ============================================================================
export const SEDES_PERFORMANCE = [
  { id: 1, nombre: 'Samsung Store', miembros: 1820, nuevos: 145, ocupacion: 68, revenue: 78000, trend: 'up' },
  { id: 2, nombre: 'iShop Perú', miembros: 1450, nuevos: 112, ocupacion: 72, revenue: 92000, trend: 'up' },
  { id: 3, nombre: 'Mac Center', miembros: 1280, nuevos: 98, ocupacion: 65, revenue: 68500, trend: 'up' },
  { id: 4, nombre: 'PC Factory', miembros: 1080, nuevos: 82, ocupacion: 58, revenue: 42000, trend: 'stable' },
  { id: 5, nombre: 'Sony Store', miembros: 920, nuevos: 68, ocupacion: 62, revenue: 38500, trend: 'up' },
  { id: 6, nombre: 'iRobot Perú', miembros: 380, nuevos: 32, ocupacion: 55, revenue: 18200, trend: 'stable' },
  { id: 7, nombre: 'Aldo & Co.', miembros: 1350, nuevos: 105, ocupacion: 75, revenue: 22600, trend: 'up' },
  { id: 8, nombre: 'Footloose', miembros: 1180, nuevos: 92, ocupacion: 80, revenue: 15800, trend: 'up' },
  { id: 9, nombre: 'Coliseum', miembros: 860, nuevos: 65, ocupacion: 70, revenue: 12400, trend: 'stable' },
  { id: 10, nombre: 'Teleticket', miembros: 1620, nuevos: 138, ocupacion: 82, revenue: 18500, trend: 'up' },
  { id: 11, nombre: 'NuSkin Perú', miembros: 290, nuevos: 22, ocupacion: 48, revenue: 9800, trend: 'stable' },
  { id: 12, nombre: 'Thermomix', miembros: 145, nuevos: 12, ocupacion: 42, revenue: 26500, trend: 'up' },
];

// ============================================================================
// COMPETENCIA - BNPL y soluciones de cuotas en Perú
// ============================================================================
export const COMPETENCIA = [
  {
    name: 'Cuotéalo',
    full_name: 'Cuotéalo (BCP)',
    market_share: 30,
    sedes: 1000,
    rank: 1,
    type: 'BNPL bancario',
    precio: 'S/100-7.000 hasta 24 cuotas',
    fortalezas: ['Marca BCP', 'No requiere tarjeta de crédito', 'Red amplia de comercios'],
    debilidades: ['Solo clientes BCP', 'Requiere validación con clave digital y token'],
  },
  {
    name: 'Yape Cuotas',
    full_name: 'Yape (BCP / Credicorp)',
    market_share: 30,
    sedes: 200,
    rank: 1,
    type: 'Billetera con BNPL embebido',
    precio: 'S/50-10.000 hasta 18 cuotas',
    fortalezas: ['Más de 17 millones de usuarios', 'Marketplace propio Yape Tienda', 'Créditos sin tarjeta'],
    debilidades: ['Volumen alto en monto bajo', 'Catálogo concentrado en su marketplace'],
  },
  {
    name: 'Divídelo',
    full_name: 'Divídelo (Interbank / Niubiz)',
    market_share: 15,
    sedes: 800,
    rank: 3,
    type: 'Cuotas tradicionales',
    precio: '3 a 18 cuotas',
    fortalezas: ['Integración con marketplaces como Mercado Libre', 'Alianzas con Rappi', 'Infraestructura Niubiz'],
    debilidades: ['Solo tarjetas Interbank', 'Consume línea de crédito de la tarjeta'],
  },
  {
    name: 'CMR Cuotas',
    full_name: 'Banco Falabella / CMR',
    market_share: 10,
    sedes: 300,
    rank: 4,
    type: 'Cuotas con tarjeta retail',
    precio: 'Hasta 36 cuotas',
    fortalezas: ['Ecosistema retail propio (Saga, Tottus, Sodimac)', 'CMR Puntos', 'Base de tarjetahabientes consolidada'],
    debilidades: ['Cerrado al ecosistema Falabella', 'Requiere tarjeta CMR específica'],
  },
  {
    name: 'aCuotaz',
    full_name: 'aCuotaz (Apurata)',
    market_share: 5,
    sedes: 80,
    rank: 6,
    type: 'BNPL fintech para no bancarizados',
    precio: 'S/100-2.000 hasta 12 cuotas',
    fortalezas: ['Atiende segmento no bancarizado', 'Regulado por SBS', 'Primeras cuotas 0% interés'],
    debilidades: ['Catálogo limitado', 'Presencia digital incipiente'],
  },
  {
    name: 'Powerpay',
    full_name: 'Powerpay (BBVA / Breca)',
    market_share: 10,
    sedes: 300,
    rank: 5,
    type: 'BNPL puro independiente',
    precio: 'Hasta 12 cuotas, desde 0% interés',
    fortalezas: ['Funciona con cualquier tarjeta de crédito o débito', 'No consume la línea de crédito', 'Transparencia y simplicidad'],
    debilidades: ['Marca aún en construcción de awareness', 'Red de comercios en expansión'],
  },
];

// ============================================================================
// CRM MOCKUP - Datos simulados de campañas activas
// ============================================================================
export const CRM_MOCKUP = {
  campaigns: [
    {
      id: 'camp_001',
      name: 'Cyber Wow - Tecnología y Electrohogar',
      status: 'active',
      budget: 6300,
      spent: 6055,
      leads: 660,
      cpl: 9.17,
      alert_status: 'normal',
      platform: 'Meta Ads',
      audience: 'Joven Digital Primer-Usuario',
    },
    {
      id: 'camp_002',
      name: 'Brand + Genérico Cuotas Sin Intereses',
      status: 'active',
      budget: 4500,
      spent: 4300,
      leads: 410,
      cpl: 10.49,
      alert_status: 'normal',
      platform: 'Google Search',
      audience: 'Adulto Bancarizado Planificador',
    },
    {
      id: 'camp_003',
      name: 'Línea de Crédito Libre - Adulto',
      status: 'active',
      budget: 2900,
      spent: 2790,
      leads: 250,
      cpl: 11.16,
      alert_status: 'normal',
      platform: 'Meta Ads',
      audience: 'Adulto Bancarizado Planificador',
    },
    {
      id: 'camp_004',
      name: 'Retargeting Comercios Partners',
      status: 'active',
      budget: 1300,
      spent: 1255,
      leads: 130,
      cpl: 9.65,
      alert_status: 'warning',
      platform: 'Google Display',
      audience: 'Mixta',
    },
  ],
  alerts: [
    {
      type: 'success',
      message: 'Campaña "Cyber Wow Tecnología" superando objetivos: CPL $9,17 frente al target $10',
      campaign_id: 'camp_001',
      timestamp: '2026-05-04T14:30:00',
    },
    {
      type: 'warning',
      message: 'Retargeting Display con frecuencia 6,8 (cap recomendado 5). Se sugiere refrescar creatividades',
      campaign_id: 'camp_004',
      timestamp: '2026-05-04T11:15:00',
    },
  ],
  lead_quality: {
    avg_score: 71,
    distribution: {
      hot: 28,
      warm: 48,
      cold: 24,
    },
  },
};

// ============================================================================
// BUDGET ALLOCATION - Distribución de presupuesto por canal
// ============================================================================
export const BUDGET_ALLOCATION = {
  total_budget: 15000,
  currency: 'USD',
  period: 'monthly',
  distribution: {
    meta_ads: {
      amount: 9000,
      percentage: 60,
      status: 'overperforming',
      kpi: 'CPL (Costo por Lead)',
      target: '$11 o menos',
      current_performance: '$9,40',
      platforms: ['Instagram', 'Facebook'],
    },
    google_search: {
      amount: 4050,
      percentage: 27,
      status: 'performing',
      kpi: 'CPL (Costo por Lead)',
      target: '$12 o menos',
      current_performance: '$10,80',
    },
    google_display: {
      amount: 1200,
      percentage: 8,
      status: 'ontrack',
      kpi: 'CPM (Costo por Mil)',
      target: '$3,50 o menos',
      current_performance: '$3,20',
    },
    youtube: {
      amount: 750,
      percentage: 5,
      status: 'ontrack',
      kpi: 'View-through rate',
      target: '20% o más',
      current_performance: '23,4%',
    },
  },
  recommendations: [
    {
      type: 'increase',
      channel: 'meta_ads',
      from: 60,
      to: 64,
      reason: 'Meta supera el CPL objetivo en 14% con audiencia adulta planificadora; el rendimiento sostenido permite escalar inversión durante Cyber Wow',
      impact: '+95 registros mensuales estimados',
    },
    {
      type: 'maintain',
      channel: 'google_search',
      reason: 'Search captura intención alta en keywords de marca y cuotas sin intereses; volumen orgánico de búsquedas creciente refuerza el canal',
      impact: 'Mantener volumen actual',
    },
    {
      type: 'decrease',
      channel: 'google_display',
      from: 8,
      to: 6,
      reason: 'Display muestra frecuencia elevada en retargeting; se sugiere reducir y reasignar a Meta para evitar fatiga creativa',
      impact: 'Redistribución hacia canal de mejor rendimiento',
    },
  ],
};

// ============================================================================
// CONTENT PILLARS - Pilares de contenido Powerpay
// ============================================================================
export const CONTENT_PILLARS = [
  {
    id: 1,
    title: 'Educación financiera y transparencia',
    description: 'Cómo funciona Powerpay, comparativos claros y resolución de dudas frecuentes',
    status: 'performing',
    performance: {
      engagement_rate: 6.4,
      reach: 320000,
      conversions: 145,
    },
    recommended_budget: 0.20,
    formats: ['Reels educativos', 'Carruseles explicativos', 'Stories Q&A', 'Lives con expertos'],
  },
  {
    id: 2,
    title: 'Cyber Days y momentos estacionales',
    description: 'Activaciones de Cyber Wow, Día de la Madre, Navidad y Black Friday',
    status: 'overperforming',
    performance: {
      engagement_rate: 11.8,
      reach: 480000,
      conversions: 320,
    },
    recommended_budget: 0.30,
    formats: ['Reels de oferta', 'Stories con cuenta regresiva', 'Spark Ads', 'Bumpers YouTube'],
  },
  {
    id: 3,
    title: 'Casos de uso por categoría',
    description: 'Tecnología, electrohogar, moda y viajes con piezas dedicadas a cada vertical',
    status: 'performing',
    performance: {
      engagement_rate: 7.2,
      reach: 295000,
      conversions: 198,
    },
    recommended_budget: 0.20,
    formats: ['Posts producto', 'Reels con creators', 'Carruseles comparativos'],
  },
  {
    id: 4,
    title: 'Diferenciadores y comparativas',
    description: 'Powerpay no consume tu línea de crédito y funciona con cualquier tarjeta',
    status: 'ontrack',
    performance: {
      engagement_rate: 5.1,
      reach: 220000,
      conversions: 112,
    },
    recommended_budget: 0.15,
    formats: ['Carruseles comparativos', 'Reels narrativos', 'Posts informativos'],
  },
  {
    id: 5,
    title: 'Comercios partners y novedades',
    description: 'Nuevos comercios afiliados, campañas conjuntas y descuentos exclusivos',
    status: 'performing',
    performance: {
      engagement_rate: 6.8,
      reach: 240000,
      conversions: 165,
    },
    recommended_budget: 0.15,
    formats: ['Posts de alianza', 'Stories con códigos', 'Reels de unboxing con creators'],
  },
];

// ============================================================================
// ALERTS - Alertas automáticas del sistema
// ============================================================================
export const ALERTS = [
  {
    id: 1,
    severity: 'high',
    title: 'Pico estacional Cyber Wow detectado',
    message: 'Las búsquedas de "cuotas sin intereses" subieron 24% esta semana y los carritos abandonados en comercios de tecnología crecieron un 35%. La ventana de Cyber Wow se acerca.',
    action: 'Se sugiere reforzar Meta Ads y Search durante los próximos diez días, priorizando categorías de tecnología y electrohogar.',
    timestamp: '2026-05-04T09:00:00',
  },
  {
    id: 2,
    severity: 'medium',
    title: 'Movimiento competitivo en Yape Tienda',
    message: 'Yape Tienda anunció una ampliación de su catálogo en electrohogar con campaña en Meta y TikTok. Concentración de inventario en marcas como Samsung y Coolbox.',
    action: 'Se recomienda revisar el mensaje diferenciador de Powerpay en torno a "funciona con cualquier tarjeta" y "no consume tu línea".',
    timestamp: '2026-05-03T15:30:00',
  },
  {
    id: 3,
    severity: 'low',
    title: 'Oportunidad en provincias',
    message: 'El tráfico desde Arequipa, Trujillo y Chiclayo creció 18% en el último mes con CPL promedio de $8,90, por debajo del target.',
    action: 'Se sugiere evaluar segmentación geo dedicada en Meta Ads para escalar adquisición fuera de Lima.',
    timestamp: '2026-05-03T11:45:00',
  },
  {
    id: 4,
    severity: 'high',
    title: 'Contenido viral con creator local',
    message: 'Un Reel orgánico de un creador de tecnología sobre "cómo financié mi laptop sin tocar la línea" alcanzó 480K vistas y 12.500 saves en una semana.',
    action: 'Se sugiere amplificar la pieza con Spark Ads y abrir conversación de colaboración pagada.',
    timestamp: '2026-05-02T18:00:00',
  },
];

// ============================================================================
// COMPETITOR INSIGHTS - Análisis de competencia BNPL Perú
// ============================================================================
export const COMPETITOR_INSIGHTS = [
  {
    brand: 'Cuotéalo',
    full_name: 'Cuotéalo (BCP)',
    location: 'Perú nacional',
    share_of_voice: 30,
    sentiment: 72,
    threat_level: 'high',
    trending_topics: ['cuotas sin tarjeta', 'BCP', 'comercios afiliados', 'token y clave digital'],
    description: 'BNPL bancario apoyado en la base de clientes BCP, que no requiere tarjeta de crédito',
    opportunity: 'Se observa la oportunidad de comunicar que Powerpay funciona con cualquier tarjeta, sin estar limitado a un banco específico',
  },
  {
    brand: 'Yape',
    full_name: 'Yape (BCP / Credicorp)',
    location: 'Perú nacional',
    share_of_voice: 30,
    sentiment: 80,
    threat_level: 'high',
    trending_topics: ['Yape Tienda', 'créditos Yape', 'billetera', 'pagos QR'],
    description: 'Billetera con amplia base de usuarios y BNPL embebido, con catálogo concentrado en su marketplace',
    opportunity: 'Se sugiere posicionar Powerpay en tickets medios-altos, donde la billetera tiende a ser un touchpoint menos natural',
  },
  {
    brand: 'Divídelo',
    full_name: 'Divídelo (Interbank / Niubiz)',
    location: 'Perú nacional',
    share_of_voice: 15,
    sentiment: 68,
    threat_level: 'medium',
    trending_topics: ['Mercado Libre', 'Rappi', 'cuotas Interbank', 'Niubiz'],
    description: 'Cuotas con tarjeta Interbank integradas en marketplaces grandes',
    opportunity: 'Se observa la oportunidad de comunicar que Powerpay no consume la línea de crédito de la tarjeta, a diferencia de las cuotas tradicionales',
  },
  {
    brand: 'CMR Cuotas',
    full_name: 'Banco Falabella / CMR',
    location: 'Perú nacional',
    share_of_voice: 10,
    sentiment: 70,
    threat_level: 'medium',
    trending_topics: ['Saga Falabella', 'Tottus', 'Sodimac', 'CMR Puntos'],
    description: 'Cuotas con tarjeta CMR vinculadas al ecosistema retail Falabella',
    opportunity: 'Se sugiere atender a usuarios fuera del ecosistema Falabella con una propuesta abierta a múltiples comercios',
  },
  {
    brand: 'aCuotaz',
    full_name: 'aCuotaz (Apurata)',
    location: 'Perú nacional digital',
    share_of_voice: 5,
    sentiment: 65,
    threat_level: 'low',
    trending_topics: ['no bancarizados', 'inclusión financiera', 'cuotas quincenales'],
    description: 'Fintech regulada por la SBS, enfocada en el segmento sin historial crediticio',
    opportunity: 'Se observa que Powerpay puede atender al usuario bancarizado que valora trabajar con cualquier tarjeta y una red de comercios amplia',
  },
  {
    brand: 'Powerpay',
    full_name: 'Powerpay (BBVA / Breca)',
    location: 'Perú nacional digital',
    share_of_voice: 10,
    sentiment: 76,
    threat_level: null,
    trending_topics: ['cuotas sin intereses', 'cualquier tarjeta', 'no consume línea', 'transparencia'],
    description: 'BNPL puro respaldado por BBVA y Breca, con identidad propia y red de comercios diversa',
    opportunity: 'Se sugiere reforzar awareness y consolidar el mensaje "el poder de elegir cómo pagar"',
  },
];

// ============================================================================
// TRENDING SOUNDS - Sonidos relevantes para contenido (TikTok / Reels)
// ============================================================================
export const TRENDING_SOUNDS = [
  { name: 'Oh No Oh No (Kreepa remix LATAM)', type: 'Comedia', usage: 'Compras impulsivas y fails', popularity: 92 },
  { name: 'Aesthetic shopping vibes (lo-fi viral)', type: 'Lifestyle', usage: 'Hauls y unboxing', popularity: 78 },
  { name: 'Una noche en Medellín sped-up (Cris Mj)', type: 'Trend joven', usage: 'Lifestyle y compras', popularity: 88 },
  { name: 'Money Money Money (ABBA flip TikTok)', type: 'Finanzas', usage: 'Cuotas, ahorro, BNPL', popularity: 70 },
  { name: 'Voiceover narrativo PE (creators finanzas)', type: 'Storytime', usage: 'Educación financiera y casos reales', popularity: 65 },
  { name: 'Cyber Wow beat genérico Perú', type: 'Estacional', usage: 'Cyber Days y campañas estacionales', popularity: 75 },
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
