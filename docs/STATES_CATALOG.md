# Catalogo de Estados de UI — Regis SG-SST

Referencia de estados vacios, de error y de carga para las 22 paginas de la plataforma.
Iconos: todos de `lucide-react`. Copias en espanol colombiano con lenguaje SG-SST contextual.

---

## Convenciones generales

| Estado | Componente sugerido | Notas |
|--------|---------------------|-------|
| **Carga inicial** | Skeleton (`@/components/ui/skeleton`) | Preferir skeletons que repliquen la forma de la tabla/card final. |
| **Accion en curso** | `<Loader2 className="animate-spin" />` dentro del boton | Deshabilitar el boton mientras carga. |
| **Error de red** | Card centrada con icono + mensaje + boton reintentar | Usar `WifiOff` o `AlertTriangle`. |
| **Permiso denegado** | Card centrada, sin boton de accion | Usar `ShieldOff`. |
| **Validacion** | Texto rojo debajo del campo (`text-destructive text-sm`) | Mensajes inline por campo. |
| **Error 500** | Card centrada con icono `ServerCrash` | Boton "Reintentar" + texto de soporte. |
| **Optimistic UI** | Aplicar cambio visual de inmediato, revertir si falla | Adecuado para toggles de estado y eliminaciones. |

---

## 1. Login

### Estado vacio
- **Cuando:** Primera visita o sesion expirada.
- **Icono:** `Building2`
- **Mensaje:** N/A (es la pantalla por defecto; el formulario se muestra siempre).
- **CTA:** N/A.

### Errores
| Tipo | Icono | Mensaje | Accion de recuperacion |
|------|-------|---------|----------------------|
| Credenciales invalidas | `AlertCircle` | "NIT o contrasena incorrectos. Verifica tus datos e intenta de nuevo." | Limpiar campo contrasena, enfocar campo NIT. |
| Red / timeout | `WifiOff` | "No se pudo conectar con el servidor. Revisa tu conexion a internet." | Boton "Reintentar". |
| Cuenta bloqueada | `ShieldOff` | "Tu cuenta ha sido desactivada. Contacta a tu consultor de Regis Colombia." | Enlace a soporte. |
| Validacion formulario | `AlertCircle` | Inline: "Ingresa tu NIT o correo electronico" / "Minimo 6 caracteres". | Foco automatico en campo con error. |
| Error 500 | `ServerCrash` | "Error en el servidor. Por favor intenta en unos minutos." | Boton "Reintentar". |

### Carga
- **Spinner:** `Loader2` dentro del boton "Ingresar" mientras autentica. Deshabilitar formulario.
- **Skeleton:** No aplica.
- **Optimistic UI:** No aplica.

---

## 2. ForgotPassword (Olvide mi contrasena)

### Estado vacio
- **Cuando:** Primera visita.
- **Icono:** `Mail`
- **Mensaje:** N/A (el formulario se muestra siempre).
- **CTA:** N/A.

### Errores
| Tipo | Icono | Mensaje | Accion |
|------|-------|---------|--------|
| Validacion NIT | `AlertCircle` | "El NIT debe tener 9 o 10 digitos." | Foco en campo NIT. |
| Validacion email | `AlertCircle` | "Correo invalido." | Foco en campo email. |
| Red / timeout | `WifiOff` | "No se pudo enviar la solicitud. Revisa tu conexion." | Boton "Reintentar". |
| Error 500 | `ServerCrash` | "Error en el servidor. Intenta nuevamente." | Boton "Reintentar". |

### Carga
- **Spinner:** `Loader2` dentro del boton "Enviar enlace" mientras procesa.
- **Estado exito:** Card con `CheckCircle2` y mensaje "Revisa tu correo. Si el NIT y correo coinciden, recibiras un enlace."
- **Skeleton:** No aplica.

---

## 3. ResetPassword (Restablecer contrasena)

### Estado vacio
- **Cuando:** El usuario llega desde el enlace del correo.
- **Icono:** `Lock`
- **Mensaje:** N/A (formulario siempre visible).

### Errores
| Tipo | Icono | Mensaje | Accion |
|------|-------|---------|--------|
| Validacion contrasena | `AlertCircle` | "Minimo 8 caracteres." | Foco en campo. |
| Contrasenas no coinciden | `AlertCircle` | "Las contrasenas no coinciden." | Foco en campo confirmar. |
| Token expirado | `Clock` | "Este enlace ha expirado. Solicita uno nuevo desde la pantalla de inicio de sesion." | Enlace a /forgot-password. |
| Red / timeout | `WifiOff` | "No se pudo actualizar la contrasena. Revisa tu conexion." | Boton "Reintentar". |
| Error 500 | `ServerCrash` | "Error en el servidor." | Boton "Reintentar". |

### Carga
- **Spinner:** `Loader2` dentro del boton "Actualizar contrasena".
- **Skeleton:** No aplica.

---

## 4. Dashboard (Panel general)

### Estado vacio
| Situacion | Icono | Mensaje | CTA |
|-----------|-------|---------|-----|
| Sin empresas (admin/consultor) | `Building2` | "No hay empresas registradas. Agrega tu primera empresa cliente para comenzar a gestionar su SG-SST." | "Agregar empresa" (navegar a /companies). |
| Sin datos de la empresa (cliente) | `BarChart3` | "Aun no hay datos para mostrar. Tu consultor de Regis Colombia esta configurando tu informacion." | Ninguno. |

### Errores
| Tipo | Icono | Mensaje | Accion |
|------|-------|---------|--------|
| Red / timeout | `WifiOff` | "No se pudieron cargar las estadisticas. Revisa tu conexion." | Boton "Reintentar". |
| Permiso denegado | `ShieldOff` | "No tienes permisos para ver este panel." | N/A. |
| Error 500 | `ServerCrash` | "Error al cargar el panel. Intenta de nuevo." | Boton "Reintentar". |

### Carga
- **Skeleton:** Cards de estadisticas (4 skeletons rectangulares en fila), graficos de barras (skeleton rectangular grande), tabla resumen (5 filas skeleton).
- **Spinner:** No usar spinner para carga inicial.
- **Optimistic UI:** No aplica (solo lectura).

---

## 5. Pila (Gestion PILA)

### Estado vacio
| Situacion | Icono | Mensaje | CTA |
|-----------|-------|---------|-----|
| Sin registros (primera vez) | `FileSpreadsheet` | "No hay periodos PILA registrados. Sincroniza los periodos para generar automaticamente los registros de los ultimos 6 meses." | "Sincronizar periodos" (boton sync). |
| Sin registros para empresa seleccionada | `FileSpreadsheet` | "No hay registros PILA para esta empresa. Ejecuta la sincronizacion para crear los periodos correspondientes." | "Sincronizar periodos". |
| Busqueda sin resultados | `Search` | "No se encontraron registros PILA para los filtros seleccionados." | "Limpiar filtros". |

### Errores
| Tipo | Icono | Mensaje | Accion |
|------|-------|---------|--------|
| Red / timeout | `WifiOff` | "No se pudieron cargar los registros PILA. Revisa tu conexion." | Boton "Reintentar". |
| Error al sincronizar | `AlertTriangle` | "Error al sincronizar periodos: {mensaje}. Verifica la configuracion del sistema." | Toast error + boton reintentar. |
| Error al enviar recordatorio | `AlertTriangle` | "No se pudo enviar el recordatorio. Verifica la configuracion de n8n o Edge Functions." | Toast con detalle. |
| Permiso denegado | `ShieldOff` | "Solo administradores y consultores pueden gestionar planillas PILA." | N/A. |
| Error 500 | `ServerCrash` | "Error del servidor al cargar PILA. Intenta de nuevo." | Boton "Reintentar". |

### Carga
- **Skeleton:** Cards de resumen (4 skeleton cards), tabla de registros (8 filas skeleton con 6 columnas).
- **Spinner:** `Loader2` dentro del boton "Sincronizar" mientras sincroniza. `Loader2` dentro del boton de envio de recordatorio.
- **Optimistic UI:** Al cambiar estado de un registro (pendiente -> cargada), actualizar Badge de estado inmediatamente. Revertir si falla.

---

## 6. MedicalExams (Examenes Medicos)

### Estado vacio
| Situacion | Icono | Mensaje | CTA |
|-----------|-------|---------|-----|
| Sin examenes (empresa seleccionada) | `Stethoscope` | "No se han registrado examenes medicos para esta empresa. Suba el primer examen ocupacional para comenzar." | "Subir examen PDF" (abrir dropzone). |
| Sin empresa seleccionada | `Building2` | "Selecciona una empresa para ver sus examenes medicos." | Selector de empresa. |
| Busqueda sin resultados | `Search` | "No se encontraron examenes medicos que coincidan con la busqueda." | "Limpiar busqueda". |

### Errores
| Tipo | Icono | Mensaje | Accion |
|------|-------|---------|--------|
| Error extraccion IA | `AlertTriangle` | "No se pudo procesar el PDF con IA. Verifica que el archivo sea un examen medico ocupacional valido." | Boton "Reintentar" o subir otro archivo. |
| Archivo no PDF | `AlertCircle` | "Solo se aceptan archivos PDF." | Toast error. |
| Duplicado detectado | `AlertTriangle` | "Ya existe un examen para este trabajador (cedula {cedula}) en un periodo similar. Desea reemplazarlo?" | Dialogo de confirmacion. |
| Red / timeout | `WifiOff` | "No se pudieron cargar los examenes. Revisa tu conexion." | Boton "Reintentar". |
| Permiso denegado | `ShieldOff` | "No tienes permisos para ver los examenes medicos de esta empresa." | N/A. |
| Error 500 | `ServerCrash` | "Error del servidor al procesar el examen." | Boton "Reintentar". |

### Carga
- **Skeleton:** Tabla de examenes (6 filas skeleton).
- **Spinner:** `Loader2` + mensaje "Procesando examen con IA..." durante extraccion del PDF. Mostrar card de progreso con pasos: "Subiendo archivo... Extrayendo datos con IA... Guardando resultados..."
- **Optimistic UI:** No aplica (requiere confirmacion del usuario tras extraccion IA).

---

## 7. RiskMatrices (Matrices de Riesgo)

### Estado vacio
| Situacion | Icono | Mensaje | CTA |
|-----------|-------|---------|-----|
| Sin matrices | `ShieldAlert` | "No hay matrices de riesgo creadas. Genera la primera matriz GTC 45 con ayuda de IA para identificar los peligros de esta empresa." | "Generar matriz con IA" (boton Wand2). |
| Sin empresa seleccionada | `Building2` | "Selecciona una empresa para ver sus matrices de riesgo." | Selector de empresa. |
| Matriz sin riesgos | `ShieldAlert` | "Esta matriz no tiene riesgos identificados. Usa la generacion con IA o agrega riesgos manualmente." | "Generar riesgos con IA". |

### Errores
| Tipo | Icono | Mensaje | Accion |
|------|-------|---------|--------|
| Error generacion IA | `AlertTriangle` | "No se pudo generar la matriz de riesgos. Verifica que la empresa tenga CIIU y actividad economica registrados." | Toast error + revisar datos empresa. |
| Red / timeout | `WifiOff` | "No se pudieron cargar las matrices de riesgo." | Boton "Reintentar". |
| Permiso denegado | `ShieldOff` | "Solo administradores y consultores pueden gestionar matrices de riesgo." | N/A. |
| Error 500 | `ServerCrash` | "Error del servidor al cargar matrices." | Boton "Reintentar". |

### Carga
- **Skeleton:** Lista de matrices (3 skeleton cards), tabla de riesgos (6 filas skeleton con 10+ columnas).
- **Spinner:** `Loader2` + "Generando matriz con IA... Esto puede tomar hasta 30 segundos." durante generacion IA.
- **Optimistic UI:** No aplica (la tabla de riesgos se recarga completa).

---

## 8. Committees (Comites)

### Estado vacio
| Situacion | Icono | Mensaje | CTA |
|-----------|-------|---------|-----|
| Sin comites para la empresa | `Users` | "No hay comites registrados para esta empresa. Cree el comite COPASST o de Convivencia Laboral segun el numero de trabajadores." | "Crear comite COPASST" / "Crear Vigia SST". |
| Sin empresa seleccionada | `Building2` | "Selecciona una empresa para gestionar sus comites." | Selector de empresa. |
| Sin integrantes | `UserPlus` | "Este comite no tiene integrantes registrados. Agregue los representantes del empleador y los trabajadores." | "Agregar integrante". |
| Sin actas | `FileText` | "No hay actas generadas para este comite. Registre los puntos a tratar y genere el acta con IA." | "Generar acta". |

### Errores
| Tipo | Icono | Mensaje | Accion |
|------|-------|---------|--------|
| Sin quorum | `AlertTriangle` | "Sin quorum: se requieren {n} integrantes (hay {m} presentes). La reunion debe reprogramarse segun la normativa." | Toast error. Mostrar conteo de quorum. |
| Sin puntos a tratar | `AlertCircle` | "Ingresa los puntos a tratar para generar el acta." | Foco en textarea de puntos. |
| Error generacion acta IA | `AlertTriangle` | "No se pudo generar el acta. Verifica la conexion y reintenta." | Boton "Reintentar". |
| Red / timeout | `WifiOff` | "No se pudieron cargar los comites." | Boton "Reintentar". |
| Permiso denegado | `ShieldOff` | "No tienes permisos para gestionar comites de esta empresa." | N/A. |
| Error 500 | `ServerCrash` | "Error del servidor al cargar comites." | Boton "Reintentar". |

### Carga
- **Skeleton:** Tabs (skeleton de tabs), lista de integrantes (4 filas skeleton), historial de actas (3 filas skeleton).
- **Spinner:** `Loader2` + "Generando acta con IA..." durante generacion de acta (puede tomar 15-30s).
- **Optimistic UI:** Marcar asistencia de integrantes (toggle checkbox inmediato).

---

## 9. EmergencyPlans (Planes de Emergencia)

### Estado vacio
| Situacion | Icono | Mensaje | CTA |
|-----------|-------|---------|-----|
| Sin planes | `Siren` | "No hay planes de emergencia registrados. Grabe una inspeccion de vulnerabilidad o suba un audio para analisis con IA." | "Grabar inspeccion" (boton Mic). |
| Sin empresa seleccionada | `Building2` | "Selecciona una empresa para gestionar sus planes de emergencia." | Selector de empresa. |

### Errores
| Tipo | Icono | Mensaje | Accion |
|------|-------|---------|--------|
| Sin acceso al microfono | `MicOff` | "No se pudo acceder al microfono. Permite el acceso en la configuracion del navegador." | Instrucciones para habilitar microfono. |
| Error transcripcion | `AlertTriangle` | "No se pudo transcribir el audio. Verifica que la grabacion tenga audio claro y audible." | Boton "Reintentar" o subir otro archivo. |
| Error analisis IA | `AlertTriangle` | "Error al analizar la vulnerabilidad con IA." | Toast error + reintentar. |
| Red / timeout | `WifiOff` | "No se pudieron cargar los planes de emergencia." | Boton "Reintentar". |
| Permiso denegado | `ShieldOff` | "No tienes permisos para gestionar planes de emergencia." | N/A. |
| Error 500 | `ServerCrash` | "Error del servidor al procesar el audio." | Boton "Reintentar". |

### Carga
- **Skeleton:** Lista de planes (3 skeleton cards).
- **Spinner:** `Loader2` + "Transcribiendo y analizando audio con IA..." durante procesamiento de audio.
- **Optimistic UI:** No aplica.

---

## 10. Compliance (Cumplimiento Resolucion 0312)

### Estado vacio
| Situacion | Icono | Mensaje | CTA |
|-----------|-------|---------|-----|
| Sin empresa seleccionada | `Building2` | "Selecciona una empresa para evaluar su cumplimiento de la Resolucion 0312 de 2019." | Selector de empresa. |
| Sin evaluacion previa | `ClipboardCheck` | "No hay evaluacion de cumplimiento para esta empresa en el periodo actual. Revise cada estandar y marque los que se cumplen." | "Iniciar evaluacion". |

### Errores
| Tipo | Icono | Mensaje | Accion |
|------|-------|---------|--------|
| Error al guardar | `AlertTriangle` | "No se pudo guardar la evaluacion de cumplimiento. Intenta de nuevo." | Toast error + reintentar. |
| Red / timeout | `WifiOff` | "No se pudieron cargar los estandares de cumplimiento." | Boton "Reintentar". |
| Permiso denegado | `ShieldOff` | "Solo administradores y consultores pueden evaluar el cumplimiento." | N/A. |
| Error 500 | `ServerCrash` | "Error del servidor al cargar cumplimiento." | Boton "Reintentar". |

### Carga
- **Skeleton:** Cards de puntaje PHVA (4 skeleton cards con barra de progreso), tabla de estandares (10 filas skeleton agrupadas por ciclo PHVA).
- **Spinner:** `Loader2` en boton "Guardar" mientras persiste evaluacion.
- **Optimistic UI:** Toggle de checkbox de cumplimiento por estandar (marcar/desmarcar inmediatamente, revertir si error al guardar).

---

## 11. Documents (Documentos)

### Estado vacio
| Situacion | Icono | Mensaje | CTA |
|-----------|-------|---------|-----|
| Sin documentos | `FolderOpen` | "No hay documentos cargados para esta empresa. Suba la documentacion requerida por el SG-SST: politica SST, plan de trabajo anual, cronograma, entre otros." | "Subir documento" (abrir dialogo de carga). |
| Sin empresa seleccionada | `Building2` | "Selecciona una empresa para gestionar sus documentos." | Selector de empresa. |
| Filtro sin resultados | `Search` | "No se encontraron documentos con el tipo seleccionado." | "Limpiar filtros". |

### Errores
| Tipo | Icono | Mensaje | Accion |
|------|-------|---------|--------|
| Error al subir | `AlertTriangle` | "No se pudo subir el documento. Verifica el tamano del archivo (max. 50 MB) y tu conexion." | Toast error + reintentar. |
| Error al eliminar | `AlertTriangle` | "No se pudo eliminar el documento." | Toast error. |
| Red / timeout | `WifiOff` | "No se pudieron cargar los documentos." | Boton "Reintentar". |
| Permiso denegado | `ShieldOff` | "No tienes permisos para gestionar documentos de esta empresa." | N/A. |
| Error 500 | `ServerCrash` | "Error del servidor al cargar documentos." | Boton "Reintentar". |

### Carga
- **Skeleton:** Tabla de documentos (6 filas skeleton con columnas tipo, nombre, estado, fecha).
- **Spinner:** `Loader2` durante subida de archivo. `Loader2` en botones de validacion/aprobacion.
- **Optimistic UI:** Cambio de estado (pendiente -> cargado -> validado -> aprobado): actualizar Badge inmediatamente. Eliminar fila con fade-out, restaurar si falla.

---

## 12. EquipmentInventory (Inventario de Equipos)

### Estado vacio
| Situacion | Icono | Mensaje | CTA |
|-----------|-------|---------|-----|
| Sin equipos | `Package` | "No hay equipos de emergencia registrados. Agregue extintores, botiquines, camillas y otros equipos para llevar control de vencimientos e inspecciones." | "Agregar equipo" (boton Plus). |
| Sin empresa seleccionada | `Building2` | "Selecciona una empresa para gestionar su inventario de equipos." | Selector de empresa. |
| Filtro sin resultados | `Search` | "No se encontraron equipos con los filtros seleccionados." | "Limpiar filtros". |

### Errores
| Tipo | Icono | Mensaje | Accion |
|------|-------|---------|--------|
| Error al guardar | `AlertTriangle` | "No se pudo guardar el equipo. Verifica los datos e intenta de nuevo." | Toast error + mantener dialogo abierto. |
| Error al eliminar | `AlertTriangle` | "No se pudo eliminar el equipo del inventario." | Toast error. |
| Red / timeout | `WifiOff` | "No se pudo cargar el inventario de equipos." | Boton "Reintentar". |
| Permiso denegado | `ShieldOff` | "No tienes permisos para gestionar el inventario de esta empresa." | N/A. |
| Error 500 | `ServerCrash` | "Error del servidor al cargar inventario." | Boton "Reintentar". |

### Carga
- **Skeleton:** Cards de alerta (skeleton cards para proximos a vencer, vencidos), tabla de equipos (6 filas skeleton).
- **Spinner:** `Loader2` en boton "Guardar" del dialogo de equipo.
- **Optimistic UI:** Eliminar equipo con fade-out de fila, restaurar si falla.

---

## 13. Companies (Empresas)

### Estado vacio
| Situacion | Icono | Mensaje | CTA |
|-----------|-------|---------|-----|
| Sin empresas | `Building2` | "No hay empresas cliente registradas. Agrega la primera empresa para comenzar a gestionar su SG-SST." | "Agregar empresa" (boton Plus). |
| Busqueda sin resultados | `Search` | "No se encontraron empresas que coincidan con la busqueda." | "Limpiar busqueda". |

### Errores
| Tipo | Icono | Mensaje | Accion |
|------|-------|---------|--------|
| NIT duplicado | `AlertCircle` | "Ya existe una empresa con este NIT registrada en el sistema." | Toast error + foco en campo NIT. |
| Error al guardar | `AlertTriangle` | "No se pudo guardar la empresa. Verifica los datos obligatorios." | Toast error + mantener dialogo. |
| Error al activar/desactivar | `AlertTriangle` | "No se pudo cambiar el estado de la empresa." | Toast error. |
| Red / timeout | `WifiOff` | "No se pudieron cargar las empresas." | Boton "Reintentar". |
| Permiso denegado | `ShieldOff` | "Solo administradores pueden gestionar empresas." | N/A. |
| Error 500 | `ServerCrash` | "Error del servidor al cargar empresas." | Boton "Reintentar". |

### Carga
- **Skeleton:** Tabla de empresas (5 filas skeleton con columnas razon social, NIT, capitulo, trabajadores, estado).
- **Spinner:** `Loader2` en boton "Guardar" del dialogo.
- **Optimistic UI:** Toggle activar/desactivar empresa: cambiar Badge inmediatamente, revertir si falla.

---

## 14. Users (Usuarios)

### Estado vacio
| Situacion | Icono | Mensaje | CTA |
|-----------|-------|---------|-----|
| Sin usuarios adicionales | `UserCog` | "Solo existe el usuario administrador. Cree usuarios tipo consultor o cliente para dar acceso a las empresas." | "Crear usuario" (boton Plus). |
| Busqueda sin resultados | `Search` | "No se encontraron usuarios que coincidan con la busqueda." | "Limpiar busqueda". |

### Errores
| Tipo | Icono | Mensaje | Accion |
|------|-------|---------|--------|
| Email duplicado | `AlertCircle` | "Ya existe un usuario con este correo electronico." | Toast error + foco en campo email. |
| Error al crear | `AlertTriangle` | "No se pudo crear el usuario. Verifica los datos e intenta de nuevo." | Toast error + mantener dialogo. |
| Error al restablecer contrasena | `AlertTriangle` | "No se pudo enviar el correo de restablecimiento." | Toast error. |
| Red / timeout | `WifiOff` | "No se pudieron cargar los usuarios." | Boton "Reintentar". |
| Permiso denegado | `ShieldOff` | "Solo administradores pueden gestionar usuarios del sistema." | N/A. |
| Error 500 | `ServerCrash` | "Error del servidor al cargar usuarios." | Boton "Reintentar". |

### Carga
- **Skeleton:** Tabla de usuarios (5 filas skeleton con columnas nombre, email, rol, empresa, estado).
- **Spinner:** `Loader2` en boton "Guardar" del dialogo. `Loader2` en boton de restablecer contrasena.
- **Optimistic UI:** Toggle activar/desactivar usuario: cambiar Badge inmediatamente, revertir si falla.

---

## 15. Workers (Trabajadores)

### Estado vacio
| Situacion | Icono | Mensaje | CTA |
|-----------|-------|---------|-----|
| Sin trabajadores | `HardHat` | "No hay trabajadores registrados para esta empresa. Agregue trabajadores individualmente o importe un listado desde Excel/CSV." | "Agregar trabajador" (boton Plus) + "Importar desde Excel" (boton Upload). |
| Sin empresa seleccionada | `Building2` | "Selecciona una empresa para gestionar sus trabajadores." | Selector de empresa. |
| Busqueda sin resultados | `Search` | "No se encontraron trabajadores que coincidan con la busqueda." | "Limpiar busqueda". |

### Errores
| Tipo | Icono | Mensaje | Accion |
|------|-------|---------|--------|
| Cedula duplicada | `AlertCircle` | "Ya existe un trabajador con esta cedula en la empresa." | Toast error + foco en campo cedula. |
| Error importacion CSV | `AlertCircle` | "El archivo importado tiene errores. Revise las filas marcadas en rojo." | Mostrar tabla de prevalidacion con errores por fila. |
| Error al guardar | `AlertTriangle` | "No se pudo guardar el trabajador." | Toast error + mantener dialogo. |
| Red / timeout | `WifiOff` | "No se pudieron cargar los trabajadores." | Boton "Reintentar". |
| Permiso denegado | `ShieldOff` | "No tienes permisos para gestionar trabajadores de esta empresa." | N/A. |
| Error 500 | `ServerCrash` | "Error del servidor al cargar trabajadores." | Boton "Reintentar". |

### Carga
- **Skeleton:** Tabla de trabajadores (8 filas skeleton con columnas nombre, cedula, cargo, area, estado).
- **Spinner:** `Loader2` en boton "Guardar" del dialogo. `Loader2` durante importacion masiva.
- **Optimistic UI:** Toggle activar/desactivar trabajador: cambiar Badge inmediatamente. Eliminar con fade-out.

---

## 16. Settings (Configuracion del Sistema)

### Estado vacio
| Situacion | Icono | Mensaje | CTA |
|-----------|-------|---------|-----|
| Sin configuraciones | `Settings2` | "No hay parametros de configuracion registrados. Esto es inusual, contacta soporte." | N/A (no deberia ocurrir en produccion). |

### Errores
| Tipo | Icono | Mensaje | Accion |
|------|-------|---------|--------|
| Error al guardar | `AlertTriangle` | "No se pudo guardar la configuracion. Intenta de nuevo." | Toast error. |
| Valor invalido | `AlertCircle` | Inline: "El valor no es valido para este parametro." | Foco en campo con error. |
| Red / timeout | `WifiOff` | "No se pudieron cargar los parametros de configuracion." | Boton "Reintentar". |
| Permiso denegado | `ShieldOff` | "Solo administradores pueden modificar la configuracion del sistema." | N/A. |
| Error 500 | `ServerCrash` | "Error del servidor al cargar configuracion." | Boton "Reintentar". |

### Carga
- **Skeleton:** Cards de grupos de configuracion (5 skeleton cards con 2-3 campos skeleton cada una).
- **Spinner:** `Loader2` en boton "Guardar" de cada grupo.
- **Optimistic UI:** No aplica (requiere guardado explicito).

---

## 17. ActivityLog (Bitacora de Actividad)

### Estado vacio
| Situacion | Icono | Mensaje | CTA |
|-----------|-------|---------|-----|
| Sin registros | `History` | "No hay actividad registrada en el sistema. Las acciones de los usuarios se registraran automaticamente aqui." | N/A (solo lectura). |
| Filtros sin resultados | `Search` | "No se encontraron registros de actividad para los filtros seleccionados." | "Limpiar filtros". |

### Errores
| Tipo | Icono | Mensaje | Accion |
|------|-------|---------|--------|
| Red / timeout | `WifiOff` | "No se pudo cargar la bitacora de actividad." | Boton "Reintentar". |
| Permiso denegado | `ShieldOff` | "Solo administradores y consultores pueden ver la bitacora completa." | N/A. |
| Error 500 | `ServerCrash` | "Error del servidor al cargar la bitacora." | Boton "Reintentar". |

### Carga
- **Skeleton:** Filtros (skeleton inputs), tabla de logs (10 filas skeleton con columnas fecha, usuario, modulo, tipo, descripcion).
- **Spinner:** `Loader2` al cambiar filtros si la recarga es lenta.
- **Optimistic UI:** No aplica (solo lectura).

---

## 18. Calendar (Calendario SG-SST)

### Estado vacio
| Situacion | Icono | Mensaje | CTA |
|-----------|-------|---------|-----|
| Sin eventos en el mes | `CalendarDays` | "No hay eventos programados para este mes. Los vencimientos de PILA, examenes medicos y reuniones de comite apareceran aqui automaticamente." | N/A (los eventos se generan desde otros modulos). |
| Sin empresa seleccionada | `Building2` | "Selecciona una empresa para ver su calendario de actividades SG-SST." | Selector de empresa. |

### Errores
| Tipo | Icono | Mensaje | Accion |
|------|-------|---------|--------|
| Red / timeout | `WifiOff` | "No se pudieron cargar los eventos del calendario." | Boton "Reintentar". |
| Error 500 | `ServerCrash` | "Error del servidor al cargar el calendario." | Boton "Reintentar". |

### Carga
- **Skeleton:** Grid del calendario (skeleton de celdas 7x5), lista de eventos del dia (3 skeleton items).
- **Spinner:** `Loader2` al navegar entre meses.
- **Optimistic UI:** No aplica (solo lectura).

---

## 19. CompanyReport (Informe por Empresa)

### Estado vacio
| Situacion | Icono | Mensaje | CTA |
|-----------|-------|---------|-----|
| Sin empresa seleccionada | `Building2` | "Selecciona una empresa para generar su informe consolidado de SG-SST." | Selector de empresa. |
| Empresa sin datos | `FileText` | "Esta empresa no tiene datos suficientes para generar un informe. Complete al menos el modulo PILA y el de cumplimiento." | Enlace a modulos pendientes. |

### Errores
| Tipo | Icono | Mensaje | Accion |
|------|-------|---------|--------|
| Error al generar | `AlertTriangle` | "No se pudo generar el informe. Intenta de nuevo." | Boton "Reintentar". |
| Error al imprimir | `AlertTriangle` | "No se pudo abrir la ventana de impresion. Verifica que tu navegador no bloquee ventanas emergentes." | Instrucciones para habilitar popups. |
| Red / timeout | `WifiOff` | "No se pudieron cargar los datos del informe." | Boton "Reintentar". |
| Error 500 | `ServerCrash` | "Error del servidor al generar el informe." | Boton "Reintentar". |

### Carga
- **Skeleton:** Cards de resumen (6 skeleton cards con icono + numero), tabla de cumplimiento (skeleton de tabla con progreso).
- **Spinner:** `Loader2` + "Cargando datos del informe..." al seleccionar empresa.
- **Optimistic UI:** No aplica (solo lectura + impresion).

---

## 20. EmailTemplates (Plantillas de Correo)

### Estado vacio
| Situacion | Icono | Mensaje | CTA |
|-----------|-------|---------|-----|
| Sin plantillas | `Mail` | "No hay plantillas de correo configuradas. Cree plantillas para solicitudes, recordatorios y escalamientos PILA." | "Crear plantilla" (boton Plus). |
| Sin resultados en filtro | `Search` | "No se encontraron plantillas del tipo seleccionado." | "Ver todas las plantillas". |

### Errores
| Tipo | Icono | Mensaje | Accion |
|------|-------|---------|--------|
| Error al guardar | `AlertTriangle` | "No se pudo guardar la plantilla. Verifica que todos los campos obligatorios esten completos." | Toast error + mantener editor. |
| Variables invalidas | `AlertCircle` | "La plantilla contiene variables no reconocidas: {variables}." | Resaltar variables invalidas en el editor. |
| Red / timeout | `WifiOff` | "No se pudieron cargar las plantillas de correo." | Boton "Reintentar". |
| Permiso denegado | `ShieldOff` | "Solo administradores pueden gestionar plantillas de correo." | N/A. |
| Error 500 | `ServerCrash` | "Error del servidor al cargar plantillas." | Boton "Reintentar". |

### Carga
- **Skeleton:** Lista de plantillas (4 skeleton cards), editor de plantilla (skeleton de textarea).
- **Spinner:** `Loader2` en boton "Guardar".
- **Optimistic UI:** No aplica (requiere guardado explicito).

---

## 21. UploadPila (Carga Publica de PILA)

### Estado vacio
- **Cuando:** El usuario (externo) llega con un token valido y la zona de carga esta lista.
- **Icono:** `Upload`
- **Mensaje:** N/A (la dropzone se muestra por defecto).

### Errores
| Tipo | Icono | Mensaje | Accion |
|------|-------|---------|--------|
| Token invalido | `AlertCircle` | "El enlace de carga no es valido. Solicite un nuevo enlace a su consultor de Regis Colombia." | N/A (sin opciones de recuperacion para usuario externo). |
| Token expirado | `Clock` | "Este enlace ha expirado. Solicite un nuevo enlace de carga a su consultor de Regis Colombia." | N/A. |
| Sin token | `AlertCircle` | "No se proporciono un enlace valido. Use el enlace enviado por su consultor." | N/A. |
| Error al subir | `AlertTriangle` | "No se pudo subir la planilla PILA. Verifique su conexion e intente de nuevo." | Boton "Reintentar". |
| Red / timeout | `WifiOff` | "Sin conexion a internet. Revise su red e intente de nuevo." | Boton "Reintentar". |

### Carga
- **Spinner:** Animacion de upload (barra de progreso o `Loader2`) durante la subida del archivo.
- **Estado exito:** Card con `CheckCircle2` verde + "Planilla PILA cargada exitosamente para {empresa} - {periodo}."
- **Skeleton:** No aplica (pagina simple).
- **Optimistic UI:** No aplica.

---

## 22. NotFound (404)

### Estado vacio
- **Cuando:** Siempre (es la pagina por defecto para rutas inexistentes).
- **Icono:** `FileQuestion`
- **Mensaje:** "La pagina que buscas no existe. Puede que la URL sea incorrecta o que no tengas acceso a este recurso."
- **CTA:** "Volver al inicio" (enlace a `/`).

### Errores
- No aplica (la pagina misma ES el estado de error).

### Carga
- No aplica (renderizado estatico).

---

## Resumen de iconos por estado

| Estado | Icono principal | Uso |
|--------|----------------|-----|
| Tabla vacia (sin datos) | Icono del modulo (ver tabla abajo) | Centrado en area de la tabla. |
| Sin empresa seleccionada | `Building2` | Con selector de empresa visible. |
| Busqueda sin resultados | `Search` | Con boton "Limpiar busqueda/filtros". |
| Error de red | `WifiOff` | Card centrada + boton reintentar. |
| Error de permisos | `ShieldOff` | Card centrada, sin acciones. |
| Error de validacion | `AlertCircle` | Inline debajo del campo. |
| Error de servidor | `ServerCrash` | Card centrada + boton reintentar. |
| Error de IA | `AlertTriangle` | Toast + detalle del error. |
| Carga de datos | `Skeleton` | Replicas de la estructura final. |
| Accion en curso | `Loader2` | Dentro del boton de accion. |
| Exito | `CheckCircle2` | Toast (sonner) verde o card de confirmacion. |

### Iconos de modulo para estados vacios

| Modulo | Icono |
|--------|-------|
| PILA | `FileSpreadsheet` |
| Examenes Medicos | `Stethoscope` |
| Matrices de Riesgo | `ShieldAlert` |
| Comites | `Users` |
| Planes de Emergencia | `Siren` |
| Cumplimiento | `ClipboardCheck` |
| Documentos | `FolderOpen` |
| Inventario de Equipos | `Package` |
| Empresas | `Building2` |
| Usuarios | `UserCog` |
| Trabajadores | `HardHat` |
| Configuracion | `Settings2` |
| Bitacora | `History` |
| Calendario | `CalendarDays` |
| Plantillas de Correo | `Mail` |
| Informe Empresa | `FileText` |

---

## Patron de implementacion recomendado

### Estado vacio reutilizable

```tsx
// src/components/common/EmptyState.tsx
import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void; icon?: LucideIcon };
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.icon && <action.icon className="h-4 w-4 mr-2" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

### Estado de error reutilizable

```tsx
// src/components/common/ErrorState.tsx
import { type LucideIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ErrorStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  onRetry?: () => void;
};

export function ErrorState({ icon: Icon, title, description, onRetry }: ErrorStateProps) {
  return (
    <Card className="max-w-md mx-auto mt-12">
      <CardContent className="flex flex-col items-center text-center py-8">
        <div className="rounded-full bg-destructive/10 p-4 mb-4">
          <Icon className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
```

### Skeleton de tabla reutilizable

```tsx
// src/components/common/TableSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type TableSkeletonProps = { rows?: number; columns?: number };

export function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {Array.from({ length: columns }).map((_, i) => (
            <TableHead key={i}><Skeleton className="h-4 w-24" /></TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, r) => (
          <TableRow key={r}>
            {Array.from({ length: columns }).map((_, c) => (
              <TableCell key={c}><Skeleton className="h-4 w-full" /></TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```
