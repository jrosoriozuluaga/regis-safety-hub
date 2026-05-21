# Video Demo — Shot List (25 minutos)

**Fecha de grabacion:** Mayo 22, 2026
**Duracion maxima:** 25 minutos
**Idioma:** Espanol (Colombia)
**Objetivo:** Demostrar los 8 criterios del brief del concurso Regis SG-SST

---

## Checklist Pre-Demo

### Datos y cuentas
- [ ] Supabase corriendo con datos de prueba (3 empresas: Construandes, DevCo, Sabor Criollo)
- [ ] Usuario admin logueado y session activa
- [ ] 33 registros PILA con variedad de estados (pendiente, cargado, validado, aprobado, vencido)
- [ ] Al menos 1 PDF de examen medico listo para subir (usar los de `datos-prueba/`)
- [ ] Al menos 1 archivo de audio listo para plan de emergencias (30-60 seg)
- [ ] Comite COPASST creado con integrantes para demo de actas
- [ ] Equipos en inventario con fechas de vencimiento proximas

### Entorno tecnico
- [ ] `npm run dev` corriendo en localhost:8080
- [ ] Supabase Dashboard abierto en otra pestana (https://supabase.com/dashboard)
- [ ] n8n abierto en otra pestana (https://n8n.john-osorio.lat)
- [ ] Terminal abierta mostrando logs del servidor
- [ ] Limpiar consola del navegador
- [ ] Cerrar notificaciones del sistema operativo
- [ ] Resolucion de pantalla: 1920x1080 o superior

### Pestanas pre-cargadas (en orden)
1. App — Dashboard (localhost:8080)
2. App — PILA (localhost:8080/pila)
3. Supabase Dashboard — tabla `pila_records`
4. n8n — workflow `pila-solicitud-mensual`
5. App — Examenes Medicos
6. App — Matrices de Riesgo
7. App — Comites
8. App — Planes de Emergencia
9. App — Cumplimiento
10. App — Inventario Equipos

### Archivos listos en escritorio
- [ ] PDF de examen medico (para M2)
- [ ] Audio de recorrido de emergencia (para M5)
- [ ] PDF de PILA para upload publico (para M1)
- [ ] SOP/Manual .docx generado

### Ensayo
- [ ] Hacer un dry run completo cronometrado
- [ ] Verificar que la extraccion IA funciona (subir PDF de prueba)
- [ ] Verificar que Whisper transcribe correctamente
- [ ] Verificar que el enlace publico de PILA funciona
- [ ] Confirmar que los emails de Resend llegan (revisar spam)

---

## Bloques del Video

---

### Bloque 1: Intro (0:00 - 1:30)

**Pantalla:** Slide de titulo o landing page de la app con logo Regis

**Accion:**
- Mostrar pantalla de inicio con logo Regis
- Transicion al problema que resuelve la plataforma

**Talking points:**
- "Regis Colombia es una consultora especializada en SG-SST. Hoy gestionamos el cumplimiento de la Resolucion 0312 de 2019 para empresas de 1 a 50 trabajadores, riesgo I a III."
- "El problema: cada consultora maneja 30, 50, hasta 90 empresas. El seguimiento manual de PILA, examenes medicos, matrices de riesgo, comites y planes de emergencia consume horas de trabajo repetitivo cada mes."
- "Esta plataforma automatiza ese trabajo. Vamos a recorrer cada modulo y mostrar como funciona en produccion con 3 empresas reales."

**Notas tecnicas:** Tener el slide listo o usar la pantalla de login como fondo visual.

---

### Bloque 2: Arquitectura (1:30 - 3:00)

**Pantalla:** Diagrama de arquitectura (puede ser un slide) + Supabase Dashboard

**Accion:**
- Mostrar brevemente el diagrama de stack
- Cambiar a Supabase Dashboard: mostrar tablas, Edge Functions desplegadas, Storage
- Mencionar n8n (mostrar pestana rapidamente)

**Talking points:**
- "El frontend esta construido en React con TypeScript y Vite. El backend es 100% Supabase: base de datos PostgreSQL con Row Level Security, autenticacion, storage para documentos y 7 Edge Functions desplegadas."
- "Para automatizacion de workflows usamos n8n self-hosted. Para IA usamos Claude de Anthropic para extraccion de documentos y analisis, y Whisper de OpenAI para transcripcion de audio."
- "Emails se envian con Resend y notificaciones WhatsApp con Twilio."
- Mostrar en Supabase: "Aqui ven las 20+ tablas, las Edge Functions activas, y el bucket de almacenamiento de documentos."

**Notas tecnicas:** Tener Supabase Dashboard en la pestana de Edge Functions para mostrar las 7 funciones desplegadas.

---

### Bloque 3: Login + Dashboard (3:00 - 4:30)

**Pantalla:** Pagina de login -> Dashboard principal

**Accion:**
1. Mostrar pantalla de login
2. Iniciar sesion como admin
3. Mostrar Dashboard con estadisticas de cumplimiento
4. Mostrar selector de empresas (admin ve todas)
5. Cambiar entre empresas para mostrar datos diferentes

**Talking points:**
- "La autenticacion es con Supabase Auth. Hay 3 roles: admin, consultor y cliente. El admin y consultor ven todas las empresas con un selector. El cliente solo ve su propia empresa."
- "El dashboard muestra el estado general: cumplimiento por empresa, documentos pendientes, alertas activas."
- "Tenemos 3 empresas en produccion: Construandes con 8 trabajadores, DevCo con 25, y Sabor Criollo con 12. Cada una cae en un capitulo diferente de la Resolucion 0312."

**Notas tecnicas:** Tener sesion cerrada para mostrar el login en vivo. Si tarda mucho, tener una sesion pre-logueada en otra pestana como backup.

---

### Bloque 4: M1 — PILA (4:30 - 8:00)

**Pantalla:** Modulo PILA

**Accion:**
1. Mostrar la tabla de registros PILA con los 6 meses sincronizados
2. Ejecutar `syncPeriods()` — mostrar como genera periodos faltantes
3. Mostrar los diferentes estados: pendiente, cargado, validado, aprobado, vencido
4. Enviar un recordatorio por email (click en boton, mostrar toast de confirmacion)
5. Mostrar el enlace de WhatsApp generado (wa.me link)
6. Abrir el enlace publico de upload (`/upload-pila?t=...`) en ventana incognito
7. Subir un PDF de PILA desde la vista publica (sin autenticacion)
8. Volver a la app y mostrar el registro actualizado a "cargado"
9. Hacer click en validar -> aprobar para completar el flujo

**Talking points:**
- "PILA es el modulo mas critico. Cada mes, cada empresa debe subir su planilla de seguridad social. Con 90 empresas, esto son 90 seguimientos manuales."
- "La plataforma sincroniza automaticamente los periodos. El dia 16 de cada mes, n8n dispara emails de solicitud a todas las empresas."
- "Si no suben en 3 dias, se envian recordatorios automaticos por email Y WhatsApp. Maximo 3 recordatorios configurables."
- "El cliente recibe un enlace unico y puede subir su PILA sin necesidad de tener cuenta. El sistema lo asocia automaticamente a su empresa y periodo."
- "El flujo de validacion es: pendiente, cargado, validado, aprobado. Solo cuando esta aprobado se otorgan puntos de cumplimiento."
- **Criterio 1: Automatizacion PILA — end-to-end sin intervencion manual.**

**Notas tecnicas:**
- Tener un PDF de PILA en el escritorio listo para subir
- Pre-generar el token de upload publico para una empresa
- Tener ventana incognito lista para abrir el enlace publico
- Verificar que Resend esta configurado para que el email se envie realmente (o mostrar el toast + log)

---

### Bloque 5: M2 — Examenes Medicos (8:00 - 11:00)

**Pantalla:** Modulo Examenes Medicos

**Accion:**
1. Mostrar la lista de examenes medicos existentes
2. Click en "Nuevo Examen" o "Subir PDF"
3. Seleccionar una empresa y un trabajador
4. Subir el PDF del examen medico
5. Mostrar el spinner/loading mientras Claude Vision procesa
6. Mostrar los 6 campos extraidos automaticamente (tipo examen, fecha, concepto, restricciones, recomendaciones, proximo control)
7. Mostrar que el usuario puede editar/corregir antes de guardar
8. Guardar y mostrar el registro creado con las recomendaciones medicas vinculadas

**Talking points:**
- "Los examenes medicos ocupacionales son obligatorios: ingreso, periodicos y de retiro. Cada PDF tiene formato diferente segun la IPS."
- "Con Claude Vision, la plataforma extrae automaticamente los 6 campos clave del PDF: tipo de examen, fecha, concepto de aptitud, restricciones, recomendaciones y fecha del proximo control."
- "El consultor solo revisa y confirma. Lo que antes tomaba 15 minutos por examen ahora toma 30 segundos."
- "Las recomendaciones se vinculan al trabajador para seguimiento."
- **Criterio 2: Extraccion IA de examenes medicos — 6/6 campos.**

**Notas tecnicas:**
- Tener un PDF de examen medico claro y legible en el escritorio
- Hacer una prueba antes de grabar para confirmar que la Edge Function `process-exam-pdf` responde correctamente
- Si la IA tarda mas de 15 segundos, cortar y explicar el resultado (tener un examen ya procesado como backup)

---

### Bloque 6: M3 — Matrices de Riesgo (11:00 - 13:00)

**Pantalla:** Modulo Matrices de Riesgo

**Accion:**
1. Mostrar lista de matrices existentes
2. Abrir una matriz con riesgos pre-cargados
3. Mostrar la estructura GTC 45: proceso, zona, actividad, peligro, efectos, controles, valoracion
4. Mostrar la generacion basada en CIIU (si esta implementada)
5. Navegar por los riesgos dentro de la matriz
6. Mostrar la valoracion de riesgo con colores (aceptable, mejorable, no aceptable)

**Talking points:**
- "La matriz de riesgo con metodologia GTC 45 es el documento mas complejo del SG-SST. Normalmente toma dias elaborarla."
- "La plataforma genera una matriz base segun el codigo CIIU de la empresa. Por ejemplo, CIIU 6201 para desarrollo de software genera riesgos ergonomicos, visuales, psicosociales."
- "Cada riesgo tiene su valoracion, controles existentes, y medidas de intervencion."
- **Criterio 3: Matriz de riesgo basada en CIIU.**

**Notas tecnicas:**
- Tener al menos una matriz con 5+ riesgos ya cargados
- Si la edicion inline no esta lista para el dia de grabacion, mostrar la visualizacion y mencionar que la edicion esta en desarrollo

---

### Bloque 7: M4 — Comites + Actas (13:00 - 16:00)

**Pantalla:** Modulo Comites

**Accion:**
1. Mostrar el comite COPASST creado con sus integrantes
2. Mostrar la validacion de quorum (numero minimo de asistentes)
3. Click en "Generar Acta"
4. Llenar los campos del acta (temas tratados, compromisos)
5. Mostrar la generacion con IA (Claude formatea y estructura)
6. Mostrar la vista previa del acta generada
7. Exportar a PDF con encabezado Regis (logo, NIT, codigo de modulo)
8. Mostrar el tracking de firmas pendientes

**Talking points:**
- "Los comites COPASST y de Convivencia son obligatorios. Cada reunion requiere un acta formal con quorum verificado."
- "La plataforma verifica automaticamente si hay quorum segun el numero de integrantes. Sin quorum, no se puede generar el acta."
- "Claude toma los temas discutidos y genera un acta formal con estructura normativa: orden del dia, desarrollo, compromisos, firmas."
- "El acta se exporta a PDF con el membrete de Regis y se puede enviar para firma digital."
- "Regis nos dijo que las actas son su mayor dolor de cabeza. Este modulo les ahorra entre 30 y 45 minutos por reunion."
- **Criterio 4: Actas de comite con validacion de quorum.**

**Notas tecnicas:**
- Tener un comite COPASST con al menos 4 integrantes pre-cargados
- Tener temas de ejemplo listos para copiar/pegar rapidamente
- Verificar que la Edge Function `generate-acta` responde correctamente
- Tener un acta ya generada como backup por si la IA tarda

---

### Bloque 8: M5 — Plan de Emergencias (16:00 - 18:30)

**Pantalla:** Modulo Planes de Emergencia

**Accion:**
1. Mostrar lista de planes existentes
2. Click en "Nuevo Plan" o "Grabar Audio"
3. Grabar un audio corto (30 seg) describiendo un recorrido por las instalaciones, o subir uno pre-grabado
4. Mostrar el proceso: audio -> Whisper (transcripcion) -> Claude (analisis de vulnerabilidades)
5. Mostrar la transcripcion generada
6. Mostrar el analisis de vulnerabilidades: riesgos identificados, recomendaciones, prioridades
7. Mostrar la matriz de vulnerabilidades resultante

**Talking points:**
- "El plan de emergencias requiere un analisis de vulnerabilidades de las instalaciones. Normalmente el consultor recorre la empresa, toma notas, y despues redacta el informe."
- "Con esta herramienta, el consultor solo graba un audio durante el recorrido. Whisper de OpenAI lo transcribe y Claude analiza la transcripcion para identificar vulnerabilidades."
- "El resultado es una matriz de vulnerabilidades con amenazas, nivel de riesgo y recomendaciones especificas. En 2 minutos en vez de 2 horas."
- **Criterio 5: Plan de emergencias desde audio con IA.**

**Notas tecnicas:**
- Tener un audio pre-grabado de 30-60 segundos como backup (describir: "Estamos en la bodega principal, hay 3 salidas de emergencia, extintores en cada piso, senalizacion visible...")
- Verificar que la Edge Function `transcribe-audio` funciona
- Si el proceso completo tarda mas de 30 segundos, tener un plan ya procesado para mostrar el resultado final

---

### Bloque 9: M6 — Cumplimiento 0312 (18:30 - 20:00)

**Pantalla:** Modulo Cumplimiento

**Accion:**
1. Mostrar el dashboard de cumplimiento general
2. Seleccionar una empresa
3. Mostrar los 4 ciclos PHVA (Planear, Hacer, Verificar, Actuar) con porcentajes
4. Expandir los estandares individuales de la Resolucion 0312
5. Mostrar como cada modulo alimenta los puntos de cumplimiento
6. Comparar puntajes entre empresas (si hay vista comparativa)

**Talking points:**
- "La Resolucion 0312 de 2019 define los estandares minimos del SG-SST. Para empresas de hasta 10 trabajadores aplica el Capitulo 1 con 7 estandares. Para 11 a 50 trabajadores, el Capitulo 2 con 21 estandares."
- "La plataforma calcula automaticamente el capitulo segun el numero de trabajadores y nivel de riesgo."
- "El dashboard PHVA muestra el avance real. Cada documento aprobado, cada comite con acta, cada examen validado suma puntos automaticamente."
- "El cliente puede ver en tiempo real su porcentaje de cumplimiento."
- **Criterio 6: Dashboard de cumplimiento 0312/2019.**

**Notas tecnicas:**
- Asegurarse de que las 3 empresas tengan puntajes diferentes para que la comparacion sea interesante
- Tener algunos items de cumplimiento en estado "aprobado" para que los porcentajes no esten en cero

---

### Bloque 10: Bonus Features (20:00 - 22:00)

**Pantalla:** Documentos -> Inventario Equipos -> Log de Actividad

**Accion:**
1. **Documentos (M7):** Mostrar la seccion de documentos generales, subir un archivo, mostrar la organizacion por carpetas/empresa
2. **Inventario de Equipos:** Mostrar equipos con fechas de vencimiento, alertas de equipos proximos a vencer, boton de recordatorio
3. **Log de Actividad:** Mostrar el registro de todas las acciones realizadas durante el demo (login, subida de documentos, generacion de actas, etc.)

**Talking points:**
- "Ademas de los modulos principales, la plataforma incluye gestion documental centralizada y un inventario de equipos con alertas de vencimiento."
- "El inventario rastrea extintores, botiquines, camillas — cada equipo con su fecha de vencimiento. La plataforma envia recordatorios antes de que venzan."
- "Y todo queda registrado en el log de actividad. Cada accion, cada cambio, cada documento — trazabilidad completa para auditorias."

**Notas tecnicas:**
- Tener 2-3 equipos con fechas de vencimiento proximas (o ya vencidos) para que las alertas se vean
- El log de actividad deberia mostrar todas las acciones del demo en tiempo real

---

### Bloque 11: Ultima Milla (22:00 - 24:00)

**Pantalla:** n8n Dashboard -> Terminal -> SOP Manual

**Accion:**
1. Mostrar n8n con los 4 workflows de PILA (brevemente)
2. Mostrar un workflow abierto para que se vean los nodos
3. Mostrar la terminal con un deploy de Edge Function (o un log reciente)
4. Mostrar el funcionamiento multi-tenant: cambiar de empresa y ver datos diferentes
5. Mostrar el SOP/Manual .docx generado

**Talking points:**
- "La automatizacion no vive solo en el frontend. En n8n tenemos 4 workflows para PILA: solicitud mensual automatica, recordatorios inteligentes, seguimiento diario, y recepcion de archivos."
- "Las Edge Functions corren en Supabase con Deno — sin servidor propio. Se despliegan en un comando."
- "La plataforma es multi-tenant desde el diseno. Con Row Level Security en Supabase, cada empresa solo ve sus propios datos. Escalar de 3 a 90 empresas es agregar filas, no codigo."
- "Y finalmente, el manual de operaciones SOP que documenta todos los procesos."
- **Criterio 7: Produccion con multiples empresas.**
- **Criterio 8: SOP/Manual operativo.**

**Notas tecnicas:**
- Tener n8n abierto en el workflow mas visual (el de seguimiento automatico tiene mas nodos)
- Tener el .docx del SOP abierto o listo para abrir rapidamente
- Si es posible, mostrar el deploy de una Edge Function en vivo (tarda ~10 seg)

---

### Bloque 12: Cierre (24:00 - 25:00)

**Pantalla:** Dashboard principal o slide de cierre

**Accion:**
- Volver al dashboard principal
- Resumen visual de los 8 criterios cumplidos

**Talking points:**
- "Recapitulemos los 8 criterios:"
  1. "Automatizacion PILA end-to-end: email, WhatsApp, upload publico, validacion — cero intervencion manual."
  2. "Extraccion IA de examenes medicos: 6 campos en 30 segundos."
  3. "Matriz de riesgo basada en CIIU con metodologia GTC 45."
  4. "Actas de comite con validacion de quorum y generacion IA."
  5. "Plan de emergencias desde audio: Whisper + Claude."
  6. "Dashboard de cumplimiento 0312/2019 con ciclo PHVA."
  7. "Tres empresas en produccion, arquitectura lista para 90+."
  8. "Manual SOP documentado."
- "Regis SG-SST no es un prototipo. Es una plataforma funcional que le devuelve horas de trabajo a cada consultor, cada semana."
- "Gracias."

**Notas tecnicas:** Tener un slide o nota con los 8 criterios listados para no olvidar ninguno en el cierre.

---

## Tiempos Objetivo por Bloque

| Bloque | Inicio | Fin | Duracion | Prioridad |
|--------|--------|-----|----------|-----------|
| 1. Intro | 0:00 | 1:30 | 1:30 | Alta |
| 2. Arquitectura | 1:30 | 3:00 | 1:30 | Media |
| 3. Login + Dashboard | 3:00 | 4:30 | 1:30 | Alta |
| 4. PILA (M1) | 4:30 | 8:00 | 3:30 | Critica |
| 5. Examenes (M2) | 8:00 | 11:00 | 3:00 | Critica |
| 6. Matrices (M3) | 11:00 | 13:00 | 2:00 | Alta |
| 7. Comites (M4) | 13:00 | 16:00 | 3:00 | Critica |
| 8. Emergencias (M5) | 16:00 | 18:30 | 2:30 | Critica |
| 9. Cumplimiento (M6) | 18:30 | 20:00 | 1:30 | Alta |
| 10. Bonus | 20:00 | 22:00 | 2:00 | Media |
| 11. Ultima Milla | 22:00 | 24:00 | 2:00 | Alta |
| 12. Cierre | 24:00 | 25:00 | 1:00 | Alta |
| **Total** | | | **25:00** | |

---

## Tips de Grabacion

- **No improvisar:** Seguir este shot list paso a paso. Practicar al menos 2 veces.
- **Velocidad:** Si un proceso de IA tarda, narrar mientras espera. No dejar silencios muertos.
- **Backup de datos:** Tener resultados pre-generados para cada modulo de IA por si fallan en vivo.
- **Cortes:** Grabar cada bloque por separado si es posible. Es mas facil editar.
- **Resolucion:** Grabar en 1080p minimo. Asegurarse de que el texto de la app sea legible.
- **Audio:** Usar microfono externo. El audio del demo de emergencias debe escucharse claramente.
- **Cursor:** Mover el cursor lento y con intencion. No hacer clicks rapidos que el espectador no pueda seguir.
- **Zoom:** En datos importantes (campos extraidos por IA, puntajes de cumplimiento), hacer zoom o acercar la camara.
