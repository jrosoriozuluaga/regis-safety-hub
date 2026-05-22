<p align="center">
  <h1 align="center">Regis Safety Hub</h1>
  <p align="center">
    <strong>Plataforma de Automatizacion SG-SST — Resolucion 0312/2019</strong>
  </p>
  <p align="center">
    <a href="https://regis-safety-hub.vercel.app">regis-safety-hub.vercel.app</a>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React 18" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/AI-Claude%20%2B%20Whisper-D97706?style=flat-square" alt="AI-Powered" />
    <img src="https://img.shields.io/badge/n8n-Workflows-EA4B71?style=flat-square&logo=n8n&logoColor=white" alt="n8n" />
    <img src="https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Edge%20Functions-Deno-000000?style=flat-square&logo=deno&logoColor=white" alt="Edge Functions" />
  </p>
</p>

---

## El Problema

**Regis Colombia** lleva 17 anos gestionando Seguridad y Salud en el Trabajo (SG-SST) para 90+ empresas con solo 3 consultores. Todo el proceso es manual: solicitar documentos por correo, revisar PDFs uno a uno, llenar matrices en Excel, redactar actas a mano, y calcular cumplimiento en hojas de calculo.

Esto no escala. Las empresas colombianas de 1-50 trabajadores deben cumplir entre 7 y 21 estandares regulatorios segun la Resolucion 0312/2019 — y cada consultor maneja 30+ empresas.

## La Solucion

Una plataforma unificada donde los documentos se solicitan automaticamente, se procesan con IA, se califican en tiempo real, y se archivan con trazabilidad completa — reduciendo el trabajo del consultor de horas a minutos por empresa.

---

## Features por Modulo

### PILA (Planilla de Seguridad Social)
- Solicitud automatica mensual por email + WhatsApp
- Escalacion a RRHH despues de N recordatorios
- Portal publico de carga con token (sin login)
- Sincronizacion automatica con Google Drive via n8n
- Idempotencia en cargas duplicadas
- Tracking de vencimientos + scroll preservation

### Examenes Medicos
- Extraccion IA con Claude Vision (cascada Haiku/Sonnet, ~70% ahorro)
- Deteccion automatica de documentos no-medicos
- Score de confianza por extraccion
- Soporte para 5+ tipos de PDF
- Recomendaciones medicas estructuradas

### Matrices de Riesgo (GTC 45)
- Pre-llenado automatico por CIIU (principal + secundario)
- Edicion inline: ND, NE, NC, NP, NR
- Agregar/eliminar riesgos manualmente
- Subir matriz aprobada por ARL
- Deduplicacion de peligros entre CIIUs

### Comites (COPASST / Convivencia / Vigia)
- Gestion de periodos, integrantes (principal/suplente), quorum
- Generacion de actas desde 3 fuentes: manual, Fireflies.ai, Whisper
- Links de asistencia individuales con token unico por integrante
- Firma y archivado con recordatorios
- Tipo de reunion: ordinaria, extraordinaria, seguimiento

### Planes de Emergencia
- Grabacion de audio en navegador (Chrome + Safari)
- Transcripcion con Whisper API
- Analisis Claude: diamante del riesgo UNGRD, PON, MEC, estructura organizacional
- max_tokens 8192 para analisis completos

### Cumplimiento (Resolucion 0312)
- 7 estandares (Cap. 1) o 21 estandares (Cap. 2) segun tamano/riesgo
- Puntaje PHVA en tiempo real
- Toggle Admin/Cliente con selector de empresa
- Impresion de reportes con header corporativo

### Documentos
- Flujo: pendiente → cargado → validado → aprobado
- Puntos de cumplimiento solo en etapa "aprobado"
- Signed URLs on-the-fly (bucket privado)

### Inventario de Equipos
- Tipos: extintor, botiquin, camilla, EPP, senalizacion, otro
- Estados: vigente, por_vencer, vencido
- Alertas automaticas en calendario
- Carga masiva CSV con plantilla descargable

### Modulos Adicionales
- **Calendario**: 5 modulos integrados (PILA, examenes, comites, emergencia, equipos) + leyenda colores
- **Trabajadores**: Registro por empresa, vista detalle con examenes y historial
- **Bitacora Mensual**: Reporte automatico de actividad por empresa
- **Resumen Semanal**: Pendientes lunes + balance viernes para consultores
- **Observabilidad**: Tendencias, heatmap PILA, costos API, distribucion cumplimiento
- **Templates Email**: CRUD de plantillas con variables dinamicas
- **Logs Actividad**: Auditoria completa filtrable por modulo/empresa/usuario
- **Perfil**: Info del usuario + cambio de contrasena
- **Onboarding**: Wizard guiado para nuevas empresas

---

## Arquitectura

| Capa | Tecnologia | Proposito |
|------|-----------|-----------|
| **Frontend** | React 18, TypeScript, Vite | SPA con type safety |
| **UI** | Tailwind CSS, shadcn/ui, Radix UI | Componentes accesibles y consistentes |
| **Backend** | Supabase (PostgreSQL) | DB, Auth, Storage, Edge Functions |
| **IA - Texto** | Anthropic Claude (Haiku/Sonnet) | Extraccion PDFs, matrices, actas, vulnerabilidad |
| **IA - Audio** | OpenAI Whisper | Transcripcion audio inspecciones y reuniones |
| **IA - Reuniones** | Fireflies.ai | Transcripcion videollamadas con diarizacion |
| **Automatizacion** | n8n (self-hosted) | 5 workflows PILA + Drive sync |
| **Email** | Resend API | Emails transaccionales con text/plain + List-Unsubscribe |
| **Mensajeria** | Twilio | WhatsApp notificaciones |
| **Storage** | Supabase + Google Drive (via n8n) | Documentos privados + backup Drive |
| **Deploy** | Vercel | Frontend en produccion |

---

## Seguridad

- **94+ politicas RLS** en 22+ tablas — tenant isolation completo
- **3 roles**: admin, consultor, cliente — con guards en frontend y RLS en backend
- **Bucket privado** con signed URLs (no URLs publicas)
- **Tokens base64** para portales publicos (PILA upload, asistencia comite)
- **Edge Functions**: JWT para IA, no-jwt para webhooks con validacion server-side
- **Service role key** solo en Edge Functions (server-side)
- **Ley 1581 de 2012**: Aviso de tratamiento de datos personales

---

## Costos Estimados

| Escenario | Costo/mes |
|-----------|-----------|
| 3 empresas (free tier) | $0 |
| 90 empresas | ~$70 |
| Con optimizaciones (cache, batch) | ~$15 |

---

## Usuarios Demo

| Email | Rol | Password |
|-------|-----|----------|
| admin@regiscolombia.com | admin | [contactar] |
| consultor@regiscolombia.com | consultor | Demo2026! |
| admin@saborcriollo.com | cliente | Demo2026! |
| admin@construandes.com | cliente | Demo2026! |

---

## Estructura del Repo

```
src/
  pages/              22 paginas (1 por modulo)
  components/         layout/, dashboard/, ui/, common/
  context/            AuthContext, ViewModeContext
  services/index.ts   Todas las queries Supabase
  types/domain.ts     Tipos TypeScript del dominio
  lib/                supabase.ts, utils.ts, exportHeader.ts
  assets/             regis-logo.jpeg

supabase/
  functions/          8 Edge Functions (Deno)
  migrations/         18 migrations (005-018)

docs/
  operations/         SOP Manual operativo
  demo/               Script y materiales del demo
  briefs/             Brief consolidado y criterios
  reports/            Reportes de batches y auditorias
  design/             Disenos y wireframes
```

---

## Como Correr Local

```bash
git clone https://github.com/jrosoriozuluaga/regis-safety-hub
cd regis-safety-hub
npm install
npm run dev    # http://localhost:8080
```

### Build

```bash
npm run build    # outputs to dist/
```

### Deploy Edge Functions

```bash
supabase functions deploy <function-name> --no-verify-jwt
```

---

## Edge Functions (8 deployadas)

| Funcion | Auth | Descripcion |
|---------|------|-------------|
| `generate-acta` | JWT | Actas comite desde agenda o transcripcion (Fireflies/Whisper) |
| `process-exam-pdf` | JWT | Extraccion IA examenes — deteccion no-medico + confianza |
| `transcribe-audio` | JWT | Whisper + Claude analisis vulnerabilidad UNGRD |
| `fetch-fireflies-transcripts` | no-jwt | Importar transcripciones Fireflies.ai |
| `send-pila-reminder` | no-jwt | Email via Resend con templates + anti-spam |
| `send-whatsapp-reminder` | no-jwt | WhatsApp via Twilio |
| `generate-bitacora` | no-jwt | Reporte mensual actividad por empresa |
| `weekly-summary` | no-jwt | Resumen semanal consultor (lunes/viernes) |

---

## Documentacion

| Documento | Ubicacion |
|-----------|-----------|
| Manual operativo | `docs/operations/SOP_MANUAL_REGIS_SGSST.docx` |
| Script demo | `docs/demo/` |
| Brief concurso | `docs/briefs/` |
| Reportes batches | `docs/reports/` |
| Plan 10 dias | `docs/PLAN_10_DIAS.md` |

---

## Licencia

Proyecto construido para el Concurso de Automatizacion de Regis Colombia.
Todos los derechos reservados.

---

## Creditos

Construido con: [React](https://react.dev), [Supabase](https://supabase.com), [Vite](https://vitejs.dev), [shadcn/ui](https://ui.shadcn.com), [n8n](https://n8n.io), [Tailwind CSS](https://tailwindcss.com), [Radix UI](https://radix-ui.com).

IA: [Anthropic Claude](https://anthropic.com), [OpenAI Whisper](https://openai.com), [Fireflies.ai](https://fireflies.ai).
