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
};
