/**
 * Shared export header for all PDF/HTML document exports.
 * Provides Regis Colombia branding + traceability per Resolution 0312/2019.
 */

/**
 * Generate document code based on module and company NIT.
 * Format: DOC-[MODULE]-[NIT]-[SEQ]
 */
export function generateDocCode(module: string, nit?: string): string {
  const mod = String(module || "DOC").toUpperCase().replace(/\s+/g, "-").slice(0, 8);
  const nitPart = nit ? nit.replace(/[^0-9]/g, "").slice(0, 9) : "000000000";
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `DOC-${mod}-${nitPart}-${seq}`;
}

/**
 * Format a date for document headers.
 */
function formatHeaderDate(date?: Date): string {
  const d = date ?? new Date();
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export type ExportHeaderOptions = {
  /** Document title shown in header */
  title: string;
  /** Module code for DOC-XXX format: e.g. "MAT-RIE", "ACTA", "INFORME" */
  moduleCode: string;
  /** Company name */
  empresaNombre?: string;
  /** Company NIT */
  empresaNit?: string;
  /** Company logo URL (shown alongside Regis logo) */
  empresaLogoUrl?: string;
  /** Document version (default "1.0") */
  version?: string;
  /** Generation date (default: now) */
  date?: Date;
};

/**
 * Returns an HTML string for the document header with Regis logo,
 * company info, and traceability fields (code, version, date).
 *
 * Designed to be injected into window.open() HTML exports.
 */
export function getExportHeaderHTML(opts: ExportHeaderOptions): string {
  const docCode = generateDocCode(opts.moduleCode || "DOC", opts.empresaNit);
  const version = opts.version ?? "1.0";
  const dateStr = formatHeaderDate(opts.date);
  const empresaNombre = opts.empresaNombre || "";
  const empresaNit = opts.empresaNit || "";

  return `
    <div style="
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 16px 20px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      font-family: 'Segoe UI', Arial, sans-serif;
    ">
      <!-- Logos -->
      <div style="flex-shrink: 0; display: flex; align-items: center; gap: 12px;">
        <img id="regis-logo-header" src="" alt="Regis Colombia"
          style="height: 60px; width: auto; object-fit: contain;" />
        ${opts.empresaLogoUrl ? `<img src="${opts.empresaLogoUrl}" alt="${empresaNombre || 'Empresa'}" style="height: 50px; width: auto; object-fit: contain; border-left: 1px solid #e2e8f0; padding-left: 12px;" />` : ""}
      </div>

      <!-- Company info -->
      <div style="flex: 1;">
        <div style="font-size: 16px; font-weight: 700; color: #1e293b;">REGIS COLOMBIA SAS</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
          Sistema de Gestión de Seguridad y Salud en el Trabajo
        </div>
        ${empresaNombre ? `<div style="font-size: 13px; font-weight: 600; color: #334155; margin-top: 6px;">${empresaNombre}</div>` : ""}
        ${empresaNit ? `<div style="font-size: 11px; color: #64748b;">NIT: ${empresaNit}</div>` : ""}
      </div>

      <!-- Traceability -->
      <div style="
        flex-shrink: 0;
        text-align: right;
        border-left: 1px solid #e2e8f0;
        padding-left: 16px;
        font-size: 11px;
        color: #64748b;
        line-height: 1.6;
      ">
        <div><strong>Código:</strong> ${docCode}</div>
        <div><strong>Versión:</strong> ${version}</div>
        <div><strong>Fecha:</strong> ${dateStr}</div>
      </div>
    </div>
  `;
}

/**
 * Returns CSS styles for export pages (print-friendly).
 */
export function getExportStyles(): string {
  return `
    @media print {
      body { margin: 0; padding: 20px; }
      @page { margin: 1.5cm; }
    }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #1e293b;
      line-height: 1.5;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 { color: #0f172a; margin-top: 1.2em; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
    }
    table th, table td {
      border: 1px solid #d1d5db;
      padding: 8px 10px;
      text-align: left;
      font-size: 12px;
    }
    table th {
      background: #f1f5f9;
      font-weight: 600;
    }
  `;
}

/**
 * Returns footer HTML for export pages.
 */
export function getExportFooterHTML(): string {
  const now = new Date();
  const dateStr = formatHeaderDate(now);
  const timeStr = now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

  return `
    <div style="
      margin-top: 40px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 10px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    ">
      <span>Regis Colombia SAS — Plataforma SG-SST</span>
      <span>Generado el ${dateStr} a las ${timeStr}</span>
    </div>
  `;
}

/**
 * Injects the Regis logo into an export window by converting
 * the imported logo asset to a data URL.
 * Call this AFTER document.write() and BEFORE print().
 */
export function injectLogoIntoWindow(printWindow: Window, logoSrc: string): void {
  // Convert the Vite-processed logo URL to a data URL by fetching it
  const img = printWindow.document.getElementById("regis-logo-header") as HTMLImageElement | null;
  if (!img) return;

  // For local dev, the logoSrc is already a valid URL (Vite asset)
  // For production, it's also a valid hashed URL
  img.src = logoSrc;
}
