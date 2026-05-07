// Keywords y hashtags para WIN - Telco fibra óptica Perú
// Configuración completa para búsquedas y monitoreo social
// Nota: nombres de exports (KEYWORDS_FITZONE, HASHTAGS_FITZONE, FITNESS_SOURCES,
// SEDES_FITZONE) son históricos del template y se mantienen por compatibilidad.

export const KEYWORDS_FITZONE = {
  // Marca WIN
  marca: [
    'win internet',
    'win peru',
    'win fibra optica',
    'win lima',
    'win planes',
    'win hogar',
    'win velocidad',
    'win opiniones',
    'que es win',
    'contratar win',
  ],

  // Keywords de categoría (fibra / internet hogar)
  categoria: [
    'internet fibra optica',
    'internet hogar lima',
    'mejor internet lima',
    'plan internet familia',
    'internet fibra al hogar',
    'fibra simetrica peru',
    'internet 1 gbps lima',
    'internet rapido peru',
    'comparar planes internet',
    'mejor operador fibra peru',
  ],

  // Intención de compra alta
  intencion: [
    'contratar internet hogar',
    'instalar internet hogar',
    'cambiar de operador internet',
    'comparar planes internet lima',
    'contratar fibra optica lima',
    'mejor plan internet 600 mbps',
    'internet con instalacion gratis',
    'plan fibra simetrica',
    'cotizar internet hogar',
    'cobertura fibra lima',
  ],

  // Keywords de producto/uso
  servicios: [
    'plan internet 750 mbps',
    'plan internet 850 mbps',
    'plan internet 1 gbps',
    'internet gamer fibra',
    'internet streaming 4k',
    'internet teletrabajo',
    'internet con tv premium',
    'internet con liga 1',
    'plan familia fibra',
    'plan fibra simetrica peru',
  ],

  // Competencia
  competidores: [
    'movistar fibra hogar',
    'movistar internet lima',
    'claro hogar fibra',
    'claro internet hogar',
    'wow peru internet',
    'wow fibra dgo',
    'entel hogar fibra',
    'bitel hogar internet',
    'fiberlux peru',
    'fiberpro internet',
  ],

  // Categorías de uso
  disciplinas: [
    'gaming online lima',
    'streaming hd hogar',
    'teletrabajo internet',
    'smart home fibra',
    'videollamadas estables',
    'educacion en linea',
    'familia conectada',
    'fibra para empresas',
    'internet pyme lima',
    'internet creador de contenido',
  ],

  // Resultados / educación
  resultados: [
    'fibra 100 por ciento optica',
    'velocidad simetrica que es',
    'fibra vs cable',
    'cuanta velocidad necesito',
    'mejor velocidad para gaming',
    'mejor velocidad para streaming',
    'velocidad subida importa',
    'instalacion fibra optica',
    'osiptel mejor operador',
    'satisfaccion operadores peru',
  ],

  // Geografías Lima
  geografias: [
    'internet miraflores',
    'internet surco',
    'internet san isidro',
    'internet san miguel',
    'internet la molina',
    'internet los olivos',
    'internet san juan de lurigancho',
    'internet san juan de miraflores',
    'internet comas',
    'internet callao',
  ],
};

export const HASHTAGS_FITZONE = {
  // Core (usar siempre)
  core: [
    '#WIN',
    '#WINInternet',
    '#WINFibra',
    '#WINPeru',
    '#Internet100Fibra',
    '#FibraOptica',
    '#VelocidadSimetrica',
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

  // Nicho telco / conectividad
  fitness: [
    '#FibraOptica',
    '#InternetPeru',
    '#InternetHogar',
    '#InternetRapido',
    '#StreamingHD',
    '#GamingPeru',
    '#SmartHome',
    '#Conectividad',
    '#WFH',
    '#HomeOffice',
  ],

  // Local Perú
  local: [
    '#Peru',
    '#Lima',
    '#LimaPeru',
    '#LimaTec',
    '#TecnologiaPeru',
    '#CyberPeru',
    '#CyberWow',
    '#CyberDays',
  ],

  // Categorías de uso
  disciplinas: [
    '#GamingOnline',
    '#StreamingPeru',
    '#Teletrabajo',
    '#SmartHomePeru',
    '#FamiliaConectada',
    '#EducacionEnLinea',
    '#CreadorDeContenido',
    '#Esports',
    '#PymePeru',
    '#NegocioDigital',
  ],

  // Casos de uso / lifestyle digital
  transformaciones: [
    '#NuevoPlan',
    '#CambioDeOperador',
    '#FibraEnCasa',
    '#SetupGamer',
    '#OficinaEnCasa',
    '#StoryTime',
    '#ComoLoConectamos',
    '#AntesYDespues',
  ],

  // Motivación / lifestyle digital
  motivacion: [
    '#VidaConectada',
    '#TrabajoFlexible',
    '#FamiliaEnLinea',
    '#SerieMaratoneada',
    '#PartidaSinLag',
    '#VelocidadReal',
    '#MejorInternet',
    '#FibraEstable',
  ],

  // Competencia (monitoreo)
  competencia: [
    '#Movistar',
    '#MovistarHogar',
    '#Claro',
    '#ClaroHogar',
    '#Wow',
    '#WowPeru',
    '#Fiberlux',
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
  'win contratar',
  'win cobertura mi distrito',
  'mejor plan fibra lima',
  'fibra optica con instalacion gratis',
  'cambiar operador internet',
  'velocidad simetrica para gaming',
];

// Configuración para Google Trends
export const GOOGLE_TRENDS_CONFIG = {
  keywords: ALL_KEYWORDS.slice(0, 15),
  region: 'PE',
  geo: {
    lima: 'PE-LIM',
  },
  category: 13, // Internet & Telecom
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
    { name: 'Voices (Øneheart)', category: 'Lifestyle conectado' },
    { name: 'Levitating (Dua Lipa)', category: 'Pop celebración' },
    { name: 'Tití Me Preguntó (Bad Bunny)', category: 'LATAM evergreen' },
    { name: 'Voiceover narrativo PE creators tech', category: 'Storytime educativo' },
    { name: 'Beat Cyber Wow Perú', category: 'Estacional' },
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
    'WIN Internet',
    'WIN Perú',
    'Movistar Hogar',
    'Wow Perú',
    'Claro Hogar',
  ],
  groups: [
    'Tecnología y Conectividad Perú',
    'Gaming Perú',
    'Teletrabajo en Perú',
    'Streaming y Series Perú',
  ],
  interests: [
    'Internet and telecom',
    'Online gaming',
    'Streaming media',
    'Smart home technology',
    'Remote work',
  ],
};

// Fuentes de información del sector telco Perú
export const FITNESS_SOURCES = [
  {
    name: 'OSIPTEL - Estadísticas del sector',
    url: 'https://www.osiptel.gob.pe',
    type: 'government',
    scraping: false,
  },
  {
    name: 'MTC - Ministerio de Transportes y Comunicaciones',
    url: 'https://www.gob.pe/mtc',
    type: 'government',
    scraping: false,
  },
  {
    name: 'IPSOS Perú - Reportes de consumo digital',
    url: 'https://www.ipsos.com/es-pe',
    type: 'industry',
    scraping: true,
  },
  {
    name: 'Gestión - Tecnología y telecomunicaciones',
    url: 'https://gestion.pe/tecnologia',
    type: 'news',
    scraping: true,
  },
  {
    name: 'El Comercio - Tecnología',
    url: 'https://elcomercio.pe/tecnologia',
    type: 'news',
    scraping: true,
  },
];

// Centros de atención WIN para monitoreo individual
export const SEDES_FITZONE = [
  {
    id: 1,
    nombre: 'WIN Sede Central',
    slug: 'sede-central',
    distrito: 'Surquillo',
    keywords: ['win sede central lima', 'oficina win surquillo', 'atencion win lima'],
    hashtags: ['#WINPeru', '#WINInternet'],
  },
  {
    id: 2,
    nombre: 'WIN Surco',
    slug: 'surco',
    distrito: 'Santiago de Surco',
    keywords: ['win surco', 'internet surco fibra', 'win santiago de surco'],
    hashtags: ['#WINSurco', '#FibraSurco'],
  },
  {
    id: 3,
    nombre: 'WIN Miraflores',
    slug: 'miraflores',
    distrito: 'Miraflores',
    keywords: ['win miraflores', 'internet miraflores fibra', 'fibra optica miraflores'],
    hashtags: ['#WINMiraflores', '#FibraMiraflores'],
  },
  {
    id: 4,
    nombre: 'WIN San Miguel',
    slug: 'san-miguel',
    distrito: 'San Miguel',
    keywords: ['win san miguel', 'internet san miguel lima', 'fibra san miguel'],
    hashtags: ['#WINSanMiguel', '#FibraSanMiguel'],
  },
  {
    id: 5,
    nombre: 'WIN La Molina',
    slug: 'la-molina',
    distrito: 'La Molina',
    keywords: ['win la molina', 'internet la molina fibra', 'fibra la molina'],
    hashtags: ['#WINLaMolina', '#FibraLaMolina'],
  },
  {
    id: 6,
    nombre: 'WIN Los Olivos',
    slug: 'los-olivos',
    distrito: 'Los Olivos',
    keywords: ['win los olivos', 'internet los olivos lima norte', 'fibra los olivos'],
    hashtags: ['#WINLosOlivos', '#FibraLimaNorte'],
  },
  {
    id: 7,
    nombre: 'WIN San Juan de Lurigancho',
    slug: 'san-juan-de-lurigancho',
    distrito: 'San Juan de Lurigancho',
    keywords: ['win san juan de lurigancho', 'internet sjl', 'fibra sjl'],
    hashtags: ['#WINSJL', '#FibraSJL'],
  },
  {
    id: 8,
    nombre: 'WIN San Juan de Miraflores',
    slug: 'san-juan-de-miraflores',
    distrito: 'San Juan de Miraflores',
    keywords: ['win san juan de miraflores', 'internet sjm', 'fibra sjm'],
    hashtags: ['#WINSJM', '#FibraLimaSur'],
  },
  {
    id: 9,
    nombre: 'WIN Comas',
    slug: 'comas',
    distrito: 'Comas',
    keywords: ['win comas', 'internet comas lima', 'fibra comas'],
    hashtags: ['#WINComas', '#FibraComas'],
  },
  {
    id: 10,
    nombre: 'WIN Callao',
    slug: 'callao',
    distrito: 'Bellavista (Callao)',
    keywords: ['win callao', 'internet callao fibra', 'fibra bellavista callao'],
    hashtags: ['#WINCallao', '#FibraCallao'],
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
