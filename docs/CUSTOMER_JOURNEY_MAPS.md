# Customer Journey Maps — Regis SG-SST Platform

Tres mapas de recorrido detallados para los perfiles principales de usuario de la plataforma Regis Safety Hub.

---

## Journey A: Carolina — Administradora Regis

### Persona

| Campo | Detalle |
|-------|---------|
| Nombre | Carolina Martinez, 35 anos |
| Rol | Administradora general de Regis Colombia |
| Experiencia | 8 anos coordinando consultores SST |
| Responsabilidad | Cartera de 90+ empresas cliente |
| Dolor principal | No sabe en tiempo real quien esta al dia y quien no. Pasa horas llamando consultores para armar el panorama semanal. |
| Meta | Tener visibilidad completa del estado de cumplimiento de toda la cartera desde un solo lugar. |

### Escenario: Lunes 8am — Revision semanal de cartera

| # | Paso | Touchpoint | Pensamiento | Emocion | Pain Point | Oportunidad |
|---|------|------------|-------------|---------|------------|-------------|
| 1 | Abre laptop, navega a regis-safety-hub.vercel.app | Navegador / URL directa | "A ver como arrancamos la semana" | 😊 | Ninguno — acceso rapido | Guardar como PWA para acceso desde escritorio |
| 2 | Inicia sesion como admin con correo y contrasena | Pantalla de Login | "Espero que cargue rapido" | 😐 | Login manual cada vez | Sesion persistente o SSO con Microsoft 365 |
| 3 | Ve el Dashboard con overview de cumplimiento general | Dashboard principal | "Ok, veamos el panorama general" | 😊 | Los numeros son globales, necesita desglose rapido | Filtros por consultor asignado o nivel de riesgo |
| 4 | Identifica 3 empresas con cumplimiento menor al 60% (indicador rojo) | Dashboard — tarjetas de cumplimiento | "Estas tres me preocupan, hay que actuar ya" | 😤 | No puede ver de un vistazo que modulos especificos fallan | Tooltip o desglose al hacer hover mostrando modulos pendientes |
| 5 | Entra a la ficha de cada empresa, revisa documentos faltantes | Pagina de empresa / Compliance | "A ver que les falta exactamente..." | 😐 | Tiene que entrar empresa por empresa | Vista comparativa de multiples empresas en una tabla |
| 6 | Descubre que Sabor Criollo no ha subido PILA de abril | Modulo PILA — listado por empresa | "Ya van dos meses seguidos que se atrasan" | 😤 | No hay alerta automatica de reincidencia | Alerta automatica cuando una empresa acumula 2+ meses sin PILA |
| 7 | Entra al modulo PILA, selecciona Sabor Criollo, envia recordatorio por WhatsApp | PILA — boton "Enviar recordatorio WhatsApp" | "Ojala esta vez si lo suban rapido" | 😐 | No sabe si el mensaje fue leido | Integracion con estado de lectura de WhatsApp Business |
| 8 | Tambien envia recordatorio por email como respaldo | PILA — boton "Enviar recordatorio Email" | "Mejor por los dos canales" | 😊 | Dos clics separados para email y WhatsApp | Boton unico de "enviar por todos los canales" |
| 9 | Navega a Examenes Medicos, filtra por pendientes de revision | Medical Exams — filtro de estado | "Veamos que nos extrajo la IA" | 😊 | Los resultados de IA a veces necesitan correccion manual | Indicador de confianza de la extraccion IA |
| 10 | Valida 2 examenes cuya extraccion IA es correcta, los marca como aprobados | Medical Exams — detalle de examen | "Bien, estos estan perfectos" | 😊 | El flujo pendiente > validado > aprobado requiere dos clics | Boton de aprobacion directa cuando la extraccion tiene alta confianza |
| 11 | Revisa actas de comite pendientes de firma en el modulo Comites | Committees — listado de actas | "Hay 4 actas sin firmar, tengo que presionar a los consultores" | 😤 | No hay recordatorio automatico de firmas pendientes | Envio automatico de recordatorio de firma a los asistentes |
| 12 | Genera el reporte semanal automatico (bitacora) para la reunion de consultores | Dashboard o Bitacora — boton "Generar reporte" | "Esto antes me tomaba 2 horas armarlo a mano" | 😊 | El reporte no incluye comparativo con semana anterior | Agregar tendencia semanal y variaciones porcentuales |
| 13 | Revisa el Log de Actividad para verificar que los consultores estan usando la plataforma | Activity Log — filtro por usuario | "Andres no ha entrado en 3 dias..." | 😐 | Solo muestra acciones, no inactividad | Alerta de inactividad de consultores por mas de X dias |
| 14 | Exporta el reporte en formato imprimible con membrete Regis para la reunion | Exportar / Imprimir | "Listo, profesional como siempre" | 😊 | Ninguno — el membrete se genera automaticamente | Envio directo por email del reporte a los consultores |

### Resumen del Journey

| Metrica | Valor |
|---------|-------|
| Duracion total estimada | 35-45 minutos |
| Momentos positivos | 5 de 14 pasos |
| Momentos neutrales | 5 de 14 pasos |
| Momentos de frustracion | 4 de 14 pasos |
| Modulos utilizados | Dashboard, PILA, Medical Exams, Committees, Activity Log, Exportar |

### Insights clave — Journey A

1. **La vision consolidada es el mayor valor.** Carolina necesita ver todo el estado de la cartera sin entrar empresa por empresa. Una vista comparativa tipo tabla con filtros resolveria su principal frustracion.
2. **Los recordatorios multi-canal podrian unificarse.** Enviar WhatsApp + email por separado genera friccion innecesaria.
3. **La IA de examenes medicos genera confianza** cuando la extraccion es precisa, pero falta un indicador de confianza para agilizar la validacion.
4. **Las alertas proactivas estan ausentes.** Carolina descubre problemas navegando manualmente; la plataforma podria notificar automaticamente empresas con reincidencia o consultores inactivos.

---

## Journey B: Andres — Consultor SST en terreno

### Persona

| Campo | Detalle |
|-------|---------|
| Nombre | Andres Gomez, 28 anos |
| Rol | Consultor SST de Regis Colombia |
| Experiencia | 3 anos en campo |
| Responsabilidad | 15 empresas asignadas, visitas mensuales |
| Dolor principal | Despues de cada visita tiene que digitalizar todo manualmente: pasar notas a computador, redactar actas, actualizar matrices. |
| Meta | Que la plataforma le permita capturar informacion en campo y genere automaticamente los documentos formales. |

### Escenario: Visita mensual a Construandes Ltda

| # | Paso | Touchpoint | Pensamiento | Emocion | Pain Point | Oportunidad |
|---|------|------------|-------------|---------|------------|-------------|
| 1 | Antes de salir, abre la plataforma desde su celular para revisar el estado de Construandes | Dashboard — vista movil | "A ver en que anda Construandes este mes" | 😊 | La plataforma no esta optimizada al 100% para movil | Mejorar responsividad y agregar modo PWA |
| 2 | Revisa el modulo de Compliance para ver que estandares 0312 estan pendientes | Compliance — ficha de empresa | "Les falta la politica SST actualizada y la evaluacion inicial" | 😐 | La lista de pendientes no sugiere prioridades | Ordenar pendientes por impacto en puntaje de cumplimiento |
| 3 | Revisa el modulo de Equipment Inventory para ver que extintores vencen pronto | Equipment Inventory — filtro por empresa | "Tienen 2 extintores que vencen este mes, hay que verificar en sitio" | 😊 | Tiene que anotar manualmente los equipos a revisar | Generar checklist descargable pre-visita |
| 4 | Revisa documentos pendientes de la empresa | Documents — filtro por estado | "Necesito que me firmen 3 documentos hoy" | 😐 | No puede enviar los documentos desde la app para que firmen antes | Pre-envio de documentos digitales para firma |
| 5 | Llega a Construandes, hace inspeccion de extintores, botiquines y senalizacion | En sitio — no hay touchpoint digital aun | "El extintor de cocina esta vencido, como lo anote" | 😤 | No hay formulario de inspeccion en la plataforma | Checklist de inspeccion digital con registro fotografico |
| 6 | Graba audio de 15 minutos durante la inspeccion del plan de emergencias | Emergency Plans — boton "Grabar audio" (movil) | "Mejor grabo todo y despues la IA lo procesa" | 😊 | La grabacion depende de la conexion a internet para subir | Permitir grabacion offline con sincronizacion posterior |
| 7 | Toma fotos del acta del comite anterior para referencia | Camara del celular (fuera de la plataforma) | "Esto deberia poder subirlo directo a la plataforma" | 😐 | Las fotos quedan en la galeria, hay que subirlas despues manualmente | Boton de captura directa integrado en el modulo de comites |
| 8 | Realiza la reunion de comite COPASST con los trabajadores | En sitio — reunion presencial | "Bien, ahora tengo que redactar el acta de todo esto" | 😤 | La redaccion manual del acta toma 45+ minutos | Transcripcion de la reunion y generacion automatica con IA |
| 9 | De vuelta en la oficina, sube el audio de la inspeccion al modulo Emergency Plans | Emergency Plans — upload de audio | "Veamos que dice la IA" | 😊 | El procesamiento toma unos minutos | Mostrar barra de progreso y notificacion cuando termine |
| 10 | La IA transcribe con Whisper y analiza vulnerabilidades con Claude | Emergency Plans — resultado de analisis | "Identifico 4 vulnerabilidades que no habia notado, excelente" | 😊 | El analisis no se puede editar directamente | Editor inline del analisis generado por IA |
| 11 | Genera el acta del comite COPASST usando IA, a partir de sus notas y el contexto de la empresa | Committees — boton "Generar acta con IA" | "En 2 minutos tengo el acta lista, antes me tomaba una hora" | 😊 | Tiene que copiar/pegar sus notas en un campo de texto | Entrada de voz para las notas del acta |
| 12 | Revisa el acta generada, hace ajustes menores y la guarda | Committees — editor de acta | "Solo tuve que cambiar un nombre, el resto esta perfecto" | 😊 | No hay historial de versiones del acta | Control de versiones para actas editadas |
| 13 | Actualiza la matriz de riesgo de Construandes con los hallazgos de hoy | Risk Matrices — editor GTC 45 | "Tengo que agregar el riesgo del tanque de gas sin ventilacion" | 😐 | La interfaz de la matriz es compleja para edicion rapida | Modo de edicion rapida o agregar riesgo desde checklist de inspeccion |
| 14 | Marca los equipos inspeccionados en el inventario y actualiza fechas | Equipment Inventory — edicion de registros | "Listo, extintores verificados excepto el vencido" | 😊 | Tiene que editar uno por uno | Edicion masiva de equipos inspeccionados |
| 15 | Registra actividades en el log y cierra su jornada | Activity Log (automatico) + Dashboard | "Todo quedo registrado, manana sigo con DevCo" | 😊 | Ninguno — el log es automatico | Resumen automatico de fin de jornada por consultor |

### Resumen del Journey

| Metrica | Valor |
|---------|-------|
| Duracion total estimada | 4-5 horas (incluyendo visita y post-visita) |
| Momentos positivos | 8 de 15 pasos |
| Momentos neutrales | 4 de 15 pasos |
| Momentos de frustracion | 3 de 15 pasos |
| Modulos utilizados | Dashboard, Compliance, Equipment Inventory, Documents, Emergency Plans, Committees, Risk Matrices, Activity Log |
| Tiempo ahorrado con IA | Aprox. 1.5 horas (acta + analisis de emergencias) |

### Insights clave — Journey B

1. **La IA es el diferenciador critico para el consultor.** La generacion automatica de actas y el analisis de planes de emergencia son los momentos de mayor satisfaccion. Reducen el trabajo post-visita de 2+ horas a menos de 30 minutos.
2. **La experiencia movil necesita mejoras.** El consultor trabaja desde el celular en campo; formularios de inspeccion, captura de fotos y grabacion de audio deben ser nativos en la plataforma movil.
3. **Falta un flujo de pre-visita estructurado.** Generar automaticamente un checklist con pendientes, equipos por vencer y documentos faltantes ahorraria 15 minutos de preparacion.
4. **La digitalizacion en sitio es el mayor cuello de botella.** Todo lo que el consultor pueda capturar digitalmente durante la visita (en vez de despues) reduce errores y ahorra tiempo.

---

## Journey C: Maria — Administradora empresa cliente

### Persona

| Campo | Detalle |
|-------|---------|
| Nombre | Maria Lopez, 42 anos |
| Rol | Contadora y administradora de Sabor Criollo S.A.S. |
| Empresa | Restaurante, 12 trabajadores, riesgo nivel II |
| Conocimiento SST | Minimo — depende completamente de Regis |
| Dolor principal | La PILA es "otro tramite mas" que tiene que hacer cada mes. No entiende por que es importante y le da pereza. |
| Meta | Cumplir con lo que le piden sin gastar mas de 5 minutos al mes. |

### Escenario: Recibe recordatorio de PILA y la carga

| # | Paso | Touchpoint | Pensamiento | Emocion | Pain Point | Oportunidad |
|---|------|------------|-------------|---------|------------|-------------|
| 1 | Recibe mensaje de WhatsApp de Regis: "Recordatorio: por favor suba su planilla PILA de mayo" con un link | WhatsApp — mensaje automatico con link | "Ay, otra vez la PILA... bueno, mejor la subo de una" | 😐 | El mensaje no explica por que es importante o que pasa si no la sube | Incluir consecuencia breve: "Evite multas, suba antes del 20" |
| 2 | Hace clic en el link desde su celular — se abre la pagina publica de carga | UploadPila — pagina publica (sin login) | "Que bien que no tengo que crear cuenta ni recordar contrasena" | 😊 | Ninguno — el acceso es inmediato | Mantener esta simplicidad, es clave para la adopcion |
| 3 | Ve instrucciones claras: "Suba su planilla PILA de mayo 2026 para Sabor Criollo S.A.S." | UploadPila — encabezado con nombre de empresa y periodo | "Ok, es para mayo, entendido" | 😊 | Si tiene multiples archivos no sabe cual es el correcto | Agregar ejemplo visual de como luce una planilla PILA correcta |
| 4 | Abre el explorador de archivos de su celular y selecciona el PDF de la PILA | UploadPila — boton "Seleccionar archivo" | "Donde lo guarde... ah, en descargas" | 😐 | Encontrar el archivo correcto en el celular puede ser confuso | Aceptar fotos/capturas ademas de PDF por si no tiene el digital |
| 5 | El archivo se sube, ve una barra de progreso y luego el mensaje "Archivo subido exitosamente" | UploadPila — confirmacion visual | "Listo, ya quedo" | 😊 | No sabe si alguien va a revisar el archivo o si ya quedo aprobado | Explicar el siguiente paso: "Su consultor lo revisara en las proximas 48 horas" |
| 6 | Recibe email de confirmacion automatico: "Hemos recibido su PILA de mayo" | Email — enviado por Resend | "Bien, tengo el comprobante por si acaso" | 😊 | El email es generico, no incluye resumen de estado general | Incluir mini-resumen: "PILA mayo: recibida. Estado general: 75% cumplimiento" |
| 7 | Tres dias despues, recibe notificacion: "Su PILA de mayo ha sido aprobada" | WhatsApp o Email — notificacion automatica | "Perfecto, no tengo que hacer nada mas" | 😊 | Ninguno | Agregar recordatorio del proximo vencimiento: "Siguiente PILA: junio, antes del 16" |
| 8 | Si hubiera habido un problema, recibiria mensaje: "Su PILA necesita correccion" con instrucciones | WhatsApp — mensaje con detalle del problema | "Que paso? A ver que dice..." | 😤 | El mensaje de error podria ser tecnico y confuso | Usar lenguaje simple: "El archivo no corresponde al periodo de mayo, por favor suba el correcto" |
| 9 | No tiene que hacer nada mas hasta el mes siguiente | Sin touchpoint — silencio positivo | "Que bueno que esto sea tan facil" | 😊 | Nunca ve su estado general de cumplimiento | Envio mensual de "boletin de salud SST" simple y visual |

### Resumen del Journey

| Metrica | Valor |
|---------|-------|
| Duracion total estimada | 3-5 minutos (carga) + notificaciones pasivas |
| Momentos positivos | 6 de 9 pasos |
| Momentos neutrales | 2 de 9 pasos |
| Momentos de frustracion | 1 de 9 pasos (solo si hay error) |
| Touchpoints digitales | WhatsApp, UploadPila (web publica), Email |
| Requiere login | No |

### Insights clave — Journey C

1. **La friccion cero es el exito.** El hecho de que Maria no necesite crear cuenta, recordar contrasena ni entender SST es lo que hace que cumpla. Cualquier paso adicional aumenta el riesgo de abandono.
2. **WhatsApp es el canal correcto.** Maria vive en WhatsApp; los emails los revisa poco. El recordatorio por WhatsApp con link directo es el patron de mayor conversion.
3. **La comunicacion debe ser en lenguaje humano.** Maria no sabe que es la Resolucion 0312 ni le importa. Los mensajes deben hablar de "su planilla" y "evitar multas", no de normativa.
4. **El silencio positivo es valioso.** Cuando todo esta bien, Maria no deberia recibir nada innecesario. Pero un boletin mensual breve (1 parrafo) con su estado podria aumentar la percepcion de valor del servicio.

---

## Comparativa de Journeys

| Dimension | Carolina (Admin) | Andres (Consultor) | Maria (Cliente) |
|-----------|-----------------|-------------------|----------------|
| Frecuencia de uso | Diaria | 3-4 veces por semana | 1 vez al mes |
| Duracion por sesion | 30-60 min | Variable (campo + oficina) | 3-5 min |
| Complejidad de interaccion | Alta — multiples modulos | Media-Alta — captura + IA | Minima — un solo flujo |
| Requiere login | Si (admin) | Si (consultor) | No (link publico) |
| Principal valor de la plataforma | Visibilidad consolidada | Automatizacion con IA | Simplicidad total |
| Mayor frustracion | Falta de alertas proactivas | Digitalizacion manual post-visita | Mensajes confusos o tecnicos |
| Dispositivo principal | Laptop/desktop | Celular + laptop | Celular exclusivamente |
| Modulos mas usados | Dashboard, PILA, Compliance | Emergency Plans, Committees, Risk Matrices | UploadPila (publico) |

---

## Oportunidades priorizadas (consolidado de los 3 journeys)

### Impacto alto / Esfuerzo bajo
1. **Unificar envio de recordatorios** (WhatsApp + email en un solo clic) — Journey A
2. **Incluir consecuencias en mensajes de recordatorio** ("Evite multas") — Journey C
3. **Explicar siguiente paso despues de la carga** ("Su consultor lo revisara en 48h") — Journey C
4. **Alerta de inactividad de consultores** — Journey A

### Impacto alto / Esfuerzo medio
5. **Vista comparativa multi-empresa** para admin — Journey A
6. **Checklist de inspeccion digital** para consultores en campo — Journey B
7. **Modo PWA** para acceso rapido movil — Journey A y B
8. **Boletin mensual automatico** para clientes con estado de cumplimiento — Journey C

### Impacto alto / Esfuerzo alto
9. **Formulario de inspeccion con captura de fotos** integrado — Journey B
10. **Modo offline con sincronizacion** para consultores sin conexion — Journey B
11. **Firma digital de actas** desde la plataforma — Journey A y B
