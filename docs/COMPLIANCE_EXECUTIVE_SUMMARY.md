# Cumplimiento Resolucion 0312 de 2019 -- Resumen Ejecutivo

## Cobertura Normativa de Regis SG-SST

---

## Alcance

Regis SG-SST cubre los **Capitulos 1 y 2** de la Resolucion 0312 de 2019, que aplican a empresas con niveles de riesgo I, II y III:

| Capitulo | Aplica a | Estandares | Cobertura |
|----------|----------|------------|-----------|
| **Capitulo 1** | Empresas con 10 o menos trabajadores, riesgo I-III | 7 estandares minimos | Completa |
| **Capitulo 2** | Empresas de 11 a 50 trabajadores, riesgo I-III | 21 estandares minimos | Completa |
| Capitulo 3 | Empresas con mas de 50 trabajadores o riesgo IV-V | 60 estandares | Fuera de alcance |

La plataforma **asigna automaticamente** el capitulo correspondiente a cada empresa segun su numero de trabajadores y nivel de riesgo ARL, usando una columna generada en la base de datos (`capitulo_0312` en la tabla `empresas_cliente`).

---

## Ciclo PHVA y su Mapeo en la Plataforma

La Resolucion 0312 organiza los estandares minimos siguiendo el ciclo PHVA (Planear, Hacer, Verificar, Actuar), que es el marco de mejora continua del SG-SST.

### Planear (P)

Actividades de planificacion y diseno del sistema.

| Estandar | Modulo en Regis SG-SST | Funcionalidad |
|----------|------------------------|---------------|
| Asignacion de responsable del SG-SST | Cumplimiento | Registro y seguimiento del responsable designado |
| Afiliacion al sistema de seguridad social | PILA | Seguimiento mensual de planillas de seguridad social, verificacion automatica |
| Capacitacion en SST | Cumplimiento + Documentos | Registro de capacitaciones, certificados, evidencias |
| Plan anual de trabajo | Cumplimiento + Documentos | Seguimiento del plan anual, porcentaje de avance |
| Evaluacion inicial del SG-SST | Cumplimiento | Auto-evaluacion con scoring PHVA |
| Identificacion de peligros y valoracion de riesgos | Matrices de Riesgo | Metodologia GTC 45 completa, generacion asistida por IA, edicion inline |
| Politica de SST | Documentos | Gestion documental con flujo de validacion |

### Hacer (H)

Actividades de implementacion y operacion del sistema.

| Estandar | Modulo en Regis SG-SST | Funcionalidad |
|----------|------------------------|---------------|
| Examenes medicos ocupacionales | Examenes Medicos | Extraccion IA de PDFs, seguimiento de recomendaciones, control de fechas |
| Actividades de prevencion y promocion | Cumplimiento + Documentos | Evidencia documental de actividades ejecutadas |
| Conformacion COPASST o Vigia | Comites | Gestion de periodos, integrantes, roles, actas con generacion IA |
| Comite de Convivencia Laboral | Comites | Mismo flujo que COPASST, sesiones trimestrales |
| Investigacion de accidentes e incidentes | Cumplimiento | Registro y seguimiento de investigaciones |
| Plan de emergencias | Planes de Emergencia | Grabacion audio, transcripcion Whisper, analisis de vulnerabilidad IA |
| Brigada de emergencias | Planes de Emergencia + Comites | Registro de brigadistas, entrenamiento |
| Equipos de emergencia | Inventario de Equipos | Control de extintores, botiquines, camillas con alertas de vencimiento |
| Reporte de accidentes de trabajo | Cumplimiento | Registro y seguimiento de reportes |

### Verificar (V)

Actividades de medicion, seguimiento y auditoria.

| Estandar | Modulo en Regis SG-SST | Funcionalidad |
|----------|------------------------|---------------|
| Indicadores del SG-SST | Cumplimiento | Dashboard con porcentajes PHVA, scoring por estandar |
| Auditoria anual | Cumplimiento + Documentos | Registro de auditoria, hallazgos, plan de mejora |
| Revision por la alta direccion | Cumplimiento + Comites | Acta de revision, seguimiento a compromisos |

### Actuar (A)

Actividades de mejora continua.

| Estandar | Modulo en Regis SG-SST | Funcionalidad |
|----------|------------------------|---------------|
| Acciones preventivas y correctivas | Cumplimiento | Registro, seguimiento y cierre de acciones |
| Mejora continua | Cumplimiento | Tendencia historica de cumplimiento, comparacion interanual |

---

## Calculo Automatico de Cumplimiento

### Tabla de Scoring

La plataforma calcula automaticamente el porcentaje de cumplimiento usando la tabla `cumplimiento_empresas` (scoring anual por empresa) y `items_cumplimiento` (estado por estandar individual).

**Formula:**

```
Cumplimiento (%) = (Suma de puntajes de items aprobados / Puntaje maximo posible) x 100
```

Los puntajes se desglosan por fase PHVA:

| Fase | Peso Cap. 1 | Peso Cap. 2 |
|------|-------------|-------------|
| Planear (P) | 25% | 25% |
| Hacer (H) | 60% | 60% |
| Verificar (V) | 5% | 5% |
| Actuar (A) | 10% | 10% |

### Clasificacion del Resultado

| Puntaje | Clasificacion | Accion Requerida |
|---------|--------------|------------------|
| < 60% | Critico | Plan de mejoramiento inmediato (enviar a ARL) |
| 60% - 85% | Moderadamente aceptable | Plan de mejoramiento a 6 meses |
| > 85% | Aceptable | Mantener y mejorar |

La plataforma muestra esta clasificacion visualmente con codigos de color en el dashboard de cumplimiento.

---

## Flujo de Validacion Documental

Cada documento requerido por la Resolucion 0312 sigue un flujo de 4 estados que garantiza trazabilidad y control de calidad:

```
PENDIENTE  -->  CARGADO  -->  VALIDADO  -->  APROBADO
```

| Estado | Descripcion | Quien actua | Efecto en Scoring |
|--------|-------------|-------------|-------------------|
| **Pendiente** | Documento solicitado, aun no cargado | Sistema (automatico) | 0 puntos |
| **Cargado** | Archivo subido por cliente o consultor | Cliente / Consultor | 0 puntos |
| **Validado** | Analista reviso y confirmo que el documento es correcto | Consultor / Admin | 0 puntos |
| **Aprobado** | Documento cumple con los requisitos normativos | Admin | Puntos asignados |

**Importante:** Los puntos de cumplimiento solo se otorgan cuando un documento alcanza el estado "Aprobado". Esto garantiza que no se infle artificialmente el porcentaje de cumplimiento.

### Almacenamiento

Los documentos se almacenan en Supabase Storage en el bucket `documentos`, organizado por modulo y empresa:

```
documentos/
  pila/{empresa_id}/planilla_2026-01.pdf
  examenes/{empresa_id}/examen_ingreso_juan.pdf
  matrices/{empresa_id}/matriz_gtc45_2026.pdf
  comites/{empresa_id}/acta_copasst_001.pdf
  ...
```

---

## Mapeo Detallado: Estandares del Capitulo 1

Los 7 estandares minimos del Capitulo 1 (empresas de 10 o menos trabajadores, riesgo I-III):

| # | Estandar | Modulo | Automatizacion |
|---|----------|--------|----------------|
| 1 | Asignacion de persona que diseña el SG-SST | Cumplimiento | Registro y validacion documental |
| 2 | Afiliacion al sistema de seguridad social integral | PILA | Seguimiento automatico mensual, recordatorios multicanal |
| 3 | Capacitacion en SST | Cumplimiento + Docs | Registro de capacitaciones con evidencia |
| 4 | Plan anual de trabajo | Cumplimiento + Docs | Seguimiento con porcentaje de avance |
| 5 | Evaluaciones medicas ocupacionales | Examenes Medicos | Extraccion IA, recomendaciones, fechas |
| 6 | Identificacion de peligros, evaluacion y valoracion de riesgos | Matrices de Riesgo | GTC 45, generacion IA, edicion inline |
| 7 | Medidas de prevencion y control | Cumplimiento + Docs | Registro y seguimiento de medidas implementadas |

---

## Mapeo Detallado: Estandares del Capitulo 2

Los 21 estandares minimos del Capitulo 2 (empresas de 11 a 50 trabajadores, riesgo I-III) incluyen los 7 del Capitulo 1 mas 14 adicionales:

| # | Estandar Adicional | Modulo | Automatizacion |
|---|-------------------|--------|----------------|
| 8 | Conformacion y funcionamiento del COPASST | Comites | Periodos, integrantes, actas IA |
| 9 | Conformacion y funcionamiento del Comite de Convivencia | Comites | Sesiones trimestrales, actas IA |
| 10 | Politica de SST | Documentos | Flujo de validacion 4 estados |
| 11 | Objetivos del SG-SST | Cumplimiento | Definicion, seguimiento, medicion |
| 12 | Plan de trabajo anual (ampliado) | Cumplimiento | Cronograma con responsables y recursos |
| 13 | Archivo y retencion documental | Documentos | Almacenamiento estructurado en Supabase Storage |
| 14 | Descripcion sociodemografica y diagnostico de salud | Examenes Medicos | Datos de trabajadores + examenes consolidados |
| 15 | Actividades de medicina del trabajo y prevencion | Examenes Medicos + Cumplimiento | Recomendaciones medicas con seguimiento |
| 16 | Reporte e investigacion de incidentes y accidentes | Cumplimiento | Registro completo, seguimiento de acciones |
| 17 | Registro estadistico de enfermedades laborales y accidentes | Cumplimiento | Indicadores automaticos: frecuencia, severidad, mortalidad |
| 18 | Medicion de indicadores del SG-SST | Cumplimiento | Dashboard PHVA con scoring en tiempo real |
| 19 | Plan de emergencias | Planes de Emergencia | Analisis de vulnerabilidad con IA |
| 20 | Brigada de prevencion, preparacion y respuesta | Planes de Emergencia + Comites | Registro de brigadistas |
| 21 | Revision por la alta direccion | Comites + Cumplimiento | Acta de revision, compromisos |

---

## Ventajas del Enfoque Automatizado

### Para el Consultor SST

- **Reduccion de tiempo:** Las actas de comite (proceso mas doloroso) se generan en minutos con IA en lugar de horas manualmente.
- **Matrices GTC 45:** El proceso mas dispendioso en tiempo se acelera con generacion IA y edicion inline.
- **Visibilidad multi-empresa:** Dashboard unificado del estado de cumplimiento de todas las empresas.
- **Trazabilidad completa:** Log de actividad automatico, bitacora mensual auto-generada.

### Para la Empresa Cliente

- **Carga simplificada:** URL publica con token para subir PILA sin necesidad de cuenta.
- **Recordatorios proactivos:** Email y WhatsApp automaticos antes de fechas de vencimiento.
- **Visibilidad en tiempo real:** Portal con acceso a su propio estado de cumplimiento.

### Para la ARL y Entes de Control

- **Documentos profesionales:** Exportaciones con marca, codigo de modulo, NIT, listos para auditoria.
- **Evidencia estructurada:** Cada estandar tiene su evidencia documental asociada con fecha y responsable.
- **Scoring verificable:** Calculo transparente basado en documentos aprobados, no en auto-declaraciones.

---

*Regis SG-SST -- Cumplimiento normativo automatizado, verificable y escalable.*
