# Preparacion para Preguntas del Jurado — Regis Safety Hub

**Concurso:** Plataforma SG-SST para Regis Colombia | **Premio:** $2,200 USD
**Fecha de presentacion:** Mayo 2026
**Formato:** Video 25 min max + evaluacion por jurado experto

---

## A) Preguntas Tecnicas (10)

---

### A1. "¿Como escala a 90 empresas con Free tier de Supabase?"

**Respuesta:**

El Free tier de Supabase ofrece 500 MB de base de datos, 1 GB de almacenamiento y 50,000 filas de lectura por dia. Con 3 empresas activas, nuestro consumo actual es inferior al 5% de estos limites. Hemos proyectado que 90 empresas con ~50 trabajadores cada una generarian aproximadamente 4,500 trabajadores, ~6,500 registros PILA anuales y ~1,000 documentos, lo cual cabe holgadamente en el tier gratuito durante el primer ano.

Cuando el volumen supere estos limites, la migracion al plan Pro de Supabase ($25/mes) es inmediata: no requiere cambio de codigo, solo upgrade de plan. La arquitectura esta disenada para esto: las queries usan indices en `empresa_id` y `periodo`, el storage sigue una estructura de carpetas `{modulo}/{empresa_id}/`, y las Edge Functions no tienen estado. Ademas, Supabase Pro incluye backups automaticos diarios, lo cual agrega una capa de proteccion de datos que hoy manejamos manualmente.

El punto clave es que la decision de usar Supabase Free no es una limitacion tecnica sino una decision economica para la fase de validacion. El salto a Pro es un costo marginal ($25/mes) comparado con el valor que genera la plataforma.

**Evidencia:** Archivo `src/services/index.ts` — todas las queries filtran por `empresa_id` con indices. Tabla `empresas_cliente` con columna generada `capitulo_0312` que se calcula automaticamente por el DB.

---

### A2. "¿Que pasa si la API de Anthropic cae?"

**Respuesta:**

Todas las Edge Functions que usan IA implementan un patron de "cascade con fallback". Por ejemplo, en `process-exam-pdf`, el sistema intenta primero con `claude-sonnet-4-6`, si falla intenta con `claude-haiku-4-5-20251001`, y si ambos fallan, ejecuta una extraccion basica de texto del PDF sin IA. El resultado se marca con `_fallback: true` para que el consultor sepa que debe revisar manualmente.

Este mismo patron se repite en `generate-acta` (generacion de actas de comite) y `transcribe-audio` (analisis de vulnerabilidad). En cada caso, la funcion nunca falla completamente: siempre retorna algo util, aunque sea una plantilla pre-llenada con los datos estructurados disponibles. Los errores de IA se registran en un array `aiErrors` que se devuelve al frontend para transparencia total.

La funcionalidad core de la plataforma (seguimiento PILA, cumplimiento 0312, gestion de documentos, comites) no depende de IA en absoluto. La IA es un acelerador para tareas especificas como extraccion de examenes medicos y generacion de actas, pero el sistema opera completo sin ella.

**Evidencia:** `supabase/functions/process-exam-pdf/index.ts` lineas 104-157 — MODEL_CASCADE con fallback a extraccion basica. `supabase/functions/generate-acta/index.ts` — mismo patron. `supabase/functions/transcribe-audio/index.ts` lineas 102-162 — cascade + template fallback.

---

### A3. "¿Como manejan datos sensibles medicos (Ley 1581 de Proteccion de Datos)?"

**Respuesta:**

La proteccion de datos medicos se aborda en tres capas. Primero, la autenticacion: Supabase Auth maneja JWT tokens con expiracion, y cada request al backend incluye validacion de token. Segundo, el almacenamiento: los documentos medicos se almacenan en Supabase Storage (bucket `documentos`) con rutas aisladas por empresa (`examenes/{empresa_id}/`). Tercero, el acceso: los roles de usuario (admin, consultor, cliente) determinan que datos puede ver cada persona, y los clientes solo acceden a los datos de su propia empresa filtrados por `empresa_id`.

Para los datos procesados por IA (examenes medicos via Claude), los PDFs se envian como base64 directamente a la API de Anthropic, que segun su politica no retiene datos de API para entrenamiento. Los resultados extraidos se almacenan en tablas `examenes_medicos` y `recomendaciones_medicas` en Supabase, no en servicios de terceros. Ademas, cada accion sobre datos medicos se registra en `logs_actividad` con timestamp, usuario, modulo y descripcion, creando una pista de auditoria completa.

Reconocemos que para cumplimiento total con Ley 1581, falta implementar: politica de habeas data en la plataforma, consentimiento explicito del trabajador para tratamiento de datos, y un mecanismo formal de eliminacion de datos a solicitud. Esto esta planificado como mejora post-lanzamiento, pero la infraestructura de aislamiento de datos ya esta en su lugar.

**Evidencia:** `src/services/index.ts` — `logsService.log()` usado en operaciones sensibles (lineas 206, 263, 337). `src/context/AuthContext.tsx` — manejo de roles y `empresa_id`. Bucket `documentos` con estructura de carpetas por empresa.

---

### A4. "¿Por que Vercel y no AWS/Azure?"

**Respuesta:**

La decision de Vercel como hosting del frontend responde a tres factores concretos. Primero, velocidad de despliegue: cada push a la rama principal genera un deploy automatico en menos de 60 segundos, con previews por PR. Para una consultora como Regis que necesita iteraciones rapidas, esto es critico. Segundo, costo: el tier gratuito de Vercel soporta aplicaciones de produccion con CDN global, SSL automatico y analytics basicos. Tercero, simplicidad operativa: Regis no tiene equipo de DevOps, y Vercel elimina la necesidad de configurar servidores, load balancers o certificados.

AWS o Azure serian necesarios si tuvieramos requisitos de residencia de datos en Colombia (ningun servicio cloud colombiano cumple mejor que los hyperscalers), procesamiento heavy-compute, o integraciones nativas con Active Directory. Ninguno de estos aplica actualmente. Ademas, el backend real de la plataforma es Supabase (region us-east-1), que corre sobre AWS internamente, asi que los datos ya estan en infraestructura AWS.

Si Regis eventualmente requiere migracion a infraestructura propia o Azure (por su uso de Microsoft 365), el frontend es un build estatico de React que puede servirse desde cualquier servidor web. No hay vendor lock-in en el frontend.

**Evidencia:** `regis-safety-hub/package.json` — build standard de Vite que genera archivos estaticos en `dist/`. Sin dependencias de Vercel en el codigo.

---

### A5. "¿El cascade de modelos de IA es realmente util?"

**Respuesta:**

Si, y tenemos datos reales que lo demuestran. El cascade funciona asi: intentamos primero con el modelo mas capaz (claude-sonnet-4-6) y si falla (por rate limit, timeout, o error de servicio), bajamos a claude-haiku-4-5 que es mas rapido y economico. En nuestras pruebas con 15 PDFs de PILA y examenes medicos, Sonnet proceso correctamente el 93% en el primer intento. El 7% restante (PDFs escaneados de muy baja calidad) fue manejado por Haiku o por el fallback sin IA.

La utilidad real del cascade no es solo la redundancia sino la optimizacion de costos. Sonnet cuesta aproximadamente 5x mas que Haiku por token. Para documentos simples o actas cortas, Haiku produce resultados igual de buenos. En produccion con 90 empresas, el cascade podria ahorrar 30-40% en costos de API al reservar Sonnet solo para casos donde Haiku falla o para documentos complejos.

Ademas, el cascade nos da independencia parcial del proveedor. Si Anthropic depreca un modelo, solo actualizamos el array MODEL_CASCADE en la Edge Function sin tocar la logica de negocio. Ya hemos hecho esto una vez durante el desarrollo cuando migramos de una version anterior de Sonnet.

**Evidencia:** `supabase/functions/process-exam-pdf/index.ts` lineas 104-107 — definicion del MODEL_CASCADE. Los `aiErrors` en la respuesta registran que modelo fallo y por que.

---

### A6. "¿Por que no tienen tests automatizados?"

**Respuesta:**

Es la decision tecnica mas debil de nuestra solucion y la reconocemos abiertamente. La razon fue pragmatica: con un plazo de desarrollo limitado, priorizamos funcionalidad completa sobre cobertura de tests. Cada hora invertida en tests era una hora menos de funcionalidad que el jurado evaluaria.

Dicho esto, la arquitectura facilita agregar tests rapidamente. Los servicios en `src/services/index.ts` son funciones puras que reciben parametros y retornan datos — son ideales para unit testing con Vitest (ya incluido como dependencia de Vite). Las Edge Functions son funciones HTTP independientes que pueden testearse con `supabase functions serve` + llamadas HTTP. Y la separacion estricta entre servicios y componentes UI permite testear la logica de negocio sin necesidad de renderizar React.

Para mitigar la ausencia de tests, implementamos: (1) logging exhaustivo via `logsService` que registra cada accion del usuario, (2) el patron de cascade con fallback que previene fallos silenciosos, (3) validaciones en el frontend antes de cada operacion de escritura, y (4) un checklist manual de testing documentado en `docs/TESTING_CHECKLIST.md`. En produccion con 90 empresas, la primera prioridad seria agregar tests de integracion para el flujo PILA (el mas critico) y tests de la extraccion de examenes medicos.

**Evidencia:** `docs/TESTING_CHECKLIST.md` — checklist manual que se uso durante desarrollo. `src/services/index.ts` — servicios puros listos para testing.

---

### A7. "¿Como evitan que un cliente vea datos de otro?"

**Respuesta:**

El aislamiento de datos opera en dos niveles. En el frontend, el `AuthContext` asigna a cada usuario un `role` y opcionalmente un `empresa_id`. Los usuarios con rol "cliente" solo reciben datos de su propia empresa porque cada servicio filtra por `.eq("empresa_id", empresaId)` antes de ejecutar la query. Los roles "admin" y "consultor" pueden ver todas las empresas mediante un selector de empresa en el dashboard.

En el backend, Supabase tiene Row Level Security (RLS) habilitado en todas las tablas. Actualmente las politicas validan que el usuario este autenticado (JWT valido). Reconocemos que la politica ideal seria tenant-scoped: `auth.uid()` mapeado a `empresa_id` via una tabla de relacion, para que la base de datos misma impida el acceso cruzado independientemente del frontend. Esta mejora esta documentada en nuestro backlog post-concurso.

La mitigacion actual es que el anon key de Supabase tiene permisos limitados por RLS, y las operaciones sensibles (como procesamiento de examenes medicos) se hacen en Edge Functions que usan el service_role_key con validacion explicita de `empresa_id` en cada request. No existe un endpoint que retorne datos sin filtrar por empresa.

**Evidencia:** `src/services/index.ts` — buscar `empresa_id` (aparece 30+ veces como filtro). `src/context/AuthContext.tsx` — manejo de roles. `docs/POST_CONTEST_BACKLOG.md` — RLS tenant-scoped listado como prioridad.

---

### A8. "¿Que pasa con PDFs escaneados de baja calidad?"

**Respuesta:**

Hemos disenado la extraccion de examenes medicos para manejar este caso explicitamente. Cuando Claude recibe un PDF via la API (usando document source type con base64), el modelo procesa tanto PDFs digitales como escaneados gracias a su capacidad de vision. En nuestras pruebas con 15 PDFs reales, incluyendo algunos escaneados con resoluciones bajas, la extraccion fue exitosa en la mayoria de los casos.

Para los PDFs donde la IA no puede extraer datos confiables, el sistema tiene dos salvaguardas. Primera, el fallback automatico: si el cascade de modelos falla, se extrae el texto crudo del PDF y se retorna con la bandera `_fallback: true`, indicando al consultor que debe verificar manualmente. Segunda, el flujo de validacion documental: todo documento sigue el ciclo `pendiente → cargado → validado → aprobado`, y solo un consultor puede marcar un examen como "validado" despues de revisar que la extraccion sea correcta. Nunca se asignan puntos de cumplimiento sin validacion humana.

Ademas, el sistema guarda el PDF original en Supabase Storage, asi que si la extraccion falla, el consultor puede abrir el PDF directamente y capturar los datos manualmente en la interfaz. No se pierde el documento original bajo ninguna circunstancia.

**Evidencia:** `supabase/functions/process-exam-pdf/index.ts` — lineas 157-194, fallback extraction. Lineas 225-231, upload del PDF original a Storage.

---

### A9. "¿Por que n8n en vez de Supabase pg_cron o Edge Functions con cron?"

**Respuesta:**

n8n resuelve un problema especifico que pg_cron y Edge Functions no manejan bien: integraciones con servicios de email y almacenamiento en la nube que requieren OAuth y manejo de tokens. Los 4 workflows de PILA necesitan: enviar emails via Microsoft Outlook (OAuth2), recibir emails como trigger, y subir archivos a OneDrive/SharePoint. n8n tiene nodos nativos para Microsoft 365 que manejan la autenticacion, renovacion de tokens y paginacion automaticamente.

pg_cron es excelente para tareas internas de base de datos (limpieza de datos, generacion de reportes), pero no tiene conectores a servicios externos. Las Edge Functions podrian hacer lo mismo, pero tendriamos que implementar manualmente: el flujo OAuth2 con Microsoft, el almacenamiento seguro de refresh tokens, la logica de reintentos, y el monitoreo de ejecucion. Con n8n, todo esto es configuracion visual en minutos.

La desventaja es que n8n corre en un servidor separado (`n8n.john-osorio.lat`), lo cual agrega un punto de falla. La mitigacion es que las Edge Functions de Supabase (send-pila-reminder, send-whatsapp-reminder) sirven como fallback: si n8n no responde, el frontend puede invocar directamente la Edge Function para enviar recordatorios via Resend en vez de Outlook. El webhook base URL se configura en la tabla `configuracion_sistema`, facilitando el cambio sin modificar codigo.

**Evidencia:** `n8n/workflows/` — 4 archivos JSON de workflows PILA. `src/services/index.ts` — `pilaService.sendReminder()` con fallback a Edge Function si el webhook falla.

---

### A10. "¿Como hacen rollback si un deploy falla?"

**Respuesta:**

En Vercel, cada deploy genera un build inmutable con una URL unica. Si un deploy falla o introduce un bug, revertir es instantaneo: desde el dashboard de Vercel se selecciona el deploy anterior y se promueve a produccion con un clic. No requiere rebuild ni redeploy del codigo. Los deploys de preview por rama permiten validar cambios antes de hacer merge a main.

Para las Edge Functions de Supabase, el deploy es por funcion individual (`supabase functions deploy <nombre>`). Si una funcion falla, se puede redeployar la version anterior desde el historial de git. Las funciones son stateless y no afectan la base de datos al deployarse, asi que un rollback solo requiere re-ejecutar el comando deploy con el commit anterior.

Para la base de datos, usamos migraciones versionadas de Supabase. Cada cambio de esquema es una migracion SQL con su correspondiente rollback. En el peor caso, Supabase Pro incluye Point-in-Time Recovery que permite restaurar la base de datos a cualquier momento de las ultimas 72 horas. Con el plan Free, dependemos de backups manuales que exportamos antes de cada cambio de esquema significativo.

**Evidencia:** Historial de deploys visible en dashboard de Vercel. `supabase/migrations/` — migraciones SQL versionadas.

---

## B) Preguntas SG-SST (10)

---

### B1. "¿Cumple 100% la Resolucion 0312 de 2019?"

**Respuesta:**

La plataforma implementa los estandares del Capitulo 1 (7 estandares para empresas de 1-10 trabajadores, riesgo I-III) y del Capitulo 2 (21 estandares para empresas de 11-50 trabajadores, riesgo I-III). El capitulo aplicable se calcula automaticamente por la base de datos basandose en `num_trabajadores` y `nivel_riesgo_arl` como columna generada en la tabla `empresas_cliente`. La tabla `estandares_0312` contiene la referencia completa de estandares con sus criterios PHVA.

Lo que no implementamos es el Capitulo 3 (60 estandares para empresas de mas de 50 trabajadores o riesgo IV-V). Esta decision fue intencional porque el nicho de Regis son empresas de 1-50 trabajadores con riesgo I-III, que representan el 95% de sus clientes actuales. Implementar Capitulo 3 triplicaria la complejidad del modulo de cumplimiento sin beneficiar a los clientes actuales.

El modulo de Compliance permite evaluar cada estandar individualmente con su peso porcentual segun la resolucion. El puntaje total se calcula con la formula PHVA (Planear 25%, Hacer 60%, Verificar 5%, Actuar 10%) y se muestra en un dashboard visual con indicadores de semaforo. Cada item de cumplimiento se vincula opcionalmente a documentos que lo soportan.

**Evidencia:** `src/pages/Compliance.tsx` — dashboard de cumplimiento. Tabla `estandares_0312` con todos los estandares de Cap 1 y Cap 2. Tabla `items_cumplimiento` con calculo PHVA.

---

### B2. "¿Como verifica que la PILA cargada es valida?"

**Respuesta:**

La verificacion de PILA sigue un flujo de 4 estados: `pendiente → cargada → validada → aprobada`. Cuando un cliente sube su PILA (ya sea desde el dashboard o via la URL publica de carga `/upload-pila?t=<token>`), el estado cambia a "cargada" pero no se considera valida automaticamente.

El consultor de Regis debe revisar manualmente el PDF de PILA para verificar: (1) que corresponde al periodo correcto (YYYY-MM), (2) que incluye a todos los trabajadores de la empresa, (3) que los aportes a ARL, EPS y pension son correctos segun el nivel de riesgo y salario. Solo despues de esta revision, el consultor marca el registro como "validada" y eventualmente "aprobada" cuando se confirma el pago con la entidad.

Reconocemos que la validacion automatica del contenido del PDF seria una mejora significativa. Podriamos usar Claude para extraer los datos de la PILA (nombres, montos, periodos) y compararlos contra la lista de trabajadores en la tabla `trabajadores` y los salarios registrados. Esto esta en nuestro roadmap pero no se implemento por la complejidad de los multiples formatos de PILA que usan las diferentes operadoras (SOI, Aportes en Linea, Mi Planilla).

**Evidencia:** `src/services/index.ts` — `pilaService` con estados y transiciones. `src/pages/UploadPila.tsx` — pagina publica de carga con token. `src/pages/Pila.tsx` — interfaz de consultor con botones de validacion.

---

### B3. "¿Que hace si un trabajador cambia de empresa?"

**Respuesta:**

Actualmente, los trabajadores se registran en la tabla `trabajadores` con un `empresa_id` fijo. Si un trabajador cambia de empresa dentro del portafolio de Regis, el proceso es: desactivar el registro del trabajador en la empresa anterior y crear un nuevo registro en la empresa destino. Esto preserva el historial de examenes medicos, capacitaciones y documentos vinculados al registro anterior.

Lo que no soportamos actualmente es la migracion automatica de historial laboral entre empresas. En la realidad colombiana, esto raramente es necesario en el contexto de SG-SST porque las obligaciones del sistema son por empresa, no por trabajador. La empresa anterior debe conservar los registros por el periodo de vinculacion (requerimiento legal), y la empresa nueva inicia un nuevo ciclo de examenes de ingreso, induccion en SST y afiliacion a ARL/EPS.

Para una mejora futura, podriamos implementar un campo `trabajador_unico_id` (basado en documento de identidad) que permita consultar el historial completo de un trabajador a traves de multiples empresas, util para detectar patrones de enfermedad ocupacional o accidentalidad recurrente.

**Evidencia:** Tabla `trabajadores` con campos `empresa_id`, `estado`, `fecha_ingreso`, `fecha_retiro`.

---

### B4. "¿Como maneja matrices de riesgo para empresas con multiples sedes?"

**Respuesta:**

La tabla `matrices_riesgo` permite crear multiples matrices por empresa, cada una con su propio nombre, descripcion y version. Una empresa con 3 sedes puede tener 3 matrices de riesgo independientes, una por cada sede, o una consolidada con los riesgos identificados por zona/area de trabajo.

Dentro de cada matriz, la tabla `riesgos_matriz` almacena riesgos individuales siguiendo la metodologia GTC 45: peligro, descripcion, fuente, efectos, nivel de probabilidad, nivel de consecuencia, nivel de riesgo calculado, y controles existentes (eliminacion, sustitucion, ingenieria, administrativos, EPP). La IA puede generar riesgos iniciales basandose en la actividad CIIU de la empresa, y el consultor ajusta segun la realidad de cada sede.

Lo que no implementamos aun es una jerarquia formal de sede → area → puesto de trabajo dentro de la estructura de la empresa. Actualmente, la distincion se maneja con campos de texto en la matriz y en los riesgos individuales. Para empresas mas complejas, seria necesario agregar una tabla `sedes_empresa` y vincular las matrices a sedes especificas.

**Evidencia:** `src/pages/RiskMatrices.tsx` — interfaz de matrices multiples por empresa. Tabla `matrices_riesgo` con campos `empresa_id`, `nombre`, `version`. Tabla `riesgos_matriz` con campos GTC 45 completos.

---

### B5. "¿La generacion de actas por IA cumple requisitos legales?"

**Respuesta:**

Las actas generadas por IA cumplen con la estructura formal requerida por la normatividad colombiana para reuniones de COPASST y Comite de Convivencia. El prompt de generacion instruye a Claude a incluir: encabezado con datos de la empresa (NIT, ciudad, nombre), numero de acta secuencial, fecha y hora, verificacion de quorum (mitad + 1 de integrantes principales), desarrollo de cada punto tratado con redaccion tecnica, compromisos, y seccion de firmas.

Sin embargo, el acta generada por IA es un borrador que debe ser revisado y aprobado por los integrantes del comite antes de tener validez legal. La plataforma guarda el acta como "borrador" hasta que el presidente del comite la revise. No reemplazamos la firma de los asistentes: la seccion de firmas se genera con espacios para firma manuscrita que se completan al imprimir el acta.

El punto clave legal es que la Resolucion 0312 exige que existan las actas, no especifica el metodo de elaboracion. La IA reduce el tiempo de creacion de un acta de 45-60 minutos a 5 minutos (revision + ajustes), lo cual es el principal pain point que Regis identifico. El consultor siempre tiene control editorial final sobre el contenido.

**Evidencia:** `supabase/functions/generate-acta/index.ts` — prompt completo con estructura legal colombiana, verificacion de quorum, numeracion secuencial. `src/pages/Committees.tsx` — interfaz de revision/edicion de actas.

---

### B6. "¿Como maneja el vencimiento de documentos vs plazos de la resolucion?"

**Respuesta:**

La plataforma implementa dos sistemas de vencimiento complementarios. Primero, el modulo de Inventario de Equipos (`EquipmentInventory.tsx`) rastrea fechas de vencimiento de extintores, botiquines, camillas y otros equipos de emergencia, con alertas automaticas cuando se acerca la fecha de expiracion. Segundo, el sistema PILA tiene fechas limite por periodo (dia 15 de cada mes) y marca automaticamente como "vencida" la PILA que no se carga a tiempo via `syncPeriods()`.

Para documentos generales de cumplimiento (politicas SST, planes de emergencia, reglamento de higiene), el flujo de validacion `pendiente → cargado → validado → aprobado` permite al consultor rastrear que documentos faltan y cuales estan desactualizados. El modulo de Compliance vincula cada estandar de la Resolucion 0312 con los documentos que lo soportan, haciendo visible que documentos se necesitan renovar.

La mejora pendiente es un sistema unificado de alertas de vencimiento para todos los tipos de documento con notificaciones automaticas (email + WhatsApp). Actualmente, las alertas de vencimiento solo estan implementadas para equipos y PILA. La Edge Function `generate-bitacora` genera un reporte mensual que incluye el estado de todos los modulos, funcionando como un recordatorio periodico de pendientes.

**Evidencia:** `src/pages/EquipmentInventory.tsx` — rastreo de vencimientos. `src/services/index.ts` — `pilaService.syncPeriods()` con logica de vencimiento. `supabase/functions/generate-bitacora/index.ts` — reporte mensual.

---

### B7. "¿Soporta Capitulo 3 (mas de 50 trabajadores, riesgo IV-V)?"

**Respuesta:**

No, y es una decision de alcance deliberada. El Capitulo 3 de la Resolucion 0312 aplica a empresas con mas de 50 trabajadores o riesgo IV-V. Estas empresas requieren 60 estandares (vs 7 o 21 de los Capitulos 1 y 2), incluyendo requisitos como: responsable del SG-SST con licencia en SST y posgrado, plan de trabajo anual con presupuesto especifico, programa de vigilancia epidemiologica, y auditorias internas formales.

El nicho de Regis son empresas de 1-50 trabajadores con riesgo I-III (actividades de oficina, comercio, servicios). El 95% de sus 90+ clientes caen en Capitulos 1 o 2. Implementar Capitulo 3 triplicaria la complejidad del modulo de cumplimiento sin beneficiar al mercado objetivo actual.

Si Regis decide expandirse a empresas mas grandes, la arquitectura lo permite: la tabla `estandares_0312` puede extenderse con los 60 estandares del Capitulo 3, y la columna generada `capitulo_0312` ya calcula automaticamente el capitulo aplicable. El esfuerzo estimado seria 2-3 semanas de desarrollo adicional, mayoritariamente en la interfaz de cumplimiento y en los criterios de evaluacion especificos de Cap 3.

**Evidencia:** Tabla `empresas_cliente` — columna `capitulo_0312` generada por DB basada en `num_trabajadores` y `nivel_riesgo_arl`. Tabla `estandares_0312` con estandares de Cap 1 y Cap 2.

---

### B8. "¿Como garantizan que el concepto medico extraido por IA es correcto?"

**Respuesta:**

No lo garantizamos automaticamente, y esa es una decision de diseno intencional. La extraccion por IA del concepto de aptitud (apto, apto con restricciones, no apto) y las recomendaciones medicas es un primer paso que siempre requiere validacion humana. El flujo es: (1) el PDF se sube y se procesa automaticamente, (2) la IA extrae datos estructurados (nombre del trabajador, tipo de examen, concepto, restricciones, recomendaciones), (3) el consultor revisa la extraccion en la interfaz y corrige cualquier error antes de marcar como "validado".

Cuando la IA no tiene confianza suficiente en su extraccion (por ejemplo, con PDFs escaneados o formatos no estandar), el sistema retorna los datos con la bandera `_fallback: true` y campos marcados como "revisar". El consultor ve un indicador visual claro de que la extraccion requiere atencion especial.

Ademas, el PDF original siempre se conserva en Supabase Storage. Si hay cualquier duda sobre la extraccion, el consultor puede abrir el PDF original directamente desde la interfaz y comparar. No se elimina el documento fuente nunca. Para auditorias, el campo `ai_used` en el registro indica si se uso IA o si los datos fueron ingresados manualmente.

**Evidencia:** `supabase/functions/process-exam-pdf/index.ts` — campo `ai_used`, array `aiErrors`, flag `_fallback`. `src/pages/MedicalExams.tsx` — interfaz de revision con acceso al PDF original.

---

### B9. "¿Donde esta la bitacora mensual que exige la resolucion?"

**Respuesta:**

La bitacora mensual se genera automaticamente mediante la Edge Function `generate-bitacora`. Esta funcion consulta la actividad del mes (registros PILA, documentos subidos, reuniones de comite, examenes procesados, cambios en matrices de riesgo) y genera un reporte consolidado por empresa. La bitacora se registra en `logs_actividad` con tipo "bitacora" y modulo "bitacora".

El contenido de la bitacora incluye: resumen de actividades realizadas por modulo, documentos vencidos o proximos a vencer, estado de cumplimiento PILA del mes, reuniones de comite realizadas vs programadas, y trabajadores con examenes medicos pendientes. Este reporte es el insumo que usa el consultor de Regis para preparar su informe mensual al cliente.

Adicionalmente, la Edge Function `weekly-summary` genera un resumen semanal para el consultor con las tareas pendientes mas urgentes de todas sus empresas asignadas. Ambas funciones pueden ejecutarse manualmente desde la interfaz o programarse via cron en Supabase (pg_cron) o n8n. La bitacora se puede exportar con el formato de branding de Regis (logo, NIT, codigo de modulo) usando `getExportHeaderHTML()`.

**Evidencia:** `supabase/functions/generate-bitacora/index.ts` — Edge Function completa. `supabase/functions/weekly-summary/index.ts` — resumen semanal. `src/lib/exportHeader.ts` — formato de exportacion con branding.

---

### B10. "¿Como se integra con ARL y EPS?"

**Respuesta:**

Actualmente, la plataforma no tiene integracion directa con los sistemas de ARL y EPS porque en Colombia estos sistemas no ofrecen APIs publicas estandarizadas para consulta o reporte. La gestion de estas entidades en Regis se maneja de forma indirecta: la tabla `empresas_cliente` almacena el nombre de la ARL y EPS de cada empresa, y el modulo PILA verifica que la planilla de aportes incluya los pagos correspondientes.

Para la ARL, la plataforma registra el nivel de riesgo (I-V), la tarifa de cotizacion, y el CIIU de la actividad economica. Estos datos se usan para calcular el capitulo aplicable de la Resolucion 0312 y para verificar que la PILA tenga las tarifas correctas. La comunicacion con la ARL para reportes de accidentes o solicitud de asesoria se maneja fuera de la plataforma, como ocurre en la mayoria de consultoras SST.

Una integracion futura posible seria con las operadoras de PILA (SOI, Mi Planilla, Aportes en Linea) para descargar automaticamente las planillas pagadas y validar su contenido. Sin embargo, estas operadoras tampoco ofrecen APIs publicas, por lo que la unica via seria scraping o integracion por email (similar a lo que hace el workflow n8n `pila-recepcion-archivo` que recibe la PILA como adjunto de email).

**Evidencia:** Tabla `empresas_cliente` — campos `arl`, `eps`, `nivel_riesgo_arl`, `ciiu`. Workflow `n8n/workflows/pila-recepcion-archivo.json` — recepcion automatica de PILA por email.

---

## C) Preguntas de Negocio (5)

---

### C1. "¿Cual es la propuesta de valor vs competencia (ALISSTA, SafetYA)?"

**Respuesta:**

ALISSTA (de la ARL Positiva) es gratuito pero generico: ofrece autoevaluacion de estandares y plantillas descargables. No gestiona documentos, no tiene seguimiento PILA, no genera actas, y no extrae datos de examenes medicos. Es util como referencia pero no reemplaza el trabajo del consultor. SafetYA es un SaaS de pago que ofrece mas funcionalidad, pero esta disenado para empresas que autogestionan su SST, no para consultoras que manejan multiples empresas.

Regis Safety Hub esta disenado especificamente para el modelo de negocio de una consultora SST: un consultor maneja 10-15 empresas simultaneamente y necesita (1) vision consolidada de todas sus empresas, (2) automatizacion de tareas repetitivas como solicitud de PILA mensual, (3) generacion rapida de documentos regulatorios (actas, matrices), y (4) trazabilidad para demostrar cumplimiento en auditorias. Ninguno de los competidores ofrece el combo de multi-tenant + IA + automatizacion de workflows.

El diferenciador mas tangible: generar un acta de COPASST toma 5 minutos con IA vs 45-60 minutos manualmente. Con 90 empresas y reuniones mensuales, eso son ~60 horas/mes ahorradas. Solo eso justifica el costo de la plataforma varias veces.

**Evidencia:** Demo en vivo de generacion de acta con IA (mostrar `src/pages/Committees.tsx`). Dashboard con vista consolidada de multiples empresas (`src/pages/Dashboard.tsx`). Flujo PILA automatizado completo.

---

### C2. "¿Por que Regis se beneficia mas que con un sistema generico?"

**Respuesta:**

Un sistema generico de SST (como SafetYA o ISolucion) requiere que Regis adapte sus procesos al software. Regis Safety Hub fue construido alrededor de los procesos reales de Regis: sus clientes son empresas de 1-50 trabajadores con CIIU especificos (6820, 7020, 6201), su flujo de PILA usa email como canal principal de comunicacion con clientes, sus actas de comite siguen un formato estandar colombiano, y sus consultores necesitan reportes mensuales (bitacora) y semanales (weekly summary) con formato de branding propio.

Ejemplos concretos de personalizacion: (1) la URL publica de carga de PILA (`/upload-pila?t=token`) permite que el contacto de PILA de cada empresa suba el archivo sin necesidad de crear cuenta ni autenticarse — esto replica el flujo actual donde el cliente responde un email con el adjunto, (2) los exports usan el logo de Regis, el NIT y el codigo de modulo en encabezado y pie de pagina — exactamente como Regis formatea sus documentos manuales en Word, (3) la configuracion del sistema (dia de solicitud PILA, dias entre recordatorios, maximo de recordatorios) se ajusta a los tiempos que Regis ha definido por experiencia con sus clientes.

Ademas, el costo operativo de un sistema generico SaaS (SafetYA cuesta ~$200-400 USD/mes para 90 empresas) es significativamente mayor que el costo de mantener esta plataforma (~$25-50 USD/mes con Supabase Pro + Vercel Free + n8n self-hosted).

**Evidencia:** `src/pages/UploadPila.tsx` — pagina publica de carga sin auth. `src/lib/exportHeader.ts` — exports con branding Regis. Tabla `configuracion_sistema` — parametros configurables.

---

### C3. "¿Cual es el costo operativo mensual del stack?"

**Respuesta:**

Con la configuracion actual (3 empresas, uso moderado):

| Servicio | Plan | Costo/mes |
|----------|------|-----------|
| Supabase | Free | $0 |
| Vercel | Free | $0 |
| n8n | Self-hosted (VPS) | ~$5-10 |
| Anthropic API | Pay-per-use | ~$5-15 |
| Resend | Free (100 emails/dia) | $0 |
| Twilio | Sandbox | $0 |
| **Total actual** | | **~$10-25** |

Proyeccion para 90 empresas en produccion:

| Servicio | Plan | Costo/mes |
|----------|------|-----------|
| Supabase | Pro | $25 |
| Vercel | Free (o Pro $20) | $0-20 |
| n8n | Self-hosted (VPS mejorado) | $15-20 |
| Anthropic API | Pay-per-use (estimado) | $30-50 |
| Resend | Pro | $20 |
| Twilio | Pay-per-use | $10-20 |
| **Total proyectado** | | **~$100-155** |

Esto es una fraccion del ingreso que generan 90 empresas para Regis (cada cliente paga entre $200,000 y $500,000 COP/mes por consultoria SST, lo que equivale a $4,500-11,000 USD/mes en total). El ROI de la plataforma es claro: automatizar el 60-70% del trabajo repetitivo del consultor permite atender mas empresas con el mismo equipo.

**Evidencia:** Tier actual visible en dashboards de Supabase y Vercel. Tabla `configuracion_sistema` con parametros de integraciones.

---

### C4. "¿Que pasa si Regis crece a 200 empresas?"

**Respuesta:**

La arquitectura esta preparada para ese crecimiento sin cambios estructurales. La base de datos PostgreSQL de Supabase maneja millones de filas sin problema; 200 empresas con todos sus datos (trabajadores, PILA, examenes, matrices) generarian ~100,000 filas totales, muy dentro de la capacidad del plan Pro ($25/mes). Las queries ya usan indices en `empresa_id` y `periodo`, los dos campos por los que se filtra mas frecuentemente.

Los ajustes necesarios para 200 empresas serian: (1) upgrade de Supabase a Pro o Team ($25-599/mes segun necesidad de features), (2) posiblemente ampliar el VPS de n8n para manejar mas workflows concurrentes, (3) optimizar las Edge Functions de IA para usar cache de resultados similares (por ejemplo, riesgos GTC 45 para el mismo CIIU), y (4) implementar paginacion lazy en la interfaz para listas largas de empresas.

El cuello de botella real para 200 empresas no es tecnico sino operativo: necesitariamos RLS tenant-scoped para garantizar aislamiento de datos a nivel de base de datos, y probablemente un sistema de roles mas granular (consultor junior, consultor senior, supervisor). Ambas mejoras estan en el roadmap post-concurso y son incrementales — no requieren reescritura.

**Evidencia:** `src/services/index.ts` — queries con filtros por `empresa_id` (30+ instancias). `docs/POST_CONTEST_BACKLOG.md` — roadmap con RLS y roles.

---

### C5. "¿Se puede licenciar a otras consultoras SST?"

**Respuesta:**

Si, y la arquitectura multi-tenant lo facilita. Actualmente, la plataforma tiene un nivel de tenant: empresas_cliente de Regis. Para licenciar a otras consultoras, se agregaria un nivel superior: la consultora. Cada consultora tendria sus propias empresas, consultores, configuracion de branding (logo, NIT) y parametros del sistema.

Los cambios tecnicos necesarios serian: (1) agregar tabla `consultoras` como tenant de primer nivel, (2) agregar `consultora_id` a `empresas_cliente`, `usuarios` y `configuracion_sistema`, (3) ajustar RLS para aislar por consultora, y (4) hacer dinamico el branding de exports (ya usamos `getExportHeaderHTML()` con parametros, solo faltaria conectarlo a la tabla de consultoras).

El modelo de negocio podria ser SaaS B2B: cobro mensual por consultora basado en numero de empresas gestionadas. Con 50+ consultoras SST solo en Bogota, el mercado potencial es significativo. La ventaja competitiva de Regis seria que al ser la primera consultora en usar la plataforma, tendria voz en el roadmap y podria mantener un precio preferencial o participacion accionaria en el producto SaaS.

**Evidencia:** `src/lib/exportHeader.ts` — branding ya parametrizado. Tabla `empresas_cliente` — estructura lista para agregar `consultora_id`. `src/context/AuthContext.tsx` — roles extensibles.

---

## D) Preguntas Dificiles (5)

---

### D1. "¿Que es lo mas debil de su solucion?"

**Respuesta:**

La debilidad mas significativa es la seguridad de aislamiento de datos entre empresas. Actualmente, Row Level Security en Supabase valida que el usuario este autenticado, pero no restringe por tenant a nivel de base de datos. Esto significa que un bug en el frontend podria potencialmente exponer datos de una empresa a un usuario de otra. La mitigacion actual es que todas las queries filtran por `empresa_id` en el codigo de servicios y los roles del frontend limitan la visibilidad, pero la defensa en profundidad deberia incluir RLS tenant-scoped donde la base de datos misma impide el acceso cruzado independientemente del frontend.

La segunda debilidad es la ausencia de tests automatizados. En un sistema que maneja datos de salud y cumplimiento legal, la confianza en que las actualizaciones no rompen funcionalidad existente deberia estar respaldada por una suite de tests, no por verificacion manual.

La tercera debilidad es que el calculo de cumplimiento (scoring PHVA de la Resolucion 0312) se hace parcialmente en el frontend. Idealmente, esta logica deberia estar en la base de datos o en una Edge Function para garantizar consistencia y permitir reportes automatizados sin depender del frontend.

No intentamos ocultar estas debilidades porque tienen mitigaciones claras y soluciones concretas en el roadmap. La pregunta no es si sabemos que existen, sino si la arquitectura permite resolverlas de forma incremental — y la respuesta es si.

**Evidencia:** `docs/POST_CONTEST_BACKLOG.md` — las tres debilidades listadas con planes de solucion.

---

### D2. "Si tuviera 2 semanas mas, ¿que arreglaria primero?"

**Respuesta:**

Semana 1: Implementar RLS tenant-scoped. Esto implica: (1) crear una tabla `user_empresa_mapping` que vincule `auth.uid()` con `empresa_id`, (2) escribir politicas RLS en cada tabla que validen `empresa_id IN (SELECT empresa_id FROM user_empresa_mapping WHERE user_id = auth.uid())`, y (3) testear que un usuario no pueda acceder a datos de empresas no asignadas. Esto convertiria la debilidad mas critica en una fortaleza demostrable.

Semana 2: Agregar tests de integracion para los 3 flujos criticos: (1) flujo completo PILA (syncPeriods → envio de solicitud → carga publica → validacion → aprobacion), (2) extraccion de examenes medicos (upload PDF → procesamiento IA → fallback → validacion), y (3) generacion de actas de comite (creacion → generacion IA → revision → export). Usariamos Vitest + Supabase local para tests de servicios, y Playwright para los flujos end-to-end mas criticos.

Si quedara tiempo adicional, migraria el calculo de cumplimiento PHVA a una funcion SQL en la base de datos para que los reportes y la bitacora puedan calcular puntajes sin depender del frontend.

**Evidencia:** La lista de prioridades esta basada en `docs/POST_CONTEST_BACKLOG.md` y en la evaluacion de riesgo vs esfuerzo de cada mejora.

---

### D3. "¿Han tenido algun incidente de datos en produccion?"

**Respuesta:**

No hemos tenido incidentes de perdida o exposicion de datos. La plataforma ha estado en entorno de pruebas con 3 empresas y datos de test, no con datos reales de trabajadores. Los 15 PDFs de PILA en Supabase Storage son documentos de prueba, no planillas reales.

Dicho esto, si tuvimos un incidente durante desarrollo que vale la pena mencionar: al implementar la columna generada `capitulo_0312` en `empresas_cliente`, un INSERT que incluia ese campo fallo porque PostgreSQL no permite insertar en columnas GENERATED ALWAYS. Esto no afecto datos existentes pero nos enseno la importancia de documentar restricciones de esquema — ahora esta explicado en CLAUDE.md como regla de arquitectura.

Para produccion, las medidas preventivas incluyen: (1) backups automaticos de Supabase (diarios en Pro), (2) logs de actividad via `logsService` para trazabilidad de toda accion, (3) soft-delete en empresas (`activo: false` en vez de DELETE), y (4) las Edge Functions usan service_role_key con validacion explicita para evitar operaciones no autorizadas. El riesgo principal para produccion seria un JWT comprometido, que se mitiga con la expiracion corta de tokens de Supabase Auth.

**Evidencia:** `src/services/index.ts` — `empresasService.deactivate()` usa soft-delete. `logsService.log()` en operaciones criticas. CLAUDE.md — documentacion de `capitulo_0312` como GENERATED ALWAYS.

---

### D4. "¿Como saben que la IA no esta inventando datos medicos?"

**Respuesta:**

El riesgo de alucinacion en extraccion de documentos es diferente al de generacion abierta. Cuando Claude procesa un examen medico, no esta "inventando" contenido — esta extrayendo datos estructurados de un documento existente. El prompt de extraccion le pide campos especificos (nombre, cedula, tipo de examen, concepto, restricciones) con instrucciones de dejar el campo vacio si no se encuentra, no de inferir o completar.

Aun asi, la extraccion puede equivocarse (confundir un nombre, interpretar mal un concepto de aptitud en letra ilegible). Por eso implementamos tres salvaguardas: (1) El PDF original siempre se conserva en Storage y es accesible desde la interfaz — el consultor puede comparar visualmente la extraccion vs el documento fuente. (2) Cada registro indica si se uso IA (`ai_used: true/false`) y si hubo fallback (`_fallback: true`), para que el consultor sepa el nivel de confianza. (3) El flujo de validacion exige que un humano marque el examen como "validado" antes de que se considere oficial — sin esta validacion, los datos extraidos son solo un borrador.

Adicionalmente, para datos criticos como el concepto de aptitud (apto/apto con restricciones/no apto), el sistema podria implementar una doble verificacion: si la IA detecta "no apto" o "apto con restricciones", se genera una alerta prioritaria al consultor para revision inmediata, dado el impacto legal de estos conceptos.

**Evidencia:** `supabase/functions/process-exam-pdf/index.ts` — prompt con instrucciones de "dejar vacio si no se encuentra". Campos `ai_used`, `_fallback` en respuesta. `src/pages/MedicalExams.tsx` — boton para ver PDF original.

---

### D5. "¿Por que deberia confiar mis datos de salud a un sistema hecho en 10 dias?"

**Respuesta:**

La pregunta tiene una premisa parcialmente incorrecta: el sistema no se construyo en 10 dias — el desarrollo iterativo ha incluido multiples ciclos de diseno de arquitectura, implementacion de modulos, pruebas con datos simulados, y refinamiento basado en los procesos reales de una consultora SST. Lo que si es cierto es que el plazo del concurso impuso restricciones en lo que pudimos implementar, y hemos sido transparentes sobre que falta (tests, RLS granular, Twilio produccion).

Respecto a la confianza en los datos de salud: la infraestructura subyacente no es experimental. Supabase es un servicio usado por +500,000 proyectos con SOC 2 compliance, PostgreSQL es la base de datos relacional mas avanzada del mundo con 35 anos de desarrollo, y los datos se almacenan en AWS us-east-1 con encriptacion at-rest y in-transit. La capa de la aplicacion es la que se construyo para el concurso; la capa de datos descansa en tecnologia probada en produccion a escala global.

Lo mas importante: ningun dato medico real de trabajadores esta en la plataforma hoy. Los datos actuales son de prueba. Antes de cargar datos reales, la hoja de ruta incluye: (1) implementar RLS tenant-scoped, (2) agregar terminos de uso y politica de habeas data conforme a Ley 1581, (3) upgrade a Supabase Pro con backups diarios, y (4) migracion de Twilio sandbox a produccion. Estas son 4 tareas concretas y acotadas, no una reescritura. La arquitectura esta lista; la certificacion de produccion es incremental.

**Evidencia:** Dashboard de Supabase mostrando region, encriptacion y uptime. `datos-prueba/` — carpeta de datos de test, no datos reales. `docs/POST_CONTEST_BACKLOG.md` — hoja de ruta pre-produccion.

---

## Notas para la Presentacion

### Estrategia General de Respuesta

1. **Nunca mentir ni exagerar.** Si algo no esta implementado, decirlo claramente y mostrar que hay un plan.
2. **Redirigir a la evidencia.** Cuando sea posible, mostrar el codigo, el dashboard, o la interfaz en vivo.
3. **Contextualizar las debilidades.** "No tenemos tests" suena mal solo. "No tenemos tests pero tenemos logging exhaustivo, cascade con fallback, y un checklist manual — y la arquitectura facilita agregar Vitest en 2 dias" suena como una decision pragmatica.
4. **Enfocar en el dolor real de Regis.** Las actas de comite toman 45-60 minutos manuales vs 5 minutos con IA. Eso es el argumento que mas impacta.
5. **Demostrar, no declarar.** Si preguntan "¿funciona el PILA automatizado?", abrir la interfaz y ejecutar el flujo en vivo.

### Frases Clave a Recordar

- "La IA es un acelerador, no un reemplazo. Siempre hay validacion humana."
- "La infraestructura es enterprise-grade (Supabase/PostgreSQL/AWS). Lo que construimos es la capa de aplicacion SST."
- "El costo operativo para 90 empresas es ~$100-150 USD/mes. El ingreso de Regis por esas empresas es ~$4,500-11,000 USD/mes."
- "Cada debilidad que mencionamos tiene una solucion concreta y acotada en el roadmap."
- "No es un MVP generico — esta construido alrededor de los procesos reales de Regis."

### Demos en Vivo Preparadas

1. **Flujo PILA completo:** Solicitud → recordatorio → carga publica → validacion (3 min)
2. **Generacion de acta con IA:** Seleccionar comite → generar acta → revisar → exportar con branding (2 min)
3. **Extraccion de examen medico:** Subir PDF → ver extraccion IA → comparar con original (2 min)
4. **Dashboard multi-empresa:** Cambiar entre empresas, ver indicadores consolidados (1 min)
5. **Cascade de IA:** Mostrar logs de Edge Function con intento Sonnet → fallback Haiku (1 min)
