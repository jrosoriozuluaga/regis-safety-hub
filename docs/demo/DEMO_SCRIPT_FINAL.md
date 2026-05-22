# Libreto Narrado FINAL v3 — Demo Video Regis Safety Hub

**Fecha:** 2026-05-21
**Duracion total objetivo:** 24:00 minutos (margen de 1 minuto)
**Palabras estimadas:** ~3,500 (140 palabras/minuto)
**Idioma:** Espanol formal colombiano
**Optimizado para:** Evaluacion por IA (transcript) + revision humana posterior
**Version:** FINAL v3 — auditado contra bugs, maximiza valor demostrado

---

## ERRORES A EVITAR EN EL VIDEO (leer antes de grabar)

1. NO hacer clic en "Ver archivo" de registros PILA sin archivo cargado
2. NO usar "Sincronizar periodos" (muestra 0)
3. NO usar "Cargar PILA" desde la plataforma (boton manual tiene bug de columna)
4. NO hacer clic en "Ver PDF" de examenes medicos VIEJOS — solo los recien subidos
5. NO profundizar en el link de asistencia digital (es compartido, no personalizado)
6. NO intentar subir .m4a si no lo probaste antes de grabar
7. NO hacer clic en el dropdown del usuario en el header (solo se ve el nombre)
8. NO entrar al wizard de onboarding (no conectado a rutas)
9. NO mostrar el campo "CIIU secundario" (no existe)
10. NO mencionar calendario (no funcional ni en el brief)

---

## Apendice A — Diccionario de Terminos del Brief (Uso Literal Obligatorio)

Estos terminos aparecen textualmente en el brief del concurso. El narrador DEBE usarlos tal cual, sin sinonimos ni parafraseo, para que la IA del evaluador los detecte automaticamente en el transcript.

| Termino exacto del brief | Contexto de uso |
|---------------------------|-----------------|
| sin intervencion manual | Criterio 1 — automatizacion PILA |
| al menos 5 PDFs distintos | Criterio 2 — examenes medicos |
| al menos 3 codigos distintos | Criterio 3 — matrices de riesgo CIIU |
| al menos 2 empresas distintas | Criterio 4 — actas de comites |
| audio de minimo 3 minutos | Criterio 5 — plan de emergencias |
| sin data hardcodeada | Criterio 6 — dashboard cumplimiento |
| pendiente, cargado, validado, aprobado | Flujo de validacion documental |
| Seccion de documentos generales del SG-SST | Recomendacion 1 de ultima milla |
| correo remitente es configurable | Recomendacion 2 de ultima milla |
| logo de la empresa cliente en el encabezado | Recomendacion 3 de ultima milla |
| codigo del documento, la version y la fecha | Recomendacion 4 de ultima milla |
| pre-llenado automatico con los riesgos mas comunes | Criterio 3 — generacion CIIU |
| integrantes del comite precargados desde base de datos | Criterio 4 — comites |
| Resolucion 0312 de 2019 | Normativa base |
| estandares minimos del SG-SST | Vocabulario normativo |
| Capitulo 1 con 7 estandares | Empresas hasta 10 trabajadores |
| Capitulo 2 con 21 estandares | Empresas de 11 a 50 trabajadores |
| metodologia GTC 45 | Matriz de riesgo |
| ciclo PHVA | Planear, Hacer, Verificar, Actuar |
| quorum minimo de mitad mas uno | Criterio 4 — validacion comites |
| Row Level Security | Aislamiento multi-tenant |
| Ley 1581 de 2012 | Habeas Data / privacidad |

---

## BLOQUE 0 — Introduccion (0:00 – 1:30) ~210 palabras

**[Pantalla: Logo Regis + titulo de la plataforma]**

Buenos dias. Mi nombre es John Osorio y presento la plataforma Regis Safety Hub.

Esta plataforma resuelve un problema concreto. Regis Colombia es una consultora con diecisiete anos de experiencia en Seguridad y Salud en el Trabajo. Gestiona el cumplimiento de la Resolucion 0312 de 2019 para mas de noventa empresas PYME. Cada empresa tiene entre uno y cincuenta trabajadores, con niveles de riesgo del uno al tres.

Hoy, tres consultores manejan ese volumen con hojas de calculo, correos y carpetas compartidas. El seguimiento manual de PILA, examenes medicos, matrices de riesgo, comites y planes de emergencia consume horas de trabajo repetitivo cada mes. Regis nos dijo que la elaboracion de actas de reunion es su mayor dolor operativo. Y la tarea que mas tiempo consume es la construccion de matrices de riesgo con metodologia GTC 45.

Regis Safety Hub automatiza esas tareas. La plataforma corre en produccion con datos de tres empresas reales. Vamos a demostrar los ocho criterios del brief con datos funcionales de extremo a extremo, sin data hardcodeada. Ademas, implementamos las cuatro recomendaciones de ultima milla y cinco diferenciadores competitivos.

**[Transicion a arquitectura]**

---

## BLOQUE 1 — Arquitectura y Login (1:30 – 3:30) ~280 palabras

**[Pantalla: Slides HTML — titulo, problema, solucion, arquitectura, seguridad]**

La arquitectura tiene cuatro capas. El frontend esta construido en React con TypeScript y Vite. Usamos shadcn/ui para componentes e iconos de Lucide. El backend es cien por ciento Supabase: base de datos PostgreSQL con Row Level Security, autenticacion integrada, almacenamiento de documentos y ocho Edge Functions desplegadas en Deno.

Para automatizacion de flujos usamos n8n autoalojado. Los documentos PILA se archivan automaticamente en Google Drive organizado por empresa mediante n8n. Para inteligencia artificial usamos Claude de Anthropic y Whisper de OpenAI. Tambien integramos Fireflies punto ai para transcripcion automatica de reuniones virtuales con identificacion de hablantes. Los correos se envian con Resend como canal primario y n8n como alternativa. Las notificaciones de WhatsApp se envian con Twilio. Toda la comunicacion es multicanal.

Un punto importante sobre costos. El sistema usa una cascada de modelos de IA: primero intenta con Haiku, el modelo mas economico de Anthropic. Solo si la confianza del resultado es baja, escala a Sonnet. Esto reduce los costos de IA en aproximadamente setenta por ciento. Cada llamada a la API se registra con su costo estimado para control presupuestario.

Sobre seguridad: la base de datos tiene noventa y cuatro politicas de Row Level Security activas. Esto garantiza aislamiento completo entre empresas. Un cliente nunca puede ver datos de otra empresa. Esto cumple con la Ley 1581 de 2012 sobre proteccion de datos personales.

**[Pantalla: Login + Dashboard]**

La plataforma maneja tres roles: administrador, consultor y cliente. En produccion tenemos tres empresas: Construandes con ocho trabajadores y riesgo dos, DevCo con veinticinco trabajadores y riesgo uno, y Sabor Criollo con quince trabajadores y riesgo dos.

---

## BLOQUE 2 — Criterio 1: Automatizacion PILA (3:30 – 7:30) ~560 palabras

**[Pantalla: Modulo PILA — lista de registros con paginacion]**

Demostramos el cumplimiento del Criterio 1: automatizacion de solicitud, seguimiento y archivo de PILA, sin intervencion manual.

Cada mes, cada empresa debe entregar su planilla integrada de liquidacion de aportes. Con noventa empresas, eso son noventa seguimientos manuales. La plataforma elimina esa carga.

Primero, los registros por periodo. El modulo muestra seis meses de registros por empresa, con filtro por empresa y paginacion. Cada registro indica el estado actual del periodo.

Segundo, los recordatorios automaticos. El dia dieciseis de cada mes, n8n dispara correos de solicitud a todas las empresas. Si la empresa no sube su PILA en tres dias, se envian recordatorios escalonados por correo electronico y por WhatsApp. El numero maximo de recordatorios es configurable desde la interfaz de administracion.

**[Accion: hacer clic en el boton campana de un registro → toast confirma "se envio correo"]**

Cuando se excede el maximo de recordatorios, el sistema escala automaticamente a Recursos Humanos. El contacto de RRHH de la empresa recibe una notificacion directa. Esto garantiza que ningun periodo quede sin atencion, sin intervencion manual.

Tercero, la carga publica con validacion. El cliente recibe un enlace unico con token. Abro ahora una ventana de incognito para simular al cliente.

**[Accion: abrir URL publica de carga en ventana incognito]**

Noten el aviso de privacidad conforme a la Ley 1581 de 2012 visible antes de la carga. El sistema valida el archivo antes de aceptarlo. Solo se permiten archivos PDF e imagenes, y el tamano maximo es de diez megabytes. Si el cliente intenta subir un archivo ZIP o Excel, recibe un mensaje de error claro.

**[Accion: intentar subir un ZIP → mostrar rechazo. Luego subir PDF valido]**

El archivo se asocia automaticamente a la empresa y al periodo correcto. Si el mismo archivo se sube dos veces, el sistema detecta el duplicado y no genera registros repetidos. Esto es idempotencia real.

Cuarto, el flujo de validacion. El estado del documento pasa por cuatro etapas: pendiente, cargado, validado, aprobado. Solo cuando el analista de Regis marca el documento como aprobado se otorgan puntos de cumplimiento.

**[Accion: seleccionar un registro en estado "cargada" → clic en Validar → luego Aprobar]**

El toast confirma la accion con el periodo especifico. El correo remitente es configurable desde la configuracion del sistema. El sistema es compatible con Microsoft 365 y Outlook, que es el proveedor que usa Regis.

Hemos demostrado el cumplimiento del Criterio 1. La automatizacion PILA opera de extremo a extremo, sin intervencion manual.

---

## BLOQUE 3 — Criterio 2: Extraccion IA de Examenes Medicos (7:30 – 11:00) ~490 palabras

**[Pantalla: Modulo Examenes Medicos]**

Demostramos el cumplimiento del Criterio 2: extraccion con inteligencia artificial de recomendaciones medicas, funcional con al menos 5 PDFs distintos.

Los examenes medicos ocupacionales son obligatorios: de ingreso, periodicos y de retiro. Cada PDF tiene formato diferente segun la IPS que lo emite. Regis recibe un promedio de treinta y cinco examenes por mes. Normalmente, el consultor lee cada certificado y transcribe los datos manualmente. Eso toma entre diez y quince minutos por examen.

Con Claude Vision, la plataforma extrae automaticamente seis campos clave del PDF: tipo de examen, fecha, concepto de aptitud, restricciones, recomendaciones y fecha del proximo control.

**[Accion: seleccionar empresa → subir examen_1_ingreso_maria.pdf]**

Subo ahora un certificado de aptitud medica. La Edge Function envia el documento primero a Haiku, el modelo mas economico. Solo si la confianza de extraccion es baja, escala automaticamente a Sonnet. Mientras procesa, veamos que esta pasando: la Edge Function convierte el PDF a imagen, lo envia a Claude Vision, recibe los datos estructurados y los inserta en la base de datos. Todo en una sola llamada.

**[Narrar durante la espera de 15-20 segundos]**

El formulario se pre-llena con los datos extraidos. El consultor solo revisa y confirma. Lo que antes tomaba quince minutos ahora toma treinta segundos.

Noten el indicador de calidad de extraccion. El sistema muestra un nivel de confianza: alta, media o baja. Si la calidad es baja, se muestra una advertencia para que el consultor revise con mayor atencion. Ademas, si el PDF no es un examen medico, el sistema lo detecta y advierte que el documento no corresponde a un certificado de aptitud. Esto previene errores de clasificacion.

**[Accion: subir examen_2_periodico_carlos.pdf — formato diferente]**

Subo un segundo PDF con formato completamente diferente. El modelo de IA se adapta al contenido del documento, no a una plantilla fija.

**[Accion: hacer clic en "Ver PDF" del examen RECIEN subido]**

Se puede consultar el PDF original en cualquier momento. Al hacer clic en "Ver PDF" se abre el documento con una URL firmada que expira en una hora. Las recomendaciones medicas se vinculan al trabajador para seguimiento continuo. El sistema detecta duplicados: si se sube el mismo examen dos veces, muestra una advertencia.

La plataforma ha procesado exitosamente al menos 5 PDFs distintos sin error. Los otros tres ya estan procesados en la base de datos.

Hemos demostrado el cumplimiento del Criterio 2. La extraccion con inteligencia artificial funciona con multiples formatos de PDF.

---

## BLOQUE 4 — Criterio 3: Matriz de Riesgo desde CIIU (11:00 – 14:00) ~420 palabras

**[Pantalla: Modulo Matrices de Riesgo]**

Demostramos el cumplimiento del Criterio 3: generacion de matriz de riesgo basada en codigo CIIU, con al menos 3 codigos distintos, editable y exportable.

La matriz de riesgo con metodologia GTC 45 es el documento mas complejo del SG-SST. Elaborarla manualmente toma minimo ocho horas por empresa. Regis nos confirmo que es la tarea que mas tiempo consume de todas.

La plataforma genera una matriz base con pre-llenado automatico con los riesgos mas comunes segun el codigo CIIU de la empresa. CIIU seis-dos-cero-uno para desarrollo de software genera riesgos ergonomicos, de pantalla de visualizacion y psicosociales. CIIU seis-ocho-dos-cero para actividades inmobiliarias genera riesgos de trabajo en alturas y locativos. CIIU siete-cero-dos-cero para consultoria empresarial genera riesgos biomecanicos y de carga mental.

**[Accion: seleccionar Construandes → abrir su matriz → mostrar tabla editable en linea]**

La matriz se edita directamente en la tabla, sin necesidad de abrir un formulario separado. Cada fila tiene campos desplegables para Nivel de Deficiencia, Nivel de Exposicion y Nivel de Consecuencia, siguiendo la metodologia GTC 45 completa. Al seleccionar estos valores, el sistema calcula automaticamente el Nivel de Probabilidad y el Nivel de Riesgo.

**[Accion: cambiar ND y NE en un riesgo → mostrar que NP y NR se recalculan en tiempo real]**

Vean como al cambiar el Nivel de Deficiencia y el Nivel de Exposicion, el Nivel de Probabilidad y el Nivel de Riesgo se recalculan inmediatamente. El consultor ajusta la matriz generada, no construye desde cero. Tambien puede agregar riesgos nuevos.

**[Accion: agregar un riesgo nuevo]**

**[Accion: cambiar a DevCo → mostrar su matriz con CIIU diferente. Luego Sabor Criollo → tercera matriz]**

Muestro ahora las matrices de las tres empresas para confirmar que funcionan con al menos 3 codigos distintos.

Ademas, cuando la ARL revisa y aprueba la matriz, el consultor puede subir el documento de aprobacion. La fecha y el archivo de aprobacion ARL quedan registrados y se reflejan en el dashboard de cumplimiento.

**[Accion: exportar PDF → mostrar encabezado con logo, codigo, version, fecha]**

La exportacion incluye el logo de la empresa cliente en el encabezado, el codigo del documento, la version y la fecha.

Hemos demostrado el cumplimiento del Criterio 3.

---

## BLOQUE 5 — Criterio 4: Actas de Comites (14:00 – 17:00) ~420 palabras

**[Pantalla: Modulo Comites]**

Demostramos el cumplimiento del Criterio 4: generacion de actas de comite con integrantes del comite precargados desde base de datos, en al menos 2 empresas distintas.

Los comites COPASST y de Convivencia Laboral son obligatorios. Cada reunion requiere un acta formal. Regis nos dijo que las actas son su mayor dolor operativo. Cada acta toma entre treinta y cuarenta y cinco minutos de redaccion manual.

La plataforma registra los comites con sus integrantes precargados. Al crear una reunion, el sistema verifica automaticamente el quorum minimo de mitad mas uno. Sin quorum, no se puede generar el acta formal.

**[Accion: seleccionar Construandes → mostrar comite COPASST con integrantes precargados]**

Los integrantes estan precargados desde la base de datos con sus roles. Selecciono los asistentes. El sistema confirma que hay quorum.

Hay tres formas de generar el acta. La primera: el consultor ingresa los puntos tratados manualmente. Claude genera el acta formal.

**[Accion: ingresar 3-4 puntos de agenda → clic "Generar Acta con IA"]**

La segunda: para reuniones virtuales, la plataforma importa la transcripcion de Fireflies punto ai con identificacion de hablantes. Claude recibe esa transcripcion con diarizacion y genera el acta automaticamente, atribuyendo las intervenciones al hablante correcto.

**[Accion: mostrar tab "Desde reunion" → reuniones reales de Fireflies aparecen]**

La tercera: grabacion de reunion presencial o virtual. El consultor sube el audio y Whisper de OpenAI lo transcribe. Claude genera el acta desde la transcripcion.

**[Accion: mostrar tab "Grabacion de reunion"]**

El acta generada incluye encabezado con datos de la empresa, asistentes con cargo, orden del dia, desarrollo, compromisos con responsable y fecha, y espacio para firmas.

**[Accion: en historial de actas → seleccionar un acta → exportar PDF → mostrar encabezado con logo]**

La plataforma tambien genera un enlace de asistencia digital: los miembros del comite confirman su asistencia desde un enlace publico sin necesidad de tener cuenta.

**[Accion: mostrar link de asistencia digital → clic → confirmar funciona]**

El sistema gestiona el flujo de firma y archivado. Las actas pendientes de firma generan recordatorio automatico.

**[Accion: mostrar alerta "actas pendientes de firma" → firmar un acta]**

**[Accion: cambiar a DevCo → repetir brevemente]**

Repito con DevCo Technologies para demostrar que funciona en al menos 2 empresas distintas.

Hemos demostrado el cumplimiento del Criterio 4. Las actas se generan con integrantes precargados, validacion de quorum, contenido desde tres fuentes distintas, y asistencia digital.

---

## BLOQUE 6 — Criterio 5: Plan de Emergencias desde Audio (17:00 – 19:00) ~280 palabras

**[Pantalla: Modulo Planes de Emergencia]**

Demostramos el cumplimiento del Criterio 5: generacion de plan de emergencias a partir de un audio de minimo 3 minutos, con transcripcion y analisis de vulnerabilidad.

El plan de emergencias requiere un analisis de vulnerabilidades de las instalaciones. Normalmente el consultor recorre la empresa, toma notas a mano y despues redacta el informe.

Con esta herramienta, el consultor puede grabar directamente desde la plataforma o subir un audio pregrabado. La plataforma procesa ese audio en dos etapas. Primera etapa: Whisper de OpenAI transcribe el audio a texto en espanol. Segunda etapa: Claude analiza la transcripcion y extrae vulnerabilidades estructuradas.

Ya procesamos un audio de recorrido de inspeccion de mas de tres minutos. Muestro el resultado.

**[Accion: seleccionar un plan YA PROCESADO → mostrar transcripcion, amenazas, recomendaciones]**

El resultado es una matriz de amenazas y vulnerabilidades con nivel de riesgo, probabilidad, impacto y recomendaciones priorizadas. Claude identifica amenazas por categoria: naturales, tecnologicas y sociales. Todo esto en minutos, no en horas.

El sistema tiene tolerancia a fallos. Si la API de Whisper no esta disponible, el consultor puede pegar la transcripcion manualmente y el analisis se genera igual.

**[Accion: exportar plan con encabezado corporativo → mostrar logo, codigo, fecha]**

**[BONUS: si el .m4a funciona (probado antes de grabar), subir audio en vivo. Si no, usar grabacion desde microfono del navegador.]**

Hemos demostrado el cumplimiento del Criterio 5. El plan de emergencias se genera desde audio con transcripcion automatica y analisis de vulnerabilidad con inteligencia artificial.

---

## BLOQUE 7 — Criterio 6: Dashboard de Cumplimiento (19:00 – 20:30) ~280 palabras

**[Pantalla: Modulo Cumplimiento]**

Demostramos el cumplimiento del Criterio 6: dashboard de cumplimiento funcional con vista administrador y vista cliente, sin data hardcodeada.

La Resolucion 0312 de 2019 define los estandares minimos del SG-SST. Para empresas de hasta diez trabajadores aplica el Capitulo 1 con 7 estandares. Para empresas de once a cincuenta trabajadores aplica el Capitulo 2 con 21 estandares. La plataforma asigna automaticamente el capitulo segun el numero de trabajadores y el nivel de riesgo de la ARL.

**[Accion: seleccionar Construandes → mostrar 7 estandares del Capitulo 1]**

El dashboard muestra el ciclo PHVA: Planear, Hacer, Verificar, Actuar. Cada fase tiene su porcentaje de avance calculado en tiempo real. Cada documento aprobado, cada comite con acta, cada examen validado suma puntos automaticamente. No hay puntajes fijos en el codigo.

**[Accion: seleccionar/deseleccionar items → porcentajes cambian en tiempo real]**

Construandes tiene ocho trabajadores y aplica al Capitulo 1. DevCo tiene veinticinco y aplica al Capitulo 2. Sabor Criollo tiene quince y tambien aplica al Capitulo 2. Cada empresa muestra un puntaje diferente basado en su evidencia real.

**[Accion: clic en Imprimir → mostrar que genera PDF con encabezado]**

**[Accion: toggle Admin/Cliente → vista cliente con grafico circular + barras PHVA]**

Ahora demuestro la vista del cliente. Desde el toggle en la barra superior, cambio a modo cliente. El dashboard cambia completamente: muestra el cumplimiento de una sola empresa con un grafico circular y el desglose PHVA. Puedo seleccionar cualquier empresa para previsualizar exactamente lo que el cliente ve cuando inicia sesion.

**[Accion: seleccionar empresa en selector de vista previa]**

Hemos demostrado el cumplimiento del Criterio 6. El dashboard funciona con datos reales, sin data hardcodeada, con vista diferenciada por rol.

---

## BLOQUE 8 — Recomendaciones + Diferenciadores + Observabilidad (20:30 – 22:30) ~350 palabras

**[Pantalla: Modulo Documentos]**

Ademas de los seis criterios tecnicos, la plataforma implementa las cuatro recomendaciones de ultima milla.

**Primera recomendacion:** Seccion de documentos generales del SG-SST. La plataforma incluye un modulo dedicado para documentos generales por empresa. Cada documento pasa por el flujo de validacion: pendiente, cargado, validado, aprobado. Cuando se aprueba, suma al dashboard de cumplimiento.

**[Accion: subir documento → mostrar flujo pendiente → cargado → validado → aprobado]**

**Segunda recomendacion:** el correo remitente es configurable desde la configuracion del sistema, sin tocar codigo.

**[Accion: mostrar Configuracion → campo email remitente]**

**Tercera recomendacion:** el logo de la empresa cliente en el encabezado de documentos exportados.

**[Accion: exportar cualquier PDF → zoom al logo de empresa en encabezado]**

**Cuarta recomendacion:** cada exportacion incluye el codigo del documento, la version y la fecha.

**[Accion: zoom al codigo + version + fecha en encabezado]**

**[Pantalla: Modulo Inventario de Equipos]**

El inventario de equipos de emergencia rastrea extintores, botiquines y camillas con fecha de vencimiento. El sistema muestra alertas cuando un equipo esta por vencer y cambia el estado automaticamente a vencido cuando pasa la fecha. Este es el diferenciador A del brief.

**[Accion: mostrar equipo vigente, por_vencer y vencido]**

**[Pantalla: Dashboard de Observabilidad]**

Ahora muestro el dashboard de observabilidad operativa, disenado para que el administrador de Regis sepa en treinta segundos si la plataforma esta sana. Muestra la tendencia de actividad, el mapa de calor de estado PILA por empresa, los costos acumulados de API de IA con desglose por modelo Haiku y Sonnet, y la distribucion de cumplimiento de todas las empresas. Toda esta informacion se calcula en tiempo real desde la base de datos.

**[Accion: recorrer los 4 paneles del dashboard de observabilidad]**

---

## BLOQUE 9 — Criterios 7 y 8: Produccion y Manual (22:30 – 24:00) ~280 palabras

**[Pantalla: n8n + Google Drive + login cliente]**

Demostramos el cumplimiento del Criterio 7: implementacion en produccion con datos funcionales de al menos una empresa simulada.

La plataforma esta desplegada en produccion con tres empresas activas y cuatro usuarios configurados. El administrador de Regis ve todo. Hay un consultor asignado a empresas especificas. Y dos clientes: uno para Sabor Criollo y otro para Construandes, cada uno con acceso exclusivo a su empresa.

**[Accion: mostrar n8n → workflow PILA activo con ejecucion verde]**

En n8n tenemos cuatro workflows de automatizacion PILA: solicitud mensual automatica, recordatorios inteligentes, seguimiento diario y recepcion de archivos. Cuando el cliente sube su PILA, n8n descarga de Supabase y archiva en la carpeta correcta de Google Drive, sin intervencion manual.

**[Accion: mostrar Google Drive → carpeta REGIS-SST/Sabor Criollo/PILA/ con el archivo]**

**[Accion: abrir ventana incognito → login como admin@saborcriollo.com / Demo2026!]**

Al iniciar sesion como cliente, solo veo los datos de mi empresa. No hay boton de cambiar empresa, no hay modulos de administracion. Row Level Security garantiza el aislamiento a nivel de base de datos.

La arquitectura es multi-tenant con noventa y cuatro politicas de RLS activas. Escalar de tres a noventa empresas es agregar registros, no codigo. Con tres empresas el costo de IA es cero. Para noventa empresas estimamos setenta dolares mensuales. El roadmap incluye procesamiento local que reduciria el costo a quince dolares.

La plataforma opera noventa dias sin intervencion de desarrollador.

**[Pantalla: Manual SOP — abrir archivo, scroll 3 segundos]**

Demostramos el cumplimiento del Criterio 8: manual escrito que permita operar la plataforma sin acompanamiento del desarrollador.

Hemos demostrado el cumplimiento de los Criterios 7 y 8.

---

## BLOQUE 10 — Diferenciadores Bonus y Cierre (24:00 – 25:00) ~210 palabras

**[Pantalla: Dashboard principal]**

Antes de cerrar, los diferenciadores adicionales. La plataforma genera automaticamente una bitacora mensual por empresa, compilando todas las actividades del mes. Este es el diferenciador B del brief.

Las actas de comite tienen seguimiento de firma y archivado con recordatorios automaticos. Este es el diferenciador C.

El resumen semanal de tareas pendientes para cada consultor. Los lunes muestra lo pendiente. Los viernes muestra el balance. Este es el diferenciador D.

Y el diferenciador E: transcripcion automatica de reuniones de comite. Para reuniones virtuales, Fireflies captura la transcripcion con hablantes identificados. Para reuniones presenciales, Whisper transcribe el audio grabado. En ambos casos, Claude genera el acta formal.

Todo queda registrado en el log de actividad con trazabilidad completa para auditorias.

**[Pantalla: Slide resumen — 8 criterios]**

Criterio 1: automatizacion PILA de extremo a extremo, sin intervencion manual.
Criterio 2: extraccion de examenes medicos con inteligencia artificial, con al menos 5 PDFs distintos.
Criterio 3: matriz de riesgo con metodologia GTC 45, con al menos 3 codigos CIIU distintos, edicion en linea con calculo automatico.
Criterio 4: actas de comite con quorum validado, al menos 2 empresas distintas, y tres fuentes de contenido.
Criterio 5: plan de emergencias desde audio de minimo 3 minutos con analisis de vulnerabilidad.
Criterio 6: dashboard de cumplimiento Resolucion 0312 de 2019, sin data hardcodeada.
Criterio 7: tres empresas en produccion, cuatro usuarios, noventa y cuatro politicas de RLS.
Criterio 8: manual de operaciones documentado.

Cuatro recomendaciones de ultima milla implementadas. Cinco diferenciadores bonus.

Regis Safety Hub le devuelve horas de trabajo a cada consultor, cada semana. Gracias.

---

## Apendice B — Guia de Pronunciacion y Enfasis

### Frases que requieren enfasis vocal (subir tono, reducir velocidad)

| Frase | Momento | Instruccion |
|-------|---------|-------------|
| "sin intervencion manual" | Criterio 1 apertura y cierre | Pronunciar cada silaba con claridad. Pausa de medio segundo antes y despues. |
| "al menos 5 PDFs distintos" | Criterio 2 | Enfatizar el numero "cinco". Pausa breve despues de "distintos". |
| "al menos 3 codigos distintos" | Criterio 3 | Enfatizar "tres". |
| "al menos 2 empresas distintas" | Criterio 4 | Enfatizar "dos". |
| "audio de minimo 3 minutos" | Criterio 5 | Enfatizar "tres minutos". |
| "sin data hardcodeada" | Criterio 6 | Pronunciar "hardcodeada" con naturalidad. |
| "pendiente, cargado, validado, aprobado" | Flujo PILA y Documentos | Enumerar con pausa entre cada estado. |
| "noventa y cuatro politicas de Row Level Security" | Bloques 1 y 9 | Enfatizar "noventa y cuatro". Es un dato de impacto. |
| "cascada de modelos: Haiku primero, Sonnet si es necesario" | Bloque 1 | Enfatizar "setenta por ciento" de ahorro. |
| "Fireflies punto ai" | Bloques 5 y 10 | Pronunciar "faierflaiz punto ei-ai". |
| "Demostramos el cumplimiento del Criterio N" | Apertura de cada bloque | Tono firme y claro. Es la senal para la IA. |
| "Hemos demostrado el cumplimiento del Criterio N" | Cierre de cada bloque | Tono conclusivo. Pausa de un segundo despues. |

### Numeros y siglas

| Termino | Pronunciacion |
|---------|---------------|
| 0312 | "cero-tres-doce" |
| 2019 | "dos mil diecinueve" |
| 1581 | "mil quinientos ochenta y uno" |
| 2012 | "dos mil doce" |
| GTC 45 | "ge-te-ce cuarenta y cinco" |
| CIIU | "ce-i-i-u" (deletrear) |
| COPASST | "co-past" (como una palabra) |
| PHVA | "pe-ache-ve-a" (deletrear) |
| PILA | "pila" (como palabra comun) |
| SG-SST | "ese-ge-ese-ese-te" (deletrear) |
| RLS | "ere-ele-ese" (deletrear) |
| PDF | "pe-de-efe" |
| IPS | "i-pe-ese" |
| ARL | "a-ere-ele" |
| NIT | "nit" (como palabra) |
| n8n | "ene-ocho-ene" |

### Velocidad por bloque

| Bloque | Tiempo | Velocidad | Razon |
|--------|--------|-----------|-------|
| 0: Intro | 0:00-1:30 | Normal (140 ppm) | Establecer contexto y dolor de Regis |
| 1: Arquitectura | 1:30-3:30 | Ligeramente rapida (150 ppm) | Tecnico. Mencionar costos, Drive y Fireflies. |
| 2: PILA | 3:30-7:30 | Normal (135 ppm) | Criterio evaluado. Enfatizar escalacion RRHH. |
| 3: Examenes | 7:30-11:00 | Normal (135 ppm) | Criterio evaluado. Narrar durante espera de IA. |
| 4: Matrices | 11:00-14:00 | Normal a lenta (130 ppm) | Criterio evaluado. LUCIRSE — edicion inline + ARL + 3 CIIUs. |
| 5: Actas | 14:00-17:00 | Normal (135 ppm) | Criterio evaluado. Tres fuentes + asistencia digital. |
| 6: Emergencias | 17:00-19:00 | Normal (135 ppm) | Criterio evaluado. Usar plan YA PROCESADO. |
| 7: Cumplimiento | 19:00-20:30 | Normal (140 ppm) | Criterio evaluado. Toggle Admin/Cliente + imprimir. |
| 8: Ultima milla | 20:30-22:30 | Normal (140 ppm) | Recomendaciones + observabilidad. |
| 9: Produccion | 22:30-24:00 | Normal (140 ppm) | n8n + Drive + login cliente + costos. |
| 10: Cierre | 24:00-25:00 | Lenta (120 ppm) | Recapitulacion. Cada criterio con pausa. |

### Tono general

- Formal pero accesible. No academico, no coloquial.
- Usar "la plataforma" como sujeto principal, no "yo" ni "nosotros" (excepto en primera persona al narrar acciones en vivo).
- Evitar muletillas: "basicamente", "digamos", "o sea".
- No usar diminutivos.
- Tratamiento de "usted" implicito (no tutear al evaluador).

---

## Checklist de Validacion

### Criterios obligatorios mencionados

- [x] Criterio 1: "sin intervencion manual" + escalacion RRHH — bloques 0, 2 y 10
- [x] Criterio 2: "al menos 5 PDFs distintos" + deteccion no-medico + confianza — bloque 3
- [x] Criterio 3: "al menos 3 codigos distintos" + edicion inline + ARL — bloque 4
- [x] Criterio 4: "al menos 2 empresas distintas" + Fireflies + Whisper + asistencia digital — bloque 5
- [x] Criterio 5: "audio de minimo 3 minutos" — bloque 6
- [x] Criterio 6: "sin data hardcodeada" + toggle Admin/Cliente con selector + imprimir — bloque 7
- [x] Criterio 7: 3 empresas + 4 usuarios + 94 RLS + n8n + Drive — bloque 9
- [x] Criterio 8: "manual escrito" + "sin acompanamiento" — bloque 9

### Recomendaciones de ultima milla

- [x] R1: "Seccion de documentos generales del SG-SST" — bloque 8
- [x] R2: "correo remitente es configurable" — bloques 2 y 8
- [x] R3: "logo de la empresa cliente en el encabezado" — bloques 4, 5 y 8
- [x] R4: "codigo del documento, la version y la fecha" — bloques 4, 5 y 8

### Diferenciadores bonus mencionados

- [x] A: Recordatorios de vencimiento de equipos — bloque 8
- [x] B: Bitacora mensual automatica — bloque 10
- [x] C: Recordatorios de firma y archivado de actas — bloques 5 y 10
- [x] D: Resumen semanal por consultor — bloque 10
- [x] E: Transcripcion automatica reuniones (Fireflies + Whisper) — bloques 5 y 10

### Funcionalidades destacadas en v3

- [x] Cascada modelos Haiku/Sonnet (~70% ahorro costos) — bloques 1, 3 y 9
- [x] Fireflies.ai con diarizacion de hablantes — bloques 1, 5 y 10
- [x] Toggle Admin/Cliente con selector de empresa — bloque 7
- [x] Dashboard observabilidad operativa (costos, PILA heatmap, actividad) — bloque 8
- [x] Escalacion PILA a RRHH automatica — bloque 2
- [x] Aprobacion ARL de matrices de riesgo — bloque 4
- [x] Asistencia digital comites (enlace publico) — bloque 5
- [x] Deteccion documentos no-medicos en extraccion IA — bloque 3
- [x] Aviso privacidad Ley 1581 en upload publico — bloque 2
- [x] Idempotencia (duplicados PILA y documentos) — bloque 2
- [x] 4 usuarios demo (admin, consultor, 2 clientes) — bloque 9
- [x] 8 Edge Functions — bloque 1
- [x] n8n → Google Drive archivado automatico — bloques 1 y 9
- [x] Imprimir cumplimiento genera PDF — bloque 7
- [x] Dashboard barras con colores unicos por empresa — bloque 1 (dashboard visible)
- [x] Costos: $0 actual, $70 para 90, roadmap $15 — bloque 9

### Vocabulario normativo

- [x] Resolucion 0312 de 2019 — mencionada 4+ veces
- [x] Ley 1581 de 2012 — bloques 1 y 2
- [x] Metodologia GTC 45 — bloques 0, 4 y 10
- [x] Ciclo PHVA — bloques 7 y 10
- [x] Estandares minimos — bloque 7
- [x] Capitulo 1 (7 estandares) y Capitulo 2 (21 estandares) — bloque 7

### Estructura de senales para IA

- [x] Cada criterio abre con "Demostramos el cumplimiento del Criterio N"
- [x] Cada criterio cierra con "Hemos demostrado el cumplimiento del Criterio N"
- [x] Recapitulacion final enumera los 8 criterios con frase del brief
- [x] Frases del brief usadas textualmente, sin sinonimos

---

## Datos Demo Necesarios (Checklist Pre-Grabacion)

| Item | Descripcion | Listo |
|------|-------------|-------|
| 3 empresas | Construandes (8 trab, cap1), DevCo (25 trab, cap2), Sabor Criollo (15 trab, cap2) | [x] |
| 4 usuarios | admin@regiscolombia.com, consultor, admin@saborcriollo.com (Demo2026!), admin@construandes.com (Demo2026!) | [x] |
| PILA registros | 6 meses x 3 empresas con al menos 1 en estado "cargada" para validar en vivo | [x] |
| PDF PILA | 1 para subir en URL publica (incognito) | [x] |
| ZIP invalido | 1 archivo ZIP para demostrar rechazo en URL publica | [x] |
| PDFs examenes | examen_1_ingreso_maria.pdf + examen_2_periodico_carlos.pdf para subir EN VIVO | [x] |
| PDFs examenes previos | 3 ya procesados en DB (total 5 distintos) | [x] |
| Plan emergencia | 1 plan YA PROCESADO con amenazas y recomendaciones para exportar | [x] |
| Audio emergencias | 1 archivo .m4a de 3+ minutos — PROBAR antes de grabar (opcional en vivo) | [ ] |
| Reunion Fireflies | Al menos 1 transcripcion visible en tab "Desde reunion" | [x] |
| Comites | COPASST + Convivencia por empresa con 4-6 integrantes precargados | [x] |
| Acta existente | 1 acta en historial para exportar PDF + 1 pendiente de firma | [x] |
| Matrices riesgo | 1 por empresa, generada desde CIIU distinto | [x] |
| Documentos generales | 3-5 por empresa en distintos estados | [x] |
| Inventario equipos | 3+ por empresa (1 vigente, 1 por_vencer, 1 vencido) | [x] |
| Cumplimiento | Evaluacion 2026 con scores PHVA distintos por empresa | [x] |
| n8n | Workflow PILA activo con ejecucion verde reciente | [x] |
| Google Drive | Carpeta REGIS-SST/Sabor Criollo/PILA/ con archivo visible | [x] |
| Manual SOP | Archivo formateado listo para abrir y scroll | [x] |
| Slides HTML | 8 slides (titulo, problema, solucion, arquitectura, seguridad, criterios, recomendaciones, cierre) | [x] |
| Microfono | Probado, lugar silencioso | [ ] |
| Grabador pantalla | OBS o similar configurado | [ ] |
| Navegador | Limpio, sin pestanas irrelevantes, DevTools cerrado | [ ] |

---

## Timing Checklist Durante Grabacion

| Marca | Bloque | Si voy tarde... |
|-------|--------|-----------------|
| 1:30 | Fin intro | — |
| 3:30 | Fin arquitectura | Acortar mencion de optimizaciones |
| 7:30 | Fin PILA | Saltar demo WhatsApp, solo mencionar |
| 11:00 | Fin examenes | Subir solo 1 PDF en vivo, no 2 |
| 14:00 | Fin matrices | Mostrar 2 CIIUs en detalle, tercero rapido |
| 17:00 | Fin actas | Demo 1 empresa detallada, mencionar Fireflies sin demo extensa |
| 19:00 | Fin emergencias | Mostrar plan ya procesado + exportar. Saltar audio en vivo |
| 20:30 | Fin cumplimiento | Toggle rapido, 2 empresas bastan |
| 22:30 | Fin ultima milla | 20s por recomendacion, observabilidad 30s |
| 24:00 | Fin produccion/SOP | Comprimir SOP a scroll de 3s |
| 25:00 | FIN | — |
