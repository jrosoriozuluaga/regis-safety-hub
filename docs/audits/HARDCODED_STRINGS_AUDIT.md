# Auditoría de Cadenas Hardcodeadas — Frontend Regis SG-SST

**Fecha:** 2026-05-21  
**Alcance:** `src/pages/` y `src/components/` (archivos `.tsx` y `.ts`)  
**Excluido:** `src/components/ui/` (librería shadcn/ui), comentarios, imports

---

## Hallazgos

### 1. URLs Hardcodeadas

| Archivo | Línea | Tipo | Valor | Riesgo | Recomendación |
|---------|-------|------|-------|--------|---------------|
| `pages/Settings.tsx` | 65 | URL placeholder | `https://n8n.example.com/webhook` | Bajo | Aceptable como placeholder de formulario |
| `pages/Pila.tsx` | 178 | URL WhatsApp API | `https://wa.me/${phone}` | Bajo | Aceptable — es la API pública de WhatsApp |
| `pages/Pila.tsx` | 405 | URL OneDrive | `https://1drv.ms/${r.drive_file_id}` | Medio | Mover el base URL a `configuracion_sistema` para flexibilidad entre OneDrive/SharePoint |
| `components/common/WhatsAppFab.tsx` | 16 | URL WhatsApp API | `https://wa.me/${REGIS_WHATSAPP}` | Bajo | Aceptable — API pública de WhatsApp |

### 2. Correos Electrónicos Hardcodeados

| Archivo | Línea | Tipo | Valor | Riesgo | Recomendación |
|---------|-------|------|-------|--------|---------------|
| `pages/Settings.tsx` | 70 | Placeholder config | `sgsst@regiscolombia.com` | Bajo | Aceptable como placeholder del formulario de configuración |
| `pages/EmailTemplates.tsx` | 43 | Datos de ejemplo preview | `sgsst@regiscolombia.com` | Bajo | Aceptable en SAMPLE_DATA para previsualización de plantillas |
| `pages/EmailTemplates.tsx` | 439 | Email en preview UI | `contacto@construandes.com` | Medio | Nombre de empresa cliente hardcodeado — usar datos dinámicos del SAMPLE_DATA |
| `pages/Pila.tsx` | 176 | Mensaje WhatsApp | `sgsst@regiscolombia.com` | Medio | Debería leerse de `configuracion_sistema.email_remitente` en vez de estar en el código |
| `pages/wizards/ConsultantOnboardingWizard.tsx` | 194 | Placeholder | `consultor@regis.com.co` | Bajo | Aceptable como placeholder |
| `pages/wizards/CompanyOnboardingWizard.tsx` | 1246 | Mock data | `maria@regis.com.co` | Medio | Datos mock de consultores — debería cargarse de la BD |
| `pages/wizards/CompanyOnboardingWizard.tsx` | 1247 | Mock data | `carlos@regis.com.co` | Medio | Datos mock de consultores — debería cargarse de la BD |

### 3. Números de Teléfono Hardcodeados

| Archivo | Línea | Tipo | Valor | Riesgo | Recomendación |
|---------|-------|------|-------|--------|---------------|
| `components/common/WhatsAppFab.tsx` | 12 | Constante | `573105551234` | **Alto** | Número de soporte Regis hardcodeado — mover a `configuracion_sistema` o variable de entorno |
| `pages/EmailTemplates.tsx` | 44 | Datos ejemplo | `+57 310 555 1234` | Medio | Mismo número ficticio en SAMPLE_DATA — usar datos reales de configuración |

### 4. Nombres de Empresas Cliente Hardcodeados (Datos de Prueba)

| Archivo | Línea | Tipo | Valor | Riesgo | Recomendación |
|---------|-------|------|-------|--------|---------------|
| `pages/EmailTemplates.tsx` | 36 | SAMPLE_DATA | `Construandes Ltda.` | Bajo | Aceptable para previsualización de plantillas |
| `pages/wizards/ConsultantOnboardingWizard.tsx` | 107 | MOCK_COMPANIES | `Construandes Ltda` | **Alto** | Datos mock que deberían venir de la BD — si se usa en producción muestra datos falsos |
| `pages/wizards/ConsultantOnboardingWizard.tsx` | 114 | MOCK_COMPANIES | `DevCo Technologies S.A.S.` | **Alto** | Mismo problema — reemplazar con query a `empresas_cliente` |
| `pages/wizards/ConsultantOnboardingWizard.tsx` | 121 | MOCK_COMPANIES | `Sabor Criollo S.A.S.` | **Alto** | Mismo problema — reemplazar con query a `empresas_cliente` |
| `pages/wizards/ConsultantOnboardingWizard.tsx` | 116 | MOCK_COMPANIES | `Ana Garcia` (consultor_actual) | **Alto** | Nombre de consultor hardcodeado — cargar de la BD |
| `pages/wizards/ConsultantOnboardingWizard.tsx` | 129 | MOCK_CARGA | `Ana Garcia` con `empresas_count: 5` | **Alto** | Datos de carga de consultores ficticios |
| `pages/wizards/CompanyOnboardingWizard.tsx` | 1246 | Mock consultores | `María Rodríguez` | Medio | Lista de consultores debería venir de la BD |
| `pages/wizards/CompanyOnboardingWizard.tsx` | 1247 | Mock consultores | `Carlos Gómez` | Medio | Lista de consultores debería venir de la BD |
| `pages/Companies.tsx` | 86-99 | TEMPLATE_EXAMPLE | `Empresa Ejemplo SAS`, `Ana Martínez` | Bajo | Aceptable como ejemplo para descarga de plantilla CSV |
| `pages/Workers.tsx` | 48-54 | TEMPLATE_EXAMPLE | `María López`, `1023456789` | Bajo | Aceptable como ejemplo para plantilla CSV |

### 5. API Keys / Tokens Hardcodeados

| Archivo | Línea | Tipo | Valor | Riesgo | Recomendación |
|---------|-------|------|-------|--------|---------------|
| — | — | — | — | — | **No se encontraron API keys ni tokens hardcodeados. Correcto.** |

### 6. IDs de Proyecto Supabase Hardcodeados

| Archivo | Línea | Tipo | Valor | Riesgo | Recomendación |
|---------|-------|------|-------|--------|---------------|
| — | — | — | — | — | **No se encontraron IDs de Supabase fuera de `lib/supabase.ts`. Correcto.** |

### 7. Números Mágicos

| Archivo | Línea | Tipo | Valor | Riesgo | Recomendación |
|---------|-------|------|-------|--------|---------------|
| `pages/Documents.tsx` | 233 | Signed URL TTL | `31536000` (1 año en segundos) | Medio | Extraer a constante con nombre descriptivo: `const SIGNED_URL_TTL_SECONDS = 31_536_000` |
| `pages/UploadPila.tsx` | 101 | Signed URL TTL | `31536000` (1 año en segundos) | Medio | Mismo caso — usar constante compartida |

### 8. Textos en Español Repetidos (Patrón, no i18n completo)

| Archivo | Línea | Tipo | Valor | Riesgo | Recomendación |
|---------|-------|------|-------|--------|---------------|
| `components/common/WhatsAppFab.tsx` | 34-48 | Mensajes WhatsApp | 4 mensajes predefinidos de soporte | Bajo | Considerar mover a un archivo de constantes si se reutilizan |
| `pages/Pila.tsx` | 176 | Mensaje WhatsApp largo | Mensaje completo de solicitud PILA | Medio | Template largo inline — mover a constantes o cargar de `templates_documento` |
| `pages/UploadPila.tsx` | 154-235 | Textos UI públicos | Múltiples mensajes de error/éxito | Bajo | Página pública — textos fijos son aceptables |
| `pages/CompanyReport.tsx` | 551 | Footer de reporte | `REGIS COLOMBIA — Plataforma SG-SST \| www.regiscolombia.com` | Medio | URL del sitio web hardcodeada — mover a configuración |

### 9. Colores Hex Hardcodeados (fuera de UI kit)

| Archivo | Línea | Tipo | Valor | Riesgo | Recomendación |
|---------|-------|------|-------|--------|---------------|
| `components/common/WhatsAppFab.tsx` | 26 | Color WhatsApp | `#25D366`, `#128C7E` | Bajo | Colores oficiales de WhatsApp — aceptable |
| `pages/Pila.tsx` | 429 | Color WhatsApp | `#25D366`, `#128C7E` | Bajo | Mismo caso — aceptable |

### 10. Nombre de Bucket de Storage

| Archivo | Línea | Tipo | Valor | Riesgo | Recomendación |
|---------|-------|------|-------|--------|---------------|
| `pages/Documents.tsx` | 166, 225, 232, 238 | Bucket name | `"documentos"` | Medio | String `"documentos"` repetido en múltiples archivos — extraer a constante en `lib/constants.ts` |
| `pages/UploadPila.tsx` | 96, 101 | Bucket name | `"documentos"` | Medio | Mismo caso |

---

## Resumen por Categoría

| Categoría | Total | Alto | Medio | Bajo |
|-----------|-------|------|-------|------|
| URLs hardcodeadas | 4 | 0 | 1 | 3 |
| Correos electrónicos | 7 | 0 | 4 | 3 |
| Números de teléfono | 2 | 1 | 1 | 0 |
| Nombres de empresa/datos mock | 10 | 5 | 2 | 3 |
| API keys / tokens | 0 | 0 | 0 | 0 |
| IDs Supabase | 0 | 0 | 0 | 0 |
| Números mágicos | 2 | 0 | 2 | 0 |
| Textos en español | 4 | 0 | 2 | 2 |
| Colores hex | 2 | 0 | 0 | 2 |
| Bucket de storage | 2 | 0 | 2 | 0 |
| **TOTAL** | **33** | **6** | **14** | **13** |

---

## Evaluación General de Riesgo

**Riesgo general: MEDIO**

### Hallazgos positivos
- No hay API keys, tokens ni secretos en el código fuente
- No hay IDs de proyecto Supabase fuera de `lib/supabase.ts`
- La arquitectura de configuración (`configuracion_sistema`) existe y se usa correctamente en la mayoría de casos

### Hallazgos críticos a corregir (6 items de riesgo Alto)
1. **`ConsultantOnboardingWizard.tsx`** — Contiene `MOCK_COMPANIES` y `MOCK_CARGA` con datos ficticios de empresas y consultores que se mostrarían en producción. Deben reemplazarse con queries reales a la BD.
2. **`WhatsAppFab.tsx`** — Número de WhatsApp de soporte (`573105551234`) hardcodeado. Si cambia el número, requiere redespliegue.

### Recomendaciones prioritarias
1. **Reemplazar datos mock en wizards** con queries a Supabase (`empresas_cliente`, `profiles`)
2. **Mover número WhatsApp** a `configuracion_sistema`
3. **Extraer el email de Regis** (`sgsst@regiscolombia.com`) del mensaje de Pila.tsx y leerlo de configuración
4. **Crear constante** `SIGNED_URL_TTL` y `STORAGE_BUCKET` en un archivo compartido de constantes
5. **Mover el template de mensaje WhatsApp** de Pila.tsx a `templates_documento` o a constantes
