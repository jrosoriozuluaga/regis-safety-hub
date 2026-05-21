const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle,
  WidthType, ShadingType, PageBreak, PageNumber, TableOfContents
} = require("docx");

const logoPath = path.join(__dirname, "..", "src", "assets", "regis-logo.jpeg");
const logoData = fs.readFileSync(logoPath);

const BRAND = { primary: "1B4F72", accent: "2E86C1", light: "D6EAF8", white: "FFFFFF", text: "2C3E50", gray: "95A5A6" };
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };
const TABLE_W = 9360;

function heading(level, text) {
  return new Paragraph({ heading: level, children: [new TextRun(text)] });
}
function p(text, opts = {}) {
  return new Paragraph({ spacing: { after: 120 }, ...opts, children: [new TextRun({ size: 22, ...opts.run, text })] });
}
function bold(text) {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ size: 22, bold: true, text })] });
}
function numberedItem(ref, level, text) {
  return new Paragraph({ numbering: { reference: ref, level }, spacing: { after: 80 }, children: [new TextRun({ size: 22, text })] });
}
function bulletItem(text) {
  return new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ size: 22, text })] });
}
function headerCell(text, width) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    shading: { fill: BRAND.primary, type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: BRAND.white, size: 20, font: "Arial" })] })]
  });
}
function cell(text, width) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, size: 20, font: "Arial" })] })]
  });
}

function moduleSection(title, description, steps) {
  const children = [
    heading(HeadingLevel.HEADING_2, title),
    p(description),
    bold("Procedimiento:"),
  ];
  steps.forEach((s, i) => children.push(numberedItem("steps", 0, `${s}`)));
  children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  return children;
}

// ── PORTADA ──
const portada = [
  new Paragraph({ spacing: { before: 2400 }, children: [] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [
    new ImageRun({ type: "jpg", data: logoData, transformation: { width: 220, height: 80 },
      altText: { title: "Regis Colombia", description: "Logo Regis", name: "logo" } })
  ] }),
  new Paragraph({ spacing: { before: 600 }, alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "MANUAL DE OPERACIONES", size: 40, bold: true, color: BRAND.primary, font: "Arial" })
  ] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "Sistema de Gestión de Seguridad y Salud en el Trabajo", size: 28, color: BRAND.accent, font: "Arial" })
  ] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 }, children: [
    new TextRun({ text: "SG-SST — Resolución 0312 de 2019", size: 24, color: BRAND.text, font: "Arial" })
  ] }),
  new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.CENTER, children: [] }),
  new Table({
    width: { size: 5000, type: WidthType.DXA }, columnWidths: [2500, 2500],
    rows: [
      new TableRow({ children: [headerCell("Campo", 2500), headerCell("Valor", 2500)] }),
      new TableRow({ children: [cell("Versión", 2500), cell("1.0", 2500)] }),
      new TableRow({ children: [cell("Fecha", 2500), cell("20 de mayo de 2026", 2500)] }),
      new TableRow({ children: [cell("Elaborado por", 2500), cell("Regis Colombia SAS", 2500)] }),
      new TableRow({ children: [cell("Código", 2500), cell("SOP-SGSST-001", 2500)] }),
      new TableRow({ children: [cell("Estado", 2500), cell("Vigente", 2500)] }),
    ]
  }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ── TOC ──
const toc = [
  heading(HeadingLevel.HEADING_1, "Tabla de Contenido"),
  new TableOfContents("Tabla de Contenido", { hyperlink: true, headingStyleRange: "1-3" }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ── SECCIÓN 1: INTRODUCCIÓN ──
const sec1 = [
  heading(HeadingLevel.HEADING_1, "1. Introducción y Objetivos del Sistema"),
  p("Este manual describe los procedimientos operativos del Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST) implementado por Regis Colombia SAS para la gestión de empresas clientes bajo la Resolución 0312 de 2019."),
  heading(HeadingLevel.HEADING_2, "1.1 Objetivo General"),
  p("Proporcionar una guía operativa completa para consultores Regis, contactos SST de empresas clientes y administradores del sistema, asegurando el cumplimiento normativo y la trazabilidad de todas las actividades del SG-SST."),
  heading(HeadingLevel.HEADING_2, "1.2 Alcance"),
  bulletItem("Empresas de 1 a 50 trabajadores, niveles de riesgo I a III"),
  bulletItem("Capítulo 1 (7 estándares): empresas con 10 o menos trabajadores"),
  bulletItem("Capítulo 2 (21 estándares): empresas de 11 a 50 trabajadores"),
  bulletItem("Ciclo PHVA: Planear, Hacer, Verificar, Actuar"),
  heading(HeadingLevel.HEADING_2, "1.3 Normativa Aplicable"),
  bulletItem("Resolución 0312 de 2019 — Estándares Mínimos del SG-SST"),
  bulletItem("Decreto 1072 de 2015 — Decreto Único Reglamentario del Sector Trabajo"),
  bulletItem("Ley 1581 de 2012 — Protección de Datos Personales (Habeas Data)"),
  bulletItem("GTC 45 — Guía Técnica Colombiana para identificación de peligros"),
  new Paragraph({ children: [new PageBreak()] }),
];

// ── SECCIÓN 2: ROLES ──
const sec2 = [
  heading(HeadingLevel.HEADING_1, "2. Roles y Permisos"),
  p("La plataforma maneja tres roles con diferentes niveles de acceso:"),
  new Table({
    width: { size: TABLE_W, type: WidthType.DXA }, columnWidths: [2000, 3680, 3680],
    rows: [
      new TableRow({ children: [headerCell("Rol", 2000), headerCell("Descripción", 3680), headerCell("Permisos", 3680)] }),
      new TableRow({ children: [
        cell("Admin Regis", 2000),
        cell("Administrador general del sistema. Gestiona consultores, configuración global, plantillas de correo.", 3680),
        cell("Acceso total: todas las empresas, configuración, usuarios, plantillas, logs de actividad.", 3680),
      ] }),
      new TableRow({ children: [
        cell("Consultor", 2000),
        cell("Profesional SST de Regis. Gestiona ~18 empresas clientes. Usa la plataforma a diario.", 3680),
        cell("Ver y gestionar todas las empresas asignadas. Crear, validar y aprobar documentos. Generar actas y reportes.", 3680),
      ] }),
      new TableRow({ children: [
        cell("Cliente", 2000),
        cell("Contacto enlace SST de la empresa cliente. Usa la plataforma 1-2 veces/mes.", 3680),
        cell("Ver solo datos de su empresa. Subir documentos (PILA, exámenes). Ver dashboard de cumplimiento propio.", 3680),
      ] }),
    ]
  }),
  new Paragraph({ spacing: { after: 200 }, children: [] }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ── SECCIÓN 3: MÓDULOS OPERATIVOS ──
const sec3_header = [heading(HeadingLevel.HEADING_1, "3. Módulos Operativos")];

const mod_empresas = moduleSection("3.1 Gestión de Empresas",
  "Registro y administración de empresas clientes. El sistema calcula automáticamente el capítulo aplicable (7 o 21 estándares) según el número de trabajadores y nivel de riesgo ARL.",
  [
    "Ir a Menú lateral → Empresas.",
    "Hacer clic en \"Nueva Empresa\".",
    "Completar: Razón social, NIT, código CIIU, ciudad, número de trabajadores, nivel de riesgo ARL.",
    "Completar datos de contacto PILA: nombre, email, teléfono del enlace SST.",
    "Guardar. El sistema asigna automáticamente Capítulo 1 o Capítulo 2.",
    "Para import masivo: usar botón \"Importar\" con archivo CSV/Excel.",
    "Para desactivar una empresa: botón \"Desactivar\" en la fila correspondiente."
  ]);

const mod_trabajadores = moduleSection("3.2 Gestión de Trabajadores",
  "Registro de trabajadores por empresa para asociar exámenes médicos y cumplimiento.",
  [
    "Ir a Menú lateral → Trabajadores.",
    "Seleccionar la empresa en el filtro superior.",
    "Hacer clic en \"Nuevo Trabajador\".",
    "Completar: Nombre, cédula, cargo, área.",
    "Guardar. El trabajador queda asociado a la empresa.",
    "Para import masivo: botón \"Importar\" con archivo CSV/Excel.",
    "Para desactivar: botón en la fila del trabajador (no se borran, se desactivan)."
  ]);

const mod_pila = moduleSection("3.3 Módulo PILA — Planilla Integrada de Liquidación de Aportes",
  "Gestión del ciclo mensual de solicitud, recepción, validación y aprobación de planillas PILA. Este módulo opera de forma automática con intervención mínima del consultor.",
  [
    "Ir a Menú lateral → PILA.",
    "Seleccionar empresa. Ver el panel de configuración con día de solicitud, días de recordatorio y máximo de intentos.",
    "Hacer clic en \"Sincronizar Períodos\" para generar los registros de los últimos 6 meses.",
    "El sistema envía automáticamente la solicitud al contacto PILA por email.",
    "Si no hay respuesta, se envían recordatorios automáticos por email y WhatsApp.",
    "El cliente recibe un enlace de upload público (sin necesidad de login).",
    "Al recibir el archivo, el estado cambia a \"cargada\".",
    "El consultor valida el archivo: botón \"Validar\" → estado \"validada\".",
    "Aprobación final: botón \"Aprobar\" → estado \"aprobada\". Suma al cumplimiento.",
    "Los períodos vencidos (sin respuesta después de fecha límite) se marcan automáticamente."
  ]);

const mod_examenes = moduleSection("3.4 Exámenes Médicos Ocupacionales",
  "Carga de exámenes médicos con extracción automática de datos mediante inteligencia artificial. Soporta exámenes de ingreso, periódicos y de egreso.",
  [
    "Ir a Menú lateral → Exámenes Médicos.",
    "Seleccionar empresa.",
    "Hacer clic en \"Procesar Examen con IA\".",
    "Seleccionar el archivo PDF del examen médico.",
    "El sistema extrae automáticamente: nombre del trabajador, cédula, tipo de examen, fecha, concepto de aptitud, recomendaciones y restricciones.",
    "Si el trabajador no existe en la base de datos, se crea automáticamente.",
    "Revisar los datos extraídos. Si hay errores, corregir manualmente.",
    "Las recomendaciones quedan vinculadas al trabajador.",
    "Si la IA no está disponible, el sistema usa extracción básica por patrones de texto."
  ]);

const mod_matrices = moduleSection("3.5 Matrices de Riesgo — Metodología GTC 45",
  "Generación de matrices de riesgo pre-llenadas a partir del código CIIU de la empresa, siguiendo la metodología de la Guía Técnica Colombiana GTC 45.",
  [
    "Ir a Menú lateral → Matrices de Riesgo.",
    "Seleccionar empresa.",
    "Hacer clic en \"Generar Matriz desde CIIU\".",
    "El sistema consulta los riesgos típicos asociados al código CIIU de la empresa.",
    "Se genera la matriz con: peligro, descripción, fuente, efectos posibles, nivel de deficiencia (ND), nivel de exposición (NE), nivel de probabilidad (NP), nivel de consecuencia (NC), nivel de riesgo (NR), medidas de intervención.",
    "Revisar y ajustar los valores según la realidad de la empresa.",
    "Para exportar: botón \"Imprimir/Exportar\". El documento incluye encabezado con logo, código de documento, versión y fecha.",
    "Funciona con al menos 3 códigos CIIU distintos (6820, 7020, 6201)."
  ]);

const mod_actas = moduleSection("3.6 Actas de Comités — COPASST y Convivencia",
  "Generación de actas de reunión para COPASST, Comité de Convivencia Laboral y Vigía de SST. Incluye verificación de quórum y generación automática del contenido.",
  [
    "Ir a Menú lateral → Comités.",
    "Seleccionar empresa y tipo de comité (COPASST, Convivencia o Vigía SST).",
    "Registrar integrantes del comité: nombre, cédula, cargo, rol (presidente, secretario, etc.), tipo (principal o suplente).",
    "Para crear una nueva acta: botón \"Nueva Acta\".",
    "Marcar los asistentes presentes (checkbox por cada integrante).",
    "El sistema verifica quórum: se requiere mitad + 1 de integrantes principales.",
    "Si NO hay quórum: la reunión es informativa, no se pueden tomar decisiones.",
    "Si hay quórum: se habilita \"Generar Acta\" con IA.",
    "Ingresar los puntos tratados en la reunión.",
    "Hacer clic en \"Generar Acta\". La IA genera el acta completa con formato estándar colombiano.",
    "Revisar el contenido generado. Editar si es necesario.",
    "Para firmar: botón \"Firmar\" marca el acta como firmada en el sistema.",
    "Para archivar: botón \"Archivar\" cuando el proceso está completo.",
    "Exportar: botón de impresión genera PDF con encabezado profesional."
  ]);

const mod_emergencias = moduleSection("3.7 Planes de Emergencia desde Audio",
  "Captura de audio durante visitas presenciales con transcripción automática y análisis de vulnerabilidad mediante inteligencia artificial.",
  [
    "Ir a Menú lateral → Planes de Emergencia.",
    "Seleccionar empresa.",
    "Hacer clic en \"Nuevo Plan\".",
    "Grabar audio directamente desde el navegador (botón de micrófono) O subir un archivo de audio pre-grabado.",
    "El audio debe tener al menos 3 minutos para un análisis completo.",
    "Describir en el audio: amenazas identificadas, recursos disponibles (extintores, botiquines, rutas de evacuación), vulnerabilidades del personal, procesos y recursos.",
    "El sistema transcribe el audio con OpenAI Whisper.",
    "La IA analiza la transcripción y genera: resumen ejecutivo, amenazas identificadas con probabilidad, análisis de vulnerabilidad (personas, recursos, procesos), nivel de riesgo global, recomendaciones priorizadas.",
    "Revisar el análisis generado.",
    "Exportar: botón de impresión genera documento con tablas de vulnerabilidad y encabezado profesional.",
    "Si la IA no está disponible, el sistema genera un análisis básico basado en palabras clave detectadas en la transcripción."
  ]);

const mod_documentos = moduleSection("3.8 Documentos Generales SG-SST",
  "Sección para cargar documentos generales del sistema: políticas, planes de capacitación, cronogramas, actas de recursos, entre otros.",
  [
    "Ir a Menú lateral → Documentos.",
    "Seleccionar empresa.",
    "Hacer clic en \"Subir Documento\".",
    "Seleccionar tipo de documento (política, plan, acta, cronograma, otro).",
    "Cargar el archivo (PDF, Word, imagen).",
    "El documento queda en estado \"pendiente\".",
    "Al ser revisado por el consultor: estado \"cargado\".",
    "Al ser validado: estado \"validado\".",
    "Al ser aprobado: estado \"aprobado\" — suma al porcentaje de cumplimiento.",
    "Los documentos aprobados cuentan como evidencia en la evaluación de estándares 0312."
  ]);

const mod_equipos = moduleSection("3.9 Inventario de Equipos de Emergencia",
  "Control de equipos de emergencia con seguimiento automático de fechas de vencimiento.",
  [
    "Ir a Menú lateral → Inventario Equipos.",
    "Seleccionar empresa.",
    "Hacer clic en \"Nuevo Equipo\".",
    "Completar: tipo (extintor, botiquín, camilla, EPP, señalización), marca, modelo, ubicación, fecha de vencimiento.",
    "El sistema calcula automáticamente el estado: vigente (verde), por vencer (amarillo, <30 días), vencido (rojo).",
    "Las alertas de equipos próximos a vencer aparecen en el Dashboard del administrador.",
    "Actualizar fechas de recarga/mantenimiento cuando corresponda."
  ]);

// ── SECCIÓN 4: DASHBOARDS ──
const sec4 = [
  heading(HeadingLevel.HEADING_1, "4. Dashboards"),
  heading(HeadingLevel.HEADING_2, "4.1 Dashboard del Administrador/Consultor"),
  p("Al iniciar sesión como administrador o consultor, el dashboard muestra:"),
  bulletItem("KPIs principales: número de empresas, trabajadores cubiertos, cumplimiento promedio, % PILA aprobadas."),
  bulletItem("Alertas activas: documentos vencidos, equipos por vencer, actas sin firmar, PILA pendientes."),
  bulletItem("Gráfico de cumplimiento por empresa: barras de colores (verde >80%, amarillo 60-80%, rojo <60%)."),
  bulletItem("Progreso de onboarding por empresa: checklist visual de configuración."),
  bulletItem("Acciones rápidas: generar bitácora mensual, generar resumen semanal."),
  bulletItem("Tabla de empresas clientes con CIIU, ciudad, trabajadores, nivel de riesgo y capítulo aplicable."),
  heading(HeadingLevel.HEADING_2, "4.2 Dashboard del Cliente"),
  p("Al iniciar sesión como contacto SST de empresa cliente, el dashboard muestra:"),
  bulletItem("Puntaje de cumplimiento SG-SST con gráfico circular animado."),
  bulletItem("Desglose del ciclo PHVA: Planear, Hacer, Verificar, Actuar con barras de progreso."),
  bulletItem("Estado de planillas PILA: aprobadas, pendientes, vencidas con porcentaje."),
  bulletItem("Indicador de desempeño: Excelente (≥86%), Moderadamente aceptable (60-85%), Nivel crítico (<60%)."),
  new Paragraph({ children: [new PageBreak()] }),
];

// ── SECCIÓN 5: CONFIGURACIÓN ──
const sec5 = [
  heading(HeadingLevel.HEADING_1, "5. Configuración del Sistema"),
  heading(HeadingLevel.HEADING_2, "5.1 Parámetros Generales (Menú → Configuración)"),
  p("Los parámetros configurables sin necesidad de código incluyen:"),
  new Table({
    width: { size: TABLE_W, type: WidthType.DXA }, columnWidths: [3120, 3120, 3120],
    rows: [
      new TableRow({ children: [headerCell("Parámetro", 3120), headerCell("Descripción", 3120), headerCell("Valor por defecto", 3120)] }),
      new TableRow({ children: [cell("pila_dia_solicitud", 3120), cell("Día del mes para enviar solicitud PILA", 3120), cell("1", 3120)] }),
      new TableRow({ children: [cell("pila_dias_recordatorio", 3120), cell("Días entre recordatorios", 3120), cell("7", 3120)] }),
      new TableRow({ children: [cell("pila_max_recordatorios", 3120), cell("Número máximo de intentos", 3120), cell("3", 3120)] }),
      new TableRow({ children: [cell("email_remitente", 3120), cell("Correo desde el que se envían notificaciones", 3120), cell("sgsst@regiscolombia.com", 3120)] }),
      new TableRow({ children: [cell("n8n_webhook_base_url", 3120), cell("URL base de n8n para workflows", 3120), cell("https://n8n.john-osorio.lat", 3120)] }),
    ]
  }),
  new Paragraph({ spacing: { after: 200 }, children: [] }),
  heading(HeadingLevel.HEADING_2, "5.2 Plantillas de Correo (Menú → Plantillas)"),
  p("Las plantillas de correo electrónico son editables desde la interfaz. Soportan variables dinámicas que se reemplazan automáticamente al enviar:"),
  bulletItem("{{empresa}}: razón social de la empresa"),
  bulletItem("{{contacto}}: nombre del contacto SST"),
  bulletItem("{{periodo}}: período PILA (ej: 2026-05)"),
  bulletItem("{{fecha_limite}}: fecha límite de entrega"),
  heading(HeadingLevel.HEADING_2, "5.3 Gestión de Usuarios (Menú → Usuarios)"),
  p("Solo disponible para rol Admin. Permite crear usuarios con rol consultor o cliente, asignar empresa (para clientes) y gestionar el estado activo/inactivo."),
  new Paragraph({ children: [new PageBreak()] }),
];

// ── SECCIÓN 6: TRAZABILIDAD ──
const sec6 = [
  heading(HeadingLevel.HEADING_1, "6. Trazabilidad y Auditoría"),
  p("Todas las acciones relevantes del sistema quedan registradas en el log de actividad (Menú → Actividad). Cada registro incluye:"),
  bulletItem("Fecha y hora de la acción"),
  bulletItem("Usuario que realizó la acción"),
  bulletItem("Tipo de acción (crear, actualizar, validar, aprobar, eliminar, generar, exportar)"),
  bulletItem("Módulo afectado (PILA, exámenes, matrices, comités, etc.)"),
  bulletItem("Descripción detallada de lo que se hizo"),
  bulletItem("Empresa asociada"),
  heading(HeadingLevel.HEADING_2, "6.1 Acciones Registradas por Módulo"),
  new Table({
    width: { size: TABLE_W, type: WidthType.DXA }, columnWidths: [2340, 7020],
    rows: [
      new TableRow({ children: [headerCell("Módulo", 2340), headerCell("Acciones registradas", 7020)] }),
      new TableRow({ children: [cell("Empresas", 2340), cell("Crear, actualizar, activar, desactivar, import masivo", 7020)] }),
      new TableRow({ children: [cell("Trabajadores", 2340), cell("Crear, actualizar, desactivar, reactivar, import masivo", 7020)] }),
      new TableRow({ children: [cell("PILA", 2340), cell("Sincronizar períodos, enviar recordatorio, subir archivo, validar, aprobar", 7020)] }),
      new TableRow({ children: [cell("Exámenes", 2340), cell("Procesar PDF con IA, crear trabajador automático", 7020)] }),
      new TableRow({ children: [cell("Matrices", 2340), cell("Generar desde CIIU, exportar", 7020)] }),
      new TableRow({ children: [cell("Comités", 2340), cell("Generar acta, firmar, archivar", 7020)] }),
      new TableRow({ children: [cell("Emergencias", 2340), cell("Crear plan, transcribir audio, generar análisis", 7020)] }),
      new TableRow({ children: [cell("Configuración", 2340), cell("Cambiar parámetros, editar plantillas", 7020)] }),
    ]
  }),
  new Paragraph({ spacing: { after: 200 }, children: [] }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ── SECCIÓN 7: PROCEDIMIENTOS DE EMERGENCIA ──
const sec7 = [
  heading(HeadingLevel.HEADING_1, "7. Procedimientos de Contingencia"),
  p("Procedimientos a seguir cuando un componente del sistema no está disponible."),
  heading(HeadingLevel.HEADING_2, "7.1 Si la IA (Claude) no responde"),
  bulletItem("Exámenes médicos: el sistema usa extracción básica por patrones de texto. Los datos extraídos serán parciales — completar manualmente."),
  bulletItem("Actas de comité: el sistema genera un acta con plantilla estándar pre-definida. El consultor debe completar el desarrollo de cada punto."),
  bulletItem("Planes de emergencia: el sistema genera un análisis básico basado en palabras clave. Complementar manualmente."),
  heading(HeadingLevel.HEADING_2, "7.2 Si el servicio de email (Resend) no funciona"),
  bulletItem("Las solicitudes PILA se pueden enviar manualmente desde el módulo PILA."),
  bulletItem("Los recordatorios por WhatsApp siguen funcionando independientemente."),
  bulletItem("Verificar el estado del API key en la configuración de Supabase."),
  heading(HeadingLevel.HEADING_2, "7.3 Si WhatsApp (Twilio) no funciona"),
  bulletItem("Los recordatorios por email siguen funcionando."),
  bulletItem("Se puede enviar el enlace de upload PILA manualmente al cliente."),
  bulletItem("Verificar créditos de la cuenta Twilio."),
  heading(HeadingLevel.HEADING_2, "7.4 Si la transcripción (Whisper) falla"),
  bulletItem("Verificar créditos de la cuenta OpenAI."),
  bulletItem("Alternativa: transcribir manualmente el audio y pegar el texto en el formulario."),
  heading(HeadingLevel.HEADING_2, "7.5 Si n8n no está disponible"),
  bulletItem("Los workflows de PILA automáticos se pausan."),
  bulletItem("El sistema usa las Edge Functions de Supabase como fallback para enviar emails."),
  bulletItem("Verificar el estado en https://n8n.john-osorio.lat"),
  new Paragraph({ children: [new PageBreak()] }),
];

// ── SECCIÓN 8: ANEXOS ──
const sec8 = [
  heading(HeadingLevel.HEADING_1, "8. Anexos"),
  heading(HeadingLevel.HEADING_2, "Anexo A — Glosario SG-SST"),
  new Table({
    width: { size: TABLE_W, type: WidthType.DXA }, columnWidths: [2800, 6560],
    rows: [
      new TableRow({ children: [headerCell("Término", 2800), headerCell("Definición", 6560)] }),
      new TableRow({ children: [cell("SG-SST", 2800), cell("Sistema de Gestión de Seguridad y Salud en el Trabajo", 6560)] }),
      new TableRow({ children: [cell("PILA", 2800), cell("Planilla Integrada de Liquidación de Aportes a la seguridad social", 6560)] }),
      new TableRow({ children: [cell("COPASST", 2800), cell("Comité Paritario de Seguridad y Salud en el Trabajo", 6560)] }),
      new TableRow({ children: [cell("GTC 45", 2800), cell("Guía Técnica Colombiana para identificación de peligros y valoración de riesgos", 6560)] }),
      new TableRow({ children: [cell("CIIU", 2800), cell("Clasificación Industrial Internacional Uniforme (código de actividad económica)", 6560)] }),
      new TableRow({ children: [cell("ARL", 2800), cell("Administradora de Riesgos Laborales", 6560)] }),
      new TableRow({ children: [cell("PHVA", 2800), cell("Ciclo de mejora continua: Planear, Hacer, Verificar, Actuar", 6560)] }),
      new TableRow({ children: [cell("Vigía SST", 2800), cell("Persona designada en empresas de <10 trabajadores (reemplaza al COPASST)", 6560)] }),
      new TableRow({ children: [cell("IPS", 2800), cell("Institución Prestadora de Servicios de Salud", 6560)] }),
      new TableRow({ children: [cell("EPP", 2800), cell("Elementos de Protección Personal", 6560)] }),
    ]
  }),
  new Paragraph({ spacing: { after: 300 }, children: [] }),
  heading(HeadingLevel.HEADING_2, "Anexo B — Checklist Resolución 0312/2019"),
  p("La plataforma evalúa el cumplimiento basado en los estándares de la Resolución 0312:"),
  bold("Capítulo 1 (7 estándares) — Empresas ≤10 trabajadores, riesgo I-III:"),
  bulletItem("Asignación de persona que diseña el SG-SST"),
  bulletItem("Afiliación al sistema de seguridad social integral"),
  bulletItem("Capacitación en SST"),
  bulletItem("Plan anual de trabajo"),
  bulletItem("Evaluaciones médicas ocupacionales"),
  bulletItem("Identificación de peligros, evaluación y valoración de riesgos"),
  bulletItem("Medidas de prevención y control frente a peligros identificados"),
  bold("Capítulo 2 (21 estándares) — Empresas 11-50 trabajadores, riesgo I-III:"),
  p("Incluye los 7 estándares del Capítulo 1 más 14 estándares adicionales que cubren: política SST, objetivos, responsabilidades, comité COPASST o Vigía, comité de convivencia, programa de capacitación, plan de emergencias, reporte de accidentes, investigación de incidentes, y más."),
  heading(HeadingLevel.HEADING_2, "Anexo C — Contactos de Soporte"),
  new Table({
    width: { size: TABLE_W, type: WidthType.DXA }, columnWidths: [3120, 3120, 3120],
    rows: [
      new TableRow({ children: [headerCell("Canal", 3120), headerCell("Contacto", 3120), headerCell("Horario", 3120)] }),
      new TableRow({ children: [cell("Email soporte", 3120), cell("soporte@regiscolombia.com", 3120), cell("L-V 8am-6pm", 3120)] }),
      new TableRow({ children: [cell("WhatsApp", 3120), cell("+57 XXX XXX XXXX", 3120), cell("L-V 8am-6pm", 3120)] }),
      new TableRow({ children: [cell("Plataforma", 3120), cell("regis-safety-hub.vercel.app", 3120), cell("24/7", 3120)] }),
    ]
  }),
];

// ── BUILD DOCUMENT ──
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: BRAND.primary },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: BRAND.accent },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: BRAND.text },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "steps", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({ children: [
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BRAND.accent, space: 4 } },
          children: [
            new TextRun({ text: "SOP-SGSST-001  |  Manual de Operaciones SG-SST  |  Regis Colombia", size: 16, color: BRAND.gray, font: "Arial" }),
          ]
        })
      ] })
    },
    footers: {
      default: new Footer({ children: [
        new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: BRAND.light, space: 4 } },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Página ", size: 16, color: BRAND.gray }),
            new TextRun({ children: [PageNumber.CURRENT], size: 16, color: BRAND.gray }),
            new TextRun({ text: "  |  Versión 1.0  |  Confidencial", size: 16, color: BRAND.gray }),
          ]
        })
      ] })
    },
    children: [
      ...portada,
      ...toc,
      ...sec1,
      ...sec2,
      ...sec3_header,
      ...mod_empresas,
      ...mod_trabajadores,
      ...mod_pila,
      ...mod_examenes,
      ...mod_matrices,
      ...mod_actas,
      ...mod_emergencias,
      ...mod_documentos,
      ...mod_equipos,
      new Paragraph({ children: [new PageBreak()] }),
      ...sec4,
      ...sec5,
      ...sec6,
      ...sec7,
      ...sec8,
    ]
  }]
});

const outPath = path.join(__dirname, "SOP_MANUAL_REGIS_SGSST.docx");
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outPath, buffer);
  console.log(`SOP generated: ${outPath} (${buffer.length} bytes)`);
});
