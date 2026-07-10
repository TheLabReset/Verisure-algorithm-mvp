# pipeline/

Jobs del pipeline diario de The Algorithm (GitHub Actions, cron ≈ 6:00 a. m. Lima).

**Estado:** placeholder de estructura (Fase 0). Se implementa en la Fase 4:
ingesta Integrametrics (`source=live`) → derivadores (SOI, detección NUEVO, IPC/IMC/Score, índice DIY) → escritura de JSON a `public/data/` + export CSV en dimensiones compartidas (fecha/hora, zona, canal) → commit + deploy.

Hoy corre en dry-run sobre fixtures (`source=fixtures`). Secrets esperados (nunca en código): `INTEGRAMETRICS_TOKEN`, `ANTHROPIC_API_KEY`.
