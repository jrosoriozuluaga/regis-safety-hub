# Checklist de Pruebas — Regis SG-SST Platform

**Sprint Día 8 de 10 — Fecha: 2026-05-20**
**Versión:** 1.0
**Objetivo:** Validar los 8 criterios del concurso antes de la grabación del video (22 de mayo)

---

## Preparación Pre-Testing

### Entorno

- [ ] Verificar que `npm run dev` arranca sin errores en puerto 8080
- [ ] Verificar conexión a Supabase (`nrtjizkeopxhpmjxxnjk`)
- [ ] Verificar que las 7 Edge Functions están desplegadas y respondiendo
- [ ] Verificar que n8n (`n8n.john-osorio.lat`) está activo y los 4 workflows PILA están habilitados
- [ ] Confirmar que los secrets están configurados: `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `TWILIO_*`, `OPENAI_API_KEY`

### Datos de Prueba

- [ ] 3 empresas activas: Construandes Ltda, DevCo Technologies S.A.S., Sabor Criollo S.A.S.
- [ ] Al menos 1 usuario por rol: admin, consultor, cliente
- [ ] 15 PDFs de prueba PILA en Storage (`documentos/pila/{empresa_id}/`)
- [ ] Al menos 1 PDF de examen médico real (no formulario en blanco)
- [ ] Al menos 1 archivo de audio para prueba de emergencias
- [ ] Registros de `pila_records` para los 6 meses recientes

### Herramientas

- [ ] Navegador Chrome (DevTools abierto en pestaña Network y Console)
- [ ] Segundo navegador o ventana incógnito para probar upload público
- [ ] Celular o emulador para pruebas responsive
- [ ] Cuenta de correo para verificar emails enviados

---

## Criterio 1: Automatización PILA

### TC-1.1: Sincronización de periodos
- [ ] **TC-1.1: syncPeriods genera 6 meses de registros por empresa**
  - **Precondiciones:** Empresa sin registros PILA o con registros incompletos
  - **Pasos:**
    1. Ir a PILA Management
    2. Seleccionar empresa
    3. Ejecutar sincronización de periodos
  - **Resultado esperado:** Se crean registros para los últimos 6 meses con estado `pendiente`. Los periodos ya existentes no se duplican.
  - **Severidad:** Crítico

### TC-1.2: Envío de solicitud por email
- [ ] **TC-1.2: Solicitud mensual de PILA por email vía n8n**
  - **Precondiciones:** Empresa con contacto PILA configurado (email válido), periodo en estado `pendiente`
  - **Pasos:**
    1. Ir a PILA Management
    2. Seleccionar empresa y periodo pendiente
    3. Hacer clic en "Enviar solicitud"
    4. Verificar en la bandeja de entrada del contacto
  - **Resultado esperado:** Email enviado con enlace de upload público. El registro se actualiza con fecha de envío. Log de actividad registrado.
  - **Severidad:** Crítico

### TC-1.3: Enlace de WhatsApp
- [ ] **TC-1.3: Generación correcta del enlace de WhatsApp**
  - **Precondiciones:** Empresa con número de teléfono PILA configurado
  - **Pasos:**
    1. Ir a PILA Management
    2. Hacer clic en botón de WhatsApp para un periodo
    3. Verificar que se abre wa.me con el número correcto y mensaje pre-armado
  - **Resultado esperado:** El enlace usa `window.location.origin` (NO localhost). El mensaje incluye el enlace de upload y el periodo correcto.
  - **Severidad:** Alto

### TC-1.4: Upload público sin autenticación
- [ ] **TC-1.4: Carga pública de PILA con token válido**
  - **Precondiciones:** Token de upload generado y activo
  - **Pasos:**
    1. Abrir `/upload-pila?t=<token_base64>` en ventana incógnito (sin login)
    2. Seleccionar archivo PDF de prueba
    3. Hacer clic en "Subir"
  - **Resultado esperado:** Archivo se sube a Storage en `documentos/pila/{empresa_id}/`. El registro cambia a estado `cargado`. No se requiere autenticación.
  - **Severidad:** Crítico

### TC-1.5: Token inválido rechazado
- [ ] **TC-1.5: Upload público rechaza token inválido o expirado**
  - **Precondiciones:** Ninguna
  - **Pasos:**
    1. Abrir `/upload-pila?t=token_invalido` en ventana incógnito
    2. Intentar subir un archivo
  - **Resultado esperado:** Mensaje de error claro. No se permite la carga. No se crea ningún registro.
  - **Severidad:** Alto

### TC-1.6: Flujo completo de estados
- [ ] **TC-1.6: Transición completa pendiente → cargado → validado → aprobado**
  - **Precondiciones:** Registro PILA en estado `pendiente`
  - **Pasos:**
    1. Subir archivo (estado cambia a `cargado`)
    2. Como consultor, revisar y marcar como `validado`
    3. Como admin, aprobar y marcar como `aprobado`
  - **Resultado esperado:** Cada transición se refleja en la UI, se registra en logs, y actualiza la fecha correspondiente.
  - **Severidad:** Crítico

### TC-1.7: Marcado automático de vencidos
- [ ] **TC-1.7: Periodos vencidos se marcan como overdue**
  - **Precondiciones:** Registros PILA con fecha de vencimiento pasada y estado `pendiente`
  - **Pasos:**
    1. Ejecutar `syncPeriods()` o esperar ejecución del cron de n8n
    2. Verificar el estado de los registros vencidos
  - **Resultado esperado:** Los registros pasados de fecha se marcan como vencidos. Se muestra indicador visual en la UI.
  - **Severidad:** Alto

### TC-1.8: Recordatorios automáticos
- [ ] **TC-1.8: Sistema de recordatorios respeta configuración**
  - **Precondiciones:** `pila_dias_recordatorio` y `pila_max_recordatorios` configurados en `configuracion_sistema`
  - **Pasos:**
    1. Verificar que los recordatorios se envían según los días configurados
    2. Verificar que no se excede `pila_max_recordatorios`
  - **Resultado esperado:** Recordatorios enviados en los intervalos correctos. Se detienen al alcanzar el máximo. Contador visible en la UI.
  - **Severidad:** Medio

---

## Criterio 2: Extracción IA Exámenes Médicos

### TC-2.1: Extracción exitosa de PDF real
- [ ] **TC-2.1: Claude Vision extrae los 6 campos de un examen médico real**
  - **Precondiciones:** PDF de examen médico con datos visibles (no formulario en blanco)
  - **Pasos:**
    1. Ir a Medical Exams
    2. Seleccionar empresa y trabajador
    3. Subir PDF de examen médico
    4. Esperar procesamiento de IA
  - **Resultado esperado:** Se extraen correctamente: tipo de examen, fecha, concepto de aptitud, restricciones, recomendaciones, próxima fecha de control. Toast de éxito.
  - **Severidad:** Crítico

### TC-2.2: Rechazo de PDF en blanco
- [ ] **TC-2.2: Validación rechaza formulario de examen en blanco**
  - **Precondiciones:** PDF de formulario vacío (sin datos del paciente)
  - **Pasos:**
    1. Ir a Medical Exams
    2. Subir PDF de formulario en blanco
  - **Resultado esperado:** El sistema detecta que la extracción está vacía o incompleta. Muestra mensaje de error indicando que el documento no contiene datos válidos. NO se guarda como "apto".
  - **Severidad:** Crítico (bug encontrado en Día 1)

### TC-2.3: Manejo de PDFs grandes
- [ ] **TC-2.3: PDFs grandes no causan stack overflow**
  - **Precondiciones:** PDF de examen de más de 1MB
  - **Pasos:**
    1. Subir PDF grande (>1MB)
    2. Observar consola del navegador
  - **Resultado esperado:** No hay error de "Maximum call stack size exceeded". El Base64 se procesa correctamente usando chunks (spread de arrays limitado).
  - **Severidad:** Crítico (bug encontrado en Día 1)

### TC-2.4: Modelo de Claude correcto
- [ ] **TC-2.4: Edge Function usa modelo Claude vigente (no deprecado)**
  - **Precondiciones:** Acceso al código de `process-exam-pdf`
  - **Pasos:**
    1. Verificar que el modelo en la Edge Function NO es: `claude-3-sonnet-20240229`, `claude-3-haiku-20240307`, `claude-3-opus-20240229`, `claude-3-5-sonnet-20240620`
    2. Confirmar que usa un modelo vigente (ej: `claude-sonnet-4-20250514`)
    3. Enviar un PDF y verificar respuesta 200 (no 404)
  - **Resultado esperado:** Respuesta exitosa de la API de Anthropic. Sin errores 404 por modelo deprecado.
  - **Severidad:** Crítico (bug encontrado en Día 1 — 4 modelos deprecados causaron 404)

### TC-2.5: Parsing de JSON con markdown fences
- [ ] **TC-2.5: Respuesta de Claude con ```json...``` se parsea correctamente**
  - **Precondiciones:** Ninguna
  - **Pasos:**
    1. Subir PDF de examen médico
    2. Verificar que la respuesta se procesa sin errores de parsing
  - **Resultado esperado:** El código limpia las markdown fences (```json y ```) antes de hacer `JSON.parse()`. Los datos se guardan correctamente.
  - **Severidad:** Crítico (bug encontrado en Día 1)

### TC-2.6: Ver examen previamente cargado
- [ ] **TC-2.6: Botón "Ver examen cargado" muestra datos extraídos**
  - **Precondiciones:** Examen médico previamente procesado y guardado
  - **Pasos:**
    1. Ir a Medical Exams
    2. Buscar un examen ya procesado
    3. Hacer clic en "Ver examen cargado" o equivalente
  - **Resultado esperado:** Se muestran los 6 campos extraídos, las recomendaciones médicas, y un enlace al PDF original.
  - **Severidad:** Alto (mejora identificada en Día 1)

### TC-2.7: Recomendaciones médicas guardadas
- [ ] **TC-2.7: Las recomendaciones extraídas se guardan en tabla separada**
  - **Precondiciones:** Examen procesado con recomendaciones
  - **Pasos:**
    1. Procesar un examen que contenga recomendaciones
    2. Verificar en la UI que las recomendaciones aparecen
    3. Verificar en DB que existen en `recomendaciones_medicas`
  - **Resultado esperado:** Cada recomendación se guarda como registro individual vinculado al examen.
  - **Severidad:** Medio

### TC-2.8: Múltiples exámenes por trabajador
- [ ] **TC-2.8: Un trabajador puede tener varios exámenes (ingreso, periódico, retiro)**
  - **Precondiciones:** Trabajador con al menos 1 examen previo
  - **Pasos:**
    1. Subir un segundo examen para el mismo trabajador
    2. Verificar que ambos aparecen en el historial
  - **Resultado esperado:** Los exámenes se listan cronológicamente. No se sobreescriben.
  - **Severidad:** Medio

---

## Criterio 3: Matriz de Riesgo CIIU Editable

### TC-3.1: Generación automática desde CIIU
- [ ] **TC-3.1: Auto-generación de matriz de riesgo basada en código CIIU**
  - **Precondiciones:** Empresa con CIIU asignado (ej: 6820, 7020, 6201)
  - **Pasos:**
    1. Ir a Risk Matrices
    2. Seleccionar empresa
    3. Crear nueva matriz de riesgo
    4. Usar opción de generación automática por CIIU
  - **Resultado esperado:** Se generan riesgos relevantes para el CIIU de la empresa, siguiendo metodología GTC 45. Incluye: proceso, zona, actividad, peligro, efectos, nivel de riesgo.
  - **Severidad:** Crítico

### TC-3.2: Edición de riesgos individuales
- [ ] **TC-3.2: Cada riesgo de la matriz es editable**
  - **Precondiciones:** Matriz con al menos 3 riesgos generados
  - **Pasos:**
    1. Hacer clic en un riesgo para editarlo
    2. Modificar: probabilidad, consecuencia, controles existentes, medidas de intervención
    3. Guardar cambios
  - **Resultado esperado:** Los cambios se guardan en `riesgos_matriz`. El nivel de riesgo se recalcula automáticamente. Toast de confirmación.
  - **Severidad:** Crítico

### TC-3.3: Agregar riesgo manual
- [ ] **TC-3.3: Se puede agregar un riesgo manualmente a la matriz**
  - **Precondiciones:** Matriz existente
  - **Pasos:**
    1. Hacer clic en "Agregar riesgo"
    2. Completar todos los campos GTC 45
    3. Guardar
  - **Resultado esperado:** El riesgo se agrega a la matriz con todos los campos. Se puede editar y eliminar después.
  - **Severidad:** Alto

### TC-3.4: Eliminar riesgo
- [ ] **TC-3.4: Se puede eliminar un riesgo de la matriz**
  - **Precondiciones:** Matriz con riesgos
  - **Pasos:**
    1. Seleccionar un riesgo
    2. Hacer clic en eliminar
    3. Confirmar eliminación
  - **Resultado esperado:** Diálogo de confirmación. El riesgo se elimina de la DB y de la UI. Log registrado.
  - **Severidad:** Medio

### TC-3.5: Exportación de matriz
- [ ] **TC-3.5: Matriz de riesgo se exporta con encabezado Regis**
  - **Precondiciones:** Matriz con al menos 5 riesgos
  - **Pasos:**
    1. Hacer clic en "Exportar" o "Imprimir"
    2. Verificar ventana de impresión
  - **Resultado esperado:** Documento incluye logo Regis (`regis-logo.jpeg`), código de módulo, NIT de la empresa, nombre de empresa. Formato de tabla legible. Usa `getExportHeaderHTML()`.
  - **Severidad:** Alto

### TC-3.6: Niveles de riesgo GTC 45
- [ ] **TC-3.6: Cálculo de niveles de riesgo según GTC 45**
  - **Precondiciones:** Riesgo con valores de probabilidad y consecuencia
  - **Pasos:**
    1. Editar un riesgo
    2. Cambiar probabilidad y consecuencia a diferentes valores
    3. Verificar que el nivel de riesgo calculado es correcto
  - **Resultado esperado:** NR = NP x NC. Nivel de probabilidad = ND x NE. Interpretación correcta (I, II, III, IV). Colores de semáforo correctos.
  - **Severidad:** Alto

### TC-3.7: Matriz por empresa
- [ ] **TC-3.7: Cada empresa tiene su propia matriz independiente**
  - **Precondiciones:** 2 empresas con matrices creadas
  - **Pasos:**
    1. Seleccionar empresa 1, ver su matriz
    2. Seleccionar empresa 2, ver su matriz
  - **Resultado esperado:** Cada empresa muestra solo sus riesgos. No hay mezcla de datos entre empresas.
  - **Severidad:** Crítico

---

## Criterio 4: Actas de Comité con Quórum

### TC-4.1: Creación de comité
- [ ] **TC-4.1: Crear comité COPASST o Convivencia con integrantes**
  - **Precondiciones:** Empresa seleccionada, trabajadores registrados
  - **Pasos:**
    1. Ir a Committees
    2. Crear nuevo comité (COPASST o Convivencia)
    3. Agregar integrantes con roles (presidente, secretario, miembros)
    4. Definir periodo de vigencia
  - **Resultado esperado:** Comité creado con integrantes. Se guarda en `comites` e `integrantes_comite`.
  - **Severidad:** Crítico

### TC-4.2: Verificación de quórum
- [ ] **TC-4.2: El sistema valida quórum antes de generar acta**
  - **Precondiciones:** Comité con integrantes definidos
  - **Pasos:**
    1. Crear nueva reunión/acta
    2. Marcar asistencia de menos de la mitad de integrantes
    3. Intentar generar acta
  - **Resultado esperado:** Advertencia de que no hay quórum. Se indica cuántos integrantes se necesitan.
  - **Severidad:** Crítico

### TC-4.3: Generación de acta con IA
- [ ] **TC-4.3: Claude genera acta de reunión a partir de temas y asistentes**
  - **Precondiciones:** Comité con quórum, temas de reunión ingresados
  - **Pasos:**
    1. Ingresar orden del día / temas de discusión
    2. Marcar asistentes
    3. Hacer clic en "Generar acta con IA"
    4. Esperar generación
  - **Resultado esperado:** Acta generada con formato profesional: encabezado, asistentes, orden del día, desarrollo de temas, compromisos, cierre. Modelo Claude vigente (no deprecado).
  - **Severidad:** Crítico

### TC-4.4: Exportación PDF de acta
- [ ] **TC-4.4: Acta se exporta como PDF con formato Regis**
  - **Precondiciones:** Acta generada
  - **Pasos:**
    1. Hacer clic en "Exportar" o "Imprimir"
    2. Verificar formato en ventana de impresión
  - **Resultado esperado:** PDF con encabezado Regis (logo, NIT, empresa), contenido del acta, espacio para firmas. Usa `getExportHeaderHTML()`.
  - **Severidad:** Alto

### TC-4.5: Seguimiento de firmas
- [ ] **TC-4.5: Se registra qué integrantes firmaron el acta**
  - **Precondiciones:** Acta generada con asistentes
  - **Pasos:**
    1. Marcar firmas de asistentes
    2. Verificar estado de firmas
  - **Resultado esperado:** Cada integrante puede marcarse como "firmó". Estado visual de firmas pendientes vs completadas.
  - **Severidad:** Alto

### TC-4.6: Vigía para empresas pequeñas
- [ ] **TC-4.6: Empresas con menos de 10 trabajadores usan Vigía (no COPASST)**
  - **Precondiciones:** Empresa con menos de 10 trabajadores
  - **Pasos:**
    1. Seleccionar empresa pequeña
    2. Verificar opciones de comité disponibles
  - **Resultado esperado:** Se ofrece crear Vigía de SST en lugar de COPASST. Solo requiere 1 persona designada.
  - **Severidad:** Medio

### TC-4.7: Historial de actas
- [ ] **TC-4.7: Las actas se almacenan y se pueden consultar por fecha**
  - **Precondiciones:** Comité con al menos 2 actas generadas
  - **Pasos:**
    1. Ir al historial de actas del comité
    2. Verificar listado cronológico
    3. Abrir un acta anterior
  - **Resultado esperado:** Todas las actas se listan con fecha, número de acta y estado. Se pueden abrir individualmente.
  - **Severidad:** Medio

### TC-4.8: Modelo Claude vigente en generate-acta
- [ ] **TC-4.8: Edge Function generate-acta usa modelo Claude no deprecado**
  - **Precondiciones:** Acceso al código de `generate-acta`
  - **Pasos:**
    1. Verificar modelo en el código fuente
    2. Generar un acta y verificar respuesta exitosa
  - **Resultado esperado:** Sin errores 404. Modelo vigente en uso.
  - **Severidad:** Crítico (lección del Día 1)

---

## Criterio 5: Plan de Emergencias desde Audio

### TC-5.1: Grabación de audio
- [ ] **TC-5.1: Se puede grabar audio desde el navegador**
  - **Precondiciones:** Permisos de micrófono habilitados
  - **Pasos:**
    1. Ir a Emergency Plans
    2. Seleccionar empresa
    3. Iniciar grabación de audio
    4. Hablar durante 10-15 segundos
    5. Detener grabación
  - **Resultado esperado:** Audio grabado, indicador de tiempo visible, archivo listo para procesar.
  - **Severidad:** Crítico

### TC-5.2: Transcripción con Whisper
- [ ] **TC-5.2: Audio se transcribe correctamente con Whisper**
  - **Precondiciones:** Audio grabado o archivo de audio cargado
  - **Pasos:**
    1. Enviar audio para transcripción
    2. Esperar procesamiento
  - **Resultado esperado:** Texto transcrito legible en español. Se muestra al usuario para verificación.
  - **Severidad:** Crítico

### TC-5.3: Análisis de vulnerabilidades con Claude
- [ ] **TC-5.3: Claude genera análisis de vulnerabilidades a partir de la transcripción**
  - **Precondiciones:** Transcripción completada
  - **Pasos:**
    1. Enviar transcripción para análisis
    2. Esperar procesamiento de Claude
  - **Resultado esperado:** Análisis estructurado de vulnerabilidades: amenazas identificadas, nivel de riesgo, recursos disponibles, recomendaciones. Modelo Claude vigente.
  - **Severidad:** Crítico

### TC-5.4: Carga de archivo de audio
- [ ] **TC-5.4: Se puede subir archivo de audio en vez de grabar**
  - **Precondiciones:** Archivo de audio (.mp3, .wav, .m4a)
  - **Pasos:**
    1. Hacer clic en opción de subir archivo
    2. Seleccionar archivo de audio
    3. Procesar
  - **Resultado esperado:** El archivo se acepta y se procesa igual que una grabación. Formatos soportados indicados en la UI.
  - **Severidad:** Alto

### TC-5.5: Exportación de plan de emergencia
- [ ] **TC-5.5: Plan de emergencia se exporta con formato Regis**
  - **Precondiciones:** Plan con análisis generado
  - **Pasos:**
    1. Exportar/imprimir plan de emergencia
  - **Resultado esperado:** Documento con encabezado Regis, análisis de vulnerabilidades, transcripción, fecha. Usa `getExportHeaderHTML()`.
  - **Severidad:** Alto

### TC-5.6: Modelo Claude vigente en transcribe-audio
- [ ] **TC-5.6: Edge Function transcribe-audio usa modelos vigentes**
  - **Precondiciones:** Acceso al código de `transcribe-audio`
  - **Pasos:**
    1. Verificar modelo de Whisper y Claude en la Edge Function
    2. Procesar un audio y verificar respuesta exitosa
  - **Resultado esperado:** Sin errores 404 o de modelo no encontrado.
  - **Severidad:** Crítico (lección del Día 1)

---

## Criterio 6: Dashboard de Cumplimiento

### TC-6.1: Puntaje PHVA por empresa
- [ ] **TC-6.1: Dashboard muestra puntaje PHVA según Resolución 0312/2019**
  - **Precondiciones:** Empresa con items de cumplimiento evaluados
  - **Pasos:**
    1. Ir a Compliance
    2. Seleccionar empresa
  - **Resultado esperado:** Puntaje total y desglose por fase PHVA (Planear, Hacer, Verificar, Actuar). Porcentaje de cumplimiento visible.
  - **Severidad:** Crítico

### TC-6.2: Capítulo correcto según tamaño y riesgo
- [ ] **TC-6.2: Se aplican estándares del capítulo correcto (1 o 2)**
  - **Precondiciones:** Empresas con diferentes tamaños y niveles de riesgo
  - **Pasos:**
    1. Empresa con ≤10 trabajadores, riesgo I-III → verificar Cap. 1 (7 estándares)
    2. Empresa con 11-50 trabajadores, riesgo I-III → verificar Cap. 2 (21 estándares)
  - **Resultado esperado:** El capítulo se asigna automáticamente (columna generada `capitulo_0312`). Solo se muestran los estándares del capítulo correspondiente.
  - **Severidad:** Crítico

### TC-6.3: Evaluación de items individuales
- [ ] **TC-6.3: Cada estándar se puede evaluar individualmente**
  - **Precondiciones:** Dashboard de cumplimiento abierto
  - **Pasos:**
    1. Seleccionar un estándar
    2. Marcar como cumple / no cumple / parcial
    3. Agregar observaciones
    4. Guardar
  - **Resultado esperado:** El puntaje se actualiza. El cambio se refleja en el total PHVA. Log de actividad registrado.
  - **Severidad:** Alto

### TC-6.4: Visualización gráfica
- [ ] **TC-6.4: Dashboard incluye gráficos de progreso**
  - **Precondiciones:** Empresa con evaluación parcial
  - **Pasos:**
    1. Verificar que hay gráficos o barras de progreso
    2. Verificar colores de semáforo según nivel de cumplimiento
  - **Resultado esperado:** Rojo (<60%), amarillo (60-85%), verde (>85%). Gráficos responsivos y legibles.
  - **Severidad:** Medio

### TC-6.5: Comparación entre empresas
- [ ] **TC-6.5: Admin puede ver resumen de cumplimiento de todas las empresas**
  - **Precondiciones:** Al menos 2 empresas con evaluaciones
  - **Pasos:**
    1. Ir al Dashboard principal (como admin)
    2. Verificar resumen de cumplimiento por empresa
  - **Resultado esperado:** Vista consolidada con puntaje de cada empresa. Se pueden comparar a simple vista.
  - **Severidad:** Alto

### TC-6.6: Exportación del informe de cumplimiento
- [ ] **TC-6.6: Informe de cumplimiento se exporta con formato profesional**
  - **Precondiciones:** Empresa con evaluación completa
  - **Pasos:**
    1. Exportar informe de cumplimiento
  - **Resultado esperado:** Documento con encabezado Regis, tabla de estándares con puntajes, total PHVA, observaciones.
  - **Severidad:** Alto

---

## Criterio 7: Producción con 1+ Empresa

### TC-7.1: Multi-tenant funcional
- [ ] **TC-7.1: Las 3 empresas de prueba tienen datos independientes**
  - **Precondiciones:** 3 empresas con datos
  - **Pasos:**
    1. Seleccionar Construandes → verificar datos
    2. Seleccionar DevCo → verificar datos
    3. Seleccionar Sabor Criollo → verificar datos
  - **Resultado esperado:** Cada empresa muestra solo sus datos en todos los módulos. No hay filtrado cruzado.
  - **Severidad:** Crítico

### TC-7.2: RLS funcional
- [ ] **TC-7.2: Row Level Security impide acceso cruzado**
  - **Precondiciones:** Usuario con rol `cliente` asignado a una empresa
  - **Pasos:**
    1. Iniciar sesión como cliente
    2. Verificar que solo ve datos de su empresa
    3. Intentar acceder a datos de otra empresa vía URL
  - **Resultado esperado:** Solo ve datos de su `empresa_id`. Las consultas a Supabase solo retornan registros permitidos.
  - **Severidad:** Crítico

### TC-7.3: Datos reales coherentes
- [ ] **TC-7.3: Los datos de las empresas son coherentes y realistas**
  - **Precondiciones:** Empresas configuradas con datos completos
  - **Pasos:**
    1. Verificar que cada empresa tiene: NIT, ARL, CIIU, nivel de riesgo, contacto PILA
    2. Verificar que los trabajadores están asociados correctamente
    3. Verificar registros PILA con documentos reales
  - **Resultado esperado:** Datos completos y sin inconsistencias. CIIUs reales (6820, 7020, 6201).
  - **Severidad:** Alto

### TC-7.4: Selector de empresa funcional
- [ ] **TC-7.4: Admin/consultor puede cambiar de empresa en cualquier módulo**
  - **Precondiciones:** Sesión como admin o consultor
  - **Pasos:**
    1. Verificar que el selector de empresa aparece en todos los módulos
    2. Cambiar de empresa en cada módulo
    3. Verificar que los datos se actualizan
  - **Resultado esperado:** Selector visible en todos los módulos. Cambio instantáneo de datos. Sin errores de carga.
  - **Severidad:** Alto

### TC-7.5: Flujos end-to-end por empresa
- [ ] **TC-7.5: Al menos 1 empresa tiene flujo completo en todos los módulos**
  - **Precondiciones:** 1 empresa con datos en todos los módulos
  - **Pasos:**
    1. Verificar PILA con registros en todos los estados
    2. Verificar exámenes médicos procesados
    3. Verificar matriz de riesgo con riesgos
    4. Verificar comité con actas
    5. Verificar plan de emergencia con análisis
    6. Verificar cumplimiento con evaluación
  - **Resultado esperado:** Al menos Construandes Ltda tiene datos completos en todos los módulos para la demo.
  - **Severidad:** Crítico

---

## Criterio 8: SOP/Manual

### TC-8.1: Generación de documento .docx
- [ ] **TC-8.1: Se genera el manual/SOP en formato .docx**
  - **Precondiciones:** Datos de la empresa configurados
  - **Pasos:**
    1. Ir al módulo de generación de SOP/manual
    2. Seleccionar empresa
    3. Generar documento
    4. Descargar .docx
  - **Resultado esperado:** Archivo .docx descargable con estructura de manual SG-SST. Incluye portada con datos de la empresa.
  - **Severidad:** Crítico

### TC-8.2: Contenido del manual acorde a 0312
- [ ] **TC-8.2: El manual incluye los componentes requeridos por Resolución 0312**
  - **Precondiciones:** Manual generado
  - **Pasos:**
    1. Abrir el .docx
    2. Verificar secciones: política SST, objetivos, identificación de peligros, plan de trabajo anual, programa de capacitación, gestión del cambio
  - **Resultado esperado:** Documento completo con todas las secciones requeridas. Personalizado con datos de la empresa.
  - **Severidad:** Alto

### TC-8.3: Branding Regis en el manual
- [ ] **TC-8.3: El manual tiene marca Regis (logo, colores, pie de página)**
  - **Precondiciones:** Manual generado
  - **Pasos:**
    1. Verificar logo Regis en portada/encabezado
    2. Verificar pie de página con datos de Regis
  - **Resultado esperado:** Logo `regis-logo.jpeg` visible. Formato profesional consistente con la marca.
  - **Severidad:** Medio

### TC-8.4: Manual personalizado por empresa
- [ ] **TC-8.4: Generar manual para diferentes empresas produce contenido diferente**
  - **Precondiciones:** 2 empresas con datos
  - **Pasos:**
    1. Generar manual para Construandes
    2. Generar manual para DevCo
    3. Comparar contenido
  - **Resultado esperado:** Cada manual refleja: nombre empresa, NIT, CIIU, nivel de riesgo, número de trabajadores, riesgos específicos.
  - **Severidad:** Alto

### TC-8.5: Descarga funcional
- [ ] **TC-8.5: El archivo .docx se descarga y se abre correctamente**
  - **Precondiciones:** Manual generado
  - **Pasos:**
    1. Descargar el archivo
    2. Abrir en Microsoft Word o LibreOffice
  - **Resultado esperado:** Archivo válido .docx que se abre sin errores. Formato preservado.
  - **Severidad:** Alto

---

## Pruebas Cross-Cutting (Transversales)

### Diseño Responsive

- [ ] **CC-1: La aplicación es usable en tablet (1024px)**
  - **Pasos:** Redimensionar navegador a 1024px o usar DevTools
  - **Resultado esperado:** Sidebar colapsable, tablas con scroll horizontal, formularios adaptados
  - **Severidad:** Medio

- [ ] **CC-2: La aplicación es legible en móvil (375px)**
  - **Pasos:** Redimensionar a 375px o abrir en celular
  - **Resultado esperado:** Navegación funcional, contenido legible (no requiere funcionalidad completa)
  - **Severidad:** Bajo

### Control de Acceso por Rol

- [ ] **CC-3: Admin ve todas las empresas y todos los módulos**
  - **Pasos:** Login como admin, navegar todos los módulos
  - **Resultado esperado:** Acceso completo, selector de empresa visible
  - **Severidad:** Crítico

- [ ] **CC-4: Consultor ve todas las empresas pero no puede configurar sistema**
  - **Pasos:** Login como consultor, verificar acceso
  - **Resultado esperado:** Acceso a módulos operativos, sin acceso a configuración del sistema
  - **Severidad:** Alto

- [ ] **CC-5: Cliente solo ve su empresa**
  - **Pasos:** Login como cliente, verificar que no hay selector de empresa
  - **Resultado esperado:** Solo datos de su `empresa_id`. Sin selector de empresa. Sin acceso a módulos administrativos.
  - **Severidad:** Crítico

### Manejo de Errores

- [ ] **CC-6: Errores de red muestran mensaje amigable**
  - **Pasos:** Desconectar internet, intentar una acción
  - **Resultado esperado:** Toast de error con mensaje comprensible. No crash de la app.
  - **Severidad:** Alto

- [ ] **CC-7: Campos obligatorios se validan antes de enviar**
  - **Pasos:** Intentar guardar formularios vacíos en cada módulo
  - **Resultado esperado:** Mensajes de validación claros. No se envía request al servidor.
  - **Severidad:** Alto

- [ ] **CC-8: Sesión expirada redirige al login**
  - **Pasos:** Esperar a que expire el token o limpiar cookies, luego intentar una acción
  - **Resultado esperado:** Redirección a login con mensaje explicativo.
  - **Severidad:** Medio

### Estados de Carga

- [ ] **CC-9: Todas las páginas muestran indicador de carga**
  - **Pasos:** Navegar cada módulo y observar el estado inicial
  - **Resultado esperado:** Spinner o skeleton mientras se cargan datos. No mostrar datos vacíos durante carga.
  - **Severidad:** Medio

- [ ] **CC-10: Botones de acción se deshabilitan durante procesamiento**
  - **Pasos:** Hacer clic en botones de "Guardar", "Generar", "Enviar" y observar
  - **Resultado esperado:** Botón deshabilitado con indicador de carga. Sin envíos duplicados.
  - **Severidad:** Alto

### Logging y Auditoría

- [ ] **CC-11: Todas las acciones críticas generan log de actividad**
  - **Pasos:** Realizar acciones en cada módulo, luego ir a Activity Log
  - **Resultado esperado:** Cada acción aparece con: tipo, módulo, descripción, empresa_id, timestamp.
  - **Severidad:** Alto

---

## Casos Edge (Basados en Bugs del Día 1)

### CE-1: Modelos de Claude deprecados
- [ ] **CE-1: Ninguna Edge Function usa modelos deprecados**
  - **Pasos:** Revisar código de las 7 Edge Functions
  - **Verificar que NO se usa:**
    - `claude-3-sonnet-20240229`
    - `claude-3-haiku-20240307`
    - `claude-3-opus-20240229`
    - `claude-3-5-sonnet-20240620`
  - **Resultado esperado:** Todos los modelos son versiones vigentes
  - **Severidad:** Crítico

### CE-2: JSON markdown fences
- [ ] **CE-2: Todas las funciones que parsean respuesta de Claude manejan markdown fences**
  - **Pasos:** Buscar `JSON.parse` en todas las Edge Functions
  - **Resultado esperado:** Antes de parsear, se limpian `` ```json `` y `` ``` `` del texto de respuesta
  - **Severidad:** Crítico

### CE-3: Base64 de archivos grandes
- [ ] **CE-3: La conversión a Base64 de PDFs grandes no causa stack overflow**
  - **Pasos:** Subir un PDF de más de 1MB en cada módulo que procesa PDFs
  - **Resultado esperado:** Sin error "Maximum call stack size exceeded". Se usa método de chunks en vez de `String.fromCharCode(...spread)`.
  - **Severidad:** Crítico

### CE-4: Formularios en blanco procesados por IA
- [ ] **CE-4: PDFs vacíos o en blanco no se procesan como datos válidos**
  - **Pasos:** Subir PDF vacío en exámenes médicos
  - **Resultado esperado:** Error descriptivo, no se guarda como resultado válido
  - **Severidad:** Alto

### CE-5: URLs de producción vs desarrollo
- [ ] **CE-5: No hay URLs hardcodeadas a localhost en producción**
  - **Pasos:** Buscar "localhost" en el código (excluyendo configuración de Vite)
  - **Resultado esperado:** Todas las URLs usan `window.location.origin` o variables de entorno. La URL de WhatsApp usa el dominio correcto.
  - **Severidad:** Alto

### CE-6: Columna generada capitulo_0312
- [ ] **CE-6: No se intenta insertar/actualizar capitulo_0312 directamente**
  - **Pasos:** Buscar `capitulo_0312` en services/index.ts y verificar que no se incluye en INSERT/UPDATE
  - **Resultado esperado:** La columna solo se lee (SELECT), nunca se escribe. Es GENERATED ALWAYS en la DB.
  - **Severidad:** Alto

---

## Pruebas de Regresión (Bugs ya Corregidos)

- [ ] **REG-1: process-exam-pdf responde 200 (no 404 por modelo deprecado)**
  - Subir PDF de examen → respuesta exitosa
  - **Severidad:** Crítico

- [ ] **REG-2: generate-acta responde 200 (no 404 por modelo deprecado)**
  - Generar acta → respuesta exitosa
  - **Severidad:** Crítico

- [ ] **REG-3: transcribe-audio responde 200 (no 404 por modelo deprecado)**
  - Procesar audio → respuesta exitosa
  - **Severidad:** Crítico

- [ ] **REG-4: Parsing de JSON funciona con y sin markdown fences**
  - Verificar que `JSON.parse` maneja ambos casos
  - **Severidad:** Crítico

- [ ] **REG-5: Base64 de PDF grande (>1MB) no causa crash**
  - Subir PDF pesado → procesamiento exitoso
  - **Severidad:** Crítico

---

## Pruebas de Rendimiento

- [ ] **PERF-1: Página de login carga en menos de 3 segundos**
  - Usar DevTools → Network → medir tiempo total
  - **Severidad:** Alto

- [ ] **PERF-2: Dashboard carga en menos de 5 segundos**
  - Con datos de 3 empresas
  - **Severidad:** Alto

- [ ] **PERF-3: PILA Management carga tabla completa sin lag**
  - Con 33+ registros PILA
  - **Severidad:** Medio

- [ ] **PERF-4: Generación de acta con IA completa en menos de 30 segundos**
  - Medir desde clic hasta resultado visible
  - **Severidad:** Medio

- [ ] **PERF-5: Extracción de examen médico completa en menos de 30 segundos**
  - Medir desde upload hasta datos extraídos visibles
  - **Severidad:** Medio

- [ ] **PERF-6: Build de producción no tiene errores**
  - Ejecutar `npm run build` → sin errores ni warnings críticos
  - **Severidad:** Crítico

---

## Checklist Final Pre-Video (22 de mayo)

- [ ] Todos los tests Críticos pasados
- [ ] Todos los tests de Regresión pasados
- [ ] Build de producción exitoso (`npm run build`)
- [ ] Edge Functions desplegadas y respondiendo
- [ ] n8n workflows activos
- [ ] Datos de demo completos en las 3 empresas
- [ ] Logo Regis visible en todas las exportaciones
- [ ] Sin errores en consola del navegador durante navegación normal
- [ ] Video de 25 minutos cubre los 8 criterios con evidencia en vivo
