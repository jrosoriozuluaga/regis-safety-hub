# Wizard de Onboarding de Empresa — Documento de Diseno

> Estado: BORRADOR  
> Autor: Equipo Regis SG-SST  
> Fecha: 2026-05-21  
> Componente: `src/pages/wizards/CompanyOnboardingWizard.tsx`

---

## 1. Historias de Usuario

### HU-01: Admin Regis crea empresa nueva en menos de 10 minutos
**Como** administrador de Regis,  
**quiero** un wizard paso a paso que me guie al crear una empresa cliente,  
**para que** toda la informacion quede completa desde el primer dia y no tenga que navegar multiples paginas.

**Criterios de aceptacion:**
- El wizard tiene 7 pasos claros con indicador de progreso.
- Puedo guardar borrador en cualquier paso y continuar despues.
- Al finalizar, la empresa queda activa con todos sus datos, trabajadores, comites y cronograma.

### HU-02: Consultor importa trabajadores desde CSV/Excel
**Como** consultor asignado,  
**quiero** importar la lista de trabajadores desde un archivo CSV o Excel,  
**para que** no tenga que escribir cada trabajador manualmente.

**Criterios de aceptacion:**
- Acepta archivos .csv y .xlsx.
- Muestra vista previa con mapeo de columnas antes de confirmar.
- Detecta cedulas duplicadas y muestra advertencia sin bloquear.
- Permite agregar trabajadores manualmente como alternativa.

### HU-03: Admin cliente recibe invitacion de acceso
**Como** administrador de la empresa cliente,  
**quiero** recibir un correo con invitacion para acceder a la plataforma,  
**para que** pueda consultar el estado de cumplimiento de mi empresa.

**Criterios de aceptacion:**
- El admin Regis puede crear un usuario con rol "cliente" desde el paso 6.
- Se envia un correo de invitacion con enlace de activacion.
- El usuario creado solo ve los datos de su empresa.

### HU-04: Trabajador aparece registrado tras onboarding
**Como** trabajador de la empresa,  
**quiero** que mis datos queden registrados en la plataforma,  
**para que** mis examenes medicos y capacitaciones queden vinculados a mi perfil.

**Criterios de aceptacion:**
- Cada trabajador tiene nombre, cedula, cargo, area y fecha de ingreso.
- Cedula es unica dentro de la empresa.
- Los trabajadores importados quedan con estado activo = true.

### HU-05: Auditor SIC verifica cumplimiento desde el dia uno
**Como** auditor del Sistema de Informacion Comercial,  
**quiero** que la empresa tenga su cronograma SST y comites configurados desde el inicio,  
**para que** pueda verificar cumplimiento de la Resolucion 0312/2019 desde la fecha de vinculacion.

**Criterios de aceptacion:**
- El cronograma SST se genera automaticamente segun CIIU y nivel de riesgo.
- Los comites (COPASST/Convivencia/Vigia) quedan creados con sus integrantes.
- El capitulo 0312 se calcula automaticamente por el DB (columna generada).

---

## 2. Los 7 Pasos del Wizard

### Paso 1: Datos Basicos de la Empresa

**Descripcion:** Captura la informacion legal y operativa de la empresa. El NIT incluye digito de verificacion calculado automaticamente. El CIIU se selecciona con buscador que filtra por codigo o descripcion. El nivel de riesgo ARL y el numero de trabajadores determinan el capitulo de la 0312.

**Campos:**
| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| NIT | texto + digito verificacion | Si | 9 digitos + 1 digito verificacion (algoritmo modulo 11) |
| Razon social | texto | Si | Min 3 caracteres |
| CIIU | select con busqueda | Si | Debe existir en tabla `ciiu_codigos` |
| Nivel riesgo ARL | select 1-5 | Si | Entero 1-5 |
| Num. trabajadores | numero | Si | Entero >= 1 |
| Direccion | texto | Si | Min 5 caracteres |
| Ciudad | texto | Si | No vacio |
| Departamento | select | No | Lista predefinida de dptos Colombia |
| Telefono | texto | No | 7-10 digitos |

**Validaciones especiales:**
- NIT unico en la base de datos (consulta asincrona al salir del campo).
- El digito de verificacion se calcula en tiempo real con el algoritmo modulo 11 colombiano.
- Al seleccionar CIIU, se sugiere automaticamente el nivel de riesgo tipico desde `ciiu_codigos.nivel_riesgo_tipico`.
- `capitulo_0312` NO se envia al backend — es columna generada.

```
+------------------------------------------------------------------+
| PASO 1 DE 7: Datos Basicos de la Empresa                        |
|                                                                  |
| [=====                                          ] 14%            |
|                                                                  |
| +--------------------------------------------------------------+ |
| |  NIT *                        Digito Verif.                  | |
| |  [_______________]  -  [_]  (calculado auto)                 | |
| |                                                              | |
| |  Razon Social *                                              | |
| |  [______________________________________________]            | |
| |                                                              | |
| |  Codigo CIIU *                                               | |
| |  [__ Buscar por codigo o descripcion... ________] v          | |
| |  > 6201 - Actividades de desarrollo de sistemas   (sugerido) | |
| |                                                              | |
| |  Nivel Riesgo ARL *     Num. Trabajadores *                  | |
| |  [_ Nivel I ____] v     [____15____]                         | |
| |                                                              | |
| |  Capitulo 0312: Capitulo 2 (calculado automaticamente)       | |
| |                                                              | |
| |  Direccion *                        Ciudad *                 | |
| |  [_________________________]        [____________]           | |
| |                                                              | |
| |  Departamento               Telefono                        | |
| |  [__ Cundinamarca __] v     [____________]                   | |
| +--------------------------------------------------------------+ |
|                                                                  |
|                          [Guardar borrador]  [Siguiente ->]      |
+------------------------------------------------------------------+
```

---

### Paso 2: Configuracion de Contactos

**Descripcion:** Se registran dos tipos de contacto: el contacto general de la empresa (para comunicaciones administrativas) y el contacto PILA (persona encargada de enviar las planillas de seguridad social cada mes). Pueden ser la misma persona — un checkbox copia los datos.

**Campos:**
| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| Nombre contacto general | texto | Si | Min 3 caracteres |
| Cargo contacto | texto | Si | No vacio |
| Email contacto | email | Si | Formato email valido |
| Mismo contacto para PILA | checkbox | No | — |
| Nombre contacto PILA | texto | Si* | Min 3 caracteres (*si no es el mismo) |
| Email contacto PILA | email | Si* | Formato email valido |
| WhatsApp contacto PILA | texto | Si* | 10 digitos, prefijo +57 |

```
+------------------------------------------------------------------+
| PASO 2 DE 7: Configuracion de Contactos                         |
|                                                                  |
| [==========                                      ] 28%          |
|                                                                  |
| +--- Contacto General -----------------------------------------+ |
| |  Nombre *                   Cargo *                          | |
| |  [_____________________]    [_____________________]          | |
| |                                                              | |
| |  Email *                                                     | |
| |  [_____________________@___________________]                 | |
| +--------------------------------------------------------------+ |
|                                                                  |
| [x] Usar el mismo contacto para PILA                            |
|                                                                  |
| +--- Contacto PILA (planillas seguridad social) ---------------+ |
| |  Nombre *                                                    | |
| |  [_____________________] (copiado de contacto general)       | |
| |                                                              | |
| |  Email PILA *                   WhatsApp *                   | |
| |  [_____________________]        [+57 ___________]            | |
| +--------------------------------------------------------------+ |
|                                                                  |
|                [<- Anterior]  [Guardar borrador]  [Siguiente ->] |
+------------------------------------------------------------------+
```

---

### Paso 3: Importar Trabajadores

**Descripcion:** Permite importar trabajadores masivamente desde CSV/Excel o agregarlos manualmente uno por uno. La importacion muestra vista previa con mapeo de columnas y detecta duplicados por cedula. Minimo 1 trabajador requerido.

**Campos por trabajador:**
| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| Nombre | texto | Si | Min 3 caracteres |
| Cedula | texto | Si | 6-10 digitos, unica en la empresa |
| Cargo | texto | Si | No vacio |
| Area | texto | Si | No vacio |
| Fecha ingreso | fecha | No | No futura |

**Flujo de importacion CSV/Excel:**
1. Usuario sube archivo .csv o .xlsx
2. Sistema detecta columnas y muestra mapeo sugerido
3. Usuario ajusta mapeo si es necesario
4. Vista previa con primeras 5 filas
5. Se marcan filas con errores (cedula duplicada, campos vacios)
6. Usuario confirma importacion

```
+------------------------------------------------------------------+
| PASO 3 DE 7: Importar Trabajadores                              |
|                                                                  |
| [===============                                 ] 42%          |
|                                                                  |
| +--- Metodo de carga -----------------------------------------+ |
| | ( ) Importar desde archivo CSV/Excel                        | |
| | ( ) Agregar manualmente                                     | |
| +-------------------------------------------------------------+ |
|                                                                  |
| +--- Importar archivo ----------------------------------------+ |
| |  [  Arrastra tu archivo aqui o haz clic para seleccionar  ] | |
| |  [          Formatos: .csv, .xlsx (max 5MB)               ] | |
| +-------------------------------------------------------------+ |
|                                                                  |
| +--- Mapeo de columnas (tras subir archivo) ------------------+ |
| |  Columna archivo     ->   Campo sistema                    | |
| |  "Nombre completo"   ->   [Nombre          ] v             | |
| |  "CC"                ->   [Cedula          ] v             | |
| |  "Puesto"            ->   [Cargo           ] v             | |
| |  "Departamento"      ->   [Area            ] v             | |
| |  "Fecha inicio"      ->   [Fecha ingreso   ] v             | |
| +-------------------------------------------------------------+ |
|                                                                  |
| +--- Vista previa (5 filas) ----------------------------------+ |
| |  # | Nombre       | Cedula     | Cargo    | Area  | Estado | |
| |  1 | Juan Perez   | 1012345678 | Operario | Prod. | OK     | |
| |  2 | Ana Garcia   | 1098765432 | Admin    | Adm.  | OK     | |
| |  3 | Carlos Lopez | 1012345678 | Tecnico  | Mant. | DUPL!  | |
| +-------------------------------------------------------------+ |
|  Total: 15 filas | 14 validas | 1 duplicada                    |
|                                                                  |
|  [Confirmar importacion]                                        |
|                                                                  |
| +--- Trabajadores agregados (tabla editable) -----------------+ |
| |  Nombre       | Cedula     | Cargo    | Area    | [+Agregar]| |
| |  Juan Perez   | 1012345678 | Operario | Prod.   | [x]       | |
| |  Ana Garcia   | 1098765432 | Admin    | Adm.    | [x]       | |
| +-------------------------------------------------------------+ |
|                                                                  |
|                [<- Anterior]  [Guardar borrador]  [Siguiente ->] |
+------------------------------------------------------------------+
```

---

### Paso 4: Setup de Comites

**Descripcion:** Configura los comites obligatorios segun la Resolucion 0312/2019. Si la empresa tiene mas de 10 trabajadores, se requiere COPASST. El Comite de Convivencia es obligatorio siempre. Si tiene 10 o menos, se configura un Vigia SST en lugar de COPASST. Cada comite tiene un periodo (2 anos) e integrantes con roles.

**Logica automatica:**
- `num_trabajadores <= 10`: Vigia SST + Convivencia
- `num_trabajadores > 10`: COPASST + Convivencia

**Campos por integrante:**
| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| Nombre | texto | Si | Min 3 caracteres |
| Cedula | texto | Si | Debe existir en trabajadores importados |
| Cargo empresa | texto | Si | No vacio |
| Rol comite | select | Si | Presidente/Secretario/Miembro (COPASST) o Representante (Vigia) |
| Es principal | checkbox | No | — |
| Email | email | No | Formato email valido |

```
+------------------------------------------------------------------+
| PASO 4 DE 7: Setup de Comites                                   |
|                                                                  |
| [====================                            ] 57%          |
|                                                                  |
| Segun el numero de trabajadores (15), se requieren:             |
| - COPASST (Comite Paritario de Seguridad y Salud)              |
| - Comite de Convivencia Laboral                                |
|                                                                  |
| +--- COPASST --------------------------------------------------+ |
| |  Periodo: [2026-05-21] a [2028-05-21]                       | |
| |                                                              | |
| |  Integrantes:                                                | |
| |  Nombre       | Cedula     | Cargo    | Rol       | Princ.  | |
| |  [__________] | [________] | [______] | [Pres.] v | [x]     | |
| |  [__________] | [________] | [______] | [Secr.] v | [ ]     | |
| |  [__________] | [________] | [______] | [Miemb] v | [x]     | |
| |                                                   [+Agregar] | |
| |                                                              | |
| |  Min: 4 integrantes (2 empleador + 2 trabajadores)          | |
| +--------------------------------------------------------------+ |
|                                                                  |
| +--- Comite de Convivencia -----------------------------------+ |
| |  Periodo: [2026-05-21] a [2028-05-21]                       | |
| |                                                              | |
| |  Integrantes:                                                | |
| |  Nombre       | Cedula     | Cargo    | Rol       | Princ.  | |
| |  [__________] | [________] | [______] | [Repr.] v | [x]     | |
| |  [__________] | [________] | [______] | [Repr.] v | [x]     | |
| |                                                   [+Agregar] | |
| |                                                              | |
| |  Min: 2 integrantes (1 empleador + 1 trabajador)            | |
| +--------------------------------------------------------------+ |
|                                                                  |
|                [<- Anterior]  [Guardar borrador]  [Siguiente ->] |
+------------------------------------------------------------------+
```

---

### Paso 5: Cronograma SST Anual

**Descripcion:** Genera automaticamente un cronograma de actividades SST para los 12 meses del ano, basado en el CIIU, nivel de riesgo ARL y capitulo de la 0312. Las actividades se sugieren pre-marcadas y el consultor puede ajustar. Cubre las actividades del ciclo PHVA (Planear, Hacer, Verificar, Actuar).

**Actividades sugeridas (ejemplo cap. 2):**
- Mensual: Seguimiento PILA, inspecciones de seguridad
- Trimestral: Reunion COPASST, capacitaciones SST
- Semestral: Simulacro de emergencias, actualizacion matriz de riesgos
- Anual: Revision por la direccion, evaluacion de estandares 0312, examenes medicos periodicos

```
+------------------------------------------------------------------+
| PASO 5 DE 7: Cronograma SST Anual                               |
|                                                                  |
| [=========================                       ] 71%          |
|                                                                  |
| Generado para: CIIU 6201 | Riesgo I | Capitulo 2               |
| Ano: [2026] v                                                   |
|                                                                  |
| +--- Cronograma (tabla mensual) ------------------------------+ |
| |  Actividad            | Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|... | |
| |  Seguimiento PILA     | [x]|[x]|[x]|[x]|[x]|[x]|[x]|[x]| | |
| |  Inspeccion seguridad  | [x]|[x]|[x]|[x]|[x]|[x]|[x]|[x]| | |
| |  Reunion COPASST       | [x]|   |[x]|   |[x]|   |[x]|   | | |
| |  Capacitacion SST      | [x]|   |[x]|   |[x]|   |[x]|   | | |
| |  Simulacro emergencia  |    |   |   |   |   |[x]|   |   | | |
| |  Actualizar matriz     |    |   |   |   |   |[x]|   |   | | |
| |  Revision direccion    |    |   |   |   |   |   |   |   | | |
| |  Eval. estandares 0312 |    |   |   |   |   |   |   |   | | |
| |  Examenes periodicos   |    |   |   |   |   |   |   |   | | |
| |  + Agregar actividad   |    |   |   |   |   |   |   |   | | |
| +-------------------------------------------------------------+ |
|                                                                  |
| Actividades marcadas: 42/108 celdas | Cumplimiento esperado: 39%|
|                                                                  |
|                [<- Anterior]  [Guardar borrador]  [Siguiente ->] |
+------------------------------------------------------------------+
```

---

### Paso 6: Roles de Acceso

**Descripcion:** Asigna el consultor responsable de la empresa y opcionalmente crea un usuario con rol "cliente" para que la empresa pueda acceder a la plataforma. Al crear el usuario cliente, se envia un correo de invitacion.

**Campos:**
| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| Consultor asignado | select | Si | Lista de usuarios con rol "consultor" |
| Crear usuario admin cliente | checkbox | No | — |
| Nombre admin cliente | texto | Si* | Min 3 caracteres (*si se crea) |
| Email admin cliente | email | Si* | Formato email valido, unico en sistema |
| Enviar invitacion por correo | checkbox | No | Default: true |

```
+------------------------------------------------------------------+
| PASO 6 DE 7: Roles de Acceso                                    |
|                                                                  |
| [==============================                  ] 85%          |
|                                                                  |
| +--- Consultor asignado --------------------------------------+ |
| |  Consultor *                                                | |
| |  [__ Seleccionar consultor... ________________] v            | |
| |  > Maria Rodriguez - maria@regis.com.co                      | |
| |  > Carlos Gomez - carlos@regis.com.co                        | |
| +--------------------------------------------------------------+ |
|                                                                  |
| [x] Crear usuario administrador para la empresa                |
|                                                                  |
| +--- Datos del admin cliente ---------------------------------+ |
| |  Nombre *                   Email *                          | |
| |  [_____________________]    [____________@___________]       | |
| |                                                              | |
| |  [x] Enviar correo de invitacion                            | |
| |                                                              | |
| |  Nota: El usuario recibira un enlace para crear su          | |
| |  contrasena y acceder a la plataforma. Solo podra           | |
| |  ver informacion de su empresa.                             | |
| +--------------------------------------------------------------+ |
|                                                                  |
|                [<- Anterior]  [Guardar borrador]  [Siguiente ->] |
+------------------------------------------------------------------+
```

---

### Paso 7: Resumen y Activacion

**Descripcion:** Muestra un resumen completo de todos los datos ingresados en los pasos anteriores. El usuario revisa la informacion y confirma para activar la empresa. Al activar, se ejecutan las acciones de inicializacion: crear empresa, trabajadores, comites, cronograma, usuario, y lanzar la primera sincronizacion de periodos PILA.

**Acciones al activar:**
1. Insertar registro en `empresas_cliente` (activo = true)
2. Insertar trabajadores en `trabajadores`
3. Insertar comites e integrantes en `comites` + `integrantes_comite`
4. Insertar cronograma (tabla por definir o JSON en empresa)
5. Crear usuario cliente en Supabase Auth + tabla `usuarios`
6. Ejecutar `syncPeriods()` para generar registros PILA de los ultimos 6 meses
7. Registrar en `logs_actividad`
8. Enviar correo de invitacion al admin cliente (si aplica)

```
+------------------------------------------------------------------+
| PASO 7 DE 7: Resumen y Activacion                               |
|                                                                  |
| [=============================================   ] 100%         |
|                                                                  |
| +--- Empresa -------------------------------------------------+ |
| |  Construandes Ltda | NIT: 900123456-7 | CIIU: 4111          | |
| |  Riesgo ARL: III | 25 trabajadores | Capitulo 2             | |
| |  Bogota, Cundinamarca | Cra 45 #67-89                       | |
| +--------------------------------------------------------------+ |
|                                                                  |
| +--- Contactos -----------------------------------------------+ |
| |  General: Juan Perez (Gerente) - juan@construandes.com      | |
| |  PILA: Maria Lopez - maria@construandes.com - +573001234567 | |
| +--------------------------------------------------------------+ |
|                                                                  |
| +--- Trabajadores --------------------------------------------+ |
| |  25 trabajadores importados | 0 duplicados | 0 errores      | |
| +--------------------------------------------------------------+ |
|                                                                  |
| +--- Comites -------------------------------------------------+ |
| |  COPASST: 4 integrantes | Periodo: 2026-2028               | |
| |  Convivencia: 2 integrantes | Periodo: 2026-2028           | |
| +--------------------------------------------------------------+ |
|                                                                  |
| +--- Cronograma SST -----------------------------------------+ |
| |  42 actividades programadas para 2026                       | |
| +--------------------------------------------------------------+ |
|                                                                  |
| +--- Acceso --------------------------------------------------+ |
| |  Consultor: Maria Rodriguez                                 | |
| |  Admin cliente: Juan Perez (juan@construandes.com)          | |
| |  Invitacion por correo: Si                                  | |
| +--------------------------------------------------------------+ |
|                                                                  |
| [!] Al activar la empresa, se ejecutaran las siguientes acciones:|
|  - Crear empresa y todos los registros asociados               |
|  - Sincronizar periodos PILA (ultimos 6 meses)                |
|  - Enviar correo de invitacion al admin cliente                |
|                                                                  |
|        [<- Anterior]  [Guardar borrador]  [ACTIVAR EMPRESA ->]  |
+------------------------------------------------------------------+
```

---

## 3. Reglas de Validacion Consolidadas

| Regla | Paso | Descripcion |
|-------|------|-------------|
| NIT formato | 1 | 9 digitos numericos + guion + 1 digito verificacion |
| NIT unico | 1 | Consulta asincrona a `empresas_cliente` para evitar duplicados |
| NIT digito verificacion | 1 | Algoritmo modulo 11 colombiano (pesos: 71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 17, 13, 7, 3) |
| CIIU existe | 1 | Debe existir en tabla `ciiu_codigos` |
| Email formato | 2, 6 | Regex estandar para email valido |
| WhatsApp formato | 2 | 10 digitos numericos (se agrega +57 automatico) |
| Cedula unica | 3 | No puede repetirse dentro de la misma empresa |
| Cedula formato | 3 | 6-10 digitos numericos |
| Min trabajadores | 3 | Al menos 1 trabajador agregado |
| Integrantes comite | 4 | COPASST: min 4 (2+2); Convivencia: min 2 (1+1); Vigia: 1 |
| Integrante existe | 4 | Cedula del integrante debe existir en lista de trabajadores del paso 3 |
| Consultor requerido | 6 | Debe seleccionar un consultor |
| Email unico usuario | 6 | Email del admin cliente no debe existir en `usuarios` |

---

## 4. Guardar Borrador y Continuar Despues

**Mecanismo:**
- Cada paso guarda datos en `localStorage` bajo la clave `onboarding_draft_{nit}`.
- El borrador incluye: `currentStep`, `wizardData`, `lastSaved` (timestamp).
- Al abrir el wizard, se verifica si hay borrador pendiente y se ofrece continuar.
- Al activar la empresa exitosamente, se elimina el borrador de `localStorage`.
- Opcionalmente en futuro: guardar borrador en tabla `onboarding_borradores` para persistencia entre dispositivos.

**Estructura del borrador:**
```json
{
  "currentStep": 3,
  "lastSaved": "2026-05-21T10:30:00Z",
  "wizardData": {
    "empresa": { "nit": "900123456", "razon_social": "..." },
    "contactos": { "nombre_contacto": "...", "email_contacto": "..." },
    "trabajadores": [ { "nombre": "...", "cedula": "..." } ],
    "comites": [],
    "cronograma": {},
    "acceso": {}
  }
}
```

---

## 5. Estados de Exito y Error

### Exito
- **Activacion completa:** Banner verde "Empresa activada exitosamente. Se crearon X trabajadores, Y comites y Z actividades en el cronograma." + redireccion a dashboard de la empresa.
- **Borrador guardado:** Toast "Borrador guardado. Puedes continuar en cualquier momento." (sonner).
- **CSV importado:** Toast "15 trabajadores importados correctamente. 1 duplicado omitido."

### Error
- **NIT duplicado:** Alerta roja inline: "Ya existe una empresa con NIT 900123456-7."
- **Error de red:** Toast error "No se pudo guardar. Verifica tu conexion e intenta de nuevo." + los datos permanecen en el formulario.
- **CSV invalido:** Alerta amarilla: "El archivo no tiene las columnas necesarias. Se requiere al menos: Nombre, Cedula."
- **Error al activar:** Modal de error con detalle: "No se pudo crear la empresa: [detalle del error]. Tus datos se guardaron como borrador."
- **Validacion de paso:** Los campos invalidos se marcan en rojo con mensaje debajo. El boton "Siguiente" queda deshabilitado hasta corregir.
