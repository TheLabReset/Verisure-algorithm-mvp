// Keywords y hashtags para Verisure Perú — Alarmas monitoreadas Lima
// Configuración completa para búsquedas y monitoreo social
// Nota: nombres de exports (KEYWORDS_FITZONE, HASHTAGS_FITZONE, FITNESS_SOURCES,
// SEDES_FITZONE) son históricos del template y se mantienen por compatibilidad.

export const KEYWORDS_FITZONE = {
  // Marca Verisure
  marca: [
    'verisure',
    'verisure peru',
    'verisure precio',
    'verisure opiniones',
    'verisure lima',
    'verisure alarmas',
    'alarmas verisure',
    'verisure cotizacion',
    'que es verisure',
    'contratar verisure',
  ],

  // Keywords de categoría (alarmas y seguridad residencial)
  categoria: [
    'alarma para casa',
    'alarmas monitoreadas',
    'sistema de alarma',
    'camaras de seguridad',
    'monitoreo 24 horas',
    'seguridad para el hogar',
    'alarma inalambrica',
    'central de alarmas',
    'alarma con monitoreo',
    'sistema seguridad casa',
  ],

  // Intención de compra alta
  intencion: [
    'instalar alarma casa',
    'cotizar alarma casa',
    'alarma con respuesta policial',
    'mejor alarma para casa lima',
    'empresa de alarmas lima',
    'alarma con app movil',
    'contratar alarma monitoreada',
    'cotizar sistema de seguridad',
    'alarma casa instalacion gratis',
    'precio alarma para casa',
  ],

  // Keywords de producto/uso
  servicios: [
    'alarma residencial',
    'alarma para negocio',
    'camaras videovigilancia',
    'alarma con camaras',
    'boton de panico hogar',
    'alarma con sirena',
    'sensor de movimiento',
    'kit alarma inalambrica',
    'monitoreo remoto seguridad',
    'central receptora alarmas',
  ],

  // Competencia
  competidores: [
    'prosegur alarmas',
    'prosegur peru',
    'prosegur movistar',
    'adt alarmas',
    'securitas alarma',
    'securitas peru',
    'liderman alarmas',
    'liderman hogar',
    'g4s peru',
    'satcom alarmas',
  ],

  // Categorías de uso
  disciplinas: [
    'alarma para tienda',
    'seguridad para bodega',
    'alarma para oficina',
    'seguridad para restaurante',
    'alarma condominio',
    'seguridad farmacia',
    'proteccion vivienda vacaciones',
    'alarma comercio pyme',
    'seguridad edificio empresarial',
    'monitoreo de eventos seguridad',
  ],

  // Resultados / educación
  resultados: [
    'como funciona una alarma',
    'doble verificacion alarma',
    'que es zerovision',
    'aviso a la pnp por alarma',
    'falsa alarma como evitar',
    'aplicacion my verisure',
    'alarma comunitaria como funciona',
    'cerco electrico precio',
    'comparativa alarmas peru',
    'sucamec central de alarmas',
  ],

  // Geografías Lima
  geografias: [
    'alarmas miraflores',
    'alarmas surco',
    'alarmas san isidro',
    'alarmas la molina',
    'alarmas san borja',
    'seguridad san juan de lurigancho',
    'alarmas los olivos',
    'alarmas chorrillos',
    'alarmas surquillo',
    'alarmas callao',
  ],
};

export const HASHTAGS_FITZONE = {
  // Core (usar siempre)
  core: [
    '#Verisure',
    '#VerisurePeru',
    '#AlarmasVerisure',
    '#ProtegemosLoQueImporta',
    '#SeguridadEnElHogar',
    '#MonitoreoContinuo',
    '#ZeroVision',
  ],

  // Engagement (rotar)
  engagement: [
    '#fyp',
    '#parati',
    '#viralperu',
    '#trendingperu',
    '#fypシ',
    '#xyzbca',
  ],

  // Nicho seguridad / hogar (subkey histórico fitness, no renombrar)
  fitness: [
    '#Seguridad',
    '#SeguridadEnElHogar',
    '#SeguridadCiudadana',
    '#CamarasDeSeguridad',
    '#Alarmas',
    '#Videovigilancia',
    '#Monitoreo',
    '#ProtegeTuFamilia',
    '#SeguridadPeru',
    '#HogarSeguro',
  ],

  // Local Perú
  local: [
    '#Peru',
    '#Lima',
    '#LimaPeru',
    '#Miraflores',
    '#Surco',
    '#SanIsidro',
    '#LimaSegura',
    '#PeruSeguro',
  ],

  // Categorías de uso
  disciplinas: [
    '#SeguridadParaNegocio',
    '#AlarmaParaTienda',
    '#BodegaSegura',
    '#OficinaSegura',
    '#FarmaciaSegura',
    '#CondominioSeguro',
    '#PymePeru',
    '#NegocioProtegido',
    '#RestauranteSeguro',
    '#ComercioSeguro',
  ],

  // Casos de uso / situaciones
  transformaciones: [
    '#AntesYDespues',
    '#TestimonioVerisure',
    '#StoryTime',
    '#ComoLoInstalamos',
    '#VacacionesSeguras',
    '#FinDeAnoSeguro',
    '#RegresoAClasesSeguro',
    '#SueñoTranquilo',
  ],

  // Motivación / lifestyle de seguridad
  motivacion: [
    '#TranquilidadEnCasa',
    '#FamiliaProtegida',
    '#HogarProtegido',
    '#NegocioProtegido',
    '#ProteccionContinua',
    '#PazMentalEnCasa',
    '#SeguridadInteligente',
    '#TecnologiaQueProtege',
  ],

  // Competencia (monitoreo)
  competencia: [
    '#Prosegur',
    '#ProsegurAlarmas',
    '#MovistarProsegur',
    '#Securitas',
    '#SecuritasPeru',
    '#Liderman',
    '#G4S',
  ],
};

// Combinar todos los hashtags
export const ALL_HASHTAGS = [
  ...HASHTAGS_FITZONE.core,
  ...HASHTAGS_FITZONE.fitness,
  ...HASHTAGS_FITZONE.local,
  ...HASHTAGS_FITZONE.disciplinas,
  ...HASHTAGS_FITZONE.transformaciones,
];

// Combinar keywords para Google Trends
export const ALL_KEYWORDS = [
  ...KEYWORDS_FITZONE.marca,
  ...KEYWORDS_FITZONE.categoria,
  ...KEYWORDS_FITZONE.intencion,
  ...KEYWORDS_FITZONE.servicios,
];

// Keywords de alta intención
export const HIGH_INTENT_KEYWORDS = [
  ...KEYWORDS_FITZONE.intencion,
  'verisure cotizar lima',
  'alarma con respuesta policial inmediata',
  'mejor alarma monitoreada peru',
  'alarma instalacion sin costo',
  'cambiar alarma de empresa',
  'alarma con doble verificacion',
];

// Configuración para Google Trends
export const GOOGLE_TRENDS_CONFIG = {
  keywords: ALL_KEYWORDS.slice(0, 15),
  region: 'PE',
  geo: {
    lima: 'PE-LIM',
  },
  category: 957, // Home & Garden > Home Security
  timeframe: 'now 7-d',
  refreshInterval: 3600000,
};

// Configuración para TikTok
export const TIKTOK_CONFIG = {
  hashtags: [
    ...HASHTAGS_FITZONE.core,
    ...HASHTAGS_FITZONE.fitness.slice(0, 5),
    ...HASHTAGS_FITZONE.local.slice(0, 3),
  ],
  region: 'PE',
  metrics: ['views', 'likes', 'shares', 'comments'],
  trending_threshold: 10000,
  sounds: [
    { name: 'Las Limeñitas (orgullo limeño)', category: 'Local Perú' },
    { name: 'POV ruido en la noche (suspense)', category: 'Suspense y demo de alarma' },
    { name: 'Pelotero a la Bola (reedición)', category: 'Familia y hogar' },
    { name: 'Voiceover narrativo PE seguridad', category: 'Storytime educativo' },
    { name: 'Audio evergreen Kreepa (humor)', category: 'Humor cotidiano' },
  ],
};

// Configuración para Meta (Facebook/Instagram)
export const META_CONFIG = {
  hashtags: [
    ...HASHTAGS_FITZONE.core,
    ...HASHTAGS_FITZONE.fitness,
    ...HASHTAGS_FITZONE.local,
  ],
  pages: [
    'Verisure Perú',
    'Prosegur Alarmas',
    'Movistar Prosegur Alarms',
    'Securitas Perú',
    'Liderman',
  ],
  groups: [
    'Vecinos vigilantes Lima',
    'Asociación de Bodegueros Lima',
    'Comerciantes de Gamarra',
    'Seguridad vecinal Lima Moderna',
  ],
  interests: [
    'Home security',
    'Home automation',
    'Security alarms',
    'Surveillance',
    'Crime prevention',
  ],
};

// Fuentes de información del sector seguridad Perú
export const FITNESS_SOURCES = [
  {
    name: 'INEI ENAPRES - Estadísticas de victimización',
    url: 'https://www.gob.pe/inei',
    type: 'government',
    scraping: false,
  },
  {
    name: 'SUCAMEC - Regulación de seguridad privada',
    url: 'https://www.gob.pe/sucamec',
    type: 'government',
    scraping: false,
  },
  {
    name: 'IPSOS Perú - Observatorio del Crimen',
    url: 'https://www.ipsos.com/es-pe',
    type: 'industry',
    scraping: true,
  },
  {
    name: 'Gestión - Sector seguridad y alarmas',
    url: 'https://gestion.pe/economia/empresas',
    type: 'news',
    scraping: true,
  },
  {
    name: 'El Comercio - Seguridad ciudadana',
    url: 'https://elcomercio.pe/lima/seguridad',
    type: 'news',
    scraping: true,
  },
];

// Zonas de cobertura Verisure en Lima para monitoreo individual
export const SEDES_FITZONE = [
  {
    id: 1,
    nombre: 'Zona Lima Top',
    slug: 'zona-lima-top',
    distrito: 'Miraflores, San Isidro, Barranco',
    keywords: ['alarmas miraflores', 'seguridad san isidro', 'alarmas barranco'],
    hashtags: ['#Miraflores', '#SanIsidro', '#Barranco'],
  },
  {
    id: 2,
    nombre: 'Zona Lima Moderna Este',
    slug: 'zona-lima-moderna-este',
    distrito: 'Surco, La Molina, San Borja, Surquillo',
    keywords: ['alarmas surco', 'alarmas la molina', 'alarmas san borja'],
    hashtags: ['#Surco', '#LaMolina', '#SanBorja'],
  },
  {
    id: 3,
    nombre: 'Zona Lima Moderna Norte',
    slug: 'zona-lima-moderna-norte',
    distrito: 'Magdalena, Jesús María, Pueblo Libre, San Miguel, Lince',
    keywords: ['alarmas magdalena', 'alarmas jesus maria', 'alarmas san miguel'],
    hashtags: ['#Magdalena', '#JesusMaria', '#PuebloLibre'],
  },
  {
    id: 4,
    nombre: 'Zona Lima Norte',
    slug: 'zona-lima-norte',
    distrito: 'Los Olivos, San Martín de Porres, Independencia, Comas',
    keywords: ['alarmas los olivos', 'seguridad smp', 'alarmas comas'],
    hashtags: ['#LosOlivos', '#Comas', '#LimaNorte'],
  },
  {
    id: 5,
    nombre: 'Zona Lima Este',
    slug: 'zona-lima-este',
    distrito: 'San Juan de Lurigancho, Ate, Santa Anita',
    keywords: ['alarmas sjl', 'seguridad ate', 'alarma santa anita'],
    hashtags: ['#SJL', '#Ate', '#LimaEste'],
  },
  {
    id: 6,
    nombre: 'Zona Lima Sur',
    slug: 'zona-lima-sur',
    distrito: 'Chorrillos, Villa El Salvador, Lurín, San Juan de Miraflores',
    keywords: ['alarmas chorrillos', 'seguridad ves', 'alarmas sjm'],
    hashtags: ['#Chorrillos', '#VES', '#LimaSur'],
  },
  {
    id: 7,
    nombre: 'Zona Lima Centro',
    slug: 'zona-lima-centro',
    distrito: 'Cercado de Lima, Breña, La Victoria',
    keywords: ['alarmas centro de lima', 'seguridad la victoria', 'alarmas breña'],
    hashtags: ['#LimaCentro', '#LaVictoria', '#CercadoDeLima'],
  },
  {
    id: 8,
    nombre: 'Zona Callao',
    slug: 'zona-callao',
    distrito: 'Callao, Bellavista, La Perla, Carmen de la Legua',
    keywords: ['alarmas callao', 'seguridad bellavista', 'alarmas la perla'],
    hashtags: ['#Callao', '#Bellavista', '#LaPerla'],
  },
  {
    id: 9,
    nombre: 'Eje Comercial Gamarra',
    slug: 'eje-comercial-gamarra',
    distrito: 'La Victoria (eje Gamarra)',
    keywords: ['seguridad gamarra', 'alarmas comercio gamarra', 'proteccion negocio gamarra'],
    hashtags: ['#Gamarra', '#ComercioSeguro'],
  },
  {
    id: 10,
    nombre: 'Eje Sur Balnearios',
    slug: 'eje-sur-balnearios',
    distrito: 'Asia, Punta Hermosa, San Bartolo, Cerro Azul',
    keywords: ['alarmas asia', 'seguridad punta hermosa', 'alarmas balneario'],
    hashtags: ['#Asia', '#PuntaHermosa', '#Balnearios'],
  },
];

export default {
  KEYWORDS_FITZONE,
  HASHTAGS_FITZONE,
  ALL_HASHTAGS,
  ALL_KEYWORDS,
  HIGH_INTENT_KEYWORDS,
  GOOGLE_TRENDS_CONFIG,
  TIKTOK_CONFIG,
  META_CONFIG,
  FITNESS_SOURCES,
  SEDES_FITZONE,
};
