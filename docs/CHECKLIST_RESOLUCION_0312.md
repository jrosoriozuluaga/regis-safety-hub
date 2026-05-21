# Checklist de Cumplimiento - Resolucion 0312 de 2019

## Mapeo de Estandares Minimos del SG-SST vs. Plataforma Regis Safety Hub

**Ultima actualizacion:** Mayo 2026
**Alcance:** Capitulo 1 (7 estandares, <=10 trabajadores, riesgo I-III) y Capitulo 2 (21 estandares, 11-50 trabajadores, riesgo I-III)
**Fuera de alcance:** Capitulo 3 (60 estandares, >50 trabajadores o riesgo IV-V)

**Sistema de valoracion (Art. 28):**
| Puntaje | Valoracion | Accion requerida |
|---------|-----------|-----------------|
| >85% | Aceptable | Mantener calificacion y evidencias |
| 60-85% | Moderadamente aceptable | Plan de mejora + reporte a ARL en 6 meses |
| <60% | Critico | Plan de mejora inmediato + reporte a ARL en 3 meses + visita del Ministerio |

---

## Capitulo 1 - Estandares Minimos para empresas con 10 o menos trabajadores, riesgo I, II o III (Art. 3)

Capitulo 1 contiene 7 estandares obligatorios. Estos mismos estandares tambien aplican para Capitulo 2, por lo que se detallan completamente aqui.

---

### Estandar 1.1.1: Responsable del SG-SST

- **Texto:** La empresa debe asignar una persona que disene e implemente el Sistema de Gestion de Seguridad y Salud en el Trabajo. Para empresas de 10 o menos trabajadores de riesgo I-III, puede ser el empleador o un trabajador designado. Debe contar con afiliacion vigente al Sistema General de Riesgos Laborales y tener acceso al curso virtual de 50 horas en SST.
- **Ciclo PHVA:** Planear
- **Peso:** 0.5 puntos
- **Cumplimiento en plataforma:** El modulo de Empresas (`Companies.tsx`) registra los datos de la empresa incluyendo el consultor asignado (campo `consultor_id`). El sistema asocia cada empresa con un consultor de Regis que actua como responsable del diseno del SG-SST. Adicionalmente, el modulo de Documentos permite cargar el acta de designacion del responsable.
- **Evidencia:** Modulo Empresas (datos del consultor asignado) + Modulo Documentos (acta de designacion, certificado curso 50 horas)
- **Brechas:** La plataforma no valida automaticamente si el responsable tiene el curso de 50 horas vigente. Esto se maneja como documento cargado manualmente.
- **Estado:** ⚠️ Parcial

---

### Estandar 1.1.4: Afiliacion al Sistema General de Riesgos Laborales

- **Texto:** La empresa debe garantizar que todos los trabajadores esten afiliados al Sistema General de Seguridad Social Integral (Salud, Pension, Riesgos Laborales). La planilla PILA es la evidencia principal de afiliacion y pago de aportes.
- **Ciclo PHVA:** Planear
- **Peso:** 0.5 puntos
- **Cumplimiento en plataforma:** El modulo PILA (`Pila.tsx`) automatiza completamente el ciclo de solicitud, seguimiento y verificacion de la planilla mensual. Incluye: generacion automatica de 6 meses de periodos (`syncPeriods`), solicitud por correo electronico via n8n/Resend, recordatorios automaticos (email + WhatsApp via Twilio), enlace publico de carga sin autenticacion (`/upload-pila`), flujo de validacion (pendiente -> cargada -> validada -> aprobada), y deteccion automatica de periodos vencidos.
- **Evidencia:** Modulo PILA -> Registros por empresa y periodo, archivos PDF almacenados en Supabase Storage (`documentos/pila/{empresa_id}/`)
- **Brechas:** Ninguna significativa. El modulo esta completamente funcional con automatizacion end-to-end.
- **Estado:** ✅ Cumple

---

### Estandar 1.1.6: Conformacion COPASST / Vigia

- **Texto:** Las empresas con 10 o mas trabajadores deben conformar un Comite Paritario de Seguridad y Salud en el Trabajo (COPASST). Las de menos de 10 deben designar un Vigia de SST. El periodo es de 2 anos. Debe tener representantes del empleador y de los trabajadores.
- **Ciclo PHVA:** Planear
- **Peso:** 0.5 puntos
- **Cumplimiento en plataforma:** El modulo de Comites (`Committees.tsx`) permite crear periodos de COPASST o Vigia, registrar integrantes (tabla `integrantes_comite`) con su rol (presidente, secretario, miembro) y tipo de representacion (empleador/trabajador). Soporta actas de reunion con generacion asistida por IA (Edge Function `generate-acta`), seguimiento de compromisos y exportacion con membrete Regis.
- **Evidencia:** Modulo Comites -> Pestaña COPASST/Vigia (acta de conformacion, actas de reunion mensuales, listado de integrantes)
- **Brechas:** No genera automaticamente el acta de conformacion inicial ni la convocatoria a elecciones de representantes de los trabajadores.
- **Estado:** ✅ Cumple

---

### Estandar 1.1.8: Conformacion Comite de Convivencia Laboral

- **Texto:** Toda empresa debe conformar un Comite de Convivencia Laboral (Ley 1010 de 2006, Resolucion 3461 de 2025). Este comite se encarga de prevenir y atender conductas de acoso laboral. Debe reunirse mensualmente (cambio de Resolucion 3461/2025, antes era trimestral). Periodo: 2 anos.
- **Ciclo PHVA:** Planear
- **Peso:** 0.5 puntos
- **Cumplimiento en plataforma:** El modulo de Comites soporta el tipo "Convivencia" con las mismas funcionalidades que COPASST: integrantes, actas con IA, seguimiento de compromisos. Las actas incluyen campos para quejas recibidas, mediaciones realizadas y acuerdos.
- **Evidencia:** Modulo Comites -> Pestaña Convivencia (acta de conformacion, actas mensuales, registro de integrantes)
- **Brechas:** No incluye un formulario especifico para recepcion formal de quejas de acoso laboral ni seguimiento de casos individuales con linea de tiempo.
- **Estado:** ⚠️ Parcial

---

### Estandar 1.2.1: Programa de Capacitacion en Promocion y Prevencion (PyP)

- **Texto:** La empresa debe contar con un programa de capacitacion anual en promocion y prevencion, que incluya la induccion y reinduccion en SST. Debe estar documentado, con cronograma, temas, responsables y evidencias de ejecucion.
- **Ciclo PHVA:** Planear
- **Peso:** 2.0 puntos
- **Cumplimiento en plataforma:** El modulo de Documentos (`Documents.tsx`) permite cargar el plan de capacitacion anual como documento tipo `plan_trabajo_anual`. El dashboard de Cumplimiento (`Compliance.tsx`) verifica la existencia de documentos aprobados de este tipo para auto-marcar el estandar como cumplido.
- **Evidencia:** Modulo Documentos -> Documento tipo "Plan de Trabajo Anual" (incluye programa de capacitacion) + Modulo Cumplimiento (verificacion automatica)
- **Brechas:** No existe un modulo dedicado de capacitaciones con registro de asistencia, evaluacion de conocimientos, ni seguimiento de horas de capacitacion por trabajador.
- **Estado:** ⚠️ Parcial

---

### Estandar 2.3.1: Evaluacion e Identificacion de Prioridades

- **Texto:** La empresa debe realizar una evaluacion inicial del SG-SST para identificar las prioridades en seguridad y salud en el trabajo. Esta evaluacion debe incluir la identificacion de la normatividad vigente, la verificacion de peligros y la evaluacion de la efectividad de las medidas implementadas.
- **Ciclo PHVA:** Planear
- **Peso:** 1.0 punto
- **Cumplimiento en plataforma:** El dashboard de Cumplimiento (`Compliance.tsx`) funciona como herramienta de evaluacion inicial, permitiendo evaluar cada estandar de la Resolucion 0312 y generando un puntaje PHVA automatico. La auto-deteccion cruza datos de PILA, examenes medicos, matrices de riesgo, actas y planes de emergencia para identificar brechas.
- **Evidencia:** Modulo Cumplimiento -> Evaluacion 0312 por empresa (exportable/imprimible con membrete Regis)
- **Brechas:** No genera automaticamente un documento formal de "evaluacion inicial del SG-SST" como tal, aunque la funcionalidad de evaluacion interactiva cumple el proposito sustantivo.
- **Estado:** ✅ Cumple

---

### Estandar 2.4.1: Plan Anual de Trabajo

- **Texto:** La empresa debe contar con un plan de trabajo anual firmado que identifique objetivos, metas, responsabilidades, recursos y cronograma. Debe ser coherente con la evaluacion inicial y las prioridades identificadas.
- **Ciclo PHVA:** Planear
- **Peso:** 2.0 puntos
- **Cumplimiento en plataforma:** El modulo de Documentos permite cargar el plan anual de trabajo como documento con flujo de validacion (pendiente -> cargado -> validado -> aprobado). El sistema lo asocia al tipo `plan_trabajo_anual` y lo vincula con la empresa correspondiente.
- **Evidencia:** Modulo Documentos -> Documento "Plan de Trabajo Anual" con estado de aprobacion
- **Brechas:** No genera automaticamente el plan anual de trabajo ni ofrece una plantilla interactiva con cronograma. Se gestiona como documento subido.
- **Estado:** ⚠️ Parcial

---

### Estandar 3.1.1: Evaluacion Medica Ocupacional

- **Texto:** La empresa debe realizar evaluaciones medicas ocupacionales de ingreso, periodicas y de egreso a todos los trabajadores, conforme a los peligros identificados en la matriz de riesgos. El concepto medico debe incluir aptitud, recomendaciones y restricciones.
- **Ciclo PHVA:** Hacer
- **Peso:** 1.0 punto
- **Cumplimiento en plataforma:** El modulo de Examenes Medicos (`MedicalExams.tsx`) permite registrar examenes de ingreso, periodicos y egreso por trabajador. Incluye extraccion asistida por IA (Edge Function `process-exam-pdf`) que extrae automaticamente del PDF: nombre, cedula, tipo de examen, concepto de aptitud, recomendaciones y restricciones. Las recomendaciones se almacenan en `recomendaciones_medicas` con seguimiento de estado (pendiente, en cumplimiento, cumplida).
- **Evidencia:** Modulo Examenes Medicos -> Registros por trabajador (tipo, concepto, recomendaciones) + PDFs almacenados en Storage
- **Brechas:** Ninguna significativa para este estandar.
- **Estado:** ✅ Cumple

---

### Estandar 4.1.2: Identificacion de Peligros con Participacion de Todos los Niveles

- **Texto:** La empresa debe realizar la identificacion de peligros, evaluacion y valoracion de los riesgos con participacion de todos los niveles de la empresa. Debe aplicar una metodologia reconocida (GTC 45 es la mas utilizada en Colombia). La matriz debe actualizarse al menos una vez al ano o cuando cambien las condiciones.
- **Ciclo PHVA:** Hacer
- **Peso:** 4.0 puntos
- **Cumplimiento en plataforma:** El modulo de Matrices de Riesgo (`RiskMatrices.tsx`) implementa la metodologia GTC 45 completa. Incluye: generacion automatica basada en CIIU (Claude API genera riesgos pre-llenados segun el codigo de actividad economica), calificacion de Nivel de Deficiencia (ND), Nivel de Exposicion (NE), Nivel de Probabilidad (NP), Nivel de Consecuencia (NC) y Nivel de Riesgo (NR), clasificacion por tipo de peligro (fisico, quimico, biologico, biomecanico, psicosocial, seguridad, fenomenos naturales), jerarquia de controles (eliminacion, sustitucion, ingenieria, administrativo, EPP), y exportacion imprimible con membrete.
- **Evidencia:** Modulo Matrices de Riesgo -> Matriz GTC 45 por empresa (con todos los campos de valoracion, controles existentes y propuestos)
- **Brechas:** No incluye un mecanismo formal para registrar la participacion de los trabajadores en la identificacion de peligros (ej. encuestas, firmas de asistencia a talleres de identificacion).
- **Estado:** ✅ Cumple

---

### Estandar 4.2.1: Medidas de Prevencion y Control de Peligros

- **Texto:** Se deben implementar las medidas de prevencion y control con base en los peligros identificados, la evaluacion y valoracion de riesgos. Se debe aplicar la jerarquia de controles: eliminacion, sustitucion, controles de ingenieria, controles administrativos y EPP.
- **Ciclo PHVA:** Hacer
- **Peso:** 2.5 puntos
- **Cumplimiento en plataforma:** Las matrices de riesgo del modulo correspondiente incluyen campos para controles existentes (fuente, medio, individuo) y controles propuestos segun la jerarquia. El modulo de Inventario de Equipos (`EquipmentInventory.tsx`) complementa esto con el registro de EPP, extintores, botiquines y otros equipos de seguridad, incluyendo fechas de vencimiento y alertas automaticas.
- **Evidencia:** Modulo Matrices de Riesgo -> Controles propuestos por riesgo + Modulo Inventario de Equipos -> Registro de EPP y equipos de emergencia
- **Brechas:** No hay un modulo dedicado de seguimiento a la implementacion de cada medida de control propuesta (cronograma de implementacion, responsable, estado).
- **Estado:** ⚠️ Parcial

---

### Estandar 5.1.1: Plan de Prevencion y Preparacion ante Emergencias

- **Texto:** La empresa debe elaborar un plan de prevencion, preparacion y respuesta ante emergencias que incluya: identificacion de amenazas (naturales, tecnologicas, sociales), analisis de vulnerabilidad (personas, recursos, procesos), valoracion del riesgo, procedimientos de respuesta y programa de simulacros.
- **Ciclo PHVA:** Hacer
- **Peso:** 5.0 puntos
- **Cumplimiento en plataforma:** El modulo de Planes de Emergencia (`EmergencyPlans.tsx`) permite crear planes completos con analisis de amenazas y vulnerabilidades. Incluye un pipeline de IA unico: grabacion de audio del consultor describiendo las condiciones del sitio -> transcripcion con Whisper (Edge Function `transcribe-audio`) -> analisis con Claude que genera automaticamente la identificacion de amenazas, el analisis de vulnerabilidad y las recomendaciones. El resultado se almacena estructurado en la tabla `planes_emergencia`.
- **Evidencia:** Modulo Planes de Emergencia -> Plan por empresa (amenazas, vulnerabilidades, procedimientos, analisis de IA)
- **Brechas:** No incluye modulo para registrar brigadas de emergencia (integrantes, capacitacion, dotacion) ni programa formal de simulacros con fechas y evaluacion.
- **Estado:** ✅ Cumple

---

## Capitulo 2 - Estandares Minimos para empresas con 11 a 50 trabajadores, riesgo I, II o III (Art. 9)

Capitulo 2 incluye los 7 estandares de Capitulo 1 (detallados arriba) mas 14 estandares adicionales. A continuacion se detallan los estandares exclusivos de Capitulo 2.

---

### Estandar 1.1.2: Responsabilidades en el SG-SST

- **Texto:** La empresa debe asignar y documentar las responsabilidades especificas en SST a todos los niveles de la organizacion. Las responsabilidades deben ser comunicadas y estar disponibles para consulta.
- **Ciclo PHVA:** Planear
- **Peso:** 0.5 puntos
- **Cumplimiento en plataforma:** El modulo de Documentos permite cargar el documento de asignacion de responsabilidades como tipo `politica_sst`. El sistema valida el flujo de aprobacion documental.
- **Evidencia:** Modulo Documentos -> Politica SST / Documento de responsabilidades
- **Brechas:** No existe una funcionalidad para asignar responsabilidades SST especificas por cargo o rol directamente en la plataforma. Se maneja como documento cargado.
- **Estado:** ⚠️ Parcial

---

### Estandar 1.1.3: Asignacion de Recursos para el SG-SST

- **Texto:** La empresa debe definir y asignar los recursos financieros, tecnicos, humanos y de otra indole requeridos para la implementacion y mejora del SG-SST.
- **Ciclo PHVA:** Planear
- **Peso:** 0.5 puntos
- **Cumplimiento en plataforma:** El modulo de Documentos permite cargar el presupuesto o acta de asignacion de recursos como evidencia. No hay un modulo dedicado de presupuesto SST.
- **Evidencia:** Modulo Documentos -> Presupuesto SST / Acta de asignacion de recursos
- **Brechas:** No existe un modulo de gestion presupuestal de SST con seguimiento de ejecucion.
- **Estado:** ⚠️ Parcial

---

### Estandar 1.1.7: Capacitacion del COPASST / Vigia

- **Texto:** El COPASST o Vigia de SST debe recibir capacitacion sobre sus funciones y responsabilidades. La empresa debe garantizar que los miembros estan capacitados para cumplir su rol.
- **Ciclo PHVA:** Planear
- **Peso:** 0.5 puntos
- **Cumplimiento en plataforma:** El modulo de Comites registra los integrantes del COPASST/Vigia. Las actas de reunion pueden incluir temas de capacitacion tratados. El modulo de Documentos permite cargar certificados de capacitacion.
- **Evidencia:** Modulo Comites -> Actas COPASST (temas de capacitacion) + Modulo Documentos (certificados)
- **Brechas:** No hay un registro especifico de capacitaciones del COPASST con temas, fechas, duracion y evaluacion de aprendizaje.
- **Estado:** ⚠️ Parcial

---

### Estandar 1.2.2: Capacitacion, Induccion y Reinduccion en SG-SST

- **Texto:** La empresa debe garantizar que todos los trabajadores reciban capacitacion, induccion y reinduccion en SST, incluyendo actividades de promocion y prevencion. Debe quedar registro documentado.
- **Ciclo PHVA:** Planear
- **Peso:** 2.0 puntos
- **Cumplimiento en plataforma:** El modulo de Documentos permite cargar registros de induccion y reinduccion. El modulo de Trabajadores (`Workers`) mantiene el registro de cada empleado, pero no incluye un campo de estado de induccion SST.
- **Evidencia:** Modulo Documentos -> Registros de induccion/reinduccion
- **Brechas:** No existe un modulo de capacitaciones con registro de asistencia por trabajador, evaluaciones de conocimiento, ni alertas de reinduccion periodica.
- **Estado:** ⚠️ Parcial

---

### Estandar 1.2.3: Responsable del SG-SST con Curso de 50 horas

- **Texto:** Las personas que disenen, administren o ejecuten el SG-SST deben contar con el curso virtual de 50 horas en SST, conforme a la resolucion del Ministerio del Trabajo. Para empresas de 11-50 trabajadores, el responsable debe acreditar este curso.
- **Ciclo PHVA:** Planear
- **Peso:** 2.0 puntos
- **Cumplimiento en plataforma:** El modulo de Documentos permite cargar el certificado del curso de 50 horas como evidencia documental. En el caso de Regis, los consultores ya cuentan con esta certificacion como requisito para ejercer.
- **Evidencia:** Modulo Documentos -> Certificado curso 50 horas SST
- **Brechas:** No hay una validacion automatica de vigencia del certificado ni alerta de renovacion.
- **Estado:** ⚠️ Parcial

---

### Estandar 2.1.1: Politica del SG-SST

- **Texto:** La empresa debe tener una politica de SST escrita, firmada por el representante legal, fechada, y comunicada al COPASST/Vigia y a todos los trabajadores. Debe incluir compromiso con: identificacion de peligros, prevencion de lesiones y enfermedades laborales, proteccion y promocion de la salud, y cumplimiento de la normatividad vigente.
- **Ciclo PHVA:** Planear
- **Peso:** 1.0 punto
- **Cumplimiento en plataforma:** El modulo de Documentos permite cargar la politica SST como documento tipo `politica_sst` con flujo de validacion completo. El dashboard de Cumplimiento verifica automaticamente la existencia de documentos aprobados de este tipo.
- **Evidencia:** Modulo Documentos -> Politica SST (documento firmado, estado: aprobado) + Modulo Cumplimiento (auto-deteccion)
- **Brechas:** No genera automaticamente la politica SST ni ofrece una plantilla interactiva. No valida que este firmada ni comunicada.
- **Estado:** ⚠️ Parcial

---

### Estandar 2.2.1: Objetivos del SG-SST

- **Texto:** Los objetivos del SG-SST deben ser claros, medibles, cuantificables, con metas definidas, documentados y revisados periodicamente. Deben ser coherentes con la politica de SST y el plan de trabajo anual.
- **Ciclo PHVA:** Planear
- **Peso:** 1.0 punto
- **Cumplimiento en plataforma:** El modulo de Documentos permite cargar el documento de objetivos SST como tipo `politica_sst`. El plan de trabajo anual (tambien cargado como documento) complementa este estandar.
- **Evidencia:** Modulo Documentos -> Objetivos SST / Politica SST
- **Brechas:** No hay un modulo dedicado de seguimiento de objetivos SST con indicadores de avance y metas cuantificables.
- **Estado:** ⚠️ Parcial

---

### Estandar 3.1.2: Actividades de Promocion y Prevencion en Salud

- **Texto:** La empresa debe desarrollar actividades de promocion de la salud y prevencion de enfermedades laborales conforme al diagnostico de condiciones de salud y los peligros y riesgos identificados.
- **Ciclo PHVA:** Hacer
- **Peso:** 1.0 punto
- **Cumplimiento en plataforma:** El plan de trabajo anual (cargado en Documentos) debe incluir el cronograma de actividades de promocion y prevencion. Los examenes medicos alimentan las recomendaciones que sirven como base para estas actividades.
- **Evidencia:** Modulo Documentos -> Plan de trabajo anual + Modulo Examenes Medicos -> Recomendaciones
- **Brechas:** No hay un modulo de seguimiento de actividades de PyP con evidencias de ejecucion (fotos, listas de asistencia, evaluaciones).
- **Estado:** ⚠️ Parcial

---

### Estandar 3.1.3: Informacion al Medico de Perfiles de Cargo

- **Texto:** El empleador debe informar al medico laboral los perfiles de cargo con una descripcion de las tareas y los riesgos a los que estara expuesto el trabajador, para que las evaluaciones medicas sean pertinentes.
- **Ciclo PHVA:** Hacer
- **Peso:** 1.0 punto
- **Cumplimiento en plataforma:** La matriz de riesgos por empresa identifica los peligros por area/proceso. La informacion de los trabajadores (cargo, area) en el modulo de Trabajadores complementa la informacion necesaria para los profesiogramas.
- **Evidencia:** Modulo Matrices de Riesgo -> Peligros por proceso/area + Modulo Trabajadores -> Cargos y areas
- **Brechas:** No genera automaticamente profesiogramas ni documentos formales de perfil de cargo con exposicion a riesgos para entregar al medico ocupacional.
- **Estado:** ⚠️ Parcial

---

### Estandar 3.1.4: Realizacion de Examenes Medicos Ocupacionales

- **Texto:** La empresa debe realizar examenes medicos de ingreso, periodicos y de egreso conforme a la normatividad vigente. Los examenes periodicos deben realizarse segun los factores de riesgo a los que esta expuesto cada trabajador.
- **Ciclo PHVA:** Hacer
- **Peso:** 1.0 punto
- **Cumplimiento en plataforma:** El modulo de Examenes Medicos registra los tres tipos de examen (ingreso, periodico, egreso) vinculados a cada trabajador. La extraccion por IA del PDF permite capturar los datos clinicos automaticamente. El sistema alerta sobre trabajadores sin examen vigente.
- **Evidencia:** Modulo Examenes Medicos -> Registros por trabajador y tipo + PDFs almacenados
- **Brechas:** No alerta automaticamente cuando un examen periodico esta proximo a vencer (segun periodicidad definida por riesgo).
- **Estado:** ✅ Cumple

---

### Estandar 3.1.5: Custodia de Historias Clinicas

- **Texto:** Los documentos que contengan datos de historia clinica de los trabajadores deben custodiarse en condiciones que garanticen confidencialidad, integridad y disponibilidad. La custodia esta a cargo del prestador de servicios de salud o del medico laboral.
- **Ciclo PHVA:** Hacer
- **Peso:** 1.0 punto
- **Cumplimiento en plataforma:** Los PDFs de examenes medicos se almacenan en Supabase Storage (bucket `documentos`) con control de acceso mediante RLS. Solo usuarios autenticados con rol admin/consultor pueden acceder. Los datos extraidos se almacenan en la base de datos con politicas de seguridad a nivel de fila.
- **Evidencia:** Supabase Storage -> `documentos/examenes_medicos/{empresa_id}/` + Control de acceso RLS
- **Brechas:** No implementa cifrado de extremo a extremo para los documentos medicos. El acceso se controla por RLS pero los archivos en el bucket son tecnicamente accesibles con la URL directa (bucket publico). Deberia ser bucket privado para historias clinicas.
- **Estado:** ⚠️ Parcial

---

### Estandar 3.1.6: Restricciones y Recomendaciones Medico-Laborales

- **Texto:** La empresa debe cumplir con las restricciones y recomendaciones emitidas por el medico laboral. Debe haber un seguimiento documentado de su implementacion.
- **Ciclo PHVA:** Hacer
- **Peso:** 1.0 punto
- **Cumplimiento en plataforma:** El modulo de Examenes Medicos extrae automaticamente recomendaciones y restricciones del PDF del examen (via IA). Estas se almacenan en la tabla `recomendaciones_medicas` con estados de seguimiento: pendiente, en_cumplimiento, cumplida. Cada recomendacion tiene tipo (recomendacion/restriccion), descripcion y opcionalmente fecha de vencimiento.
- **Evidencia:** Modulo Examenes Medicos -> Pestana Recomendaciones (listado con filtro por estado, tipo y trabajador)
- **Brechas:** Ninguna significativa. El seguimiento estructurado con estados es exactamente lo requerido.
- **Estado:** ✅ Cumple

---

### Estandar 3.2.1: Reporte de Accidentes de Trabajo y Enfermedad Laboral

- **Texto:** La empresa debe reportar a la ARL, EPS y Direccion Territorial del Ministerio del Trabajo los accidentes de trabajo y enfermedades laborales, dentro de los plazos legales (accidente grave o mortal: inmediatamente; accidente con incapacidad: dentro de los 2 dias habiles siguientes).
- **Ciclo PHVA:** Hacer
- **Peso:** 2.0 puntos
- **Cumplimiento en plataforma:** No hay un modulo dedicado de registro y reporte de accidentes de trabajo e incidentes en la plataforma.
- **Evidencia:** No disponible en la plataforma actualmente.
- **Brechas:** Falta un modulo completo de registro, investigacion y reporte de accidentes de trabajo, incidentes y enfermedades laborales. Este es un gap significativo para Capitulo 2.
- **Estado:** ❌ No cumple

---

### Estandar 3.2.2: Investigacion de Accidentes, Incidentes y Enfermedad Laboral

- **Texto:** La empresa debe investigar todos los incidentes y accidentes de trabajo con participacion del COPASST/Vigia, dentro de los 15 dias calendario siguientes al evento. Los resultados deben comunicarse al COPASST y deben generar acciones correctivas.
- **Ciclo PHVA:** Hacer
- **Peso:** 2.0 puntos
- **Cumplimiento en plataforma:** No hay un modulo dedicado de investigacion de accidentes. Las actas del COPASST pueden documentar discusiones sobre accidentes investigados, pero no hay un flujo estructurado de investigacion.
- **Evidencia:** Parcialmente en Modulo Comites -> Actas COPASST (si se documenta la discusion)
- **Brechas:** Falta un modulo de investigacion de accidentes con formato FURAT, arbol de causas, plan de acciones correctivas y seguimiento.
- **Estado:** ❌ No cumple

---

### Estandar 4.2.2: Verificacion de Medidas de Prevencion y Control

- **Texto:** La empresa debe verificar la aplicacion de las medidas de prevencion y control por parte de los trabajadores, contratistas y subcontratistas.
- **Ciclo PHVA:** Hacer
- **Peso:** 2.5 puntos
- **Cumplimiento en plataforma:** El modulo de Inventario de Equipos permite verificar el estado de EPP y equipos de seguridad con fechas de vencimiento. Las inspecciones del COPASST documentadas en actas complementan la verificacion. Sin embargo, no hay un modulo formal de inspecciones de seguridad.
- **Evidencia:** Modulo Inventario de Equipos -> Estado y vencimiento de EPP + Modulo Comites -> Actas de inspeccion del COPASST
- **Brechas:** No existe un modulo dedicado de inspecciones de seguridad con listas de chequeo, programacion periodica y registro fotografico.
- **Estado:** ⚠️ Parcial

---

### Estandar 4.2.4: Inspeccion con el COPASST o Vigia

- **Texto:** La empresa debe realizar inspecciones sistematicas de las instalaciones, equipos y herramientas con participacion del COPASST o Vigia de SST. Las inspecciones deben ser periodicas y documentadas.
- **Ciclo PHVA:** Hacer
- **Peso:** 2.5 puntos
- **Cumplimiento en plataforma:** Las actas del COPASST en el modulo de Comites pueden documentar los resultados de inspecciones realizadas. El Inventario de Equipos complementa con el seguimiento de equipos de emergencia.
- **Evidencia:** Modulo Comites -> Actas COPASST (resultados de inspecciones) + Modulo Inventario de Equipos
- **Brechas:** No hay un formato estandar de inspeccion integrado ni programacion automatica de inspecciones periodicas.
- **Estado:** ⚠️ Parcial

---

### Estandar 4.2.6: Entrega de EPP

- **Texto:** La empresa debe suministrar elementos de proteccion personal (EPP) acordes con los peligros identificados y verificar su uso. Debe quedar registro de entrega y capacitacion en uso correcto. Se debe verificar con contratistas y subcontratistas.
- **Ciclo PHVA:** Hacer
- **Peso:** 2.5 puntos
- **Cumplimiento en plataforma:** El modulo de Inventario de Equipos permite registrar EPP con cantidades, fechas de vencimiento y alertas. Sin embargo, no hay un registro individual de entrega de EPP por trabajador.
- **Evidencia:** Modulo Inventario de Equipos -> Registro de EPP disponible
- **Brechas:** No existe un formato de entrega individual de EPP por trabajador (con firma, fecha, tipo de elemento) ni verificacion de uso.
- **Estado:** ⚠️ Parcial

---

### Estandar 5.1.2: Brigada de Emergencia Conformada, Capacitada y Dotada

- **Texto:** La empresa debe conformar, capacitar y dotar una brigada de prevencion, preparacion y respuesta ante emergencias. La brigada debe estar entrenada en primeros auxilios, control de incendios y evacuacion.
- **Ciclo PHVA:** Hacer
- **Peso:** 5.0 puntos
- **Cumplimiento en plataforma:** El modulo de Planes de Emergencia documenta el plan general pero no incluye un registro especifico de integrantes de brigada, su capacitacion ni dotacion.
- **Evidencia:** Modulo Planes de Emergencia -> Plan general (puede incluir mencion de brigada en el analisis de IA)
- **Brechas:** No hay un registro estructurado de brigada de emergencia con integrantes, roles (primeros auxilios, incendios, evacuacion), capacitaciones recibidas y dotacion asignada.
- **Estado:** ⚠️ Parcial

---

### Estandar 6.1.2: Auditoria Anual del SG-SST

- **Texto:** La empresa debe adelantar al menos una auditoria anual al SG-SST, la cual debe incluir el cumplimiento de la politica, los resultados de los indicadores, la participacion de los trabajadores, y el desarrollo del plan de trabajo.
- **Ciclo PHVA:** Verificar
- **Peso:** 1.25 puntos
- **Cumplimiento en plataforma:** El modulo de Cumplimiento permite realizar evaluaciones periodicas del SG-SST con puntaje PHVA. El registro de actividad (Activity Log) documenta todas las acciones realizadas en la plataforma. La evaluacion exportable sirve como evidencia de revision.
- **Evidencia:** Modulo Cumplimiento -> Evaluacion 0312 anual (exportable) + Modulo Log de Actividad -> Registro de acciones
- **Brechas:** No genera un informe formal de auditoria con hallazgos, no conformidades y plan de accion. La evaluacion 0312 es una herramienta de auto-evaluacion, no una auditoria formal.
- **Estado:** ⚠️ Parcial

---

### Estandar 6.1.3: Revision Anual por la Alta Direccion

- **Texto:** La alta direccion debe revisar al menos una vez al ano el SG-SST. La revision debe incluir los resultados de la auditoria, los indicadores, las investigaciones de accidentes, y la identificacion de nuevos peligros.
- **Ciclo PHVA:** Verificar
- **Peso:** 1.25 puntos
- **Cumplimiento en plataforma:** El reporte de empresa (`CompanyReport.tsx`) consolida informacion de todos los modulos para facilitar la revision por la direccion. El dashboard muestra indicadores clave. La evaluacion 0312 exportable puede usarse en la reunion de revision.
- **Evidencia:** Reporte de Empresa (consolidado exportable) + Modulo Cumplimiento -> Evaluacion 0312
- **Brechas:** No genera un acta formal de revision por la direccion con los elementos requeridos por norma (resultados de indicadores, estadisticas de AT/EL, cambios en contexto, etc.).
- **Estado:** ⚠️ Parcial

---

### Estandar 7.1.1: Acciones de Promocion y Prevencion basadas en Resultados del SG-SST

- **Texto:** La empresa debe definir e implementar acciones de promocion y prevencion con base en los resultados del SG-SST, las investigaciones de accidentes e incidentes, y las recomendaciones del COPASST.
- **Ciclo PHVA:** Actuar
- **Peso:** 2.5 puntos
- **Cumplimiento en plataforma:** El modulo de Cumplimiento identifica brechas que pueden traducirse en acciones de mejora. Las recomendaciones medicas con seguimiento alimentan acciones preventivas. Las actas del COPASST documentan compromisos.
- **Evidencia:** Modulo Cumplimiento -> Brechas identificadas + Modulo Examenes Medicos -> Recomendaciones + Modulo Comites -> Compromisos en actas
- **Brechas:** No hay un modulo dedicado de plan de mejora con acciones correctivas/preventivas, responsables, fechas y seguimiento de cierre.
- **Estado:** ⚠️ Parcial

---

### Estandar 7.1.2: Medidas Correctivas, Preventivas y de Mejora

- **Texto:** La empresa debe tomar las medidas correctivas, preventivas y/o de mejora que resulten de la investigacion de incidentes, accidentes y enfermedades laborales, las inspecciones, la evaluacion de estandares minimos y las recomendaciones del COPASST.
- **Ciclo PHVA:** Actuar
- **Peso:** 2.5 puntos
- **Cumplimiento en plataforma:** El registro de actividad documenta acciones realizadas. Las actas del COPASST pueden incluir seguimiento de acciones correctivas. Sin embargo, no hay un ciclo formal de accion correctiva.
- **Evidencia:** Modulo Log de Actividad + Modulo Comites -> Actas con seguimiento de compromisos
- **Brechas:** No existe un modulo formal de acciones correctivas y preventivas con clasificacion (correccion, accion correctiva, accion preventiva, mejora), analisis de causas, plan de accion, seguimiento y cierre.
- **Estado:** ⚠️ Parcial

---

### Estandar 7.1.3: Acciones de Mejora por Investigacion de AT/EL

- **Texto:** La empresa debe ejecutar las acciones preventivas, correctivas y de mejora resultado de la investigacion de incidentes, accidentes de trabajo y enfermedades laborales, verificando su efectividad.
- **Ciclo PHVA:** Actuar
- **Peso:** 2.5 puntos
- **Cumplimiento en plataforma:** Depende del modulo de investigacion de accidentes que actualmente no existe en la plataforma.
- **Evidencia:** No disponible directamente. Parcialmente en actas COPASST si se documenta seguimiento.
- **Brechas:** Al no existir modulo de investigacion de accidentes (Estandar 3.2.1 y 3.2.2), este estandar tampoco tiene soporte.
- **Estado:** ❌ No cumple

---

## Tabla Resumen

### Capitulo 1 (7 estandares - empresas con 10 o menos trabajadores, riesgo I-III)

| # | Item | Estandar | Ciclo | Peso | Estado | Modulo Principal |
|---|------|----------|-------|------|--------|-----------------|
| 1 | 1.1.1 | Responsable del SG-SST | Planear | 0.5 | ⚠️ Parcial | Empresas + Documentos |
| 2 | 1.1.4 | Afiliacion a seguridad social (PILA) | Planear | 0.5 | ✅ Cumple | PILA |
| 3 | 1.1.6 | Conformacion COPASST/Vigia | Planear | 0.5 | ✅ Cumple | Comites |
| 4 | 1.1.8 | Comite de Convivencia Laboral | Planear | 0.5 | ⚠️ Parcial | Comites |
| 5 | 1.2.1 | Programa de capacitacion PyP | Planear | 2.0 | ⚠️ Parcial | Documentos |
| 6 | 2.3.1 | Evaluacion e identificacion de prioridades | Planear | 1.0 | ✅ Cumple | Cumplimiento |
| 7 | 2.4.1 | Plan anual de trabajo | Planear | 2.0 | ⚠️ Parcial | Documentos |
| 8 | 3.1.1 | Evaluaciones medicas ocupacionales | Hacer | 1.0 | ✅ Cumple | Examenes Medicos |
| 9 | 4.1.2 | Identificacion de peligros y valoracion de riesgos | Hacer | 4.0 | ✅ Cumple | Matrices de Riesgo |
| 10 | 4.2.1 | Medidas de prevencion y control | Hacer | 2.5 | ⚠️ Parcial | Matrices + Inventario |
| 11 | 5.1.1 | Plan de emergencias | Hacer | 5.0 | ✅ Cumple | Planes de Emergencia |

**Totales Capitulo 1:**
- ✅ Cumple: 6 estandares (14.5 puntos de peso combinado)
- ⚠️ Parcial: 5 estandares (6.0 puntos de peso combinado)
- ❌ No cumple: 0 estandares

**Nota sobre puntaje:** En Capitulo 1, los estandares de Capitulo 2 y 3 que no aplican se califican con puntaje maximo automaticamente (Art. 27). El puntaje mostrado es solo sobre los 7 estandares aplicables (renormalizados a 100%).

---

### Capitulo 2 (21 estandares - empresas con 11 a 50 trabajadores, riesgo I-III)

| # | Item | Estandar | Ciclo | Peso | Estado | Modulo Principal |
|---|------|----------|-------|------|--------|-----------------|
| 1 | 1.1.1 | Responsable del SG-SST | Planear | 0.5 | ⚠️ Parcial | Empresas + Documentos |
| 2 | 1.1.2 | Responsabilidades en el SG-SST | Planear | 0.5 | ⚠️ Parcial | Documentos |
| 3 | 1.1.3 | Asignacion de recursos | Planear | 0.5 | ⚠️ Parcial | Documentos |
| 4 | 1.1.4 | Afiliacion a seguridad social (PILA) | Planear | 0.5 | ✅ Cumple | PILA |
| 5 | 1.1.6 | Conformacion COPASST/Vigia | Planear | 0.5 | ✅ Cumple | Comites |
| 6 | 1.1.7 | Capacitacion COPASST/Vigia | Planear | 0.5 | ⚠️ Parcial | Comites + Documentos |
| 7 | 1.1.8 | Comite de Convivencia Laboral | Planear | 0.5 | ⚠️ Parcial | Comites |
| 8 | 1.2.1 | Programa de capacitacion PyP | Planear | 2.0 | ⚠️ Parcial | Documentos |
| 9 | 1.2.2 | Capacitacion, induccion y reinduccion SST | Planear | 2.0 | ⚠️ Parcial | Documentos |
| 10 | 1.2.3 | Responsable con curso 50 horas | Planear | 2.0 | ⚠️ Parcial | Documentos |
| 11 | 2.1.1 | Politica del SG-SST | Planear | 1.0 | ⚠️ Parcial | Documentos |
| 12 | 2.2.1 | Objetivos del SG-SST | Planear | 1.0 | ⚠️ Parcial | Documentos |
| 13 | 2.3.1 | Evaluacion e identificacion de prioridades | Planear | 1.0 | ✅ Cumple | Cumplimiento |
| 14 | 2.4.1 | Plan anual de trabajo | Planear | 2.0 | ⚠️ Parcial | Documentos |
| 15 | 3.1.1 | Evaluacion medica ocupacional | Hacer | 1.0 | ✅ Cumple | Examenes Medicos |
| 16 | 3.1.2 | Actividades de PyP en salud | Hacer | 1.0 | ⚠️ Parcial | Documentos |
| 17 | 3.1.3 | Informacion al medico de perfiles | Hacer | 1.0 | ⚠️ Parcial | Matrices + Trabajadores |
| 18 | 3.1.4 | Realizacion de examenes medicos | Hacer | 1.0 | ✅ Cumple | Examenes Medicos |
| 19 | 3.1.5 | Custodia de historias clinicas | Hacer | 1.0 | ⚠️ Parcial | Supabase Storage |
| 20 | 3.1.6 | Restricciones y recomendaciones medicas | Hacer | 1.0 | ✅ Cumple | Examenes Medicos |
| 21 | 3.2.1 | Reporte de AT/EL | Hacer | 2.0 | ❌ No cumple | No disponible |
| 22 | 3.2.2 | Investigacion de AT/EL | Hacer | 2.0 | ❌ No cumple | No disponible |
| 23 | 4.1.2 | Identificacion de peligros | Hacer | 4.0 | ✅ Cumple | Matrices de Riesgo |
| 24 | 4.2.1 | Medidas de prevencion y control | Hacer | 2.5 | ⚠️ Parcial | Matrices + Inventario |
| 25 | 4.2.2 | Verificacion de medidas | Hacer | 2.5 | ⚠️ Parcial | Inventario + Comites |
| 26 | 4.2.4 | Inspeccion con COPASST/Vigia | Hacer | 2.5 | ⚠️ Parcial | Comites |
| 27 | 4.2.6 | Entrega de EPP | Hacer | 2.5 | ⚠️ Parcial | Inventario |
| 28 | 5.1.1 | Plan de emergencias | Hacer | 5.0 | ✅ Cumple | Planes de Emergencia |
| 29 | 5.1.2 | Brigada de emergencia | Hacer | 5.0 | ⚠️ Parcial | Planes de Emergencia |
| 30 | 6.1.2 | Auditoria anual | Verificar | 1.25 | ⚠️ Parcial | Cumplimiento |
| 31 | 6.1.3 | Revision por la alta direccion | Verificar | 1.25 | ⚠️ Parcial | Cumplimiento + Reportes |
| 32 | 7.1.1 | Acciones de PyP basadas en resultados | Actuar | 2.5 | ⚠️ Parcial | Cumplimiento + Comites |
| 33 | 7.1.2 | Medidas correctivas y preventivas | Actuar | 2.5 | ⚠️ Parcial | Log Actividad + Comites |
| 34 | 7.1.3 | Acciones por investigacion AT/EL | Actuar | 2.5 | ❌ No cumple | No disponible |

**Totales Capitulo 2:**
- ✅ Cumple: 8 estandares
- ⚠️ Parcial: 23 estandares
- ❌ No cumple: 3 estandares (3.2.1, 3.2.2, 7.1.3 - todos relacionados con investigacion de accidentes)

---

## Analisis de Brechas Principales

### 1. Investigacion de Accidentes de Trabajo e Incidentes (CRITICO)
**Estandares afectados:** 3.2.1 (2.0 pts), 3.2.2 (2.0 pts), 7.1.3 (2.5 pts) = **6.5 puntos en riesgo**
**Impacto:** Solo aplica a Capitulo 2. Es el unico grupo de estandares con estado "No cumple".
**Recomendacion:** Desarrollar un modulo de registro, investigacion y seguimiento de accidentes de trabajo, incidentes y enfermedades laborales. Debe incluir formato FURAT, arbol de causas, plan de acciones correctivas y seguimiento de cierre.

### 2. Modulo de Capacitaciones (MODERADO)
**Estandares afectados:** 1.2.1 (2.0 pts), 1.2.2 (2.0 pts), 1.2.3 (2.0 pts), 1.1.7 (0.5 pts) = **6.5 puntos parciales**
**Impacto:** Actualmente se maneja solo como documentos cargados, sin registro estructurado.
**Recomendacion:** Crear un modulo de capacitaciones con cronograma, registro de asistencia, evaluaciones y alertas de vencimiento.

### 3. Plan de Acciones Correctivas y Preventivas (MODERADO)
**Estandares afectados:** 7.1.1 (2.5 pts), 7.1.2 (2.5 pts) = **5.0 puntos parciales**
**Impacto:** El ciclo Actuar queda sin soporte estructurado.
**Recomendacion:** Implementar un modulo de plan de mejora con acciones correctivas/preventivas, responsables, fechas y verificacion de eficacia.

### 4. Inspecciones de Seguridad (MENOR)
**Estandares afectados:** 4.2.2 (2.5 pts), 4.2.4 (2.5 pts) = **5.0 puntos parciales**
**Impacto:** Las inspecciones se documentan parcialmente en actas del COPASST.
**Recomendacion:** Agregar un modulo o sub-modulo de inspecciones con listas de chequeo configurables y programacion periodica.

---

## Cobertura por Ciclo PHVA

### Capitulo 1

| Ciclo | Estandares Aplicables | Cumple | Parcial | No Cumple | Peso Total |
|-------|----------------------|--------|---------|-----------|------------|
| Planear | 7 | 3 | 4 | 0 | 7.0 pts |
| Hacer | 4 | 3 | 1 | 0 | 12.5 pts |
| Verificar | 0 | 0 | 0 | 0 | N/A |
| Actuar | 0 | 0 | 0 | 0 | N/A |
| **Total** | **11** | **6** | **5** | **0** | **19.5 pts** |

### Capitulo 2

| Ciclo | Estandares Aplicables | Cumple | Parcial | No Cumple | Peso Total |
|-------|----------------------|--------|---------|-----------|------------|
| Planear | 14 | 3 | 11 | 0 | 14.5 pts |
| Hacer | 14 | 5 | 6 | 3 | 33.0 pts |
| Verificar | 2 | 0 | 2 | 0 | 2.5 pts |
| Actuar | 3 | 0 | 2 | 1 | 7.5 pts |
| **Total** | **33** | **8** | **21** | **4** | **57.5 pts** |

**Nota:** La numeracion de 33 items en Capitulo 2 corresponde a los items individuales de la tabla de valores (Art. 27), no a los 21 estandares agrupados. La Resolucion 0312 define 21 estandares para Capitulo 2, pero algunos estandares contienen multiples items de evaluacion.

---

## Modulos de la Plataforma vs. Estandares Cubiertos

| Modulo | Items Cubiertos (Cumple) | Items Cubiertos (Parcial) | Estandares Clave |
|--------|-------------------------|--------------------------|------------------|
| PILA | 1.1.4 | - | Afiliacion seguridad social |
| Examenes Medicos | 3.1.1, 3.1.4, 3.1.6 | 3.1.3, 3.1.5 | Evaluaciones, recomendaciones |
| Matrices de Riesgo | 4.1.2 | 4.2.1, 3.1.3 | GTC 45, peligros, controles |
| Comites (COPASST) | 1.1.6 | 1.1.7, 4.2.4, 6.1.2 | Conformacion, actas, inspecciones |
| Comites (Convivencia) | - | 1.1.8 | Conformacion, actas |
| Planes de Emergencia | 5.1.1 | 5.1.2 | Plan emergencias, brigada |
| Cumplimiento | 2.3.1 | 6.1.2, 6.1.3 | Evaluacion 0312, auditoria |
| Documentos | - | 1.1.1, 1.1.2, 1.1.3, 1.2.1, 1.2.2, 1.2.3, 2.1.1, 2.2.1, 2.4.1 | Politica, plan, capacitaciones |
| Inventario Equipos | - | 4.2.1, 4.2.2, 4.2.6 | EPP, equipos emergencia |
| Trabajadores | - | 3.1.3 | Perfiles de cargo |
| Log Actividad | - | 7.1.2 | Trazabilidad de acciones |
| **No cubierto** | - | - | 3.2.1, 3.2.2, 7.1.3 (AT/EL) |
