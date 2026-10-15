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
  },
};
