# Registro de Riesgos — Regis Safety Hub

**Fecha:** 21 de mayo de 2026  
**Autor:** Equipo de desarrollo  
**Revisión:** v1.0

## Matriz de Riesgos (Resumen)

**Escala:** Probabilidad (1-5) × Impacto (1-5) = Severidad (1-25)
- 🔴 Crítico: 15-25
- 🟡 Alto: 10-14
- 🟢 Medio: 5-9
- ⚪ Bajo: 1-4

| # | Riesgo | Prob | Imp | Sev | Categoría | Owner |
|---|--------|------|-----|-----|-----------|-------|
| R01 | Cross-tenant data access (RLS abierta) | 4 | 5 | 🔴 20 | Seguridad | Dev |
| R02 | Dato médico erróneo extraído por IA | 3 | 5 | 🔴 15 | Legal | Dev + Consultor |
| R03 | Filtración exámenes médicos | 2 | 5 | 🟡 10 | Seguridad | Dev |
| R04 | Reclamo SIC por Habeas Data | 3 | 4 | 🟡 12 | Legal | Admin Regis |
| R05 | Supabase Free tier insuficiente | 4 | 4 | 🟡 16 | Técnico | Dev |
| R06 | n8n single point of failure | 3 | 3 | 🟢 9 | Técnico | Dev |
| R07 | Anthropic cambia/descontinúa modelos | 3 | 3 | 🟢 9 | Técnico | Dev |
| R08 | Twilio sandbox no escala | 5 | 2 | 🟡 10 | Técnico | Dev |
| R09 | Pérdida de datos por error operacional | 2 | 5 | 🟡 10 | Negocio | Admin Regis |
| R10 | API keys expuestas | 2 | 5 | 🟡 10 | Seguridad | Dev |
| R11 | Cambio regulatorio SG-SST | 2 | 4 | 🟢 8 | Legal | Admin Regis |
| R12 | Feature creep de clientes | 4 | 2 | 🟢 8 | Negocio | Admin Regis |
| R13 | Rotación de consultores | 3 | 3 | 🟢 9 | Negocio | Admin Regis |
| R14 | Phishing a admins cliente | 3 | 3 | 🟢 9 | Seguridad | Dev |
| R15 | Incumplimiento 0312 por MinTrabajo | 2 | 4 | 🟢 8 | Legal | Consultor |
| R16 | Vercel free tier rate limits | 2 | 3 | 🟢 6 | Técnico | Dev |
| R17 | Falla deploy Vercel | 2 | 2 | ⚪ 4 | Técnico | Dev |
| R18 | Dependencia APIs externas sin SLA | 3 | 3 | 🟢 9 | Técnico | Dev |

---

## A) Riesgos Técnicos

### R05 — Supabase Free tier insuficiente

**Descripción:** El Free tier de Supabase ofrece 500MB de base de datos y 1GB de Storage. A 90 empresas con exámenes médicos (~2MB/PDF), el storage se agota en ~2 meses. La DB en sí (~40MB a 90 empresas) no es problema.

**Probabilidad:** 4/5 — Casi seguro si se escala según el plan.  
**Impacto:** 4/5 — Uploads fallan, plataforma parcialmente inoperante.  
**Severidad:** 🟡 16  
**Mitigación actual:** Solo 3 empresas activas, bien dentro de límites.  
**Mitigación recomendada:** Upgrade a Supabase Pro ($25/mes) antes de llegar a 10 empresas. Monitorear usage en Dashboard.  
**Owner:** Dev  
**Plazo:** Corto plazo (antes de onboarding empresa #10)

### R06 — n8n single point of failure

**Descripción:** n8n está self-hosted en n8n.john-osorio.lat (servidor personal). Si el servidor cae, los 4 workflows PILA dejan de funcionar: solicitudes mensuales, recordatorios diarios, seguimiento automático y recepción de archivos.

**Probabilidad:** 3/5 — Servidores personales tienen ~99% uptime, no 99.9%.  
**Impacto:** 3/5 — PILA automation se detiene, pero email/WhatsApp via Edge Functions siguen funcionando como fallback parcial.  
**Severidad:** 🟢 9  
**Mitigación actual:** Edge Functions de Resend y Twilio funcionan independientemente de n8n.  
**Mitigación recomendada:** Migrar a n8n Cloud ($20/mes) o pg_cron de Supabase (elimina dependencia). Documentar procedimiento manual de respaldo.  
**Owner:** Dev  
**Plazo:** Mediano plazo

### R07 — Anthropic cambia/descontinúa modelos

**Descripción:** Ya ocurrió: 4 modelos deprecados entre febrero y junio 2026 (3.5-sonnet, 3.7-sonnet, sonnet-4-20250514, 3.5-haiku). El pattern `MODEL_CASCADE` mitiga, pero todos los modelos del cascade podrían cambiar simultáneamente.

**Probabilidad:** 3/5 — Anthropic rota modelos cada 3-6 meses.  
**Impacto:** 3/5 — Las 3 Edge Functions degradan a fallback estático (funcional pero sin IA).  
**Severidad:** 🟢 9  
**Mitigación actual:** `MODEL_CASCADE` con 2 modelos + fallback estático en las 3 funciones. `extractJSON()` robusto.  
**Mitigación recomendada:** Monitorear changelog de Anthropic. Agregar alerta cuando el modelo primario retorna 404 más de 3 veces. Considerar usar alias `claude-sonnet-latest` si Anthropic lo ofrece.  
**Owner:** Dev  
**Plazo:** Recurrente (verificar cada mes)

### R08 — Twilio sandbox no escala

**Descripción:** El sandbox de WhatsApp de Twilio requiere que cada destinatario envíe "join <keyword>" cada 72h. Inviable a 90 empresas con ~90 contactos PILA.

**Probabilidad:** 5/5 — Seguro que no escala.  
**Impacto:** 2/5 — WhatsApp es complementario; email sigue funcionando.  
**Severidad:** 🟡 10  
**Mitigación actual:** Links wa.me como fallback (el usuario abre WhatsApp manualmente).  
**Mitigación recomendada:** Registrar número WhatsApp Business API (~$15/mes). Requiere verificación de negocio con Meta (~2 semanas). Templates pre-aprobados (ver WHATSAPP_TEMPLATES.md).  
**Owner:** Dev + Admin Regis  
**Plazo:** Corto plazo (antes del demo si es posible, o post-contest)

### R16 — Vercel free tier rate limits

**Descripción:** Vercel free: 100GB bandwidth/mes, 6,000 build minutes/mes. Como SPA estática con Supabase backend, el bandwidth es bajo.

**Probabilidad:** 2/5 — Improbable con 90 empresas (SPA carga una vez, datos vienen de Supabase).  
**Impacto:** 3/5 — Sitio inaccesible si se excede.  
**Severidad:** 🟢 6  
**Mitigación actual:** SPA liviana (~2MB bundle), assets cacheados.  
**Mitigación recomendada:** Monitorear en Vercel Dashboard. Pro ($20/mes) si bandwidth supera 80GB.  
**Owner:** Dev  
**Plazo:** Bajo prioridad

### R18 — Dependencia de APIs externas sin SLA

**Descripción:** Claude, Whisper, Resend y Twilio se usan en planes free/bajo que no garantizan SLA. Una caída simultánea de Claude + Resend dejaría sin IA ni email.

**Probabilidad:** 3/5 — Cada servicio tiene ~99.5% uptime individual; combinado, alguno falla ~1-2 veces/mes.  
**Impacto:** 3/5 — Degradación parcial (fallbacks existen para IA; email tiene n8n como respaldo).  
**Severidad:** 🟢 9  
**Mitigación actual:** Fallbacks estáticos en Edge Functions, n8n como canal alternativo de email.  
**Mitigación recomendada:** Implementar health checks periódicos. Documentar en RUNBOOK_INCIDENTES.md (ya hecho).  
**Owner:** Dev  
**Plazo:** Mediano plazo

---

## B) Riesgos de Negocio

### R09 — Pérdida de datos por error operacional

**Descripción:** Eliminación accidental de registros, corrupción de datos, o fallo de Supabase sin backup verificado. Free tier tiene backups diarios pero sin point-in-time recovery.

**Probabilidad:** 2/5 — Poco probable con RLS y UI controlada.  
**Impacto:** 5/5 — Pérdida de datos médicos, PILA, actas tiene implicaciones legales y operacionales.  
**Severidad:** 🟡 10  
**Mitigación actual:** Supabase free incluye backups diarios automáticos. `ON DELETE CASCADE` en tablas hijas.  
**Mitigación recomendada:** Verificar restauración de backup al menos 1 vez. Upgrade a Pro para PITR. Implementar soft delete (`activo = false`) en lugar de DELETE en tablas críticas.  
**Owner:** Admin Regis + Dev  
**Plazo:** Corto plazo

### R11 — Cambio regulatorio SG-SST

**Descripción:** Si MinTrabajo modifica la Resolución 0312 de 2019 (estándares, puntajes, o categorías de empresa), la tabla `estandares_0312` y la lógica de cumplimiento quedarían desactualizadas.

**Probabilidad:** 2/5 — Regulaciones SG-SST colombianas cambian cada 3-5 años.  
**Impacto:** 4/5 — Cumplimiento reportado sería incorrecto, riesgo para las empresas cliente.  
**Severidad:** 🟢 8  
**Mitigación actual:** Tabla `estandares_0312` es editable por admin. Lógica de cumplimiento basada en datos de la tabla (no hardcoded).  
**Mitigación recomendada:** Suscribirse a alertas de MinTrabajo. Diseñar versionado de estándares (año de vigencia).  
**Owner:** Admin Regis  
**Plazo:** Bajo prioridad (reactivo)

### R12 — Feature creep de clientes

**Descripción:** Las 90 empresas cliente pedirán funcionalidades fuera del scope: reportes personalizados, integraciones con ERP, módulo de accidentalidad, etc.

**Probabilidad:** 4/5 — Muy probable en operación real.  
**Impacto:** 2/5 — Distracción del equipo, pero no afecta funcionalidad existente.  
**Severidad:** 🟢 8  
**Mitigación actual:** Backlog documentado (POST_CONTEST_BACKLOG.md).  
**Mitigación recomendada:** Proceso formal de priorización (MoSCoW). Roadmap público trimestral.  
**Owner:** Admin Regis  
**Plazo:** Post-contest

### R13 — Rotación de consultores

**Descripción:** Si un consultor se va de Regis, su conocimiento de las empresas asignadas se pierde. La plataforma tiene datos pero no el contexto humano.

**Probabilidad:** 3/5 — Rotación típica en consultoras SST es ~20% anual.  
**Impacto:** 3/5 — Nuevo consultor necesita ramp-up, posible caída de calidad.  
**Severidad:** 🟢 9  
**Mitigación actual:** `logs_actividad` registra todas las acciones. `consultor_id` en empresas permite reasignación.  
**Mitigación recomendada:** Notas por empresa (campo `observaciones` o bitácora interna). Resumen automático de historial por empresa para onboarding de consultor nuevo.  
**Owner:** Admin Regis  
**Plazo:** Mediano plazo

---

## C) Riesgos de Seguridad

### R01 — Cross-tenant data access (RLS abierta)

**Descripción:** Las políticas RLS actuales son `auth.role() = 'authenticated'` — cualquier usuario autenticado puede leer y escribir datos de TODAS las empresas. Un admin de Sabor Criollo puede ver los exámenes médicos de Construandes.

**Probabilidad:** 4/5 — Basta con que un usuario curioso explore la API o use las DevTools del browser.  
**Impacto:** 5/5 — Violación de privacidad, potencial multa SIC, pérdida de confianza de clientes.  
**Severidad:** 🔴 20  
**Mitigación actual:** Frontend filtra por `empresa_id` en queries. Pocos usuarios activos (contest).  
**Mitigación recomendada:** Implementar RLS tenant-scoped con helper `get_user_empresa_id()`. Draft disponible en `005_bucket_security_DRAFT.sql`. Prioridad P1.  
**Owner:** Dev  
**Plazo:** Urgente (antes de producción real)

### R03 — Filtración de exámenes médicos

**Descripción:** Los exámenes médicos contienen datos de salud (categoría sensible bajo Ley 1581). El bucket de Storage es público. Cualquiera con la URL puede descargar un PDF.

**Probabilidad:** 2/5 — URLs son aleatorias (UUID en path), pero no hay autenticación.  
**Impacto:** 5/5 — Datos sensibles expuestos, multa SIC hasta 2,000 SMLMV (~$3.6M COP).  
**Severidad:** 🟡 10  
**Mitigación actual:** URLs con UUID difíciles de adivinar.  
**Mitigación recomendada:** Bucket privado + signed URLs (draft en 005). Cifrado at-rest (Supabase Pro lo incluye).  
**Owner:** Dev  
**Plazo:** Urgente

### R10 — API keys expuestas

**Descripción:** Las API keys (Anthropic, Resend, Twilio) están en Supabase Secrets. El `.env` local fue agregado a `.gitignore` (fix ya aplicado en commit aef8804). Riesgo residual: alguien con acceso al Dashboard de Supabase ve todos los secrets.

**Probabilidad:** 2/5 — Acceso al dashboard está protegido por MFA de Supabase.  
**Impacto:** 5/5 — Keys comprometidas permiten envío de emails/WhatsApp a nombre de Regis, consumo de API Anthropic.  
**Severidad:** 🟡 10  
**Mitigación actual:** Secrets en Supabase (no en código). `.env` en `.gitignore`.  
**Mitigación recomendada:** Rotación de keys cada 90 días. Alertas de consumo anómalo en Anthropic/Twilio/Resend dashboards.  
**Owner:** Dev  
**Plazo:** Corto plazo

### R14 — Phishing a admins de empresa cliente

**Descripción:** La URL pública `/upload-pila?t=<token>` podría ser imitada por un atacante. Un email falso podría dirigir al contacto PILA a un sitio que roba el archivo PILA (contiene datos de seguridad social de trabajadores).

**Probabilidad:** 3/5 — Phishing es común en Colombia.  
**Impacto:** 3/5 — Datos PILA de la empresa comprometidos.  
**Severidad:** 🟢 9  
**Mitigación actual:** Token en URL valida empresa (no es adivinable).  
**Mitigación recomendada:** DKIM/SPF en dominio de Resend. Aviso de seguridad en UploadPila ("Verifique que la URL sea regis-safety-hub.vercel.app"). Educación a contactos PILA.  
**Owner:** Dev + Admin Regis  
**Plazo:** Mediano plazo

---

## D) Riesgos Legales

### R02 — Dato médico erróneo extraído por IA

**Descripción:** Claude Vision podría extraer incorrectamente el concepto de aptitud (e.g., marcar "apto" cuando el PDF dice "no apto"). Un trabajador no apto podría ser asignado a tareas de riesgo.

**Probabilidad:** 3/5 — Claude es preciso (~95%) pero no perfecto, especialmente con PDFs escaneados de baja calidad.  
**Impacto:** 5/5 — Consecuencia directa en salud del trabajador. Responsabilidad legal para Regis y la empresa.  
**Severidad:** 🔴 15  
**Mitigación actual:** Campo `procesado_por_ia = true` y `revisado_por_consultor = false` para flaggear. Fallback estático cuando IA no está disponible.  
**Mitigación recomendada:** Obligar revisión humana antes de marcar como "validado". UI con botón "Ver examen cargado" para comparar PDF vs datos extraídos (tarea nueva del Día 3). Nunca auto-aprobar resultados de IA.  
**Owner:** Dev + Consultor  
**Plazo:** Urgente

### R04 — Reclamo SIC por Habeas Data

**Descripción:** La plataforma no tiene política de privacidad publicada, no recolecta consentimiento de trabajadores para tratamiento de datos personales, ni tiene mecanismo de ejercicio de derechos ARCO. Violación de Ley 1581 de 2012.

**Probabilidad:** 3/5 — SIC ha aumentado fiscalización. Un trabajador inconforme podría presentar queja.  
**Impacto:** 4/5 — Multa hasta 2,000 SMLMV, orden de suspender tratamiento de datos.  
**Severidad:** 🟡 12  
**Mitigación actual:** Ninguna específica. Datos están en Supabase con RLS básica.  
**Mitigación recomendada:** Implementar recomendaciones de COMPLIANCE_HABEAS_DATA.md: publicar política, agregar consentimiento en UploadPila, registrar en RNBD ante SIC.  
**Owner:** Admin Regis  
**Plazo:** Urgente (antes de operación real con datos de terceros)

### R15 — Incumplimiento 0312 detectado por MinTrabajo

**Descripción:** Si la plataforma da falsa sensación de cumplimiento (puntaje alto pero estándares realmente no cumplidos), MinTrabajo podría sancionar a la empresa y a Regis como consultora responsable.

**Probabilidad:** 2/5 — MinTrabajo inspecciona aleatoriamente ~5% de empresas/año.  
**Impacto:** 4/5 — Sanción a empresa + reputación de Regis dañada.  
**Severidad:** 🟢 8  
**Mitigación actual:** Scoring basado en evidencia documental real. Dashboard muestra brechas claramente.  
**Mitigación recomendada:** Mapeo línea por línea de estándares (CHECKLIST_RESOLUCION_0312.md ya hecho). Advertencia en UI cuando cumplimiento es <60%.  
**Owner:** Consultor  
**Plazo:** Mediano plazo

---

## Plan de Acción Priorizado

### Fase 1 — Urgente (antes de producción real)
1. R01: Implementar RLS tenant-scoped
2. R02: Revisión humana obligatoria para datos extraídos por IA
3. R03: Bucket privado + signed URLs
4. R04: Publicar política de privacidad, consentimiento en UploadPila

### Fase 2 — Corto plazo (primeros 30 días de operación)
5. R05: Upgrade Supabase a Pro
6. R08: Registrar WhatsApp Business API
7. R09: Verificar restauración de backup
8. R10: Rotación de API keys

### Fase 3 — Mediano plazo (primeros 90 días)
9. R06: Evaluar migración n8n a Cloud o pg_cron
10. R13: Notas por empresa para onboarding de consultores
11. R14: DKIM/SPF + educación anti-phishing

### Fase 4 — Recurrente
12. R07: Monitorear changelog Anthropic mensualmente
13. R11: Alertas de cambios regulatorios MinTrabajo
14. R12: Priorización formal de feature requests
