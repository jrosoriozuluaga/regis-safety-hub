# Auditoría de Modelos Claude en Edge Functions

**Fecha:** 2026-05-20  
**Auditor:** Claude Code (automático)  
**Scope:** Todas las Edge Functions en `supabase/functions/`

## Edge Functions Inventariadas

Se encontraron **7 Edge Functions** desplegadas. De ellas, **3 usan Claude** y **4 no usan IA de Anthropic**.

| Edge Function | Usa Claude? | Modelos actuales | Estado |
|---|---|---|---|
| `generate-acta` | ✅ Sí | `claude-sonnet-4-6`, `claude-haiku-4-5-20251001` | ✅ Modelos actuales |
| `process-exam-pdf` | ✅ Sí | `claude-sonnet-4-6`, `claude-haiku-4-5-20251001` | ✅ Modelos actuales |
| `transcribe-audio` | ✅ Sí | `claude-sonnet-4-6`, `claude-haiku-4-5-20251001` | ✅ Modelos actuales |
| `send-pila-reminder` | ❌ No | N/A (usa Resend para email) | ✅ Sin dependencia Claude |
| `send-whatsapp-reminder` | ❌ No | N/A (usa Twilio para WhatsApp) | ✅ Sin dependencia Claude |
| `generate-bitacora` | ❌ No | N/A (genera reporte desde DB) | ✅ Sin dependencia Claude |
| `weekly-summary` | ❌ No | N/A (resumen semanal desde DB) | ✅ Sin dependencia Claude |

## Patrón de Cascade

Las 3 funciones que usan Claude implementan el mismo patrón de cascade:

```
MODEL_CASCADE = ["claude-sonnet-4-6", "claude-haiku-4-5-20251001"]
```

1. Intenta `claude-sonnet-4-6` (modelo principal, más capaz)
2. Si retorna 404: intenta `claude-haiku-4-5-20251001` (fallback más económico)
3. Si ambos fallan: usa template/fallback estático

## Modelos Deprecados Encontrados

**Ninguno.** Todos los modelos fueron actualizados en el commit `6793985` (sesión del 20 de mayo de 2026).

### Historial de modelos deprecados (ya corregidos)

| Modelo deprecado | Retirado | Reemplazado por |
|---|---|---|
| `claude-3-5-sonnet-20241022` | Feb 2026 | `claude-sonnet-4-6` |
| `claude-3-7-sonnet-20250219` | Jun 2026 | `claude-sonnet-4-6` |
| `claude-sonnet-4-20250514` | Jun 2026 | `claude-sonnet-4-6` |
| `claude-3-5-haiku-20241022` | Feb 2026 | `claude-haiku-4-5-20251001` |

## Funciones Auxiliares Compartidas

Las funciones `process-exam-pdf` y `transcribe-audio` comparten dos helpers:

- **`extractJSON(text)`**: Parsea respuesta JSON de Claude, removiendo markdown fences (`\`\`\`json...\`\`\``)
- **`uint8ToBase64(bytes)`**: Codificación base64 chunked (solo en `process-exam-pdf`) para PDFs grandes

`generate-acta` NO necesita `extractJSON` porque usa la respuesta como markdown directamente.

## Resultado

🟢 **LIMPIO** — Todas las Edge Functions usan modelos actualizados. No se requiere acción.
