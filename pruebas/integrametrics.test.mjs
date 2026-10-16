import { test } from 'node:test'
import assert from 'node:assert/strict'
import { dayWindows, fetchRegistros, IntegrametricsError } from '../src/fuentes/integrametrics.js'

test('dayWindows: intervalo SEMIABIERTO [start,end) partido por día', () => {
  const w = dayWindows('2026-07-08 00:00:00', '2026-07-11 00:00:00')
  assert.equal(w.length, 3) // 8, 9, 10 (11 es exclusivo)
  assert.equal(w[0].start, '2026-07-08 00:00:00')
  assert.equal(w[0].end, '2026-07-09 00:00:00')
  assert.equal(w[2].end, '2026-07-11 00:00:00')
})

test('fetchRegistros: pagina por día y concatena (mock fetch)', async () => {
  const calls = []
  const fakeFetch = async (url) => {
    calls.push(url)
    return { ok: true, json: async () => [{ id_unico: calls.length, url }] }
  }
  const rows = await fetchRegistros({
    token: 'TESTTOKEN',
    startDate: '2026-07-08 00:00:00',
    endDate: '2026-07-11 00:00:00',
    fetchImpl: fakeFetch,
  })
  assert.equal(calls.length, 3) // 3 ventanas de día
  assert.equal(rows.length, 3) // 1 registro por ventana concatenado
  assert.ok(calls[0].includes('Bearer') === false) // el token va en header, no en URL
  assert.ok(calls[0].includes('startDate='))
})

test('fetchRegistros: sin token lanza IntegrametricsError (no crash silencioso)', async () => {
  await assert.rejects(
    () =>
      fetchRegistros({
        token: null,
        startDate: '2026-07-10 00:00:00',
        endDate: '2026-07-11 00:00:00',
        fetchImpl: async () => ({ ok: true, json: async () => [] }),
      }),
    IntegrametricsError,
  )
})

test('fetchRegistros: respuesta HTTP no-ok se convierte en error manejado', async () => {
  await assert.rejects(
    () =>
      fetchRegistros({
        token: 'T',
        startDate: '2026-07-10 00:00:00',
        endDate: '2026-07-11 00:00:00',
        fetchImpl: async () => ({ ok: false, status: 503, json: async () => ({}) }),
        esperar: async () => {},
      }),
    /503/,
  )
})

// Una falla pasajera (red, 5xx, 429) se reintenta dos veces; un 4xx no. Sin esto, un corte de un segundo deja al
// panel un día sin data, porque la corrida hace su commit al final
const ventana = { token: 'T', startDate: '2026-07-10 00:00:00', endDate: '2026-07-11 00:00:00' };
test('fetchRegistros: reintenta una falla pasajera y sigue', async () => {
  const esperas = [];
  let llamadas = 0;
  const fetchImpl = async () => {
    llamadas += 1;
    if (llamadas === 1) throw new Error('ECONNRESET');
    if (llamadas === 2) return { ok: false, status: 502, json: async () => ({}) };
    return { ok: true, status: 200, json: async () => [{ id_unico: 1 }] };
  };
  const filas = await fetchRegistros({ ...ventana, fetchImpl, esperar: async (ms) => { esperas.push(ms); } });
  assert.equal(llamadas, 3);
  assert.deepEqual(filas, [{ id_unico: 1 }]);
  assert.deepEqual(esperas, [3000, 10000]);
});

test('fetchRegistros: un 4xx no se reintenta, y tres fallas pasajeras seguidas sí cortan', async () => {
  let llamadas = 0;
  await assert.rejects(() => fetchRegistros({ ...ventana, esperar: async () => {}, fetchImpl: async () => { llamadas += 1; return { ok: false, status: 401, json: async () => ({}) }; } }), /401/);
  assert.equal(llamadas, 1);
  llamadas = 0;
  await assert.rejects(() => fetchRegistros({ ...ventana, esperar: async () => {}, fetchImpl: async () => { llamadas += 1; return { ok: false, status: 429, json: async () => ({}) }; } }), /429/);
  assert.equal(llamadas, 3);
});
