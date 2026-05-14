// Mock Data para Verisure Perú. Dashboard Demo Comercial
// Datos simulados realistas para captación de leads en alarmas monitoreadas en Lima

// ============================================================================
// MOCK GA4 DATA - Google Analytics 4 simulado para verisure.pe
// ============================================================================
export const MOCK_GA4_DATA = {
  sessions: {
    total: 70000,
    new_users: 50000,
    returning: 20000,
    avg_session_duration: '2:48',
    pages_per_session: 3.4,
    bounce_rate: 36.2,
  },

  top_pages: [
    {
      page: '/',
      title: 'Verisure Perú. Alarmas con monitoreo continuo',
      views: 25000,
      bounce_rate: 30,
      avg_time: '2:52',
    },
    {
      page: '/precio-alarma',
      title: 'Cotiza tu alarma Verisure',
      views: 15000,
      bounce_rate: 22,
      avg_time: '3:25',
    },
    {
      page: '/nuestra-alarma',
      title: 'Cómo funciona la alarma Verisure',
      views: 12000,
      bounce_rate: 28,
      avg_time: '3:08',
    },
    {
      page: '/alarmas-negocio',
      title: 'Alarmas para negocio y comercio',
      views: 10000,
      bounce_rate: 26,
      avg_time: '3:14',
    },
    {
      page: '/servicios/zerovision',
      title: 'ZeroVision. Neutralización por niebla',
      views: 8000,
      bounce_rate: 34,
      avg_time: '2:40',
    },
  ],

  conversions: {
    solicitudes_cotizacion: 1500,
    cotizaciones_calificadas: 1050,
    instalaciones_completadas: 120,
    clic_a_whatsapp: 6200,
    descargas_my_verisure: 3400,
    consultas_atencion: 980,
  },

  traffic_sources: {
    paid_search: { percentage: 35, sessions: 24500, label: 'Google Ads' },
    social_media: { percentage: 30, sessions: 21000, label: 'Meta Ads' },
    organic_search: { percentage: 22, sessions: 15400, label: 'Búsqueda Orgánica' },
    direct: { percentage: 9, sessions: 6300, label: 'Directo' },
    referral: { percentage: 4, sessions: 2800, label: 'Referidos' },
  },

  devices: {
    mobile: { percentage: 80, sessions: 56000, label: 'Mobile' },
    desktop: { percentage: 16, sessions: 11200, label: 'Desktop' },
    tablet: { percentage: 4, sessions: 2800, label: 'Tablet' },
  },

  locations: [
    { distrito: 'Lima Moderna', sessions: 24500, conversions: 525, percentage: 35 },
    { distrito: 'Lima Norte', sessions: 14000, conversions: 300, percentage: 20 },
    { distrito: 'Lima Este', sessions: 9800, conversions: 210, percentage: 14 },
    { distrito: 'Lima Sur', sessions: 9100, conversions: 195, percentage: 13 },
    { distrito: 'Lima Centro y otros', sessions: 7700, conversions: 165, percentage: 11 },
    { distrito: 'Callao', sessions: 4900, conversions: 105, percentage: 7 },
  ],
};

// ============================================================================
// PERFORMANCE KPIs - Métricas principales del dashboard (leads + tráfico web)
// Las claves del objeto se mantienen como históricas; cambia label y description.
// ============================================================================
export const PERFORMANCE_KPIS = {
  nuevos_miembros: {
    current: 120,
    previous: 92,
    change: '+30.4',
    trend: 'up',
    label: 'Instalaciones Cerradas',
    description: 'Contratos firmados con instalación completada este mes',
  },

  leads: {
    qualified: 1050,
    total: 1500,
    qualification_rate: 70.0,
    cost_per_lead: 30.00,
    trend: '+18.2%',
    trend_value: 18.2,
  },

  alcance: {
    current: 2800000,
    previous: 2200000,
    change: '+27.3',
    trend: 'up',
    label: 'Alcance Único',
    description: 'Personas únicas impactadas por la campaña este mes',
  },

  reach: {
    unique_reach: 2800000,
    impressions: 4900000,
    frequency: 1.75,
    trend: '+27.3%',
    trend_value: 27.3,
  },

  engagement: {
    total_interactions: 86000,
    engagement_rate: 3.1,
    shares: 9800,
    trend: '+19.6%',
    trend_value: 19.6,
  },

  budget: {
    total_budget: 50000,
    total_spent: 45000,
    spent_percentage: 90.0,
    cost_per_click: 0.48,
    trend: 'on-track',
  },

  cpl: {
    current: 30.00,
    previous: 38.50,
    change: '-22.1',
    trend: 'down',
    label: 'Costo por Lead',
    description: 'Costo promedio por solicitud de cotización generada',
    currency: '$',
  },

  trials: {
    current: 86000,
    previous: 71900,
    change: '+19.6',
    trend: 'up',
    label: 'Interacciones',
    description: 'Likes, comentarios, saves y compartidos en la campaña',
  },

  whatsapp: {
    current: 9.18,
    previous: 11.20,
    change: '-18.0',
    trend: 'down',
    label: 'CPM Promedio',
    description: 'Costo por mil impresiones servidas',
    currency: '$',
  },

  retention: {
    current: 0.52,
    previous: 0.61,
    change: '-14.8',
    trend: 'down',
    label: 'CPI Promedio',
    description: 'Costo por interacción (likes, comentarios, saves, clics)',
    currency: '$',
  },
};

// ============================================================================
// VERISURE AWARENESS SCORE - Índice de oportunidad de captación en seguridad
// ============================================================================
export const OPPORTUNITY_SCORE = {
  current_score: 76,
  trend: '+5.2%',
  components: {
    search_interest: {
      score: 84,
      weight: 0.25,
      contribution: 21.0,
      insight: 'Las búsquedas de "alarma para casa" y "cámaras de seguridad" sostienen niveles altos en Lima, con picos asociados a coberturas mediáticas de inseguridad',
    },
    social_engagement: {
      score: 75,
      weight: 0.20,
      contribution: 15.0,
      insight: '#seguridadenelhogar y #seguridadciudadana muestran engagement creciente en Reels, con presencia de testimoniales orgánicos del sector',
    },
    competitor_gap: {
      score: 70,
      weight: 0.20,
      contribution: 14.0,
      insight: 'Prosegur Alarmas concentra share of voice apoyado en su alianza con Movistar; se observa espacio para reforzar la doble verificación y ZeroVision como diferenciales',
    },
    seasonal_index: {
      score: 80,
      weight: 0.15,
      contribution: 12.0,
      insight: 'La ventana de fin de año y verano (noviembre a marzo) muestra el pico estacional del sector con incremento de búsquedas y consultas activas',
    },
    conversion_efficiency: {
      score: 70,
      weight: 0.20,
      contribution: 14.0,
      insight: 'El CPL blended de $30 está sobre el target sugerido para LATAM ($24 a $35) y mantiene margen de mejora vía Meta lead ads y geocercas por hotspots delictivos',
    },
  },
  recommendation: {
    message: 'Se observa una ventana favorable para reforzar Meta lead ads y Google Search orientados a Hogar Familiar Lima Moderna y Negocio PyME durante los próximos sesenta días. Las keywords de marca y categoría sostienen volumen, y los distritos de Lima Norte y Este presentan urgencia comercial con tasas de respuesta más rápidas tras evento delictivo.',
    confidence: '84%',
    priority: 'high',
    actions: [
      'Se sugiere reforzar Meta Reels con creatividades enfocadas en doble verificación y respuesta inmediata',
      'Se recomienda evaluar una capa de YouTube TrueView para amplificar recordación en distritos de Lima Top y Moderna',
      'Se propone explorar piezas dedicadas al segmento PyME con foco en extorsión y continuidad operativa',
      'Se observa la conveniencia de pilotar Spark Ads en TikTok con creadores del nicho hogar y seguridad ciudadana',
    ],
  },
};

// ============================================================================
// PRODUCTOS PERFORMANCE - Rendimiento por servicio Verisure
// ============================================================================
export const SERVICIOS_PERFORMANCE = [
  {
    id: 1,
    nombre: 'Alarma Residencial Esencial',
    demanda: 'Alta',
    leads: 450,
    conversiones: 23,
    conversion_rate: '5.1%',
    cpl: 20.00,
    revenue: 41400,
    trend: '+18%',
    precio: 'desde S/ 169/mes',
    leadAds: { formularios: 540, conversion_rate: 32, cpl: 18.50 },
    whatsapp: { conversaciones: 220, respondidas: 178, tasa_respuesta: 81 },
  },
  {
    id: 2,
    nombre: 'Alarma Residencial Plus con cámaras',
    demanda: 'Muy Alta',
    leads: 330,
    conversiones: 16,
    conversion_rate: '4.8%',
    cpl: 24.00,
    revenue: 35200,
    trend: '+22%',
    precio: 'desde S/ 195/mes',
    leadAds: { formularios: 410, conversion_rate: 30, cpl: 21.80 },
    whatsapp: { conversaciones: 175, respondidas: 142, tasa_respuesta: 81 },
  },
  {
    id: 3,
    nombre: 'ZeroVision Residencial',
    demanda: 'Alta',
    leads: 210,
    conversiones: 9,
    conversion_rate: '4.3%',
    cpl: 26.00,
    revenue: 24300,
    trend: '+14%',
    precio: 'desde S/ 219/mes',
    leadAds: { formularios: 260, conversion_rate: 28, cpl: 23.60 },
    whatsapp: { conversaciones: 110, respondidas: 86, tasa_respuesta: 78 },
  },
  {
    id: 4,
    nombre: 'Alarma para Negocio PyME',
    demanda: 'Muy Alta',
    leads: 270,
    conversiones: 18,
    conversion_rate: '6.5%',
    cpl: 18.00,
    revenue: 36500,
    trend: '+26%',
    precio: 'desde S/ 229/mes',
    leadAds: { formularios: 340, conversion_rate: 36, cpl: 15.80 },
    whatsapp: { conversaciones: 145, respondidas: 122, tasa_respuesta: 84 },
  },
  {
    id: 5,
    nombre: 'Cámaras de Videovigilancia',
    demanda: 'Media Alta',
    leads: 120,
    conversiones: 7,
    conversion_rate: '5.8%',
    cpl: 19.00,
    revenue: 13800,
    trend: '+12%',
    precio: 'desde S/ 149/mes',
    leadAds: { formularios: 150, conversion_rate: 30, cpl: 17.20 },
    whatsapp: { conversaciones: 62, respondidas: 50, tasa_respuesta: 80 },
  },
  {
    id: 6,
    nombre: 'Guardián Verisure con botón SOS',
    demanda: 'Media',
    leads: 120,
    conversiones: 8,
    conversion_rate: '7.0%',
    cpl: 16.00,
    revenue: 9600,
    trend: '+9%',
    precio: 'desde S/ 39/mes',
    leadAds: { formularios: 155, conversion_rate: 32, cpl: 14.50 },
    whatsapp: { conversaciones: 58, respondidas: 48, tasa_respuesta: 82 },
  },
];

// ============================================================================
// SEDES PERFORMANCE - Rendimiento por zona de cobertura Verisure
// (Verisure opera remoto: "miembros" representa clientes activos en zona;
// "nuevos" son instalaciones cerradas el mes; "ocupacion" es penetración estimada)
// ============================================================================
export const SEDES_PERFORMANCE = [
  { id: 1, nombre: 'Zona Lima Top', miembros: 4500, nuevos: 18, ocupacion: 6.2, revenue: 142500, trend: 'up' },
  { id: 2, nombre: 'Zona Lima Moderna Este', miembros: 5500, nuevos: 22, ocupacion: 5.4, revenue: 168000, trend: 'up' },
  { id: 3, nombre: 'Zona Lima Moderna Norte', miembros: 3800, nuevos: 16, ocupacion: 4.6, revenue: 112800, trend: 'up' },
  { id: 4, nombre: 'Zona Lima Norte', miembros: 4200, nuevos: 17, ocupacion: 2.8, revenue: 122100, trend: 'up' },
  { id: 5, nombre: 'Zona Lima Este', miembros: 3200, nuevos: 13, ocupacion: 2.4, revenue: 91200, trend: 'up' },
  { id: 6, nombre: 'Zona Lima Sur', miembros: 2400, nuevos: 10, ocupacion: 1.9, revenue: 67800, trend: 'stable' },
  { id: 7, nombre: 'Zona Lima Centro', miembros: 2100, nuevos: 8, ocupacion: 2.2, revenue: 56700, trend: 'stable' },
  { id: 8, nombre: 'Zona Callao', miembros: 1800, nuevos: 7, ocupacion: 2.0, revenue: 49500, trend: 'stable' },
  { id: 9, nombre: 'Eje Comercial Gamarra', miembros: 1500, nuevos: 6, ocupacion: 3.4, revenue: 48000, trend: 'up' },
  { id: 10, nombre: 'Eje Sur Balnearios', miembros: 1000, nuevos: 3, ocupacion: 5.8, revenue: 36000, trend: 'up' },
];

// ============================================================================
// COMPETENCIA - Operadores de seguridad y alarmas en Lima
// ============================================================================
export const COMPETENCIA = [
  {
    name: 'Prosegur Alarmas',
    full_name: 'Movistar Prosegur Alarms (JV con Telefónica)',
    market_share: 38,
    sedes: 0,
    rank: 1,
    type: 'Operador integrado con alianza telco',
    precio: 'S/ 99 a S/ 199 instalación, mensual S/ 120 a S/ 180',
    fortalezas: ['Alianza comercial con Movistar amplifica búsquedas y referidos', 'Base de seguidores Meta amplia con pauta sostenida', 'Promociones frecuentes de instalación'],
    debilidades: ['Diferenciación de la oferta tecnológica menos visible en comunicación', 'Producto residencial percibido como menos premium frente a competidores europeos'],
  },
  {
    name: 'Verisure Perú',
    full_name: 'Verisure Perú S.A.C.',
    market_share: 34,
    sedes: 10,
    rank: 2,
    type: 'Operador europeo de alarmas monitoreadas',
    precio: 'S/ 899 a S/ 1.399 instalación, mensual S/ 170 a S/ 207',
    fortalezas: ['Tecnología propietaria ZeroVision por niebla densa', 'Doble verificación por imagen y audio antes de avisar autoridades', 'Pauta digital intensiva con creatividades testimoniales', 'App My Verisure y Guardián con botón SOS'],
    debilidades: ['Ticket de instalación inicial elevado frente a competidores locales', 'Contrato con permanencia percibido como objeción frecuente'],
  },
  {
    name: 'Securitas',
    full_name: 'Securitas Perú',
    market_share: 10,
    sedes: 0,
    rank: 3,
    type: 'Operador global con foco corporativo',
    precio: 'Cotización a la medida',
    fortalezas: ['Portafolio integrado de guardia presencial y seguridad electrónica', 'Marca global reconocida en compliance corporativo', 'Capacidades de monitoreo remoto'],
    debilidades: ['Comunicación residencial limitada', 'Tarifario no público dificulta consideración rápida'],
  },
  {
    name: 'Liderman',
    full_name: 'Liderman (Grupo de Operaciones Especiales Perú)',
    market_share: 8,
    sedes: 0,
    rank: 4,
    type: 'Operador local con foco en vigilancia presencial',
    precio: 'Cotización a la medida',
    fortalezas: ['Trayectoria local de más de tres décadas', 'Alianza con Ajax Systems para hardware moderno', 'Marca cercana en barrios y condominios'],
    debilidades: ['Pauta digital baja en lead generation residencial', 'Reconocimiento mayor en vigilancia física que en alarmas monitoreadas'],
  },
  {
    name: 'G4S Perú',
    full_name: 'G4S (Allied Universal)',
    market_share: 4,
    sedes: 0,
    rank: 5,
    type: 'Operador global con foco B2B grandes cuentas',
    precio: 'Cotización a la medida',
    fortalezas: ['Plataforma Alarm.com integrada en soluciones tecnológicas', 'Escala global y compliance internacional', 'Capacidad de soluciones llave en mano para corporativos'],
    debilidades: ['Presencia residencial marginal en Lima', 'Comunicación enfocada en cuentas corporativas grandes'],
  },
  {
    name: 'Otros operadores',
    full_name: 'Marcas locales (Satcom, Top Security, Grupo Navarro y similares)',
    market_share: 6,
    sedes: 0,
    rank: 6,
    type: 'Operadores locales fragmentados',
    precio: 'Variable, desde S/ 49/mes',
    fortalezas: ['Precios competitivos en segmentos específicos', 'Atención cercana de barrio'],
    debilidades: ['Escala reducida y comunicación limitada', 'Variabilidad en niveles de servicio'],
  },
];

// ============================================================================
// CRM MOCKUP - Datos simulados de campañas activas Verisure
// ============================================================================
export const CRM_MOCKUP = {
  campaigns: [
    {
      id: 'camp_001',
      name: 'Meta Lead Ads Hogar Familiar Lima Moderna',
      status: 'active',
      budget: 20000,
      spent: 19500,
      leads: 900,
      cpl: 21.67,
      alert_status: 'normal',
      platform: 'Meta Ads',
      audience: 'Hogar Familiar Lima Moderna',
    },
    {
      id: 'camp_002',
      name: 'Google Search Categoría y Brand',
      status: 'active',
      budget: 17500,
      spent: 16800,
      leads: 460,
      cpl: 36.52,
      alert_status: 'warning',
      platform: 'Google Search',
      audience: 'Mixta hogar y negocio',
    },
    {
      id: 'camp_003',
      name: 'YouTube TrueView Brand Verisure Lima',
      status: 'active',
      budget: 5000,
      spent: 4500,
      leads: 60,
      cpl: 75.00,
      alert_status: 'normal',
      platform: 'YouTube',
      audience: 'Mixta',
    },
    {
      id: 'camp_004',
      name: 'TikTok Spark Negocio PyME y Hogar 30 a 45',
      status: 'active',
      budget: 4500,
      spent: 4200,
      leads: 80,
      cpl: 52.50,
      alert_status: 'warning',
      platform: 'TikTok Ads',
      audience: 'Negocio PyME Lima',
    },
  ],
  alerts: [
    {
      type: 'success',
      message: 'Meta Lead Ads Hogar Familiar supera el target con CPL $21,67 frente a $22 propuesto y volumen sostenido de 900 leads',
      campaign_id: 'camp_001',
      timestamp: '2026-05-04T14:30:00',
    },
    {
      type: 'warning',
      message: 'TikTok Spark Negocio muestra CPL $52,50 sobre el target $25; se sugiere refrescar creatividades y reducir frecuencia',
      campaign_id: 'camp_004',
      timestamp: '2026-05-04T11:15:00',
    },
  ],
  lead_quality: {
    avg_score: 70,
    distribution: {
      hot: 28,
      warm: 44,
      cold: 28,
    },
  },
};

// ============================================================================
// BUDGET ALLOCATION - Distribución de presupuesto por canal
// ============================================================================
export const BUDGET_ALLOCATION = {
  total_budget: 50000,
  currency: 'USD',
  period: 'monthly',
  distribution: {
    meta_ads: {
      amount: 20000,
      percentage: 40,
      status: 'overperforming',
      kpi: 'CPL y volumen',
      target: 'CPL $22 o menos',
      current_performance: 'CPL $21,67 con 900 leads',
      platforms: ['Instagram', 'Facebook'],
    },
    google_search: {
      amount: 17500,
      percentage: 35,
      status: 'performing',
      kpi: 'CPL alta intención',
      target: 'CPL $35 o menos',
      current_performance: 'CPL $36,52',
    },
    youtube: {
      amount: 5000,
      percentage: 10,
      status: 'performing',
      kpi: 'Recordación y VTR',
      target: 'VTR 25% o más',
      current_performance: 'VTR 27,4%',
    },
    tiktok_ads: {
      amount: 5000,
      percentage: 10,
      status: 'ontrack',
      kpi: 'Alcance segmento 30 a 45',
      target: 'CPM $4 o menos',
      current_performance: 'CPM $3,90',
    },
    google_display: {
      amount: 2500,
      percentage: 5,
      status: 'ontrack',
      kpi: 'Remarketing',
      target: 'CPM $3 o menos',
      current_performance: 'CPM $2,90',
    },
  },
  recommendations: [
    {
      type: 'increase',
      channel: 'meta_ads',
      from: 40,
      to: 44,
      reason: 'Meta Lead Ads sostiene CPL $21,67 con volumen creciente; el canal absorbe escalado adicional sin saturación inmediata',
      impact: 'Subida sugerida de aproximadamente 180 leads mensuales',
    },
    {
      type: 'maintain',
      channel: 'youtube',
      reason: 'YouTube aporta lift incremental al search con VTR 27,4%; el canal funciona como capa de awareness con frecuencia controlada',
      impact: 'Sin cambios en la asignación actual',
    },
    {
      type: 'decrease',
      channel: 'google_search',
      from: 35,
      to: 31,
      reason: 'Search supera el CPL target en 4%; se sugiere optimizar pujas en keywords competitivas y reasignar parte del presupuesto hacia Meta',
      impact: 'Bajada sugerida con redistribución hacia canales más eficientes',
    },
  ],
};

// ============================================================================
// CONTENT PILLARS - Pilares de contenido Verisure
// ============================================================================
export const CONTENT_PILLARS = [
  {
    id: 1,
    title: 'Educación en seguridad para el hogar',
    description: 'Cómo funciona el monitoreo continuo, qué es la doble verificación y por qué importa la conexión con autoridades',
    status: 'performing',
    performance: {
      engagement_rate: 5.4,
      reach: 520000,
      conversions: 195,
    },
    recommended_budget: 0.20,
    formats: ['Reels educativos', 'Carruseles explicativos', 'Stories de preguntas', 'Lives con especialistas'],
  },
  {
    id: 2,
    title: 'Estacionalidad y momentos clave',
    description: 'Activaciones por fin de año, vacaciones de verano, regreso a clases y Fiestas Patrias con foco en hogares ausentes',
    status: 'overperforming',
    performance: {
      engagement_rate: 8.1,
      reach: 780000,
      conversions: 380,
    },
    recommended_budget: 0.30,
    formats: ['Reels estacionales', 'Stories de viaje seguro', 'Spark Ads', 'Bumpers YouTube'],
  },
  {
    id: 3,
    title: 'Casos de uso y testimoniales',
    description: 'Historias de familias, comercios y negocios que activaron Verisure antes o después de un evento delictivo',
    status: 'performing',
    performance: {
      engagement_rate: 6.8,
      reach: 410000,
      conversions: 235,
    },
    recommended_budget: 0.20,
    formats: ['Reels testimoniales', 'Carruseles narrativos', 'Videos verticales largos'],
  },
  {
    id: 4,
    title: 'Diferenciadores Verisure',
    description: 'ZeroVision, Central Receptora propia, doble verificación y app My Verisure como capas de protección integradas',
    status: 'ontrack',
    performance: {
      engagement_rate: 4.6,
      reach: 295000,
      conversions: 124,
    },
    recommended_budget: 0.15,
    formats: ['Carruseles comparativos', 'Reels demostrativos', 'Posts informativos'],
  },
  {
    id: 5,
    title: 'Comunidad y zonas',
    description: 'Cobertura por zona de Lima, testimoniales locales por distrito y comunicación con asociaciones vecinales o de bodegueros',
    status: 'performing',
    performance: {
      engagement_rate: 5.9,
      reach: 340000,
      conversions: 168,
    },
    recommended_budget: 0.15,
    formats: ['Posts por zona', 'Stories con códigos por distrito', 'Reels testimoniales locales'],
  },
];

// ============================================================================
// ALERTS - Alertas automáticas del sistema
// ============================================================================
export const ALERTS = [
  {
    id: 1,
    severity: 'high',
    title: 'Pico estacional previo a fin de año',
    message: 'Las búsquedas de "alarma para casa" y "cámaras de seguridad" subieron 22% esta semana y los topics de seguridad ciudadana crecieron 18% en Meta. La ventana de noviembre y diciembre se acerca.',
    action: 'Se sugiere reforzar Meta Lead Ads y Google Search durante los próximos quince días, priorizando creatividades sobre doble verificación y monitoreo continuo.',
    timestamp: '2026-05-04T09:00:00',
  },
  {
    id: 2,
    severity: 'medium',
    title: 'Movimiento competitivo en Prosegur Alarmas',
    message: 'Prosegur lanzó una nueva tanda de creatividades en Meta con promo de instalación a S/ 99, sosteniendo inversión alta apoyada por la alianza con Movistar.',
    action: 'Se recomienda revisar el mensaje diferenciador de Verisure en torno a ZeroVision, doble verificación y respuesta inmediata a la PNP.',
    timestamp: '2026-05-03T15:30:00',
  },
  {
    id: 3,
    severity: 'low',
    title: 'Oportunidad en Lima Este y Norte',
    message: 'El tráfico desde San Juan de Lurigancho, Ate, Los Olivos y Comas creció 26% en el último mes con CPL promedio de $22, por debajo del target del canal.',
    action: 'Se sugiere evaluar segmentación geo dedicada con foco en hotspots delictivos para escalar volumen del segmento PyME.',
    timestamp: '2026-05-03T11:45:00',
  },
  {
    id: 4,
    severity: 'high',
    title: 'Contenido viral con creador local de seguridad',
    message: 'Un Reel orgánico de un creador de tecnología sobre "cómo proteger tu casa en vacaciones" alcanzó 540K vistas y 12.800 saves en una semana.',
    action: 'Se sugiere amplificar la pieza con Spark Ads y abrir conversación de colaboración pagada coherente con el tono de marca.',
    timestamp: '2026-05-02T18:00:00',
  },
];

// ============================================================================
// COMPETITOR INSIGHTS - Análisis de competencia seguridad Lima
// ============================================================================
export const COMPETITOR_INSIGHTS = [
  {
    brand: 'Prosegur Alarmas',
    full_name: 'Movistar Prosegur Alarms',
    location: 'Lima Metropolitana',
    share_of_voice: 38,
    sentiment: 72,
    threat_level: 'high',
    trending_topics: ['promo instalación', 'monitoreo 24/7', 'alianza Movistar', 'cobertura hogar y negocio'],
    description: 'Operador con alianza telco que apalanca la base Movistar para captación y comunicación masiva',
    opportunity: 'Se observa la oportunidad de comunicar la tecnología propietaria de Verisure (ZeroVision y doble verificación) como capa diferencial frente a la promesa básica de monitoreo',
  },
  {
    brand: 'Verisure Perú',
    full_name: 'Verisure Perú S.A.C.',
    location: 'Lima Metropolitana y provincias',
    share_of_voice: 34,
    sentiment: 78,
    threat_level: null,
    trending_topics: ['ZeroVision', 'doble verificación', 'app My Verisure', 'Guardián botón SOS'],
    description: 'Operador europeo con tecnología propietaria, pauta digital sostenida y app de seguridad personal',
    opportunity: 'Se sugiere reforzar awareness asociando ZeroVision y la doble verificación como capas que neutralizan el robo en curso',
  },
  {
    brand: 'Securitas',
    full_name: 'Securitas Perú',
    location: 'Lima y provincias',
    share_of_voice: 10,
    sentiment: 68,
    threat_level: 'medium',
    trending_topics: ['compliance corporativo', 'guardia presencial', 'soluciones integradas', 'gobierno corporativo'],
    description: 'Operador global con portafolio integrado de guardia presencial y seguridad electrónica orientado a B2B',
    opportunity: 'Se observa la oportunidad de capturar al segmento PyME que no es atendido por Securitas con propuesta de valor accesible y rápida',
  },
  {
    brand: 'Liderman',
    full_name: 'Liderman (Grupo de Operaciones Especiales Perú)',
    location: 'Lima Metropolitana',
    share_of_voice: 8,
    sentiment: 70,
    threat_level: 'medium',
    trending_topics: ['vigilancia presencial', 'Ajax Systems', 'comunidad y barrio', 'experiencia local'],
    description: 'Operador local con trayectoria amplia, foco principal en vigilancia presencial y crecimiento reciente en alarmas con Ajax',
    opportunity: 'Se sugiere apalancar la tecnología propietaria y el monitoreo desde Central propia como capas complementarias a la oferta local',
  },
  {
    brand: 'G4S Perú',
    full_name: 'G4S (Allied Universal)',
    location: 'Perú nacional',
    share_of_voice: 4,
    sentiment: 64,
    threat_level: 'low',
    trending_topics: ['Alarm.com', 'cuentas corporativas', 'soluciones tecnológicas', 'seguridad llave en mano'],
    description: 'Operador global enfocado en grandes cuentas corporativas con plataforma Alarm.com',
    opportunity: 'Se observa la oportunidad de comunicar la propuesta residencial y PyME de Verisure con un ticket accesible para usuarios que no son grandes corporativos',
  },
  {
    brand: 'Otros operadores',
    full_name: 'Marcas locales (Satcom, Top Security, Grupo Navarro y similares)',
    location: 'Lima Metropolitana y zonas específicas',
    share_of_voice: 6,
    sentiment: 60,
    threat_level: 'low',
    trending_topics: ['precios bajos', 'instalación rápida', 'atención de barrio', 'cobertura puntual'],
    description: 'Operadores locales fragmentados con foco en precio y atención cercana',
    opportunity: 'Se observa la oportunidad de comunicar la consistencia tecnológica y operativa de Verisure como propuesta estandarizada con respaldo internacional',
  },
];

// ============================================================================
// TRENDING SOUNDS - Sonidos relevantes para contenido (TikTok / Reels)
// ============================================================================
export const TRENDING_SOUNDS = [
  { name: 'Las Limeñitas (orgullo limeño)', type: 'Local PE', usage: 'Piezas con foco geo y comunidad', popularity: 88 },
  { name: 'POV ruido en la noche (suspense)', type: 'Suspense', usage: 'Demo de alarma activándose y respuesta inmediata', popularity: 82 },
  { name: 'Pelotero a la Bola (reedición)', type: 'Familia', usage: 'Storytelling familiar y protección del hogar', popularity: 75 },
  { name: 'Voiceover narrativo PE (creadores seguridad)', type: 'Storytime', usage: 'Educación sobre cómo proteger la casa y el negocio', popularity: 70 },
  { name: 'Audio evergreen Kreepa (humor cotidiano)', type: 'Humor', usage: 'Situaciones de descuido como puerta abierta o ventana sin cerrar', popularity: 68 },
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
