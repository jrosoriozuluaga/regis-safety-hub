# Regis SG-SST -- Resumen Ejecutivo

## Plataforma de Gestion del Sistema de Seguridad y Salud en el Trabajo

---

## Que es Regis SG-SST?

Regis SG-SST es una plataforma web integral para la gestion del Sistema de Gestion de Seguridad y Salud en el Trabajo (SG-SST), disenada especificamente para empresas colombianas de 1 a 50 trabajadores con niveles de riesgo I a III, en cumplimiento de la Resolucion 0312 de 2019.

La plataforma fue construida para Regis Colombia, una firma consultora que administra el cumplimiento SG-SST de multiples PYMES simultaneamente. Regis SG-SST transforma procesos manuales, repetitivos y propensos a errores en flujos de trabajo automatizados e inteligentes.

---

## Diferenciadores Clave

### Inteligencia Artificial Integrada

- **Procesamiento de examenes medicos:** Claude Vision (Anthropic) extrae automaticamente datos de PDFs de examenes ocupacionales, incluyendo recomendaciones medicas, restricciones y diagnosticos.
- **Transcripcion de audio:** OpenAI Whisper convierte grabaciones de reuniones en texto, que luego Claude analiza para generar actas de comite estructuradas.
- **Generacion de actas:** Las actas de COPASST y Convivencia se generan automaticamente con IA a partir de transcripciones, eliminando el proceso mas doloroso reportado por Regis.
- **Matrices de riesgo GTC 45:** Generacion asistida por IA con edicion inline directa en tabla, el proceso mas dispendioso en tiempo para los consultores.
- **Analisis de vulnerabilidad:** Claude analiza planes de emergencia y genera evaluaciones de vulnerabilidad estructuradas.

### Automatizacion Sin Intervencion Manual

- **Seguimiento PILA completo:** Solicitud automatica el dia 16 de cada mes, recordatorios escalonados por email y WhatsApp, marcado automatico de vencidos, y carga publica sin autenticacion via token.
- **Bitacora mensual auto-generada:** Edge Function que compila automaticamente todas las actividades del mes por empresa.
- **Resumen semanal del consultor:** Resumen automatico enviado a cada consultor con el estado de sus empresas asignadas.
- **Recordatorios de vencimiento de equipos:** Alertas automaticas para extintores, botiquines, camillas y otros equipos con fecha de caducidad.
- **Recordatorios de firma y archivo de actas:** Seguimiento automatico post-reunion para completar el ciclo documental.

### Exportaciones Profesionales con Marca

Todos los documentos exportados incluyen encabezado con logo de Regis, codigo del modulo, NIT de la empresa y nombre. Formato profesional listo para presentar ante ARL o Ministerio de Trabajo.

---

## Stack Tecnologico

| Capa | Tecnologia |
|------|------------|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui + Radix UI |
| Backend | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| IA | Anthropic Claude (Vision, texto) + OpenAI Whisper (audio) |
| Automatizacion | n8n (workflows self-hosted) + 7 Edge Functions (Deno) |
| Comunicacion | Resend (email) + Twilio (WhatsApp) |

---

## Escala y Rendimiento

- **Disenada para 90+ empresas** gestionadas simultaneamente
- **3 roles de usuario:** Administrador, Consultor, Cliente
- **Hasta 50 trabajadores por empresa** (Capitulos 1 y 2 de la Resolucion 0312)
- **Multi-tenant:** Cada empresa ve unicamente sus propios datos

---

## Seguridad

- **94 politicas de Row Level Security (RLS)** en Supabase
- **Aislamiento por tenant:** Los clientes solo acceden a datos de su empresa
- **Autenticacion robusta:** Supabase Auth con roles (admin/consultor/cliente)
- **Carga publica segura:** URLs con token base64 para carga PILA sin credenciales
- **Edge Functions con service role:** Operaciones privilegiadas aisladas del frontend

---

## Modulos de la Plataforma

| # | Modulo | Descripcion |
|---|--------|-------------|
| 1 | **PILA** | Seguimiento mensual de planillas, solicitudes automaticas, recordatorios multicanal, carga publica |
| 2 | **Examenes Medicos** | Registro de examenes ocupacionales, extraccion IA de PDFs, seguimiento de recomendaciones |
| 3 | **Matrices de Riesgo** | Metodologia GTC 45, edicion inline, generacion asistida por IA, exportacion profesional |
| 4 | **Comites** | COPASST, Convivencia y Vigia SST, generacion de actas con IA, gestion de integrantes |
| 5 | **Planes de Emergencia** | Grabacion de audio, transcripcion Whisper, analisis de vulnerabilidad con Claude |
| 6 | **Cumplimiento 0312** | Dashboard de cumplimiento por estandar, calculo automatico PHVA, scoring en tiempo real |
| 7 | **Documentos** | Gestion documental general con flujo de validacion de 4 estados |
| 8 | **Inventario de Equipos** | Control de extintores, botiquines, camillas con alertas de vencimiento |
| 9 | **Registro de Actividad** | Bitacora completa de todas las acciones por usuario y empresa |
| 10 | **Plantillas de Email** | CRUD de plantillas para comunicaciones estandarizadas |

---

## Enfoque en Criterios de Evaluacion

| Criterio | Como lo cumple Regis SG-SST |
|----------|----------------------------|
| **Automatizacion** | PILA end-to-end sin intervencion, bitacora mensual, resumen semanal, recordatorios de vencimiento |
| **IA** | 4 Edge Functions con Claude/Whisper: examenes, actas, matrices, planes de emergencia |
| **Cumplimiento** | Mapeo completo Cap. 1 y 2 de Resolucion 0312, scoring PHVA automatico |
| **Exportaciones** | Documentos con marca Regis, encabezado/pie corporativo, listos para auditoria |
| **Escalabilidad** | Arquitectura multi-tenant, 94 RLS policies, disenada para 90+ empresas |

---

*Regis SG-SST -- Transformando la gestion de seguridad y salud en el trabajo para las PYMES colombianas.*
