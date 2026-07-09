# Sereno — Psicólogo virtual PWA (chat multiagente invisible)

> Nombre público: **Sereno** (el vigilante nocturno que cuida mientras duermes + "estar sereno" como promesa del producto). "Vigía" queda como nombre interno de la lente longitudinal.

## Context
Refinado vía /idea-refine en dos rondas. La primera convergió en "diario que vigila + prescribe"; el usuario pivotó: **el MVP es más simple — una PWA de chat estilo psicólogo virtual**, sin rituales, sin gamificación, sin biblioteca de ejercicios, sin push programado. Tres perspectivas de agente (Mentor de crecimiento, Psicólogo, Vigía de patrones) operan **detrás de un solo chat** — el usuario habla con "Vigía" y el sistema aplica el enfoque adecuado internamente. Diferenciador vs ChatGPT genérico: **memoria persistente entre sesiones** + personas con método real.

## Problem Statement
¿Cómo podríamos dar acompañamiento psicológico conversacional que recuerde tu historia y aplique el enfoque correcto (mentoría, reflexión psicológica, o lectura de patrones) sin que el usuario tenga que gestionarlo?

## Recommended Direction
**PWA móvil-first de un solo chat.** El usuario escribe cuando quiere; no hay ritual impuesto.

- **Un agente visible ("Vigía"), tres lentes internas** definidas en el system prompt:
  - *Mentor*: metas, hábitos, decisiones — cuando el usuario busca acción.
  - *Psicólogo*: emociones, patrones cognitivos — cuando hay carga emocional.
  - *Vigía*: lectura longitudinal — cuando pregunta "¿cómo he estado?" o el historial muestra algo relevante.
  - `ponytail:` sin clasificador separado — una sola llamada LLM con las 3 lentes descritas en el prompt; router dedicado solo si la calidad lo exige.
- **Memoria persistente**: al cerrar sesión de chat (o cada N mensajes), se genera resumen estructurado → DB. Los últimos resúmenes se inyectan como contexto en cada conversación nueva. Esto ES el producto.
- **Seguridad (no negociable)**: detección de lenguaje de crisis (ideación suicida, autolesión) → respuesta de contención + derivación a líneas de ayuda locales. Se prueba con casos sintéticos antes de cualquier usuario real. Disclaimer visible: no es terapia clínica.

## Key Assumptions to Validate
- [ ] **Retorno sin ritual:** sin push a las 21:00, ¿la gente vuelve sola? → 15 beta users, medir sesiones/semana durante 4 semanas. (Riesgo #1 del pivote: se quitó el mecanismo de retención.)
- [ ] **Memoria percibida:** el usuario nota y valora que "se acuerda de mí" → feedback cualitativo semana 2 ("¿sentiste que recordaba tus conversaciones?").
- [ ] **Calidad de lentes:** las respuestas se sienten mejores que ChatGPT genérico → test ciego informal con 3-5 usuarios.
- [ ] **Seguridad:** derivación de crisis correcta en 100% de casos sintéticos.

## MVP Scope
**In:**
- PWA (manifest + service worker, instalable, móvil-first) — Next.js en Vercel.
- Auth mínima: magic link por email (necesaria para memoria por usuario).
- Chat streaming: AI SDK v6 + AI Gateway (`"provider/model"` string), una ruta API.
- System prompt con 3 lentes + protocolo de crisis.
- Memoria: tabla de resúmenes de sesión en Postgres (Neon), inyección de últimos ~5 resúmenes.
- Historial de conversaciones visible para el usuario.
- Disclaimer legal + aviso de privacidad mínimo.
- 15 beta users de la comunidad, 4 semanas.

**Criterio de éxito:** ≥40% de los beta con ≥2 sesiones/semana en semana 4, y ≥3 mencionan espontáneamente la memoria como valor.

**Estimación:** ~1 semana de trabajo.

## Not Doing (and Why)
- **Rituales, push 21:00, gamificación** — decisión explícita del usuario; el retorno orgánico es ahora el supuesto a validar.
- **Selector visible de 3 agentes / chat grupal** — descartado; un chat, enrutado interno.
- **Biblioteca de ejercicios prescritos** — muere del concepto anterior; el chat puede sugerir técnicas inline si aplica, sin catálogo.
- **Reporte dominical automático** — la lente Vigía responde on-demand; reportes programados solo si los beta los piden.
- **App nativa / tiendas** — la PWA es la app.
- **Monetización** — nada antes de validar retorno.
- **Dashboard para terapeutas** — pivote futuro documentado, no ahora.

## Decisiones cerradas (2026-07-09)
- **LLM:** Groq tier gratuito, `openai/gpt-oss-120b` como principal. Fallback por rate limit: Qwen3.6 27B. (Llama 3.3 70B descartado: Groq lo deprecó el 2026-07-09, decommission 2026-08-16 — caería en plena beta. Correo oficial de Groq recomienda estos dos reemplazos.) Integración: AI SDK + `@ai-sdk/groq` con `GROQ_API_KEY`. Costo beta: US$0.
- **Idioma:** español mexicano (comunidad beta es de México).
- **Líneas de crisis (México):** Línea de la Vida 800-911-2000 (24/7) y SAPTEL 55-5259-8121. Verificar números vigentes antes del deploy.
- **Nombre público:** Sereno.

## Verification
1. PWA desplegada en Vercel; instalable en Android + iOS (probar en móvil real).
2. Flujo completo: magic link → chat → respuesta streaming → cerrar → nueva sesión → el agente referencia la conversación anterior.
3. Las 3 lentes: mensaje de metas → tono mentor; mensaje emocional → tono psicólogo; "¿cómo he estado este mes?" → síntesis del historial.
4. Casos sintéticos de crisis → contención + derivación, cero consejos ante ideación. Bloqueante para el beta.
5. Onboarding de 15 beta; métricas de sesiones/semana instrumentadas desde día 1.

## Next Step (al aprobar)
Guardar one-pager en `docs/ideas/vigia-psicologo-virtual.md` y decidir arranque del MVP.
