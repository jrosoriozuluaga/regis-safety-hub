# Guia de Entrega -- Concurso Regis SG-SST

## Informacion del Concurso

- **Premio:** $2,200 USD
- **Fecha limite de entrega:** 21 de mayo de 2026
- **Video demo:** 22 de mayo de 2026 (maximo 25 minutos)

---

## 1. Lista de Verificacion Pre-Entrega

### Build y Codigo

- [ ] `npm run build` completa sin errores en `regis-safety-hub/`
- [ ] No hay warnings criticos de TypeScript
- [ ] Todas las rutas cargan correctamente en produccion
- [ ] Variables de entorno configuradas en el entorno de despliegue
- [ ] Edge Functions desplegadas y funcionales (7 funciones)
- [ ] n8n workflows activos y configurados

### Datos de Prueba

- [ ] 3 empresas de prueba creadas (Construandes, DevCo, Sabor Criollo)
- [ ] 33 registros PILA con datos variados (pendiente, cargado, validado, aprobado, vencido)
- [ ] 15 PDFs de prueba en Supabase Storage
- [ ] Trabajadores asociados a cada empresa
- [ ] Items de cumplimiento con diferentes estados
- [ ] Al menos 1 matriz de riesgo con riesgos cargados
- [ ] Al menos 1 comite con acta generada
- [ ] Equipos con fechas de vencimiento proximas para demostrar alertas

### Usuario de Demo

- [ ] Cuenta admin funcional en Supabase Auth
- [ ] Credenciales documentadas (NO incluir en repositorio publico)
- [ ] Roles de consultor y cliente configurados para demostrar permisos

---

## 2. Como Grabar el Video Demo (25 min max)

### Estructura Recomendada

| Tiempo | Seccion | Contenido |
|--------|---------|-----------|
| 0:00-2:00 | **Introduccion** | Presentacion de Regis SG-SST, problema que resuelve, stack tecnologico |
| 2:00-6:00 | **PILA (estrella)** | Flujo completo: solicitud automatica, recordatorio email, recordatorio WhatsApp, carga publica, validacion |
| 6:00-9:00 | **Examenes Medicos + IA** | Subir PDF, demostrar extraccion con Claude Vision, ver recomendaciones extraidas |
| 9:00-12:00 | **Matrices de Riesgo** | Crear matriz GTC 45, generacion IA, edicion inline, exportacion |
| 12:00-15:00 | **Comites + Actas** | Crear comite, grabar audio, transcribir con Whisper, generar acta con Claude |
| 15:00-17:00 | **Planes de Emergencia** | Grabacion audio, transcripcion, analisis de vulnerabilidad IA |
| 17:00-19:00 | **Cumplimiento 0312** | Dashboard PHVA, scoring automatico, flujo de validacion documental |
| 19:00-21:00 | **Equipos + Documentos** | Inventario con alertas de vencimiento, gestion documental |
| 21:00-23:00 | **Automatizaciones** | Bitacora mensual, resumen semanal, logs de actividad, plantillas email |
| 23:00-25:00 | **Seguridad + Escalabilidad** | Demostrar roles (admin vs cliente), RLS, multi-tenant, arquitectura |

### Consejos para la Grabacion

1. **Preparar los datos antes:** Asegurar que hay datos en todos los modulos para no perder tiempo creando durante el video.
2. **Usar pantalla completa del navegador** para mejor visibilidad.
3. **Narrar cada accion:** Explicar que se esta haciendo y por que es importante para el consultor SST.
4. **Mostrar el "antes y despues":** Cuando sea posible, mencionar como se hacia el proceso manualmente vs. con la plataforma.
5. **No saltarse las exportaciones:** Los documentos con marca Regis son un diferenciador importante.
6. **Mostrar la consola de Supabase** brevemente para evidenciar RLS policies y estructura de BD.

### Herramientas de Grabacion Sugeridas

- OBS Studio (gratuito, multiplataforma)
- QuickTime Player (macOS nativo)
- Loom (con timer visible)

---

## 3. Que Destacar por Criterio de Evaluacion

### Automatizacion (peso alto)

- Flujo PILA completo sin intervencion manual (solicitud -> recordatorio -> carga -> validacion)
- Bitacora mensual generada automaticamente por Edge Function
- Resumen semanal del consultor
- Recordatorios de vencimiento de equipos
- Recordatorios de firma y archivo de actas
- Sincronizacion automatica de periodos con `syncPeriods()`

### Procesamiento con IA (peso alto)

- **Demostrar en vivo:** Subir un PDF de examen medico y ver la extraccion en tiempo real
- **Demostrar en vivo:** Grabar audio de reunion y generar acta automaticamente
- Generacion de matrices de riesgo GTC 45 con IA
- Analisis de vulnerabilidad en planes de emergencia
- Mencionar los 4 modelos usados: Claude Vision, Claude texto, Whisper

### Cumplimiento Normativo (peso medio)

- Mapeo completo de Capitulos 1 y 2 de Resolucion 0312/2019
- Calculo automatico de porcentaje PHVA
- Flujo de validacion documental de 4 estados
- Asignacion automatica de capitulo segun numero de trabajadores y nivel de riesgo

### Exportaciones Profesionales (peso medio)

- Exportar al menos 2 documentos diferentes durante el video
- Mostrar encabezado con logo, codigo, NIT, nombre empresa
- Mencionar que estan listos para presentar ante ARL

### Escalabilidad (peso medio)

- Arquitectura multi-tenant con aislamiento por empresa
- 94 politicas RLS en Supabase
- Selector de empresa para admin/consultor
- Disenado para 90+ empresas, 3 consultores, 50 trabajadores/empresa

---

## 4. Checklist de Despliegue

### Frontend (Vercel recomendado)

- [ ] Conectar repositorio a Vercel
- [ ] Configurar variables de entorno:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [ ] Verificar build exitoso en Vercel
- [ ] Verificar dominio accesible (URL de Vercel o dominio personalizado)
- [ ] Probar todas las rutas en produccion

### Supabase

- [ ] Proyecto activo y no pausado
- [ ] Edge Functions desplegadas (7 funciones):
  - `send-pila-reminder`
  - `send-whatsapp-reminder`
  - `generate-bitacora`
  - `weekly-summary`
  - `transcribe-audio`
  - `process-exam-pdf`
  - `generate-acta`
- [ ] Secrets configurados:
  - `ANTHROPIC_API_KEY`
  - `RESEND_API_KEY`
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Storage bucket `documentos` accesible
- [ ] RLS policies verificadas

### n8n

- [ ] Instancia activa en `n8n.john-osorio.lat`
- [ ] 4 workflows PILA activos
- [ ] Webhook URLs configuradas en `configuracion_sistema`
- [ ] Credenciales de email configuradas (Outlook/Microsoft 365)

---

## 5. Enlaces y Credenciales para la Entrega

Preparar un documento privado (NO incluir en repo publico) con:

- [ ] URL de la plataforma desplegada
- [ ] Credenciales de usuario admin (email + password)
- [ ] Credenciales de usuario consultor (si aplica)
- [ ] Credenciales de usuario cliente (si aplica)
- [ ] URL del repositorio (si se comparte)
- [ ] URL del video demo (YouTube/Loom/Drive unlisted)
- [ ] URL de Supabase dashboard (si se comparte acceso)
- [ ] URL de n8n (si se comparte acceso)

### Formato Sugerido para Credenciales

```
PLATAFORMA REGIS SG-SST
========================
URL: https://[dominio-vercel].vercel.app
Repo: https://github.com/[usuario]/regis-sgsst

ACCESO ADMIN
Email: [email-admin]
Password: [password-admin]

ACCESO CONSULTOR
Email: [email-consultor]
Password: [password-consultor]

ACCESO CLIENTE
Email: [email-cliente]
Password: [password-cliente]

SERVICIOS
Supabase: https://supabase.com/dashboard/project/nrtjizkeopxhpmjxxnjk
n8n: https://n8n.john-osorio.lat
```

---

## 6. Ultimos Pasos antes de Entregar

1. **Hacer una corrida completa:** Navegar por todos los modulos verificando que no hay errores.
2. **Limpiar la consola:** Verificar que no hay errores de JavaScript en la consola del navegador.
3. **Verificar mobile:** Aunque no es prioridad, verificar que la plataforma es usable en tablet.
4. **Capturar screenshots:** Tomar capturas de pantalla de cada modulo principal para incluir en la presentacion si es necesario.
5. **Backup de datos de prueba:** Exportar los datos de prueba por si se necesita reiniciar el ambiente.
6. **Grabar el video** siguiendo la estructura de la seccion 2.
7. **Revisar el video** completo antes de enviar. Verificar audio, que no se muestren credenciales, y que dura menos de 25 minutos.

---

*Buena suerte en el concurso!*
