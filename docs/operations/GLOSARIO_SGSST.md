# Glosario SG-SST y Términos Técnicos del Proyecto

> Referencia rápida de terminología de Seguridad y Salud en el Trabajo (SG-SST) y conceptos técnicos utilizados en la plataforma Regis SG-SST. Organizado por categorías con definiciones, ejemplos, referencias legales y módulos relacionados.

---

## A) Términos SG-SST

### 1. SG-SST — Sistema de Gestión de Seguridad y Salud en el Trabajo
- **Definición:** Proceso lógico y por etapas que permite gestionar los peligros y riesgos laborales. Integra políticas, organización, planificación, aplicación, evaluación, auditoría y acciones de mejora para anticipar, reconocer, evaluar y controlar riesgos que puedan afectar la seguridad y salud de los trabajadores.
- **Referencia legal:** Decreto 1072 de 2015, Libro 2, Parte 2, Título 4, Capítulo 6.
- **Módulo relacionado:** Todos los módulos de la plataforma.

### 2. Resolución 0312 de 2019
- **Definición:** Norma que define los estándares mínimos del SG-SST según el tamaño de la empresa y su nivel de riesgo. Establece tres capítulos: Cap. 1 (7 estándares para empresas de 1-10 trabajadores, riesgo I-III), Cap. 2 (21 estándares para 11-50 trabajadores, riesgo I-III) y Cap. 3 (60 estándares para empresas de mayor tamaño o riesgo IV-V).
- **Ejemplo:** Una empresa con 8 trabajadores y riesgo II aplica Capítulo 1 y debe cumplir 7 estándares mínimos.
- **Referencia legal:** Resolución 0312 de 2019, Ministerio del Trabajo.
- **Módulo relacionado:** Cumplimiento (`Compliance.tsx`).

### 3. COPASST — Comité Paritario de Seguridad y Salud en el Trabajo
- **Definición:** Organismo de promoción y vigilancia de las normas de SST dentro de la empresa. Obligatorio para empresas con más de 10 trabajadores. Compuesto por igual número de representantes del empleador y de los trabajadores, elegidos por períodos de dos años.
- **Ejemplo:** Una empresa con 25 trabajadores conforma un COPASST con 2 representantes del empleador y 2 de los trabajadores, más sus suplentes.
- **Referencia legal:** Decreto 1072 de 2015, Art. 2.2.4.6.8; Resolución 2013 de 1986.
- **Módulo relacionado:** Comités (`Committees.tsx`).

### 4. Vigía SST — Vigía de Seguridad y Salud en el Trabajo
- **Definición:** Persona designada por el empleador para cumplir funciones equivalentes al COPASST en empresas con 10 o menos trabajadores. Tiene las mismas responsabilidades de vigilancia y promoción de la SST.
- **Ejemplo:** En una empresa de 6 trabajadores, el empleador designa a uno de ellos como Vigía SST.
- **Referencia legal:** Decreto 1072 de 2015, Art. 2.2.4.6.8, Parágrafo 1.
- **Módulo relacionado:** Comités (`Committees.tsx`).

### 5. PILA — Planilla Integrada de Liquidación de Aportes
- **Definición:** Documento electrónico mensual mediante el cual los empleadores liquidan y pagan los aportes al Sistema de Seguridad Social Integral (salud, pensión, riesgos laborales) y parafiscales (caja de compensación, SENA, ICBF). Es obligatoria y su pago oportuno es verificable.
- **Ejemplo:** La empresa Construandes Ltda paga su PILA del período 2026-04 antes del día 15 del mes siguiente.
- **Referencia legal:** Decreto 1465 de 2005; Resolución 2388 de 2016.
- **Módulo relacionado:** PILA (`Pila.tsx`), Upload público (`PublicUpload.tsx`).

### 6. ARL — Administradora de Riesgos Laborales
- **Definición:** Entidad aseguradora que cubre los accidentes de trabajo y enfermedades laborales. Toda empresa debe afiliar a sus trabajadores a una ARL. La ARL brinda asesoría, capacitación y paga prestaciones económicas y asistenciales derivadas de eventos laborales.
- **Ejemplo:** Un trabajador sufre un accidente de trabajo y la ARL cubre los gastos médicos y la incapacidad temporal.
- **Referencia legal:** Ley 1562 de 2012; Decreto 1072 de 2015.
- **Módulo relacionado:** Cumplimiento (`Compliance.tsx`), Empresas (`empresas_cliente`).

### 7. EPP — Elementos de Protección Personal
- **Definición:** Dispositivos, accesorios y vestimenta que utiliza el trabajador para protegerse de riesgos que puedan amenazar su seguridad o salud. Incluye cascos, guantes, gafas de seguridad, protectores auditivos, arneses, botas de seguridad, entre otros.
- **Ejemplo:** En una obra de construcción se requieren casco, guantes, botas con punta de acero y arnés para trabajos en alturas.
- **Referencia legal:** Decreto 1072 de 2015, Art. 2.2.4.6.24.
- **Módulo relacionado:** Inventario de Equipos (`EquipmentInventory.tsx`), Matrices de Riesgo (`RiskMatrices.tsx`).

### 8. GTC 45 — Guía Técnica Colombiana 45
- **Definición:** Metodología estandarizada para la identificación de peligros, evaluación y valoración de riesgos en el entorno laboral. Define niveles de probabilidad, consecuencia e interpretación del riesgo para priorizar controles. Es la metodología más utilizada en Colombia para construir matrices de riesgo.
- **Ejemplo:** Se evalúa el riesgo biomecánico de postura prolongada: probabilidad media, consecuencia moderada = riesgo tolerable.
- **Referencia legal:** GTC 45:2012, ICONTEC.
- **Módulo relacionado:** Matrices de Riesgo (`RiskMatrices.tsx`).

### 9. PHVA — Planear, Hacer, Verificar, Actuar
- **Definición:** Ciclo de mejora continua que estructura el SG-SST en cuatro fases: Planear (políticas, objetivos, recursos), Hacer (implementación), Verificar (auditoría e indicadores) y Actuar (acciones correctivas y preventivas). Los estándares de la Resolución 0312 se agrupan según este ciclo.
- **Ejemplo:** En la fase Verificar, se realiza la auditoría anual del SG-SST y se revisan indicadores de accidentalidad.
- **Referencia legal:** Decreto 1072 de 2015, Art. 2.2.4.6.17-21.
- **Módulo relacionado:** Cumplimiento (`Compliance.tsx`).

### 10. Matriz de riesgo
- **Definición:** Herramienta que permite identificar, analizar y valorar los peligros y riesgos presentes en el ambiente laboral. Registra la fuente del peligro, los efectos posibles, los controles existentes y los niveles de riesgo según la metodología GTC 45.
- **Ejemplo:** La matriz identifica riesgo eléctrico en el área de servidores con nivel de riesgo alto, requiriendo controles de ingeniería.
- **Referencia legal:** Decreto 1072 de 2015, Art. 2.2.4.6.15.
- **Módulo relacionado:** Matrices de Riesgo (`RiskMatrices.tsx`).

### 11. Plan de emergencias
- **Definición:** Documento que establece los procedimientos, recursos y organización para responder ante situaciones de emergencia (sismos, incendios, inundaciones, derrames químicos, amenazas sociales). Incluye análisis de amenazas, vulnerabilidad, planes de evacuación y directorio de emergencias.
- **Ejemplo:** El plan define rutas de evacuación, punto de encuentro y brigadas asignadas para caso de sismo.
- **Referencia legal:** Decreto 1072 de 2015, Art. 2.2.4.6.25.
- **Módulo relacionado:** Planes de Emergencia (`EmergencyPlans.tsx`).

### 12. Acta de comité
- **Definición:** Documento formal que registra el desarrollo de las reuniones del COPASST, Convivencia Laboral o cualquier otro comité. Incluye fecha, asistentes, temas tratados, compromisos y firmas. Es evidencia obligatoria para auditorías.
- **Ejemplo:** El acta del COPASST de marzo 2026 registra la inspección realizada al área de bodega y los hallazgos encontrados.
- **Referencia legal:** Decreto 1072 de 2015; Resolución 0312 de 2019.
- **Módulo relacionado:** Comités (`Committees.tsx`), Edge Function `generate-acta`.

### 13. Examen médico ocupacional
- **Definición:** Evaluación médica que se realiza al trabajador en tres momentos: ingreso (pre-ocupacional), periódico (durante la vinculación) y egreso (retiro). Determina la aptitud del trabajador para desempeñar sus funciones y detecta condiciones de salud relacionadas con la exposición a riesgos laborales.
- **Ejemplo:** Al ingresar a la empresa, el trabajador se realiza examen de ingreso que incluye visiometría, audiometría y examen físico general.
- **Referencia legal:** Resolución 2346 de 2007; Decreto 1072 de 2015, Art. 2.2.4.6.24.
- **Módulo relacionado:** Exámenes Médicos (`MedicalExams.tsx`), Edge Function `process-exam-pdf`.

### 14. Concepto de aptitud
- **Definición:** Resultado del examen médico ocupacional que clasifica al trabajador como: apto sin restricciones, apto con restricciones (puede trabajar con limitaciones específicas) o no apto (no puede desempeñar el cargo evaluado).
- **Ejemplo:** Un trabajador con diagnóstico de lumbalgia recibe concepto "apto con restricciones: no levantar cargas superiores a 15 kg".
- **Referencia legal:** Resolución 2346 de 2007, Art. 15.
- **Módulo relacionado:** Exámenes Médicos (`MedicalExams.tsx`).

### 15. Amenaza
- **Definición:** Peligro latente asociado a un fenómeno natural, tecnológico o social que puede manifestarse en un lugar específico y con una duración e intensidad determinadas. Se clasifica en: natural (sismo, inundación), tecnológica (incendio, fuga de gas) y social (asalto, terrorismo).
- **Ejemplo:** Una empresa ubicada en zona sísmica identifica el sismo como amenaza natural con probabilidad alta.
- **Referencia legal:** Decreto 1072 de 2015, Art. 2.2.4.6.25.
- **Módulo relacionado:** Planes de Emergencia (`EmergencyPlans.tsx`).

### 16. Vulnerabilidad
- **Definición:** Grado de susceptibilidad o fragilidad de personas, recursos, sistemas y procesos ante una amenaza específica. Se evalúa en tres elementos: personas, recursos y sistemas/procesos. Un nivel alto de vulnerabilidad combinado con una amenaza probable genera un riesgo alto de emergencia.
- **Ejemplo:** La empresa no tiene brigada de emergencias ni extintores vigentes: vulnerabilidad alta ante incendio.
- **Referencia legal:** Decreto 1072 de 2015, Art. 2.2.4.6.25.
- **Módulo relacionado:** Planes de Emergencia (`EmergencyPlans.tsx`).

### 17. Nivel de riesgo (ARL)
- **Definición:** Clasificación de I a V que se asigna a cada empresa según su actividad económica principal (código CIIU). Determina la tarifa de cotización a la ARL. Riesgo I es el más bajo (actividades administrativas) y Riesgo V el más alto (minería, construcción pesada). La plataforma Regis atiende niveles I-III.
- **Ejemplo:** Una empresa de consultoría (CIIU 7020) tiene nivel de riesgo I; una empresa de construcción liviana tiene nivel III.
- **Referencia legal:** Decreto 1607 de 2002; Decreto 1072 de 2015.
- **Módulo relacionado:** Empresas (`empresas_cliente`), Cumplimiento (`Compliance.tsx`).

### 18. CIIU — Clasificación Industrial Internacional Uniforme
- **Definición:** Código numérico de cuatro dígitos que clasifica la actividad económica principal de una empresa. Determina el nivel de riesgo ARL y el capítulo de la Resolución 0312 que aplica. En Colombia se utiliza la revisión 4 adaptada por el DANE.
- **Ejemplo:** CIIU 6201 corresponde a "Actividades de desarrollo de sistemas informáticos"; CIIU 6820 a "Actividades inmobiliarias realizadas a cambio de una retribución o por contrata".
- **Módulo relacionado:** Empresas (`empresas_cliente`).

### 19. NIT — Número de Identificación Tributaria
- **Definición:** Número asignado por la DIAN que identifica de manera única a cada empresa o persona jurídica en Colombia. Se utiliza en todos los documentos oficiales del SG-SST y en las planillas PILA.
- **Ejemplo:** NIT 900.123.456-7 identifica a la empresa Construandes Ltda en el sistema.
- **Módulo relacionado:** Empresas (`empresas_cliente`), Exportación de documentos (`exportHeader.ts`).

### 20. Comité de Convivencia Laboral
- **Definición:** Comité obligatorio en todas las empresas, encargado de recibir y dar trámite a quejas de acoso laboral, prevenir conductas de hostigamiento y fomentar relaciones laborales armónicas. Se reúne trimestralmente o cuando se presente una queja.
- **Ejemplo:** Un trabajador presenta queja de acoso verbal ante el Comité de Convivencia, que cita a las partes para mediación.
- **Referencia legal:** Ley 1010 de 2006; Resolución 652 de 2012 (modificada por Resolución 1356 de 2012).
- **Módulo relacionado:** Comités (`Committees.tsx`).

### 21. Decreto 1072 de 2015
- **Definición:** Decreto Único Reglamentario del Sector Trabajo. Compila todas las normas reglamentarias del sector trabajo en Colombia. El Libro 2, Parte 2, Título 4, Capítulo 6 contiene las disposiciones del SG-SST que toda empresa debe cumplir.
- **Referencia legal:** Decreto 1072 de 2015.
- **Módulo relacionado:** Cumplimiento (`Compliance.tsx`).

### 22. Accidente de trabajo (AT)
- **Definición:** Todo suceso repentino que sobrevenga por causa o con ocasión del trabajo y que produzca en el trabajador una lesión orgánica, una perturbación funcional o psiquiátrica, una invalidez o la muerte. Incluye accidentes durante el traslado trabajo-hogar si el transporte lo provee el empleador.
- **Ejemplo:** Un trabajador se cae de una escalera mientras realiza mantenimiento en las instalaciones de la empresa.
- **Referencia legal:** Ley 1562 de 2012, Art. 3.
- **Módulo relacionado:** Registro de Actividad (`ActivityLog.tsx`).

### 23. Enfermedad laboral (EL)
- **Definición:** Enfermedad contraída como resultado de la exposición a factores de riesgo inherentes a la actividad laboral o del medio en el que el trabajador se ha visto obligado a trabajar. Debe estar contenida en la tabla de enfermedades laborales o demostrar relación de causalidad.
- **Ejemplo:** Un trabajador de digitación desarrolla síndrome del túnel carpiano por movimientos repetitivos durante 5 años.
- **Referencia legal:** Ley 1562 de 2012, Art. 4; Decreto 1477 de 2014.
- **Módulo relacionado:** Exámenes Médicos (`MedicalExams.tsx`).

### 24. Indicadores del SG-SST
- **Definición:** Métricas que permiten evaluar el desempeño del SG-SST. Se dividen en indicadores de estructura (recursos disponibles), proceso (ejecución del plan) y resultado (accidentalidad, enfermedad laboral, ausentismo). Son obligatorios y deben definirse desde la planificación.
- **Ejemplo:** Tasa de accidentalidad = (N.o accidentes / N.o trabajadores) x 100. Meta: menor a 5%.
- **Referencia legal:** Decreto 1072 de 2015, Art. 2.2.4.6.19-21.
- **Módulo relacionado:** Cumplimiento (`Compliance.tsx`).

---

## B) Roles SG-SST

### 25. Responsable del SG-SST
- **Definición:** Persona designada por el empleador para diseñar, implementar, administrar y ejecutar el SG-SST. En empresas de menos de 20 trabajadores con riesgo I-III, puede ser un técnico en SST. En empresas más grandes, debe ser un profesional con licencia vigente en SST.
- **Ejemplo:** En Regis Colombia, el consultor asignado a cada empresa actúa como responsable externo del SG-SST.
- **Referencia legal:** Resolución 0312 de 2019, Art. 3-5.
- **Módulo relacionado:** Todos los módulos; rol "consultor" en la plataforma.

### 26. Brigadista de emergencia
- **Definición:** Trabajador voluntario capacitado para actuar como primer respondiente ante emergencias dentro de la empresa. Las brigadas se organizan en: evacuación, primeros auxilios y control de incendios. Deben recibir capacitación periódica y participar en simulacros.
- **Ejemplo:** El brigadista de primeros auxilios atiende a un trabajador que sufrió un desmayo mientras se activa la cadena de socorro.
- **Referencia legal:** Decreto 1072 de 2015, Art. 2.2.4.6.25.
- **Módulo relacionado:** Planes de Emergencia (`EmergencyPlans.tsx`).

### 27. Médico ocupacional
- **Definición:** Profesional médico con especialización o competencia en salud ocupacional, responsable de realizar los exámenes médicos ocupacionales y emitir los conceptos de aptitud. Debe contar con licencia vigente en SST.
- **Ejemplo:** El médico ocupacional realiza exámenes periódicos a los 12 trabajadores de la empresa y emite las recomendaciones médicas correspondientes.
- **Referencia legal:** Resolución 2346 de 2007.
- **Módulo relacionado:** Exámenes Médicos (`MedicalExams.tsx`).

### 28. Representante del empleador (en COPASST)
- **Definición:** Persona designada directamente por el empleador para integrar el COPASST. Tiene voz y voto en las decisiones del comité. El número de representantes depende del tamaño de la empresa.
- **Referencia legal:** Resolución 2013 de 1986.
- **Módulo relacionado:** Comités (`Committees.tsx`).

### 29. Representante de los trabajadores (en COPASST)
- **Definición:** Trabajador elegido por votación libre de sus compañeros para integrar el COPASST. Debe haber igual número de representantes de los trabajadores que del empleador.
- **Ejemplo:** En elecciones del COPASST, los 30 trabajadores de la empresa votan y eligen a 2 representantes principales y 2 suplentes.
- **Referencia legal:** Resolución 2013 de 1986; Decreto 1072 de 2015.
- **Módulo relacionado:** Comités (`Committees.tsx`).

### 30. Inspector de seguridad
- **Definición:** Persona encargada de realizar inspecciones periódicas a las instalaciones, equipos y procesos de la empresa para identificar condiciones inseguras y actos inseguros. Puede ser un miembro del COPASST o un trabajador designado.
- **Ejemplo:** El inspector de seguridad detecta que un extintor está vencido durante la inspección mensual y genera un hallazgo.
- **Módulo relacionado:** Inventario de Equipos (`EquipmentInventory.tsx`).

### 31. Coordinador de emergencias
- **Definición:** Persona responsable de liderar la respuesta ante emergencias. Coordina las brigadas, toma decisiones sobre evacuación y mantiene comunicación con organismos de socorro externos (bomberos, ambulancias, policía).
- **Referencia legal:** Decreto 1072 de 2015, Art. 2.2.4.6.25.
- **Módulo relacionado:** Planes de Emergencia (`EmergencyPlans.tsx`).

### 32. Alta dirección
- **Definición:** Persona o grupo de personas que dirigen y controlan una empresa al más alto nivel. Tienen la responsabilidad legal de implementar el SG-SST, asignar recursos y rendir cuentas sobre su funcionamiento.
- **Referencia legal:** Decreto 1072 de 2015, Art. 2.2.4.6.8.
- **Módulo relacionado:** Cumplimiento (`Compliance.tsx`); rol "cliente" en la plataforma.

---

## C) Documentos SG-SST

### 33. Política de SST
- **Definición:** Documento firmado por la alta dirección que establece el compromiso de la empresa con la seguridad y salud de los trabajadores. Debe ser específica, concisa, fechada, firmada y divulgada a todos los trabajadores. Se revisa mínimo una vez al año.
- **Ejemplo:** "La empresa Construandes Ltda se compromete a proteger la seguridad y salud de sus trabajadores, contratistas y visitantes..."
- **Referencia legal:** Decreto 1072 de 2015, Art. 2.2.4.6.5-6.
- **Módulo relacionado:** Cumplimiento (`Compliance.tsx`), Documentos (`Documents.tsx`).

### 34. Reglamento de higiene y seguridad industrial
- **Definición:** Documento obligatorio que establece las normas internas de higiene y seguridad industrial de la empresa. Incluye la identificación de riesgos principales, obligaciones del empleador y trabajadores, y disposiciones generales de seguridad.
- **Referencia legal:** Ley 9 de 1979, Art. 349; Código Sustantivo del Trabajo, Art. 349.
- **Módulo relacionado:** Documentos (`Documents.tsx`).

### 35. Plan de trabajo anual
- **Definición:** Documento que establece las actividades de SST a ejecutar durante el año, con responsables, recursos, cronograma y metas. Debe cubrir los cuatro componentes del ciclo PHVA y ser aprobado por la alta dirección.
- **Ejemplo:** El plan de trabajo anual 2026 incluye 4 capacitaciones, 2 simulacros, inspecciones mensuales y exámenes periódicos.
- **Referencia legal:** Decreto 1072 de 2015, Art. 2.2.4.6.8, numeral 7.
- **Módulo relacionado:** Cumplimiento (`Compliance.tsx`).

### 36. Plan de capacitación
- **Definición:** Programa anual que define las capacitaciones en SST que recibirán los trabajadores. Debe basarse en la identificación de peligros y evaluación de riesgos, e incluir inducción, reinducción y formaciones específicas según el cargo.
- **Referencia legal:** Decreto 1072 de 2015, Art. 2.2.4.6.11.
- **Módulo relacionado:** Cumplimiento (`Compliance.tsx`).

### 37. Cronograma de actividades
- **Definición:** Herramienta de seguimiento que detalla mes a mes las actividades planificadas del SG-SST con sus fechas de ejecución, responsables y estado de cumplimiento. Es complementario al plan de trabajo anual.
- **Módulo relacionado:** Cumplimiento (`Compliance.tsx`).

### 38. Matriz legal
- **Definición:** Compilación de los requisitos legales vigentes en materia de SST aplicables a la empresa, según su actividad económica y riesgos. Se actualiza periódicamente e identifica el requisito, la norma, el responsable del cumplimiento y su estado.
- **Referencia legal:** Decreto 1072 de 2015, Art. 2.2.4.6.8, numeral 5.
- **Módulo relacionado:** Cumplimiento (`Compliance.tsx`), Documentos (`Documents.tsx`).

### 39. Bitácora mensual
- **Definición:** Informe mensual que consolida las actividades de SST ejecutadas durante el mes para cada empresa cliente. En la plataforma Regis, se genera automáticamente mediante la Edge Function `generate-bitacora` y se envía al consultor responsable.
- **Ejemplo:** La bitácora de abril 2026 reporta: 2 capacitaciones realizadas, 1 inspección, PILA pagada a tiempo, 0 accidentes.
- **Módulo relacionado:** Edge Function `generate-bitacora`, Dashboard.

### 40. Informe de cumplimiento
- **Definición:** Reporte que evalúa el porcentaje de cumplimiento de los estándares mínimos de la Resolución 0312. Presenta la calificación por cada estándar, el porcentaje global y las acciones de mejora requeridas. Se genera al menos una vez al año.
- **Ejemplo:** La empresa obtiene 85% de cumplimiento: calificación "aceptable", requiere plan de mejora para los estándares incumplidos.
- **Referencia legal:** Resolución 0312 de 2019, Art. 28.
- **Módulo relacionado:** Cumplimiento (`Compliance.tsx`).

### 41. Acta de asignación de recursos SST
- **Definición:** Documento donde la alta dirección formaliza los recursos humanos, técnicos y financieros asignados para la implementación del SG-SST. Es evidencia de compromiso gerencial.
- **Referencia legal:** Decreto 1072 de 2015, Art. 2.2.4.6.8, numeral 4.
- **Módulo relacionado:** Documentos (`Documents.tsx`), Cumplimiento (`Compliance.tsx`).

### 42. Profesiograma
- **Definición:** Documento que define los exámenes médicos ocupacionales requeridos para cada cargo según los riesgos a los que está expuesto el trabajador. Establece tipo de examen, periodicidad y pruebas complementarias (audiometría, visiometría, espirometría, etc.).
- **Ejemplo:** El profesiograma del cargo "operario de bodega" incluye: examen osteomuscular, visiometría y audiometría con periodicidad anual.
- **Módulo relacionado:** Exámenes Médicos (`MedicalExams.tsx`).

---

## D) Procesos SG-SST

### 43. Inspección de seguridad
- **Definición:** Recorrido sistemático por las instalaciones para identificar condiciones inseguras (pisos mojados, cables sueltos, falta de señalización) y actos inseguros (no uso de EPP). Se documenta con formato de inspección y genera acciones correctivas.
- **Ejemplo:** La inspección mensual detecta que 3 extintores están próximos a vencer y se programa su recarga.
- **Módulo relacionado:** Inventario de Equipos (`EquipmentInventory.tsx`).

### 44. Inducción SST
- **Definición:** Capacitación inicial que recibe todo trabajador nuevo sobre los peligros y controles de su puesto de trabajo, la política de SST, el plan de emergencias, y sus derechos y deberes en el SG-SST. Debe realizarse antes de que el trabajador inicie labores.
- **Referencia legal:** Decreto 1072 de 2015, Art. 2.2.4.6.11.
- **Módulo relacionado:** Cumplimiento (`Compliance.tsx`).

### 45. Reinducción SST
- **Definición:** Actualización periódica de la capacitación en SST que se realiza al menos una vez al año o cuando cambian las condiciones de riesgo, se actualizan procedimientos o se reintegra un trabajador luego de una ausencia prolongada.
- **Referencia legal:** Decreto 1072 de 2015, Art. 2.2.4.6.11.
- **Módulo relacionado:** Cumplimiento (`Compliance.tsx`).

### 46. Simulacro de evacuación
- **Definición:** Ejercicio práctico donde se ejecuta el plan de emergencias de forma controlada para evaluar la capacidad de respuesta, tiempos de evacuación, funcionamiento de alarmas y desempeño de las brigadas. Se realiza mínimo una vez al año.
- **Ejemplo:** Se realiza simulacro de sismo: se mide tiempo de evacuación (3 min 20 seg), se detecta que la ruta alterna estaba bloqueada.
- **Referencia legal:** Decreto 1072 de 2015, Art. 2.2.4.6.25.
- **Módulo relacionado:** Planes de Emergencia (`EmergencyPlans.tsx`).

### 47. Investigación de accidente laboral
- **Definición:** Proceso obligatorio de análisis de las causas raíz de un accidente de trabajo. Debe realizarse dentro de los 15 días calendario siguientes al evento. Genera acciones correctivas y preventivas para evitar la recurrencia.
- **Referencia legal:** Resolución 1401 de 2007.
- **Módulo relacionado:** Registro de Actividad (`ActivityLog.tsx`).

### 48. Reporte de enfermedad laboral
- **Definición:** Notificación formal a la ARL y a la EPS cuando se diagnostica una enfermedad de origen laboral. Se utiliza el formato FURAT (Formato Único de Reporte de Accidente de Trabajo) para accidentes y FUREL (Formato Único de Reporte de Enfermedad Laboral) para enfermedades.
- **Referencia legal:** Resolución 156 de 2005.
- **Módulo relacionado:** Exámenes Médicos (`MedicalExams.tsx`).

### 49. Auditoría interna del SG-SST
- **Definición:** Evaluación sistemática e independiente del SG-SST que se realiza al menos una vez al año. Verifica el cumplimiento de la política, los objetivos, las obligaciones legales, los indicadores y la eficacia de los controles implementados.
- **Referencia legal:** Decreto 1072 de 2015, Art. 2.2.4.6.29-30.
- **Módulo relacionado:** Cumplimiento (`Compliance.tsx`).

### 50. Revisión por la dirección
- **Definición:** Evaluación estratégica que realiza la alta dirección al menos una vez al año sobre los resultados del SG-SST. Analiza indicadores, resultados de auditorías, accidentalidad, cumplimiento del plan de trabajo y define acciones de mejora y asignación de recursos.
- **Referencia legal:** Decreto 1072 de 2015, Art. 2.2.4.6.31.
- **Módulo relacionado:** Cumplimiento (`Compliance.tsx`).

---

## E) Términos Técnicos del Proyecto

### 51. Edge Function (Función de borde)
- **Definición:** Función serverless que se ejecuta en el entorno Deno de Supabase, cerca del usuario. En Regis se usan para tareas que requieren procesamiento externo: envío de emails (Resend), mensajes WhatsApp (Twilio), procesamiento con IA (Claude/Whisper) y generación de documentos.
- **Ejemplo:** La Edge Function `process-exam-pdf` recibe un PDF de examen médico, lo envía a Claude para extracción de datos y retorna las recomendaciones médicas estructuradas.
- **Módulo relacionado:** `supabase/functions/*`.

### 52. RLS — Row Level Security (Seguridad a nivel de fila)
- **Definición:** Mecanismo de Supabase/PostgreSQL que restringe el acceso a filas individuales de la base de datos según políticas definidas. Garantiza que cada usuario solo vea los datos de su empresa (tenant). Está habilitado en todas las tablas del proyecto.
- **Ejemplo:** Un usuario con rol "cliente" y `empresa_id = 5` solo puede ver registros PILA de la empresa 5, no de otras empresas.
- **Módulo relacionado:** Todas las tablas en `supabase`.

### 53. Tenant (Inquilino / Multi-tenant)
- **Definición:** En la arquitectura multi-tenant de Regis, cada empresa cliente es un "tenant" que comparte la misma infraestructura pero tiene datos aislados. El campo `empresa_id` en todas las tablas identifica al tenant. RLS garantiza el aislamiento.
- **Ejemplo:** Las empresas Construandes, DevCo y Sabor Criollo comparten la misma base de datos pero nunca ven los datos de las otras.
- **Módulo relacionado:** Toda la plataforma; `empresas_cliente`.

### 54. Cascade IA (Patrón de cascada de modelos)
- **Definición:** Patrón de diseño donde se utiliza un modelo de IA avanzado (Claude) para tareas complejas como extracción de datos de PDFs, análisis de vulnerabilidad y generación de actas. El sistema envía el contenido con un prompt estructurado y recibe datos en formato JSON para almacenar en la base de datos.
- **Ejemplo:** La Edge Function `generate-acta` envía la transcripción de la reunión a Claude, que genera el acta con estructura formal (asistentes, temas, compromisos).
- **Módulo relacionado:** Edge Functions `process-exam-pdf`, `transcribe-audio`, `generate-acta`.

### 55. Webhook
- **Definición:** Punto de enlace HTTP que recibe llamadas automáticas desde otros sistemas. En Regis, n8n expone webhooks que la plataforma invoca para disparar flujos de trabajo (envío de recordatorios PILA, procesamiento de archivos recibidos por email).
- **Ejemplo:** La plataforma envía un POST a `n8n.john-osorio.lat/webhook/pila-reminder` con los datos de la empresa para disparar el envío de un recordatorio.
- **Módulo relacionado:** PILA (`Pila.tsx`); n8n workflows.

### 56. CORS — Cross-Origin Resource Sharing
- **Definición:** Mecanismo de seguridad del navegador que controla qué dominios pueden hacer peticiones a un servidor. Todas las Edge Functions de Supabase deben incluir headers CORS para permitir que el frontend (localhost:8080 o dominio de producción) las invoque.
- **Ejemplo:** La Edge Function responde con `Access-Control-Allow-Origin: *` para permitir peticiones desde cualquier origen.
- **Módulo relacionado:** `supabase/functions/*/index.ts`.

### 57. JWT — JSON Web Token
- **Definición:** Token de autenticación que identifica al usuario en cada petición a Supabase. Contiene claims como `user_id`, `role` y `empresa_id`. Las Edge Functions públicas se despliegan con `--no-verify-jwt` para permitir acceso sin autenticación (ej: upload público de PILA).
- **Ejemplo:** La función `send-pila-reminder` se despliega sin verificación JWT porque es invocada por n8n, no por un usuario autenticado.
- **Módulo relacionado:** Auth (`AuthContext.tsx`); Edge Functions.

### 58. Service Role Key (Clave de rol de servicio)
- **Definición:** Clave secreta de Supabase que otorga acceso total a la base de datos, saltando todas las políticas RLS. Solo se usa en Edge Functions del lado del servidor, nunca en el frontend. Permite que las funciones lean y escriban datos de cualquier tenant.
- **Módulo relacionado:** Edge Functions; secreto `SUPABASE_SERVICE_ROLE_KEY`.

### 59. Signed URL (URL firmada)
- **Definición:** URL temporal con firma criptográfica que permite acceder a un archivo en Supabase Storage sin autenticación. Tiene un tiempo de expiración configurable. Se usa para compartir documentos de forma segura.
- **Ejemplo:** Se genera un signed URL válido por 1 hora para que el cliente descargue su planilla PILA validada.
- **Módulo relacionado:** PILA (`Pila.tsx`); Documentos (`Documents.tsx`).

### 60. Real-time subscription (Suscripción en tiempo real)
- **Definición:** Funcionalidad de Supabase que permite al frontend recibir actualizaciones automáticas cuando cambian datos en la base de datos, sin necesidad de recargar la página. Utiliza WebSockets para mantener la conexión activa.
- **Ejemplo:** Cuando un cliente sube su PILA desde el link público, el dashboard del consultor se actualiza automáticamente mostrando el nuevo estado.
- **Módulo relacionado:** Potencialmente todos los módulos con datos colaborativos.

### 61. Supabase Storage
- **Definición:** Servicio de almacenamiento de archivos integrado en Supabase. En Regis se usa el bucket `documentos` (público) para almacenar PDFs de PILA, exámenes médicos, actas y demás documentos del SG-SST. Los archivos se organizan por ruta: `{modulo}/{empresa_id}/{archivo}`.
- **Ejemplo:** La PILA de Construandes del período 2026-04 se almacena en `documentos/pila/1/pila_2026-04.pdf`.
- **Módulo relacionado:** PILA, Exámenes Médicos, Documentos.

### 62. Token de upload público
- **Definición:** Token codificado en Base64 que se incluye en la URL pública de carga de PILA (`/upload-pila?t=<base64>`). Contiene la información necesaria para identificar la empresa y el período sin requerir autenticación del usuario. Permite que contactos de PILA externos suban archivos sin crear cuenta.
- **Ejemplo:** El enlace `https://app.regis.co/upload-pila?t=eyJlbXByZXNhX2lkIjo...` se envía por email al contacto PILA de la empresa.
- **Módulo relacionado:** PILA (`Pila.tsx`), Upload público (`PublicUpload.tsx`).

---

## Referencias Normativas Principales

| Norma | Tema |
|-------|------|
| Decreto 1072 de 2015 | Decreto Único Reglamentario del Sector Trabajo |
| Resolución 0312 de 2019 | Estándares Mínimos del SG-SST |
| Ley 1562 de 2012 | Sistema General de Riesgos Laborales |
| Resolución 2346 de 2007 | Exámenes médicos ocupacionales |
| Resolución 1401 de 2007 | Investigación de accidentes e incidentes |
| Ley 1010 de 2006 | Acoso laboral |
| Resolución 652 de 2012 | Comité de Convivencia Laboral |
| Resolución 2013 de 1986 | COPASST |
| GTC 45:2012 | Identificación de peligros y valoración de riesgos |
| Decreto 1607 de 2002 | Tabla de clasificación de actividades económicas (riesgo ARL) |
| Decreto 1477 de 2014 | Tabla de enfermedades laborales |
