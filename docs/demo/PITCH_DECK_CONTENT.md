# Pitch Deck — Regis Safety Hub

> Contenido diapositiva por diapositiva para el video de demostración (25 min).
> Concurso Regis Colombia — Mayo 2026.

---

## Diapositiva 1: Portada

**Título:** Regis Safety Hub — Automatización SG-SST Inteligente

**Bullets:**
- Plataforma integral para la gestión del Sistema de Gestión de Seguridad y Salud en el Trabajo
- Diseñada para consultoras que administran múltiples empresas PYME
- Potenciada por inteligencia artificial y automatización de flujos

**Visual sugerido:** Logo de Regis centrado, fondo con gradiente azul corporativo, subtítulo "Resolución 0312/2019 · Cumplimiento automatizado" debajo del logo.

**Notas del presentador:** Saludo breve. Presentar el nombre de la plataforma y el objetivo: transformar la forma en que una consultora de SST gestiona el cumplimiento normativo de decenas de empresas. Mencionar que se cubrirán todos los módulos en los próximos 25 minutos con demostraciones en vivo.

---

## Diapositiva 2: El Problema

**Título:** El día a día de un consultor SG-SST hoy

**Bullets:**
- 90+ empresas gestionadas por 3 consultores con hojas de Excel y carpetas compartidas
- Recordatorios manuales: llamadas, correos uno por uno, sin confirmación de lectura
- Cero trazabilidad: no se sabe quién cargó qué documento ni cuándo
- Actas de comités redactadas a mano — la tarea más demorada según Regis
- Riesgo constante de incumplimiento por olvido u omisión

**Visual sugerido:** Captura de pantalla de un Excel real con tracking de PILA (anonimizado) al lado izquierdo. Al lado derecho, íconos de alerta representando los problemas (reloj, documento perdido, signo de exclamación).

**Notas del presentador:** Describir la realidad actual de Regis: tres personas manejando el cumplimiento mensual de más de 90 empresas con herramientas genéricas. Enfatizar que el volumen de tareas repetitivas deja poco tiempo para asesoría de valor. Dar el ejemplo concreto de PILA: cada mes hay que solicitar, perseguir, verificar y archivar un comprobante por cada empresa.

---

## Diapositiva 3: La Oportunidad

**Título:** Un mercado regulado con obligaciones recurrentes

**Bullets:**
- La Resolución 0312/2019 exige cumplimiento verificable a todas las empresas con empleados
- 90+ empresas generan obligaciones mensuales (PILA), semestrales (exámenes) y anuales (planes, comités)
- El incumplimiento conlleva multas de hasta 500 SMLMV para la empresa y responsabilidad para la consultora
- Oportunidad de escalar sin aumentar personal proporcionalmente
- Cada nuevo cliente multiplica tareas repetitivas — el modelo actual no escala

**Visual sugerido:** Gráfico simple mostrando crecimiento de empresas vs. capacidad del equipo actual (líneas divergentes). Ícono de la normativa colombiana al costado.

**Notas del presentador:** Explicar que la regulación colombiana crea demanda constante. El problema no es conseguir clientes — es poder atenderlos. Con 90 empresas y 3 consultores, cada persona maneja 30 empresas. Cada módulo de la plataforma automatiza tareas que hoy consumen horas semanales. La plataforma permite crecer a 150 o 200 empresas con el mismo equipo.

---

## Diapositiva 4: Visión General de la Solución

**Título:** Regis Safety Hub — Cuatro pilares

**Bullets:**
- **Automatización de flujos:** PILA, recordatorios, seguimiento — sin intervención manual
- **IA documental:** Extracción de exámenes médicos, generación de matrices y actas con Claude
- **Dashboards en tiempo real:** Cumplimiento 0312, estado de documentos, métricas por empresa
- **Trazabilidad completa:** Cada acción queda registrada con usuario, fecha y contexto

**Visual sugerido:** Diagrama de cuatro cuadrantes con ícono representativo en cada uno. Centro: logo de Regis Safety Hub. Colores diferenciados por cuadrante.

**Notas del presentador:** Esta diapositiva da la visión de alto nivel antes de entrar módulo por módulo. Explicar brevemente cada pilar. Destacar que la trazabilidad no es solo un feature — es un requisito legal del SG-SST. Transición: "Veamos la arquitectura que hace esto posible."

---

## Diapositiva 5: Arquitectura Técnica

**Título:** Stack tecnológico y arquitectura

**Bullets:**
- **Frontend:** React + TypeScript + Vite, desplegado en Vercel — SPA rápida y responsive
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Edge Functions en Deno)
- **Automatización:** n8n self-hosted para flujos PILA (cron + webhooks + email)
- **IA:** Anthropic Claude (análisis documental, generación de actas) + OpenAI Whisper (transcripción)
- **Comunicaciones:** Resend (email transaccional) + Twilio (WhatsApp)

**Visual sugerido:** Diagrama de arquitectura con cajas conectadas: Usuario → Vercel (React) → Supabase (DB/Auth/Storage) ← Edge Functions (Claude/Whisper). Rama lateral: n8n → Supabase + Resend + Twilio. Flechas indicando flujo de datos.

**Notas del presentador:** Recorrer el diagrama de izquierda a derecha. Explicar por qué cada tecnología fue elegida: Supabase por RLS y tiempo real, n8n por la flexibilidad de workflows sin código, Claude por la calidad de análisis documental en español. Mencionar que las Edge Functions corren en Deno con acceso a las APIs de IA. Transición: "Entremos al primer módulo."

---

## Diapositiva 6: Módulo 1 — PILA

**Título:** M1: Gestión PILA — De 90 llamadas mensuales a cero

**Bullets:**
- **Antes:** El consultor envía correos individuales, hace seguimiento manual, archiva PDFs en carpetas
- **Ahora:** Sincronización automática de 6 meses de períodos por empresa
- Recordatorios escalonados por email (Resend) y WhatsApp (Twilio) con enlace de carga
- Carga pública con token — el cliente sube su PILA sin necesidad de cuenta
- Flujo de validación: pendiente → cargado → validado → aprobado

**Visual sugerido:** Screenshot de la tabla PILA con estados por colores. Al lado, ejemplo del correo de recordatorio y del enlace de carga pública.

**Notas del presentador:** DEMO EN VIVO. Mostrar la vista PILA filtrada por empresa. Demostrar: (1) cómo se sincronizan los períodos automáticamente, (2) el envío de un recordatorio por email, (3) abrir el enlace público de carga en otra pestaña simulando al cliente, (4) ver cómo el estado cambia a "cargado", (5) validar y aprobar el documento. Mencionar que n8n ejecuta un cron diario que envía recordatorios automáticos y marca vencidos sin intervención.

---

## Diapositiva 7: Módulo 2 — Exámenes Médicos

**Título:** M2: Exámenes Médicos — Extracción inteligente con IA

**Bullets:**
- **Antes:** Leer cada certificado médico PDF y transcribir datos manualmente al sistema
- **Ahora:** Se sube el PDF y Claude Vision extrae: aptitud, restricciones, recomendaciones, fecha, tipo, médico
- Creación automática del registro del trabajador si no existe
- Seguimiento de recomendaciones médicas con estado de cumplimiento
- Histórico de exámenes por trabajador con filtros y exportación

**Visual sugerido:** Flujo visual: PDF de entrada → Claude Vision (ícono de IA) → formulario pre-llenado → registro guardado. Screenshot del modal de extracción mostrando los campos detectados.

**Notas del presentador:** DEMO EN VIVO. Subir un certificado de aptitud médica real (de prueba). Mostrar cómo la Edge Function process-exam-pdf envía el documento a Claude, que devuelve los campos estructurados. El formulario se llena automáticamente y el usuario solo confirma. Mostrar la lista de recomendaciones médicas extraídas. Destacar: lo que antes tomaba 10-15 minutos por examen ahora toma 30 segundos.

---

## Diapositiva 8: Módulo 3 — Matrices de Riesgo

**Título:** M3: Matrices de Riesgo GTC 45 — De 8 horas a 8 minutos

**Bullets:**
- **Antes:** Construir una matriz GTC 45 desde cero en Excel — mínimo 8 horas por empresa
- **Ahora:** Generación automática basada en código CIIU de la empresa
- Claude analiza la actividad económica y genera riesgos con: peligro, fuente, efecto, nivel de riesgo, controles
- Cada riesgo es editable — el consultor ajusta, no construye desde cero
- Exportación con encabezado Regis y formato normativo completo

**Visual sugerido:** Screenshot de la matriz de riesgo con columnas GTC 45. Ícono de IA indicando los campos generados automáticamente. Antes/después visual comparando Excel vs. la plataforma.

**Notas del presentador:** DEMO EN VIVO. Seleccionar una empresa y mostrar la matriz existente. Demostrar la generación con IA: seleccionar CIIU, ejecutar, ver cómo se puebla la tabla con riesgos relevantes para esa actividad económica. Editar un riesgo para mostrar que es completamente personalizable. Exportar la matriz como PDF con encabezado Regis. Enfatizar el ahorro de tiempo: la tarea que más horas consume en la consultora ahora tiene un punto de partida inteligente.

---

## Diapositiva 9: Módulo 4 — Comités y Actas

**Título:** M4: Comités y Actas — El dolor más grande de Regis, resuelto

**Bullets:**
- **Antes:** Redactar actas de COPASST y Convivencia manualmente — la tarea más demorada para Regis
- **Ahora:** Registro de comités con validación automática de quórum (50%+1)
- Generación de actas con IA: se ingresan puntos clave y Claude produce el acta formal
- Exportación PDF con encabezado corporativo, firmas y pie de página normativo
- Seguimiento de compromisos y recordatorio de firma/archivo

**Visual sugerido:** Screenshot del formulario de creación de acta con los campos de entrada. Al lado, el PDF generado con formato profesional. Indicador de quórum visible.

**Notas del presentador:** DEMO EN VIVO. Este es el módulo estrella — Regis identificó las actas como su mayor dolor operativo. Mostrar: (1) crear un comité con integrantes, (2) verificar quórum automáticamente, (3) crear un acta ingresando los puntos discutidos, (4) generar el contenido con Claude, (5) exportar el PDF final con encabezado Regis. Mostrar el seguimiento de compromisos. Destacar que lo que antes tomaba 2-3 horas de redacción ahora se genera en minutos y el consultor solo revisa y ajusta.

---

## Diapositiva 10: Módulo 5 — Planes de Emergencia

**Título:** M5: Planes de Emergencia — Del audio de campo al análisis estructurado

**Bullets:**
- **Antes:** El consultor toma notas en campo, luego las pasa a un documento — alto riesgo de omisión
- **Ahora:** Grabación de audio directamente en la plataforma durante la inspección
- Transcripción automática con OpenAI Whisper
- Análisis de vulnerabilidades con Claude: amenazas identificadas, nivel de riesgo, recomendaciones
- Plan estructurado con clasificación por tipo de amenaza (natural, tecnológica, social)

**Visual sugerido:** Flujo: micrófono (grabación) → onda de audio → texto transcrito → análisis de vulnerabilidades con colores por nivel de riesgo. Screenshot del resultado del análisis.

**Notas del presentador:** DEMO EN VIVO. Grabar un audio corto describiendo las condiciones de un lugar de trabajo ficticio. Mostrar la transcripción automática. Ejecutar el análisis con Claude y mostrar cómo se identifican vulnerabilidades con clasificación y recomendaciones. Explicar que esto permite al consultor capturar información en campo sin perder detalles, y el análisis de IA garantiza que no se omitan riesgos evidentes.

---

## Diapositiva 11: Módulo 6 — Dashboard de Cumplimiento

**Título:** M6: Cumplimiento Resolución 0312/2019 — Visibilidad total

**Bullets:**
- Evaluación basada en los estándares mínimos de la Resolución 0312/2019 (Capítulos 1 y 2)
- Puntaje PHVA (Planear, Hacer, Verificar, Actuar) calculado automáticamente
- Vista por empresa con detalle de cada estándar: cumple, no cumple, en progreso
- Los puntos solo se otorgan cuando el documento alcanza estado "aprobado"
- Panel consolidado para que el consultor vea todas las empresas de un vistazo

**Visual sugerido:** Screenshot del dashboard de cumplimiento con barras de progreso PHVA. Tabla de estándares con indicadores de color. Vista consolidada multi-empresa.

**Notas del presentador:** DEMO EN VIVO. Abrir el módulo de cumplimiento. Seleccionar una empresa y recorrer los estándares evaluados. Mostrar cómo el puntaje se calcula automáticamente según los documentos aprobados. Explicar la lógica de capítulos: empresas con 10 o menos trabajadores evalúan Capítulo 1 (7 estándares), de 11 a 50 evalúan Capítulo 2 (21 estándares). Mostrar la vista consolidada si está disponible.

---

## Diapositiva 12: Funcionalidades Adicionales

**Título:** Más allá del cumplimiento básico

**Bullets:**
- **Inventario de Equipos:** Registro con fechas de vencimiento y alertas automáticas (extintores, botiquines, camillas)
- **Bitácora mensual auto-generada:** Edge Function que compila todas las actividades del mes por empresa
- **Resumen semanal del consultor:** Reporte automático de pendientes, vencimientos y acciones requeridas
- **Gestión de plantillas de correo:** CRUD completo para personalizar comunicaciones
- **Log de actividad:** Auditoría completa de cada acción en la plataforma

**Visual sugerido:** Grid de 5 mini-screenshots o íconos representando cada funcionalidad adicional. Destacar el inventario de equipos con un badge de "alerta de vencimiento".

**Notas del presentador:** Recorrer brevemente cada feature adicional. No es necesario hacer demo completa de cada uno — mostrar capturas de pantalla o navegar rápidamente. Destacar que la bitácora y el resumen semanal se generan automáticamente sin intervención. El inventario de equipos resuelve un problema real: extintores vencidos son una de las no conformidades más comunes en auditorías. El log de actividad garantiza trazabilidad ante cualquier auditoría.

---

## Diapositiva 13: Cumplimiento de Criterios del Concurso

**Título:** Resolución 0312/2019 — Criterios evaluados

**Bullets:**
- Automatización sin intervención manual — PILA, recordatorios, bitácora, resumen semanal
- Procesamiento documental con IA — exámenes médicos, matrices de riesgo, actas, planes de emergencia
- Cumplimiento normativo verificable — dashboard 0312 con puntaje PHVA
- Exportaciones profesionales con branding — encabezado Regis, código de módulo, NIT, pie normativo
- Escalabilidad demostrada — diseño multi-tenant, 3 empresas activas, arquitectura lista para 90+
- Trazabilidad — log de actividad con usuario, fecha, módulo y descripción
- Comunicación multicanal — email (Resend) + WhatsApp (Twilio)

**Visual sugerido:** Checklist visual con 7 criterios marcados como cumplidos (check verde). Formato limpio tipo tabla.

**Notas del presentador:** Repasar cada criterio del concurso y cómo la plataforma lo cumple. Ser específico: no solo decir "automatización" sino dar el ejemplo concreto (PILA sync + cron diario de n8n). Mencionar que el octavo criterio (si lo hay) está identificado y en el roadmap.

---

## Diapositiva 14: Stack Tecnológico en Detalle

**Título:** Tecnologías que potencian la plataforma

**Bullets:**
- **React 18 + TypeScript + Vite:** SPA moderna, tipado estricto, hot reload rápido, desplegada en Vercel
- **Supabase:** PostgreSQL con RLS, autenticación integrada, Storage para documentos, Edge Functions (Deno)
- **n8n:** Automatización de workflows self-hosted — crons, webhooks, integración email
- **Anthropic Claude:** Análisis documental, generación de texto normativo, extracción de datos de PDFs
- **OpenAI Whisper:** Transcripción de audio a texto en español para inspecciones de campo

**Visual sugerido:** Logos de cada tecnología organizados en tres filas: Frontend (React, TypeScript, Vite, Tailwind, Vercel), Backend (Supabase, PostgreSQL, Deno), Servicios (Claude, Whisper, Resend, Twilio, n8n).

**Notas del presentador:** Explicar brevemente por qué se eligió cada tecnología. Supabase: RLS permite seguridad a nivel de fila sin escribir middleware. n8n: flexibilidad para modificar workflows sin redesplegar código. Claude: mejor rendimiento en español para análisis de documentos normativos colombianos. No extenderse demasiado — el público puede no ser técnico.

---

## Diapositiva 15: Seguridad y Privacidad

**Título:** Seguridad de datos y cumplimiento regulatorio

**Bullets:**
- Row Level Security (RLS) en todas las tablas — cada empresa solo ve sus propios datos
- Autenticación con Supabase Auth — roles diferenciados: admin, consultor, cliente
- Documentos almacenados en Supabase Storage con rutas segregadas por empresa
- Edge Functions con service role key — nunca se expone la clave de servicio al frontend
- Ruta de cumplimiento Habeas Data (Ley 1581/2012) — diseño preparado para política de tratamiento de datos

**Visual sugerido:** Diagrama de capas de seguridad: Usuario → Auth (JWT) → RLS (PostgreSQL) → Storage (paths por empresa). Ícono de candado en cada capa.

**Notas del presentador:** Explicar que la seguridad no es un agregado posterior — está integrada en la arquitectura desde el diseño. RLS significa que incluso si hay un bug en el frontend, la base de datos rechaza consultas no autorizadas. Mencionar que el manejo de datos personales de trabajadores (exámenes médicos, por ejemplo) requiere cumplimiento de Habeas Data y la plataforma está diseñada para facilitar eso.

---

## Diapositiva 16: Escalabilidad

**Título:** De 3 empresas hoy a 90+ mañana

**Bullets:**
- Arquitectura multi-tenant desde el diseño — cada tabla tiene `empresa_id` como filtro principal
- Roles de acceso: admin ve todo, consultor ve sus empresas asignadas, cliente ve solo la suya
- Base de datos PostgreSQL con índices optimizados para consultas por empresa y período
- Edge Functions stateless — escalan automáticamente con Supabase
- n8n procesa workflows en batch — un cron atiende las 90 empresas en una ejecución

**Visual sugerido:** Gráfico mostrando la línea de esfuerzo manual (crece linealmente con empresas) vs. esfuerzo con la plataforma (crece sub-linealmente). Flecha indicando el punto actual (3 empresas) y el objetivo (90+).

**Notas del presentador:** El punto clave es que agregar una empresa nueva es configurar un registro en la base de datos — no duplicar archivos ni workflows. PILA sync genera automáticamente los 6 meses de períodos para cada empresa nueva. Los recordatorios se envían en batch. Los dashboards se calculan en tiempo real. Mostrar brevemente el selector de empresas para ilustrar la experiencia multi-tenant.

---

## Diapositiva 17: Roadmap Post-Concurso

**Título:** Evolución planificada — próximos 6 meses

**Bullets:**
- **RLS granular por consultor:** Cada consultor solo accede a sus empresas asignadas (actualmente: todos ven todo)
- **Migración a Microsoft 365:** Workflows de n8n pasarán de Gmail/Drive a Outlook/OneDrive (Regis usa Microsoft)
- **Tests automatizados:** Suite de pruebas con Vitest + Testing Library para regresiones
- **pg_cron en Supabase:** Reemplazar crons de n8n por funciones programadas directamente en la base de datos
- **App móvil PWA:** Acceso offline para inspecciones de campo con sincronización posterior

**Visual sugerido:** Timeline horizontal con los 5 hitos distribuidos en los próximos 6 meses. Cada hito con ícono representativo y fecha estimada.

**Notas del presentador:** Ser transparente sobre lo que falta. La migración a Outlook es prioridad porque Regis ya usa Microsoft 365. RLS granular es el siguiente paso de seguridad. Los tests automáticos son necesarios antes de escalar a producción con 90 empresas. Mencionar que el roadmap se priorizó con base en conversaciones con Regis sobre sus necesidades inmediatas.

---

## Diapositiva 18: Cierre

**Título:** Regis Safety Hub — Resumen y contacto

**Bullets:**
- 6 módulos funcionales con IA integrada y automatización de flujos
- 3 empresas activas en producción con datos reales
- Reducción estimada del 70% en tiempo de tareas operativas repetitivas
- Arquitectura lista para escalar a 90+ empresas sin cambios estructurales
- Diseñado por y para consultores SG-SST colombianos

**Visual sugerido:** Logo de Regis grande centrado. Debajo: métricas clave en tres columnas (6 módulos, 3 empresas activas, 90+ empresas objetivo). Información de contacto del equipo. Frase de cierre motivacional.

**Notas del presentador:** Cerrar con fuerza. Recapitular los puntos más impactantes: las actas ya no se redactan a mano, PILA se gestiona sin llamadas, las matrices de riesgo tienen un punto de partida inteligente. Agradecer al jurado por su tiempo. Invitar a preguntas. Si hay tiempo, ofrecer una última demostración rápida de cualquier módulo que quieran ver con más detalle.

---

## Notas Generales para la Grabación del Video

- **Duración objetivo:** 22-24 minutos (dejar margen para el límite de 25)
- **Distribución sugerida:**
  - Introducción y problema: 3 min (diapositivas 1-4)
  - Arquitectura: 1 min (diapositiva 5)
  - Módulos con demo en vivo: 14-16 min (diapositivas 6-11, ~2.5 min por módulo)
  - Features adicionales y criterios: 2 min (diapositivas 12-13)
  - Stack, seguridad, escalabilidad: 2 min (diapositivas 14-16)
  - Roadmap y cierre: 2 min (diapositivas 17-18)
- **Regla de oro:** Cada módulo debe tener demo en vivo — no solo diapositivas
- **Preparar datos de prueba** en las 3 empresas antes de grabar
- **Tener PDFs de exámenes médicos y audios de prueba** listos para las demos de IA
- **Grabar en resolución 1080p mínimo** con fuente legible en la plataforma
