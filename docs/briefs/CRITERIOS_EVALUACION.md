# Criterios oficiales de evaluación — Concurso Regis Colombia

## 8 Criterios obligatorios (orden del brief)
1. Automatización PILA: solicitud + seguimiento + archivo, sin intervención manual
2. Extracción IA de recomendaciones médicas: funciona con 5+ PDFs distintos
3. Generación matriz de riesgo desde CIIU: 3+ códigos, editable y exportable
4. Generación de actas de comités: 2+ empresas, integrantes precargados
5. Plan de emergencias desde audio: audio 3+ min transcrito + análisis de vulnerabilidad
6. Dashboard de cumplimiento funcional: vista admin + vista cliente, sin data hardcodeada
7. Implementación en producción con datos funcionales de 1+ empresa simulada
8. SOP / manual escrito o en video que permita operar la plataforma sin acompañamiento

## Ranking de dolor del cliente (mayor a menor tiempo manual)
1. Matrices GTC 45
2. Planes de emergencia
3. Actas de comités  ← "Si pudiéramos resolver UNO, sería este"
4. Actas de seguimiento
5. Exámenes médicos
6. PILA
7. Cálculo de cumplimiento

## 4 Recomendaciones de última milla (segundo brief)
- Sección de documentos generales SG-SST (subir + contar al dashboard)
- Compatibilidad con Outlook / remitente configurable sin tocar código
- Logo de la empresa cliente en cabezote de documentos exportados
- Encabezado con código, versión y fecha en cada exportación

## Reglas duras del Q&A
- Soporte para 7 estándares Y 21 estándares (60 fuera de scope)
- Quórum mínimo (mitad + 1) para generar acta formal
- Flujo de aprobación: pendiente → cargado → validado → aprobado (lo valida analista Regis)
- Tanto consultor Regis como cliente pueden cargar documentos
- Detección de duplicados entre canales (correo + WhatsApp)
- Modelo de datos debe permitir múltiples comités por empresa (futuro, no implementar)
- Historial de integrantes de comités preservado ante cambios
- Firma electrónica certificada (DocuSign/FirmaVirtual) o documento "listo para firmar"
- 98% de exámenes médicos son PDF digital, 2% escaneado (OCR es secundario pero debe existir)
- IPS envía exámenes (no el cliente)
- Stack del cliente: Microsoft 365 / Outlook

## Diferenciadores bonus (solo si sobra tiempo)
A. Recordatorios de vencimiento de equipos de emergencia (extintores, botiquines)
B. Bitácora mensual automática por correo
C. Recordatorios de firma y archivo de actas
D. Resumen semanal de tareas por consultor (lunes/viernes)
E. Transcripción automática de COPASST virtuales (Whisper)
