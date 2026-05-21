# Análisis Competitivo — Mercado de Software SG-SST en Colombia

**Fecha:** Mayo 2026  
**Elaborado para:** Regis Colombia SAS  
**Producto:** Regis Safety Hub

---

## 1. Contexto del Mercado

El mercado colombiano de software para Sistemas de Gestión de Seguridad y Salud en el Trabajo (SG-SST) atiende a más de 700.000 empresas obligadas a cumplir con la Resolución 0312 de 2019. La mayoría de consultorías SST (estimado 2.000+ en el país) aún operan con herramientas manuales o genéricas, creando una oportunidad significativa para soluciones especializadas.

**Segmento objetivo de Regis:** Firmas consultoras SST que gestionan entre 10 y 200 empresas clientes tipo PYME (1-50 trabajadores, riesgo I-III, Capítulos 1 y 2 de la Resolución 0312).

---

## 2. Análisis de Competidores

### 2.1 ALISSTA (ARL SURA)

**Descripción:** Herramienta web gratuita proporcionada por ARL SURA a sus empresas afiliadas para el seguimiento básico de cumplimiento SG-SST.

| Aspecto | Detalle |
|---------|---------|
| **Modelo de negocio** | Gratuito (incluido con afiliación ARL SURA) |
| **Usuarios** | Empresas afiliadas a SURA (~30% del mercado ARL) |
| **Tecnología** | Aplicación web básica |

**Fortalezas:**
- Costo cero para empresas afiliadas a SURA
- Respaldo institucional de la ARL más grande de Colombia
- Base de usuarios amplia y establecida
- Alineada con normatividad colombiana

**Debilidades:**
- Solo disponible para afiliados a SURA (excluye ~70% del mercado)
- Genérica: no personalizable por consultora
- Sin inteligencia artificial ni automatización avanzada
- Gestión documental básica (carga y descarga manual)
- No soporta flujos multi-empresa para consultoras
- Sin notificaciones proactivas por WhatsApp
- Sin extracción automática de datos de documentos

**Regis vs. ALISSTA:** Regis no depende de ninguna ARL, soporta gestión multi-tenant para consultoras, incorpora IA para extracción documental y automatiza procesos como PILA que ALISSTA maneja de forma manual. ALISSTA es una herramienta de cumplimiento; Regis es una plataforma de productividad para consultoras.

---

### 2.2 ISOTools Excellence

**Descripción:** Plataforma SaaS internacional para gestión de sistemas ISO y cumplimiento normativo. Sede en España con presencia en Latinoamérica.

| Aspecto | Detalle |
|---------|---------|
| **Modelo de negocio** | SaaS empresarial, licenciamiento por módulos |
| **Usuarios** | Empresas medianas y grandes, multinacionales |
| **Tecnología** | Plataforma web madura, desarrollo propio |

**Fortalezas:**
- Producto maduro con años en el mercado
- Soporte para múltiples normas ISO (9001, 14001, 45001, etc.)
- Funcionalidades avanzadas de auditoría y trazabilidad
- Equipo de implementación y soporte dedicado
- Presencia en múltiples países de LATAM

**Debilidades:**
- Precio elevado (USD $500-2.000+/mes por módulo), inaccesible para PYMEs
- Complejidad excesiva para empresas de 1-50 trabajadores
- No está construido específicamente para Resolución 0312 colombiana
- Requiere implementación prolongada (semanas a meses)
- Orientado a ISO 45001, no a los estándares simplificados de 0312
- Sin automatización de PILA ni flujos SST específicos colombianos
- Sin capacidades de IA para extracción documental

**Regis vs. ISOTools:** ISOTools es un Ferrari para empresas que necesitan una bicicleta. Regis está diseñado específicamente para el cumplimiento 0312 de PYMEs colombianas, a una fracción del costo, con implementación inmediata y automatización de procesos que ISOTools no contempla (PILA, actas con IA, análisis de vulnerabilidad por audio).

---

### 2.3 SafetyCulture (iAuditor)

**Descripción:** Plataforma global mobile-first para inspecciones, checklists y gestión de seguridad laboral.

| Aspecto | Detalle |
|---------|---------|
| **Modelo de negocio** | Freemium + planes desde USD $24/usuario/mes |
| **Usuarios** | Equipos de operaciones y seguridad globalmente |
| **Tecnología** | App móvil nativa + web, API robusta |

**Fortalezas:**
- Experiencia móvil excepcional (mejor en clase)
- Amplia biblioteca de plantillas de inspección
- Flujos de trabajo de inspección y auditoría eficientes
- Reportes fotográficos integrados
- Presencia en Latinoamérica con soporte en español

**Debilidades:**
- No es específico para SG-SST colombiano
- Sin cumplimiento de Resolución 0312 integrado
- Sin gestión de PILA, comités COPASST, ni planes de emergencia
- Sin automatización de flujos regulatorios colombianos
- Modelo de precio por usuario (escala mal para consultoras con muchas empresas)
- Sin generación de actas ni documentos regulatorios colombianos

**Regis vs. SafetyCulture:** SafetyCulture es excelente para inspecciones en campo, pero no entiende el contexto regulatorio colombiano. Regis tiene scoring de cumplimiento 0312, gestión de comités, automatización PILA y generación de actas — funcionalidades que SafetyCulture nunca va a implementar para un mercado específico como Colombia.

---

### 2.4 Software SG-SST Genérico Colombiano (MeySafety, SimpliRoute SST, otros)

**Descripción:** Proveedores locales colombianos que ofrecen software específico para SG-SST, generalmente como aplicaciones de escritorio o web básicas.

| Aspecto | Detalle |
|---------|---------|
| **Modelo de negocio** | Licencia perpetua o SaaS básico ($50-200K COP/mes) |
| **Usuarios** | Empresas colombianas y algunas consultoras |
| **Tecnología** | Aplicaciones web legacy o de escritorio, bases de datos tradicionales |

**Fortalezas:**
- Conocimiento profundo de la normatividad colombiana
- Interfaz 100% en español
- Soporte local en zona horaria colombiana
- Precios accesibles para el mercado local

**Debilidades:**
- Interfaces de usuario desactualizadas (estética 2010-2015)
- Sin inteligencia artificial ni procesamiento automático de documentos
- Procesos mayormente manuales (carga, revisión, aprobación)
- Automatización limitada o inexistente
- Arquitectura técnica obsoleta (difícil de escalar)
- Sin notificaciones inteligentes (WhatsApp, email automatizado)
- Sin API abierta para integraciones

**Regis vs. Genéricos Colombianos:** Regis comparte el conocimiento regulatorio colombiano pero está construido con tecnología moderna (React, Supabase, Edge Functions). Donde los genéricos requieren entrada manual, Regis automatiza: extracción de exámenes médicos con IA, generación de actas con Claude, análisis de vulnerabilidad por audio, y seguimiento PILA completamente automatizado.

---

### 2.5 Excel + Google Drive / OneDrive (Status Quo)

**Descripción:** La "solución" que usa la mayoría de consultoras SST en Colombia: hojas de cálculo compartidas, carpetas en la nube, y correos electrónicos manuales.

| Aspecto | Detalle |
|---------|---------|
| **Modelo de negocio** | Gratuito o incluido con Microsoft 365 / Google Workspace |
| **Usuarios** | Estimado 70-80% de las consultoras SST colombianas |
| **Tecnología** | Hojas de cálculo + almacenamiento en la nube |

**Fortalezas:**
- Costo cero o mínimo
- Familiaridad universal (todos saben usar Excel)
- Flexibilidad total (se adapta a cualquier formato)
- Sin curva de aprendizaje

**Debilidades:**
- Cero automatización (todo es manual)
- Sin trazabilidad ni auditoría de cambios
- Alto riesgo de error humano (fórmulas rotas, datos duplicados)
- Sin scoring de cumplimiento automático
- Sin recordatorios ni alertas proactivas
- Archivos dispersos sin estructura estandarizada
- Escala terriblemente (90 empresas × 12 meses × N documentos = caos)
- Sin control de versiones real
- Sin reportes consolidados automáticos

**Regis vs. Excel:** Regis reemplaza el caos de Excel con flujos estructurados y automatizados. Lo que una consultora hace en 3 horas con Excel (solicitar PILA, revisar, recordar, registrar), Regis lo hace en 3 minutos. Multiplicado por 90 empresas y 12 meses, el ahorro de tiempo es transformacional.

---

### 2.6 Herramientas de Gestión de Proyectos Adaptadas (Asana, Monday, Notion)

**Descripción:** Plataformas de productividad y gestión de proyectos que algunas consultoras adaptan para seguimiento SST.

| Aspecto | Detalle |
|---------|---------|
| **Modelo de negocio** | Freemium + planes desde USD $8-20/usuario/mes |
| **Usuarios** | Equipos tech-savvy que buscan organización |
| **Tecnología** | SaaS moderno, APIs abiertas, integraciones |

**Fortalezas:**
- Excelentes herramientas de colaboración
- Tableros y vistas personalizables
- Automatizaciones básicas (reglas, notificaciones)
- Integraciones con ecosistema amplio
- UX moderna y atractiva

**Debilidades:**
- Sin lógica SST: no saben qué es PILA, COPASST, ni Resolución 0312
- Sin automatización de procesos regulatorios específicos
- Sin extracción de datos con IA de documentos SST
- Sin scoring de cumplimiento normativo
- Requieren configuración manual extensa para simular flujos SST
- Sin generación de documentos regulatorios (actas, bitácoras)
- Las automatizaciones no entienden el dominio SST

**Regis vs. Herramientas Adaptadas:** Una herramienta construida para el propósito siempre supera a una herramienta adaptada. Monday puede rastrear tareas; Regis sabe que el PILA del periodo 2026-04 de Construandes está vencido, envía el recordatorio por WhatsApp, recibe el archivo por email, lo sube automáticamente y actualiza el cumplimiento 0312.

---

## 3. Matriz Comparativa

| Funcionalidad | Regis Safety Hub | ALISSTA | ISOTools | SafetyCulture | Excel/Drive | Genéricos CO | Asana/Monday |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Automatización PILA completa** | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ Parcial | ❌ |
| **Extracción IA de documentos** | ✅ Claude Vision | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Scoring Resolución 0312** | ✅ Cap 1 y 2 | ✅ Básico | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Gestión de comités** | ✅ COPASST + Convivencia | ⚠️ Básico | ❌ | ❌ | ❌ | ⚠️ Parcial | ❌ |
| **Generación de actas con IA** | ✅ Claude | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Planes de emergencia + audio** | ✅ Whisper + Claude | ❌ | ❌ | ⚠️ Inspecciones | ❌ | ⚠️ Básico | ❌ |
| **Matrices de riesgo GTC 45** | ✅ + IA | ⚠️ Básico | ✅ | ⚠️ | ❌ | ✅ | ❌ |
| **Multi-tenant (consultora)** | ✅ | ❌ | ✅ | ⚠️ | ❌ | ⚠️ | ⚠️ |
| **Notificaciones WhatsApp** | ✅ Twilio | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Notificaciones email automáticas** | ✅ Resend + n8n | ❌ | ✅ | ✅ | ❌ | ⚠️ | ✅ |
| **Carga pública por token** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Bitácora mensual automática** | ✅ Edge Function | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Resumen semanal consultor** | ✅ Edge Function | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Inventario de equipos + alertas** | ✅ | ❌ | ✅ | ✅ | ❌ | ⚠️ | ❌ |
| **Exportación con branding** | ✅ Logo + código + NIT | ❌ | ✅ | ✅ | ❌ | ⚠️ | ❌ |
| **Log de actividad auditable** | ✅ | ⚠️ | ✅ | ✅ | ❌ | ⚠️ | ✅ |
| **App móvil nativa** | ❌ (responsive) | ❌ | ⚠️ | ✅ Excelente | ✅ | ❌ | ✅ |
| **Costo mensual estimado** | $150-300K COP | Gratis (solo SURA) | $2-8M COP | $500K-2M COP | Gratis | $50-200K COP | $200-500K COP |
| **Implementación** | Inmediata | Inmediata | 4-12 semanas | 1-2 semanas | Inmediata | 2-4 semanas | 1-2 semanas |

**Leyenda:** ✅ = Incluido | ⚠️ = Parcial o limitado | ❌ = No disponible

---

## 4. Declaración de Posicionamiento

> **Regis Safety Hub es la única plataforma SG-SST construida POR una consultora SST PARA consultoras SST, con automatización impulsada por inteligencia artificial que elimina el 80% del trabajo manual en gestión de cumplimiento para PYMEs colombianas.**

### Propuesta de valor en una frase por audiencia:

- **Para consultoras SST:** "Gestione 90+ empresas con el esfuerzo que antes requería 20, gracias a automatización inteligente de PILA, actas, matrices y cumplimiento 0312."
- **Para empresas cliente:** "Su cumplimiento SST gestionado de forma profesional, con recordatorios automáticos y visibilidad en tiempo real de su estado regulatorio."
- **Para el jurado del concurso:** "Demostración funcional de cómo la IA y la automatización transforman una consultora SST artesanal en una operación escalable."

---

## 5. Diferenciadores Clave — Las 4 Capacidades de "Última Milla"

Estos diferenciadores representan funcionalidades que ningún competidor ofrece y que abordan dolores reales de las consultoras SST:

### 5.1 Alertas de Vencimiento de Equipos

**Dolor que resuelve:** Extintores, camillas, botiquines y equipos de emergencia vencen sin que nadie se dé cuenta, generando hallazgos en auditorías.

**Cómo funciona Regis:** El módulo de inventario de equipos registra fechas de vencimiento y genera alertas automáticas con anticipación configurable. El consultor recibe un resumen de equipos próximos a vencer en su panel de control.

**Por qué importa:** Un extintor vencido encontrado en auditoría es un hallazgo crítico. Regis lo previene de forma automática.

### 5.2 Bitácora Mensual Automatizada

**Dolor que resuelve:** Al final de cada mes, el consultor debe compilar manualmente un reporte de todas las actividades realizadas por empresa — proceso tedioso que consume horas.

**Cómo funciona Regis:** La Edge Function `generate-bitacora` consulta los logs de actividad, documentos cargados, actas generadas y estados PILA del mes, y genera automáticamente un reporte consolidado por empresa.

**Por qué importa:** Convierte 2-3 horas de trabajo administrativo mensual por empresa en un clic.

### 5.3 Seguimiento de Firma y Archivo de Actas

**Dolor que resuelve:** Las actas de comité se generan pero quedan pendientes de firma física, digitalización y archivo. Se pierden o quedan sin firmar durante meses.

**Cómo funciona Regis:** Cada acta tiene un flujo de estados (borrador → generada → firmada → archivada) con recordatorios automáticos cuando una acta lleva más de X días sin avanzar al siguiente estado.

**Por qué importa:** Las actas sin firmar son el hallazgo más común en auditorías SST. Regis cierra la brecha entre generación y archivo.

### 5.4 Resumen Semanal del Consultor

**Dolor que resuelve:** El consultor no tiene visibilidad rápida del estado general de todas sus empresas. Debe revisar empresa por empresa para identificar pendientes.

**Cómo funciona Regis:** La Edge Function `weekly-summary` genera cada lunes un resumen con: empresas con PILA pendiente, documentos por validar, actas sin firmar, equipos próximos a vencer y cumplimiento 0312 por empresa.

**Por qué importa:** El consultor arranca la semana sabiendo exactamente qué priorizar, en lugar de dedicar la primera hora a "descubrir" el estado actual.

---

## 6. Análisis FODA de Regis Safety Hub

### Fortalezas
- Construido por quienes viven el problema diariamente (Regis Colombia)
- Stack tecnológico moderno y escalable (React + Supabase + Edge Functions)
- IA integrada en el flujo de trabajo (no como módulo adicional)
- Automatización end-to-end de PILA (el proceso más frecuente)
- Costo competitivo para el mercado colombiano
- Multi-tenant diseñado desde la arquitectura

### Oportunidades
- Mercado masivamente desatendido (mayoría usa Excel)
- Regulación colombiana obliga a todas las empresas a cumplir
- Las ARL solo cubren a sus afiliados, dejando espacio para soluciones agnósticas
- La IA generativa permite funcionalidades imposibles hace 2 años
- Potencial de expansión a Capítulo 3 (empresas más grandes)

### Debilidades
- Sin app móvil nativa (solo responsive web)
- Producto nuevo sin track record en el mercado
- Dependencia de APIs externas (Anthropic, Twilio, Resend)
- Equipo de desarrollo pequeño
- Aún sin certificaciones propias de seguridad (SOC 2, ISO 27001)

### Amenazas
- ALISSTA podría agregar funcionalidades de IA (respaldo de SURA)
- Cambios regulatorios que modifiquen la Resolución 0312
- Competidores genéricos colombianos podrían modernizarse
- Entrada de plataformas internacionales con localización colombiana
- Riesgo de cambios en precios de APIs de IA

---

## 7. Conclusión

El mercado de software SG-SST en Colombia está fragmentado entre soluciones gratuitas limitadas (ALISSTA), plataformas internacionales costosas (ISOTools, SafetyCulture), software local desactualizado, y el status quo de Excel. Ningún competidor combina: conocimiento regulatorio colombiano profundo, automatización de procesos específicos SST, inteligencia artificial para procesamiento documental, y arquitectura multi-tenant para consultoras.

Regis Safety Hub ocupa un espacio único en esta intersección, con el potencial de convertirse en el estándar de la industria para consultoras SST que gestionan PYMEs en Colombia.
