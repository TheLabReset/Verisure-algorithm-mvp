// Keywords y hashtags para Powerpay - BNPL Perú
// Configuración completa para búsquedas y monitoreo social

export const KEYWORDS_FITZONE = {
  // Marca Powerpay
  marca: [
    'powerpay',
    'powerpay peru',
    'powerpay bbva',
    'power pay bbva',
    'ppay peru',
    'ppayperu',
    'powerpay funciona',
    'powerpay opiniones',
    'que es powerpay',
    'registrarme powerpay',
  ],

  // Keywords de categoría (cuotas / BNPL)
  categoria: [
    'pagar en cuotas',
    'comprar en cuotas',
    'pagar compras en cuotas',
    'financiamiento para compras',
    'dividir pagos en cuotas',
    'pagar en partes una compra',
    'pagar despues una compra',
    'comprar a cuotas',
    'pagos en cuotas peru',
    'compras en cuotas sin intereses',
  ],

  // Intención de compra alta
  intencion: [
    'pagar en cuotas sin intereses',
    'comprar en cuotas sin intereses',
    'cuotas sin intereses',
    'pagar en cuotas 0% interes',
    'pagar en cuotas con tarjeta',
    'comprar con tarjeta de credito en cuotas',
    'dividir compra con tarjeta de credito',
    'financiar compras con tarjeta',
    'comprar ahora pagar despues',
    'cuotas 0 interes peru',
  ],

  // Keywords de producto/uso
  servicios: [
    'comprar laptop en cuotas',
    'financiar celular en cuotas',
    'comprar iphone en cuotas',
    'cuotas plaza vea',
    'cuotas ripley',
    'cuotas saga falabella',
    'comprar electrodomesticos en cuotas',
    'comprar refrigeradora en cuotas',
    'cuotas oechsle',
    'comprar tv en cuotas sin intereses',
  ],

  // Competencia
  competidores: [
    'cuotealo interbank',
    'cuotealo bcp',
    'yape cuotas',
    'yape tienda',
    'dividelo bcp',
    'dividelo interbank',
    'alternativa a cuotealo',
    'cuotealo vs powerpay',
    'cmr cuotas falabella',
    'acuotaz apurata',
  ],

  // Categorías de comercios
  disciplinas: [
    'tecnologia en cuotas',
    'electrohogar en cuotas',
    'moda en cuotas',
    'viajes en cuotas',
    'belleza en cuotas',
    'salud en cuotas',
    'celulares en cuotas',
    'laptops en cuotas',
    'sneakers en cuotas',
    'eventos en cuotas',
  ],

  // Resultados / educación financiera
  resultados: [
    'sin afectar linea de credito',
    'sin consumir cupo de tarjeta',
    'cuotas sin tocar mi linea',
    'comprar sin intereses',
    'como funciona el bnpl',
    'que es buy now pay later',
    'pagar despues sin intereses',
    'cuotas con cualquier tarjeta',
    'cuotas con tarjeta de debito',
    'transparencia cuotas peru',
  ],

  // Geografías Perú
  geografias: [
    'cuotas sin intereses lima',
    'pagar en cuotas peru',
    'comprar en cuotas lima',
    'financiamiento compras peru',
    'cuotas sin intereses arequipa',
    'cuotas sin intereses trujillo',
    'comprar en cuotas chiclayo',
    'cuotas peru bbva',
    'pagar en cuotas cusco',
    'bnpl peru',
  ],
};

export const HASHTAGS_FITZONE = {
  // Core (usar siempre)
  core: [
    '#Powerpay',
    '#PowerpayPe',
    '#ElPoderDeElegir',
    '#PagaComoQuieras',
    '#CuotasSinIntereses',
    '#BNPLPeru',
    '#Fintech',
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

  // Nicho fintech / cuotas
  fitness: [
    '#CuotasSinIntereses',
    '#CompraEnCuotas',
    '#PagaEnCuotas',
    '#FinanzasPersonales',
    '#TipsFinancieros',
    '#FintechPeru',
    '#BuyNowPayLater',
    '#ComprasInteligentes',
    '#FinanciamientoFlexible',
    '#PagaEnPartes',
  ],

  // Local Perú
  local: [
    '#Peru',
    '#Lima',
    '#CyberPeru',
    '#CyberWow',
    '#CyberDays',
    '#PeruRetail',
    '#ComprasEnPeru',
    '#HechoEnPeru',
  ],

  // Categorías de producto
  disciplinas: [
    '#ComprarTecnologia',
    '#Electrohogar',
    '#TecnoPeru',
    '#CelularesPeru',
    '#LaptopsPeru',
    '#ModaPeru',
    '#ShoppingHaul',
    '#ViajesPeru',
    '#BellezaPeru',
    '#LifestylePeru',
  ],

  // Casos de uso / unboxing
  transformaciones: [
    '#Unboxing',
    '#Haul',
    '#PrimeraCompra',
    '#Antesydespues',
    '#StoryTime',
    '#ComoLoCompre',
    '#NuevaCompra',
    '#NuevoSetup',
  ],

  // Motivación / lifestyle financiero
  motivacion: [
    '#FinanzasSanas',
    '#CompraInteligente',
    '#OrdenFinanciero',
    '#LibertadFinanciera',
    '#SmartShopping',
    '#TipsDeCompra',
    '#AhorroPeru',
    '#PlanificaTuCompra',
  ],

  // Competencia (monitoreo)
  competencia: [
    '#Cuotealo',
    '#Yape',
    '#YapeTienda',
    '#Dividelo',
    '#CMRPuntos',
    '#Acuotaz',
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

// Keywords de alta intención (conversión)
export const HIGH_INTENT_KEYWORDS = [
  ...KEYWORDS_FITZONE.intencion,
  'cuotas sin intereses peru',
  'powerpay registrarme',
  'powerpay precio',
  'cuotas con cualquier tarjeta',
  'comprar ahora pagar despues',
  'no afecta linea de credito',
];

// Configuración para Google Trends
export const GOOGLE_TRENDS_CONFIG = {
  keywords: ALL_KEYWORDS.slice(0, 15),
  region: 'PE',
  geo: {
    lima: 'PE-LIM',
  },
  category: 7, // Finance
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
    { name: 'Oh No Oh No (Kreepa remix LATAM)', category: 'Comedia compras' },
    { name: 'Aesthetic shopping vibes', category: 'Lifestyle haul' },
    { name: 'Una noche en Medellín sped-up', category: 'Trend joven' },
    { name: 'Money Money Money flip TikTok', category: 'Finanzas' },
    { name: 'Voiceover narrativo PE', category: 'Storytime educativo' },
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
    'Powerpay Perú',
    'Powerpay Oficial',
    'Cuotéalo BCP',
    'Yape',
    'Divídelo',
  ],
  groups: [
    'Compras Inteligentes Perú',
    'Fintech y Finanzas Perú',
    'Cyber Days Perú',
    'Tecnología Perú',
  ],
  interests: [
    'Personal finance',
    'Online shopping',
    'Consumer technology',
    'Fashion and apparel',
    'Travel and tourism',
  ],
};

// Fuentes de información fintech Perú
export const FITNESS_SOURCES = [
  {
    name: 'BCRP - Reporte Sistema Nacional de Pagos',
    url: 'https://www.bcrp.gob.pe',
    type: 'government',
    scraping: false,
  },
  {
    name: 'ASBANC',
    url: 'https://www.asbanc.com.pe',
    type: 'association',
    scraping: false,
  },
  {
    name: 'Niubiz Insights',
    url: 'https://www.niubiz.com.pe/blog',
    type: 'industry',
    scraping: true,
  },
  {
    name: 'Gestión - Finanzas Personales',
    url: 'https://gestion.pe/tu-dinero',
    type: 'news',
    scraping: true,
  },
  {
    name: 'El Comercio - Día 1',
    url: 'https://elcomercio.pe/economia/dia-1',
    type: 'news',
    scraping: true,
  },
];

// Comercios partners Powerpay (para monitoreo individual)
export const SEDES_FITZONE = [
  {
    id: 1,
    nombre: 'Samsung Store',
    slug: 'samsung',
    distrito: 'Tecnología',
    keywords: ['samsung peru', 'galaxy en cuotas', 'samsung cuotas powerpay'],
    hashtags: ['#Samsung', '#GalaxyPeru'],
  },
  {
    id: 2,
    nombre: 'iShop Perú',
    slug: 'ishop',
    distrito: 'Tecnología',
    keywords: ['ishop peru', 'iphone en cuotas', 'apple peru cuotas'],
    hashtags: ['#iShopPeru', '#ApplePeru'],
  },
  {
    id: 3,
    nombre: 'Mac Center',
    slug: 'mac-center',
    distrito: 'Tecnología',
    keywords: ['mac center peru', 'macbook en cuotas', 'apple cuotas peru'],
    hashtags: ['#MacCenter', '#ApplePeru'],
  },
  {
    id: 4,
    nombre: 'PC Factory',
    slug: 'pc-factory',
    distrito: 'Tecnología',
    keywords: ['pc factory peru', 'laptop en cuotas', 'gaming pc cuotas'],
    hashtags: ['#PCFactory', '#GamingPeru'],
  },
  {
    id: 5,
    nombre: 'Sony Store',
    slug: 'sony',
    distrito: 'Electrohogar',
    keywords: ['sony peru', 'tv sony en cuotas', 'audio sony cuotas'],
    hashtags: ['#SonyPeru', '#SonyStore'],
  },
  {
    id: 6,
    nombre: 'iRobot Perú',
    slug: 'irobot',
    distrito: 'Electrohogar',
    keywords: ['irobot peru', 'roomba en cuotas', 'limpieza inteligente'],
    hashtags: ['#iRobot', '#Roomba'],
  },
  {
    id: 7,
    nombre: 'Aldo & Co.',
    slug: 'aldo-co',
    distrito: 'Moda',
    keywords: ['aldo peru', 'calzado aldo cuotas', 'moda en cuotas'],
    hashtags: ['#AldoCo', '#ModaPeru'],
  },
  {
    id: 8,
    nombre: 'Footloose',
    slug: 'footloose',
    distrito: 'Moda',
    keywords: ['footloose peru', 'sneakers en cuotas', 'zapatillas cuotas'],
    hashtags: ['#Footloose', '#SneakersPeru'],
  },
  {
    id: 9,
    nombre: 'Coliseum',
    slug: 'coliseum',
    distrito: 'Deportes',
    keywords: ['coliseum peru', 'ropa deportiva cuotas', 'tienda deportiva peru'],
    hashtags: ['#Coliseum', '#DeportePeru'],
  },
  {
    id: 10,
    nombre: 'Teleticket',
    slug: 'teleticket',
    distrito: 'Entretenimiento',
    keywords: ['teleticket peru', 'entradas conciertos cuotas', 'eventos en cuotas'],
    hashtags: ['#Teleticket', '#ConciertosPeru'],
  },
  {
    id: 11,
    nombre: 'NuSkin Perú',
    slug: 'nuskin',
    distrito: 'Belleza',
    keywords: ['nuskin peru', 'skincare cuotas', 'belleza en cuotas'],
    hashtags: ['#NuSkin', '#SkincarePeru'],
  },
  {
    id: 12,
    nombre: 'Thermomix',
    slug: 'thermomix',
    distrito: 'Hogar',
    keywords: ['thermomix peru', 'thermomix en cuotas', 'cocina premium peru'],
    hashtags: ['#Thermomix', '#CocinaPremium'],
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
