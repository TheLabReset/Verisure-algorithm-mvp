// Quién es el cliente y cómo habla su rubro. Es el único archivo que dice el nombre de la marca:
// las lecturas, las pantallas y el cálculo lo toman de acá. Una prueba falla si la marca aparece escrita en otro lado.
export const CLIENTE = {
  id: 'verisure',
  nombre: 'Verisure',
  nombreLargo: 'Verisure Perú',
  rubro: 'alarmas y seguridad para hogares y negocios',
  ciudad: 'Lima',
  // Cómo se llama la marca en Integrametrics (maname): así se separa lo propio de la competencia
  marcaFuente: 'VERISURE',
  // La competencia que se sigue, con su nombre en Integrametrics. Hunter (B2B) y Securitas (seguros) quedan fuera:
  // no compiten en residencial (docs/INTEGRAMETRICS-HALLAZGOS.md)
  competencia: [{ nombre: 'Prosegur', marcaFuente: 'PROSEGUR' }],
  // Otras marcas que se vigilan solo en la capa 1: sus primeras apariciones y sus digitalizados. Se siguen por su
  // nombre exacto en Integrametrics, no por subsector (una marca de cámaras puede estar en «tiendas de tecnología»). No entran a la
  // inversión, al share, a las capas 2 a 4, al export.csv del BI ni a MAIA: van en public/data/vigiladas.json.
  // Su color sigue el orden de esta lista (--vigilada-1 a --vigilada-4 en tokens.css): se agrega al final.
  // Liderman y Hikvision salieron: sus piezas eran de revendedores, retail y empleo, no campañas de la marca.
  vigiladas: [
    { nombre: 'Portero Seguro', marcaFuente: 'PORTERO SEGURO' },
  ],
  subsectores: ['SEGURIDAD Y ALARMAS', 'SEGURIDAD PRIVADA'],
  rubroPlural: 'empresas de seguridad',
  // Nombres propios que van con mayúscula cuando un nombre de versión llega en mayúsculas desde la fuente
  nombresPropios: ['ZeroVision', 'Lima', 'Perú'],
  // Google Trends (Perú). Cada grupo va en una sola consulta para que los términos queden en la misma escala.
  // «prosegur» sola no sirve: mezcla empleo y transporte de valores; «alarma» sola mezcla despertadores y autos.
  busquedas: {
    geo: 'PE',
    desde: '2024-01-01',
    // La amenaza DIY: cámaras que la persona instala sola, frente a la búsqueda de la marca
    categoria: [
      { id: 'camaras', nombre: 'cámaras de seguridad', terminos: ['camaras de seguridad', 'camara de seguridad'] },
      { id: 'wifi', nombre: 'cámara wifi', terminos: ['camara wifi'] },
      { id: 'marca', nombre: 'verisure', terminos: ['verisure'], propia: true },
    ],
    // Marcas de cámaras DIY que se venden en retail y marketplaces
    marcasDiy: [
      { id: 'ezviz', nombre: 'Ezviz', terminos: ['camara ezviz'] },
      { id: 'xiaomi', nombre: 'Xiaomi', terminos: ['camara xiaomi'] },
      { id: 'tapo', nombre: 'Tapo', terminos: ['camara tapo'] }, // la marca de cámaras de TP-Link
      { id: 'imou', nombre: 'Imou', terminos: ['camara imou'] },
      { id: 'hikvision', nombre: 'Hikvision', terminos: ['camara hikvision'] },
    ],
    // Las empresas de seguridad por su nombre, en todas las categorías de Trends. Prosegur y Liderman suman búsquedas de
    // empleo (en la categoría de seguridad Liderman no aparece); Portero Seguro no tiene búsquedas suficientes y «boxer»
    // se confunde con motos y ropa: quedan fuera
    competencia: [
      { id: 'prosegur', nombre: 'Prosegur', terminos: ['prosegur'], empleo: true },
      { id: 'verisure', nombre: 'Verisure', terminos: ['verisure'], propia: true },
      { id: 'liderman', nombre: 'Liderman', terminos: ['liderman'], empleo: true },
    ],
    sinMedir: ['Portero Seguro'],
  },
};
