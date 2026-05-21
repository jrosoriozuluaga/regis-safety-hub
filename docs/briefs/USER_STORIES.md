# User Stories — Plataforma Regis SG-SST

Documento de referencia para desarrollo, pruebas y guion del video.
Cada US es simultáneamente: un caso de prueba, una sección del SOP/Manual,
y una escena potencial del video demo.

═══════════════════════════════════════════════════════════════════
PERSONAS
═══════════════════════════════════════════════════════════════════

## 1. Consultor Regis (analista SST)
- Profesional con licencia en SST
- Cada uno gestiona ~18 empresas clientes
- Usa la plataforma todos los días para validar, generar y revisar documentos
- Necesita ver rápido el estado de su cartera y atender pendientes
- Conocimiento técnico: medio. Usa Outlook, Teams, Drive, Canva.

## 2. Contacto enlace SST (empresa cliente)
- Persona designada por la empresa cliente para gestionar SG-SST
- Puede ser RRHH, contador, gerente operativo, o encargado específico
- Usa la plataforma 1-2 veces al mes
- Necesita interfaces simples (clientes NO son tech-savvy según Q&A)
- Conocimiento técnico: bajo. Apenas correo, WhatsApp, Drive básico.

## 3. Integrante de comité (asistente ocasional)
- Miembro del COPASST o Comité de Convivencia
- Solo interactúa para confirmar asistencia a reuniones
- Acceso vía link, sin necesidad de login completo

═══════════════════════════════════════════════════════════════════
CÓMO USAR ESTE DOCUMENTO
═══════════════════════════════════════════════════════════════════

**Para desarrollo:** cada US no implementada al día 7 = riesgo de
demo. Las 🔴 son no-negociables.

**Para pruebas (día 8):**
- Marcar cada criterio de aceptación con ✅ o ❌
- 🔴 todas deben pasar antes del día 9 (video)
- 🟡 todas deben pasar antes del día 10 (entrega)
- 🟢 nice to have, no bloquean entrega

**Para el video (día 9):** las 🔴 son el guion. Cubren los 8 criterios
del brief.

**Para el SOP/Manual (criterio #8):** reformatear las US 🔴 + 🟡 como
"Cómo hacer X" y queda el manual escrito.

═══════════════════════════════════════════════════════════════════
LEYENDA DE PRIORIDADES
═══════════════════════════════════════════════════════════════════

🔴 Demo + Producción — sale en el video, debe funcionar perfecto
🟡 Solo Producción — debe funcionar pero no se demuestra en video
🟢 Nice to have — bonus si hay tiempo

═══════════════════════════════════════════════════════════════════
CROSSCUTTING (Auth, onboarding, configuración)
═══════════════════════════════════════════════════════════════════

### US-X-01 🔴 Login del consultor Regis
**Como** consultor Regis, **quiero** iniciar sesión con mi correo
corporativo, **para** acceder a mi cartera de clientes.

Criterios:
- [ ] Login con email + contraseña funciona
- [ ] Después del login veo el dashboard con mis empresas asignadas
- [ ] Si meto contraseña incorrecta, mensaje claro de error
- [ ] Hay opción de "olvidé mi contraseña"

Mapea a: Crit #6, #7 · Pilares P5, P9

### US-X-02 🔴 Onboarding de empresa cliente nueva
**Como** consultor Regis, **quiero** registrar una nueva empresa cliente
en menos de 10 minutos, **para** poder incorporar 6 clientes nuevos al mes
sin intervención técnica.

Criterios:
- [ ] Veo un wizard con pasos claros (datos empresa → estándares → contacto → invitación)
- [ ] Ingreso nombre, NIT, código CIIU, # trabajadores, nivel de riesgo
- [ ] El sistema detecta o me deja seleccionar 7 vs 21 estándares automáticamente
- [ ] Defino el contacto enlace SST (correo + nombre + cargo)
- [ ] El sistema envía automáticamente un magic link al contacto
- [ ] Después del onboarding, la empresa ya aparece en mi dashboard
- [ ] Tarda menos de 10 minutos completos

Mapea a: Crit #6, #7 · Pilares P4, P9

### US-X-03 🔴 Primer login del cliente vía magic link
**Como** contacto SST de una empresa cliente, **quiero** entrar a la
plataforma haciendo clic en un enlace, **para** no tener que recordar
una contraseña adicional.

Criterios:
- [ ] Recibo el correo con magic link inmediatamente después de ser invitado
- [ ] Al hacer clic, entro directo al dashboard de mi empresa
- [ ] Solo veo datos de mi empresa, nada de otras empresas (verificar RLS)
- [ ] Veo un mensaje de bienvenida y la primera tarea sugerida
- [ ] Puedo navegar las secciones sin ayuda

Mapea a: Crit #6 · Pilares P5, P9

### US-X-04 🟡 Cambio de plantilla de correo desde admin UI
**Como** consultor Regis con perfil admin, **quiero** editar el texto del
correo de recordatorio PILA, **para** no tener que llamar al desarrollador
cuando queremos cambiar el tono o el mensaje.

Criterios:
- [ ] Existe una sección de admin de plantillas
- [ ] Puedo ver las plantillas existentes (PILA, exámenes, escalado)
- [ ] Puedo editar el texto y guardar
- [ ] La nueva versión se usa en el siguiente envío
- [ ] Las versiones anteriores quedan en historial

Mapea a: 2da recomendación última milla · Pilar P7

### US-X-05 🟡 Recuperar contraseña
**Como** consultor Regis, **quiero** recuperar mi contraseña si la olvido,
**para** no depender de soporte técnico.

Criterios:
- [ ] Hay link "olvidé mi contraseña" en el login
- [ ] Ingreso correo, recibo enlace de reseteo
- [ ] El enlace expira en máx 24h

Mapea a: Pilar P9

═══════════════════════════════════════════════════════════════════
MÓDULO 1 — PILA (Planilla de aportes a seguridad social)
═══════════════════════════════════════════════════════════════════

### US-M1-01 🔴 Configurar automatización PILA por cliente
**Como** consultor Regis, **quiero** configurar el envío automático de
la solicitud PILA mensual para una empresa, **para** eliminar el
seguimiento manual.

Criterios:
- [ ] Veo el contacto enlace SST de la empresa pre-cargado
- [ ] Defino el día del mes del primer envío (default día 1)
- [ ] Defino cantidad de recordatorios automáticos (default 2)
- [ ] Defino contacto de escalado (default: líder RRHH)
- [ ] La configuración persiste

Mapea a: Crit #1 · Pilares P1, P7

### US-M1-02 🔴 Envío automático mensual de solicitud PILA
**Como** sistema, **debo** enviar la solicitud PILA del mes al contacto
de cada empresa cliente, **para** que el consultor no tenga que
recordarlo.

Criterios:
- [ ] El día configurado, el correo sale automáticamente
- [ ] El correo incluye el remitente configurado (no Gmail por default si
      Regis usa Outlook)
- [ ] El correo tiene el logo de Regis y se ve profesional
- [ ] Se registra en el log que el envío salió (P6 audit log)
- [ ] Si la empresa tiene WhatsApp configurado, también se envía por WhatsApp

Mapea a: Crit #1 · Pilares P1, P6, P7

### US-M1-03 🔴 Cliente sube PILA por correo o WhatsApp
**Como** contacto SST cliente, **quiero** responder al correo o WhatsApp
de Regis adjuntando el PDF de la PILA, **para** cumplir el reporte mensual.

Criterios:
- [ ] El sistema recibe el adjunto del correo y lo archiva en la
      carpeta correcta del Drive (siguiendo convención Resolución 0312)
- [ ] El sistema recibe el archivo de WhatsApp también
- [ ] El sistema marca el PILA como "cargado" en el dashboard
- [ ] El consultor recibe notificación de que llegó

Mapea a: Crit #1 · Pilares P1, P5

### US-M1-04 🔴 Validación del PILA y suma al cumplimiento
**Como** consultor Regis, **quiero** validar el PILA recibido y que
sume al porcentaje de cumplimiento de la empresa, **para** mantener el
dashboard al día.

Criterios:
- [ ] Veo el PILA en estado "cargado, pendiente de validación"
- [ ] Lo abro y reviso
- [ ] Al aprobar, cambia a "validado" y suma puntos al dashboard
- [ ] Si lo rechazo, no suma puntos y se notifica al cliente con razón

Mapea a: Crit #1, #6 · Pilares P1, P6 · Flujo de aprobación del Q&A

### US-M1-05 🟡 Recordatorios automáticos si no responde
**Como** sistema, **debo** enviar recordatorio si la empresa no responde
en X días, **para** reducir reproceso manual.

Criterios:
- [ ] Después de 7 días sin respuesta, envío recordatorio 1
- [ ] Después de 7 días más sin respuesta, envío recordatorio 2
- [ ] Después del 2do recordatorio sin respuesta, escalo al líder de RRHH
- [ ] El número de días es configurable por empresa (P7)

Mapea a: Crit #1 · Pilares P1, P7

### US-M1-06 🟡 Detección de duplicados PILA
**Como** sistema, **debo** detectar si el mismo PILA llega por correo
y por WhatsApp, **para** no archivarlo dos veces ni doblar el puntaje.

Criterios:
- [ ] Hash del archivo coincide → no se duplica
- [ ] Si llega el mismo PILA distinto (re-encoded), match por trabajadores
      + período → no se duplica
- [ ] Solo se cuenta una vez en el dashboard

Mapea a: Pilares P10 · Regla dura del Q&A

═══════════════════════════════════════════════════════════════════
MÓDULO 2 — EXÁMENES MÉDICOS OCUPACIONALES
═══════════════════════════════════════════════════════════════════

### US-M2-01 🔴 IPS envía PDF y sistema lo recibe
**Como** sistema, **debo** recibir automáticamente los PDFs que envía
la IPS por correo, **para** que el consultor no tenga que descargarlos
uno por uno.

Criterios:
- [ ] El correo entrante con PDF adjunto se procesa automáticamente
- [ ] El sistema identifica que es un examen médico (no otro doc)
- [ ] Se guarda el PDF en el bucket de Storage (PRIVADO, no público)
- [ ] El consultor recibe notificación

Mapea a: Crit #2 · Pilares P1, P5

### US-M2-02 🔴 Extracción IA de recomendaciones (PDF digital)
**Como** sistema, **debo** extraer las recomendaciones y restricciones
del médico del PDF digital, **para** alimentar el informe del trabajador.

Criterios:
- [ ] Primero intenta extraer texto con pdf-parse (sin OCR, gratis)
- [ ] Si tiene texto, manda a LLM barato (Haiku/gpt-4o-mini) con schema Zod
- [ ] Si la extracción no pasa validación, escala a LLM premium
- [ ] La extracción incluye: nombre trabajador, cédula, fecha examen,
      recomendaciones, restricciones, aptitud para el cargo
- [ ] Funciona con al menos 5 PDFs distintos sin error (criterio del brief)
- [ ] El costo estimado de cada llamada se loguea (P8)

Mapea a: Crit #2 · Pilares P1, P3, P8

### US-M2-03 🔴 Asociación al trabajador correcto
**Como** sistema, **debo** asociar las recomendaciones al trabajador
correcto en la BD, **para** que aparezcan en su perfil.

Criterios:
- [ ] El sistema busca al trabajador por cédula
- [ ] Si no existe, crea el trabajador con los datos del examen
- [ ] Las recomendaciones quedan vinculadas al trabajador
- [ ] El consultor puede ver la asociación y corregir si está mal

Mapea a: Crit #2 · Pilares P1, P6

### US-M2-04 🔴 Validación humana de la extracción
**Como** consultor Regis, **quiero** revisar y aprobar la extracción IA
antes de que se considere definitiva, **para** evitar errores que afecten
al trabajador.

Criterios:
- [ ] Veo el examen en estado "extraído, pendiente de validación"
- [ ] Veo lado a lado el PDF original y los campos extraídos
- [ ] Puedo editar cualquier campo
- [ ] Al aprobar, queda "validado" y suma al cumplimiento
- [ ] Si rechazo, se marca para re-procesar o procesar manualmente

Mapea a: Crit #2, #6 · Flujo de aprobación Q&A · Pilar P6

### US-M2-05 🟡 OCR como fallback (PDF escaneado)
**Como** sistema, **debo** procesar PDFs escaneados con OCR cuando no
tienen capa de texto, **para** cubrir el 2% restante.

Criterios:
- [ ] Detecta que el PDF no tiene texto extraíble
- [ ] Corre Tesseract o equivalente local primero
- [ ] Solo escala a OCR pago si confianza < umbral
- [ ] El proceso completo no toma más de 30 segundos

Mapea a: Crit #2 · Pilares P3 · Patrón A1 de EFICIENCIAS

### US-M2-06 🟡 Detección de duplicados de exámenes
**Como** sistema, **debo** detectar si llega el mismo examen del mismo
trabajador en el mismo período por dos canales, **para** no procesarlo
dos veces.

Criterios:
- [ ] Match por trabajador + tipo de examen + fecha → se descarta el duplicado
- [ ] Se loguea la detección
- [ ] El consultor puede ver que se detectó un duplicado

Mapea a: Q&A · Pilares P10

### US-M2-07 🟡 Vista de recomendaciones por trabajador
**Como** contacto SST cliente, **quiero** ver las recomendaciones de los
exámenes médicos de mis trabajadores, **para** cumplir con las
restricciones laborales.

Criterios:
- [ ] Veo lista de trabajadores con su último examen
- [ ] Hago clic en uno y veo sus recomendaciones vigentes
- [ ] Solo veo trabajadores de MI empresa (RLS)

Mapea a: Crit #6 · Pilares P5

═══════════════════════════════════════════════════════════════════
MÓDULO 3 — MATRIZ DE RIESGO DESDE CIIU
═══════════════════════════════════════════════════════════════════

### US-M3-01 🔴 Crear matriz desde código CIIU
**Como** consultor Regis, **quiero** generar una matriz de riesgo pre-llenada
ingresando solo el código CIIU de la empresa, **para** no construirla
desde cero.

Criterios:
- [ ] Ingreso código CIIU (ej: 6820, 7020, 6201)
- [ ] El sistema pre-llena con los riesgos típicos del sector
      (físicos, químicos, psicosociales, ergonómicos, biológicos)
- [ ] Funciona con al menos 3 códigos distintos (criterio del brief)
- [ ] La matriz queda asociada a la empresa cliente

Mapea a: Crit #3 · Pilares P1, P4

### US-M3-02 🔴 Ajustar matriz pre-llenada
**Como** consultor Regis, **quiero** ajustar la matriz (agregar, quitar
o modificar riesgos), **para** adaptarla a la realidad de cada empresa.

Criterios:
- [ ] Puedo agregar un nuevo riesgo manualmente
- [ ] Puedo eliminar un riesgo pre-llenado
- [ ] Puedo modificar nivel de probabilidad, exposición, consecuencia
- [ ] Los cambios se autoguardan o tengo botón "guardar"

Mapea a: Crit #3 · Pilar P1

### US-M3-03 🔴 Exportar matriz lista para firmar
**Como** consultor Regis, **quiero** exportar la matriz a un formato
que Regis pueda firmar, **para** archivarla y entregarla al cliente.

Criterios:
- [ ] Exporto a PDF o Word (cuál sea estándar para SST)
- [ ] El documento exportado incluye logo de la empresa cliente (1a recomendación)
- [ ] Incluye encabezado con código, versión, fecha (4a recomendación)
- [ ] El documento se ve profesional

Mapea a: Crit #3 · 1ra y 4ta recomendación última milla · Pilar P1

### US-M3-04 🟡 Subir matriz aprobada por ARL
**Como** consultor Regis o cliente, **quiero** subir la matriz ya
aprobada por la ARL como archivo plano, **para** que sume al puntaje
de cumplimiento.

Criterios:
- [ ] Subo el PDF o Word firmado
- [ ] El sistema lo asocia a la matriz existente
- [ ] Suma puntos al dashboard

Mapea a: Crit #3 · Pilar P1

═══════════════════════════════════════════════════════════════════
MÓDULO 4 — ACTAS DE COMITÉS (COPASST y Convivencia)
═══════════════════════════════════════════════════════════════════

### US-M4-01 🔴 Configurar integrantes del COPASST
**Como** consultor Regis, **quiero** registrar los integrantes del COPASST
de una empresa, **para** que se pre-carguen automáticamente en cada acta.

Criterios:
- [ ] Registro nombre, cédula, cargo, tipo (principal/suplente), correo
- [ ] Defino fecha de inicio del periodo (2 años)
- [ ] Lo mismo para Comité de Convivencia
- [ ] Los datos persisten

Mapea a: Crit #4 · Pilares P1, P7

### US-M4-02 🟡 Reemplazar integrante con preservación de historial
**Como** consultor Regis, **quiero** reemplazar un integrante saliente,
**para** mantener actualizado el comité sin perder el historial.

Criterios:
- [ ] Marco al saliente como "retirado" con fecha
- [ ] Agrego el nuevo integrante con fecha de inicio
- [ ] Las actas anteriores siguen mostrando los integrantes que estaban
      en ese momento
- [ ] El nuevo integrante aparece en las próximas actas

Mapea a: Q&A · Pilares P6, P4

### US-M4-03 🔴 Crear nueva acta con puntos tratados
**Como** consultor Regis, **quiero** crear una nueva acta de comité
ingresando solo los puntos tratados, **para** no redactarla manualmente.

Criterios:
- [ ] Selecciono empresa y tipo de comité
- [ ] Veo los integrantes pre-cargados
- [ ] Marco quién asistió (check de cada uno)
- [ ] Ingreso los puntos tratados (texto libre o estructurado)
- [ ] Veo en tiempo real si hay quórum o no

Mapea a: Crit #4 · Pilares P1, P7

### US-M4-04 🔴 Verificación de quórum
**Como** sistema, **debo** verificar que haya quórum (mitad + 1 de
integrantes) antes de permitir generar el acta formal.

Criterios:
- [ ] Si menos de mitad + 1 marcados como presentes, no permite "generar acta"
- [ ] Muestra mensaje claro: "Sin quórum no se pueden tomar decisiones"
- [ ] Si hay quórum, habilita el botón "Generar acta"

Mapea a: Q&A regla dura · Crit #4 · Pilar P1

### US-M4-05 🔴 Generación IA del acta completa
**Como** sistema, **debo** generar el acta completa con formato estándar
usando los integrantes, puntos tratados y asistencia, **para** que el
consultor solo revise y firme.

Criterios:
- [ ] El acta tiene formato profesional (encabezado, cuerpo, cierre)
- [ ] Lista todos los integrantes con su estado (presente/ausente)
- [ ] Incluye los puntos tratados con redacción coherente
- [ ] Incluye logo de la empresa cliente en el encabezado
- [ ] Incluye código, versión, fecha en el encabezado
- [ ] Se ve listo para firmar
- [ ] Funciona con al menos 2 empresas distintas (criterio brief)

Mapea a: Crit #4 · 1ra y 4ta recomendación última milla · Pilares P1, P3

### US-M4-06 🔴 Link de asistencia digital
**Como** integrante de comité, **quiero** confirmar mi asistencia con un
link sin tener que crear cuenta, **para** dejar constancia rápido.

Criterios:
- [ ] Recibo correo o WhatsApp con un link único
- [ ] Al hacer clic, confirmo asistencia con un click
- [ ] El sistema marca mi asistencia automáticamente en la sesión
- [ ] El link expira al cierre de la reunión

Mapea a: Crit #4, Q&A · Pilar P9

### US-M4-07 🟡 Exportar acta firmable
**Como** consultor Regis, **quiero** exportar el acta generada, **para**
recoger firmas físicas o electrónicas.

Criterios:
- [ ] Exporto a PDF o Word
- [ ] El documento mantiene logo, encabezado, formato
- [ ] Está listo para firma electrónica certificada (DocuSign o similar)
  o para imprimir-firmar-escanear

Mapea a: Crit #4 · 1ra, 4ta recomendación · Pilar P1

═══════════════════════════════════════════════════════════════════
MÓDULO 5 — PLAN DE EMERGENCIA DESDE AUDIO
═══════════════════════════════════════════════════════════════════

### US-M5-01 🔴 Grabar o subir audio de visita
**Como** consultor Regis en visita presencial, **quiero** grabar un audio
describiendo amenazas, recursos y vulnerabilidades, **para** que el
sistema lo procese y genere el plan.

Criterios:
- [ ] Puedo grabar desde el celular dentro de la plataforma (mobile-friendly)
- [ ] Alternativamente, puedo subir un audio pre-grabado
- [ ] El sistema acepta audios de hasta 30 minutos
- [ ] Veo barra de progreso de subida

Mapea a: Crit #5 · Pilares P1, P9

### US-M5-02 🔴 Transcripción automática del audio
**Como** sistema, **debo** transcribir el audio a texto, **para** poder
generar el documento.

Criterios:
- [ ] Whisper local primero para audios cortos (P3, patrón A5)
- [ ] Whisper API si audio largo o ruido alto
- [ ] La transcripción se ve correcta
- [ ] Funciona con audio de al menos 3 minutos (criterio brief)

Mapea a: Crit #5 · Pilares P1, P3

### US-M5-03 🔴 Análisis de vulnerabilidad generado
**Como** sistema, **debo** generar el análisis de vulnerabilidad
estructurado a partir de la transcripción, **para** llenar la plantilla
del plan de emergencia.

Criterios:
- [ ] El documento generado refleja fielmente lo dicho en el audio
- [ ] Incluye secciones: amenazas, recursos, vulnerabilidades
- [ ] Las clasifica según metodología de plan de emergencia
- [ ] El consultor puede ver el resultado antes de exportar

Mapea a: Crit #5 · Pilar P1

### US-M5-04 🔴 Editar y exportar plan
**Como** consultor Regis, **quiero** editar el plan generado y exportarlo,
**para** entregarlo formalmente.

Criterios:
- [ ] Editor que permite ajustar el texto generado
- [ ] Exporto a Word o PDF
- [ ] Incluye logo cliente, encabezado código/versión/fecha
- [ ] El documento queda guardado en la empresa

Mapea a: Crit #5 · 1ra, 4ta recomendación · Pilar P1

═══════════════════════════════════════════════════════════════════
MÓDULO 6 — DASHBOARD DE CUMPLIMIENTO
═══════════════════════════════════════════════════════════════════

### US-M6-01 🔴 Vista admin Regis: todas las empresas
**Como** consultor Regis, **quiero** ver el porcentaje de cumplimiento de
todas las empresas de mi cartera, **para** identificar prioridades del día.

Criterios:
- [ ] Lista de empresas con su % de cumplimiento
- [ ] Indicador visual claro (verde/amarillo/rojo) por umbral
- [ ] Puedo ordenar por % ascendente o descendente
- [ ] Puedo ver cuántos documentos están pendientes por empresa

Mapea a: Crit #6 · Pilar P1

### US-M6-02 🔴 Vista cliente: solo su empresa
**Como** contacto SST cliente, **quiero** ver el porcentaje de mi empresa
y qué documentos están verdes y cuáles no, **para** saber qué falta.

Criterios:
- [ ] Solo veo MI empresa (RLS estricto)
- [ ] Veo % global, gráfico de progreso
- [ ] Veo lista de ítems del SG-SST con estado (verde/amarillo/rojo)
- [ ] Hago clic en uno y veo qué documento falta o qué se rechazó

Mapea a: Crit #6 · Pilares P1, P5

### US-M6-03 🔴 Cálculo real en tiempo real (sin hardcode)
**Como** sistema, **debo** calcular el porcentaje a partir de los
documentos validados, **para** que el dashboard refleje la realidad.

Criterios:
- [ ] El cálculo se basa en items_cumplimiento + documentos validados
- [ ] No hay valores hardcoded (criterio brief explícito)
- [ ] Cuando se valida un documento nuevo, el % se actualiza automáticamente
- [ ] Soporta lógica de 7 estándares Y 21 estándares

Mapea a: Crit #6 · Pilares P1, P4 · Patrones C1, C2 de EFICIENCIAS

### US-M6-04 🔴 Flujo de aprobación visible
**Como** consultor o cliente, **quiero** ver claramente el estado de cada
documento (pendiente → cargado → validado → aprobado), **para** saber qué
me toca a mí.

Criterios:
- [ ] Cada documento muestra estado actual
- [ ] El consultor ve botón "validar" para los que están en "cargado"
- [ ] El cliente ve estado "pendiente de validación" cuando subió
- [ ] Hay log de quién hizo qué cambio cuándo (P6)

Mapea a: Q&A · Crit #6 · Pilares P1, P6

### US-M6-05 🟡 Actualización en tiempo real (sin recargar)
**Como** consultor o cliente, **quiero** que el dashboard se actualice
solo cuando algo cambia, **para** no tener que recargar manualmente.

Criterios:
- [ ] Si otro usuario sube/valida un documento, mi vista refleja el cambio
- [ ] Sin necesidad de F5
- [ ] Usa Supabase Realtime (patrón B2)

Mapea a: Pilar P1, P4

### US-M6-06 🟡 Detección de perfil normativo (7 vs 21)
**Como** sistema, **debo** aplicar el perfil correcto (7 o 21 estándares)
según el tamaño y nivel de riesgo de la empresa, **para** evaluar correctamente.

Criterios:
- [ ] En el onboarding se detecta automáticamente según trabajadores + riesgo
- [ ] El admin puede sobreescribir manualmente si es necesario
- [ ] El dashboard muestra el perfil aplicado (7 u 21)
- [ ] Las métricas se calculan contra el perfil correcto

Mapea a: 2da recomendación última milla del primer brief (clarificación)
· Pilar P4

═══════════════════════════════════════════════════════════════════
RECOMENDACIONES DE ÚLTIMA MILLA (las 4 trampas mortales)
═══════════════════════════════════════════════════════════════════

### US-UM-01 🔴 Sección de documentos generales SG-SST
**Como** consultor Regis o cliente, **quiero** subir documentos generales
del SG-SST (políticas, actas de recursos, plan de capacitaciones,
cronogramas), **para** que queden organizados y sumen al porcentaje.

Criterios:
- [ ] Existe una sección "Documentos generales" por empresa
- [ ] Puedo subir PDFs, Word, imágenes
- [ ] Los clasifico por tipo (política, plan, acta de recursos, etc.)
- [ ] Suman al porcentaje del dashboard según el estándar aplicable

Mapea a: 1ra recomendación última milla · Crit #6 · Pilar P1

### US-UM-02 🔴 Configurar remitente de correo sin código
**Como** admin Regis, **quiero** cambiar el correo desde el que sale la
plataforma, **para** que parezca venir de Regis (Outlook) en vez de Gmail.

Criterios:
- [ ] Hay sección admin de configuración de correo
- [ ] Defino dirección remitente, nombre que aparece, firma
- [ ] Pruebo enviando un correo de prueba
- [ ] El cambio aplica sin redeploy

Mapea a: 2da recomendación última milla · Pilar P7

### US-UM-03 🔴 Logo de empresa cliente en exportados
**Como** sistema, **debo** incluir el logo de la empresa cliente en el
encabezado de cada documento exportado, **para** que se vea como un
entregable profesional, no un borrador genérico.

Criterios:
- [ ] Subo el logo de la empresa cliente una vez en su perfil
- [ ] Todos los documentos exportados (actas, matrices, planes) lo incluyen
- [ ] Si la empresa no tiene logo cargado, usa logo de Regis por default

Mapea a: 3ra recomendación última milla · Pilar P1

### US-UM-04 🔴 Encabezado con código, versión y fecha
**Como** sistema, **debo** incluir en cada documento exportado un
encabezado con código de documento, versión y fecha de creación,
**para** cumplir el requisito de trazabilidad de la norma.

Criterios:
- [ ] Cada documento exportado tiene esos 3 campos en el encabezado
- [ ] El código se genera automáticamente según el tipo y empresa
- [ ] La versión aumenta cuando el documento se regenera
- [ ] La fecha es la de creación o actualización

Mapea a: 4ta recomendación última milla · Pilar P6

═══════════════════════════════════════════════════════════════════
BONUS YA IMPLEMENTADOS (Edge Functions detectadas)
═══════════════════════════════════════════════════════════════════

### US-B-01 🔴 Bitácora mensual automática
**Como** sistema, **debo** generar y enviar al consultor un resumen
mensual de lo completado, pendiente y siguiente para cada cliente,
**para** cerrar el mes ordenadamente.

Criterios:
- [ ] El último día del mes, sale automáticamente
- [ ] Va al correo del consultor a cargo
- [ ] Resume por empresa: % al final del mes, qué se completó,
      qué quedó pendiente
- [ ] Limpio y legible

Mapea a: Bonus B del segundo brief · Pilares P1, P8

### US-B-02 🔴 Resumen semanal por consultor
**Como** consultor Regis, **quiero** recibir cada lunes la lista de
pendientes con cada cliente, y cada viernes el balance de la semana,
**para** no olvidar clientes pequeños.

Criterios:
- [ ] Lunes 8am: correo con pendientes de la semana
- [ ] Viernes 6pm: correo con qué se completó y qué quedó abierto
- [ ] Solo incluye empresas de la cartera de cada consultor

Mapea a: Bonus D del segundo brief · Pilares P1, P8

═══════════════════════════════════════════════════════════════════
PLAN DE EJECUCIÓN DE PRUEBAS (DÍA 8)
═══════════════════════════════════════════════════════════════════

## Setup previo
1. Sembrar al menos 2 empresas demo:
   - "Sabor Criollo SAS" (ya existe) - usar como 21 estándares
   - "Construcciones del Café SAS" - usar como 7 estándares
2. Sembrar 5-10 trabajadores por empresa
3. Generar 5 PDFs de exámenes médicos demo (puede usar plantilla)
4. Generar 3 audios cortos demo (puede grabarse uno mismo)
5. Crear usuario admin Regis + 1 usuario cliente de Sabor Criollo

## Orden de ejecución (4-6 horas)
Bloque 1 (1h) — Crosscutting: US-X-01 a US-X-05
Bloque 2 (1h) — Módulo 1 PILA: todas las US-M1
Bloque 3 (1.5h) — Módulo 2 Exámenes: todas las US-M2
Bloque 4 (1h) — Módulo 3 Matriz: todas las US-M3
Bloque 5 (1.5h) — Módulo 4 Actas: todas las US-M4 (más complejo)
Bloque 6 (1h) — Módulo 5 Plan emergencia: todas las US-M5
Bloque 7 (1h) — Módulo 6 Dashboard: todas las US-M6
Bloque 8 (30 min) — Última milla: todas las US-UM
Bloque 9 (30 min) — Bonus: US-B-01 y US-B-02

## Para cada US, registrar:
- Estado: ✅ Pasa / ❌ Falla / ⚠️ Pasa con observaciones
- Si falla: qué criterio específico, qué se vio, screenshot si aplica
- Si pasa con observaciones: qué se podría mejorar (no bloquea)

## Si una 🔴 falla
- Se mete en el plan del día 9 antes de grabar video
- Si no se puede arreglar en el día, se ajusta el guion del video
  para no mostrarla

## Si una 🟡 falla
- Se documenta como deuda técnica conocida
- No bloquea la entrega
- Se menciona en el SOP/Manual

## Si una 🟢 falla
- Sin acción. Es bonus, no obligatorio.
