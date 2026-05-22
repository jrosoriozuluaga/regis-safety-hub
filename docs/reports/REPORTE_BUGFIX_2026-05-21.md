# Reporte Bugfix — 2026-05-21 (Dia de grabacion)

## Resumen

8 bugs corregidos en 8 commits atomicos. Build exitoso tras cada fix.
2 bugs diferidos (BUG-4 no era bug real, BUG-10 requiere cambio de schema).

## Bugs Corregidos

| # | Bug | Commit | Archivos |
|---|-----|--------|----------|
| BUG-1 | Header mostraba nombre de usuario como empresa | `39899a6` | domain.ts, auth.ts, AppHeader.tsx |
| BUG-2 | "Ver archivo" fallaba (bucket privado, URLs expiradas) | `e7d15ba` | utils.ts, Pila.tsx, MedicalExams.tsx, Documents.tsx |
| BUG-3 | UploadPila aceptaba ZIP/Excel (solo debe ser PDF/imagen) | `58e0fd6` | UploadPila.tsx |
| BUG-7 | Audio .m4a se enviaba como "recording.webm" | `2315260` | EmergencyPlans.tsx |
| BUG-6 | WhatsApp FAB flotante visible en todas las paginas | `8b0cf14` | AppLayout.tsx |
| BUG-9 | Clientes podian ver formulario "Nueva acta" | `7194890` | Committees.tsx |
| BUG-5 | Error al guardar plantilla de correo | `2e2ecf9` | services/index.ts |
| BUG-11 | No se mostraba ruta de Storage tras carga | `7c45783` | services/index.ts, Documents.tsx |

## Bugs No Corregidos

| # | Bug | Razon |
|---|-----|-------|
| BUG-4 | "Plantillas Correo" no visible en sidebar | No es bug: item y ruta ya existen (`/plantillas-correo`, `adminItems` en AppSidebar) |
| BUG-8 | Dropdown usuario incompleto | Resuelto como parte de BUG-1 (nuevo displayName, roleLabel, menu limpio) |
| BUG-10 | CIIU secundario | Requiere columna nueva en DB (`ciiu_secundario` en `empresas_cliente`). Diferido — no se pueden ejecutar comandos contra DB remota |

## Detalle Tecnico

### BUG-1: Header nombre usuario
- **Problema:** `companyName` en UserProfile se llenaba con `profile.nombre` (nombre del usuario), no con `empresa.razon_social`
- **Fix:** Agregado campo `nombre` a UserProfile. `companyName` ahora lee de `empresa.razon_social` con fallback "Regis Colombia". Header muestra `displayName` (nombre real) y rol para staff

### BUG-2: Signed URLs
- **Problema:** Storage bucket `documentos` es privado. URLs directas y signed URLs expiradas no funcionan
- **Fix:** Helper `openStorageFile()` en utils.ts extrae path de cualquier formato de URL, genera signed URL de 1h on-the-fly. Aplicado en PILA, Examenes, Documentos

### BUG-3: Validacion UploadPila
- **Problema:** Aceptaba .xlsx, .xls, .zip. La PILA se sube como PDF o foto (imagen del recibo)
- **Fix:** Solo acepta .pdf/.png/.jpg/.jpeg. Limite reducido de 25MB a 10MB. Hint y accept actualizados

### BUG-5: Template save
- **Problema:** `.single()` lanza error si RLS impide la actualizacion (0 filas afectadas)
- **Fix:** Cambiado a `.maybeSingle()` con error descriptivo si no hay data

### BUG-7: Audio filename
- **Problema:** `formData.append("audio", blob, "recording.webm")` siempre — archivos .m4a/.aac se enviaban con extension incorrecta
- **Fix:** Si es `File`, usa `file.name` original. Si es `Blob` (grabacion del browser), mantiene "recording.webm"

### BUG-11: Toast con ruta
- **Problema:** Tras upload no se mostraba donde quedo el archivo
- **Fix:** `documentsService.upload()` retorna `storagePath`. Toast lo muestra por 5 segundos

## Build Final

```
✓ built in 1.93s — 0 errores TypeScript, 0 errores Vite
```
