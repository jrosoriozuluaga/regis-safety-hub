# Wizard de Onboarding de Consultor — Documento de Diseno

**Estado:** BORRADOR  
**Modulo:** Gestion de Usuarios  
**Fecha:** 2026-05-21  

---

## 1. User Stories

### US-01: Admin Regis (creador)
> Como administrador de Regis, quiero registrar un nuevo consultor paso a paso para asegurarme de capturar toda la informacion necesaria (datos, rol, empresas, notificaciones) sin omitir nada, y que el consultor reciba credenciales automaticamente.

**Criterios de aceptacion:**
- Puedo completar los 5 pasos del wizard sin errores.
- Al finalizar, se crea el registro en `usuarios` y en Supabase Auth.
- El consultor recibe un correo de bienvenida con enlace de clave temporal.
- Las empresas seleccionadas se actualizan en `empresas_cliente.consultor_id`.

### US-02: Nuevo consultor
> Como consultor recien contratado, quiero recibir un correo claro con mis credenciales temporales y las empresas asignadas para poder iniciar sesion y comenzar a trabajar inmediatamente.

**Criterios de aceptacion:**
- El correo incluye: enlace de acceso, clave temporal, lista de empresas asignadas, datos de contacto de soporte.
- Al iniciar sesion por primera vez, se le solicita cambiar la clave.

### US-03: Consultor existente (redistribucion)
> Como administrador, quiero poder reasignar empresas entre consultores para balancear la carga de trabajo cuando un consultor se va o ingresa uno nuevo.

**Criterios de aceptacion:**
- El wizard muestra la carga actual (numero de empresas) por consultor.
- Puedo buscar y filtrar empresas por nombre o NIT.
- Al reasignar, se actualiza `empresas_cliente.consultor_id` y se notifica al consultor afectado.

### US-04: Auditor / Cumplimiento
> Como auditor, quiero ver un registro completo de cuando y por quien fue creado cada consultor, que permisos tiene y que empresas maneja, para efectos de trazabilidad.

**Criterios de aceptacion:**
- La creacion del consultor genera un registro en `logs_actividad` con tipo `usuario_creado`, modulo `usuarios`, y metadata que incluye el rol y las empresas asignadas.
- El historial de cambios es consultable desde el modulo de Logs de Actividad.

---

## 2. Pasos del Wizard

### Paso 1: Datos Personales

**Campos:**
| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| Nombre completo | text | Si | Min 3, max 100 caracteres |
| Email corporativo | email | Si | Formato email valido, unico en `usuarios` |
| Cedula | text | Si | Solo numeros, 6-12 digitos, unico |
| Telefono | text | No | Formato colombiano: 3XX XXX XXXX |
| Foto de perfil | file | No | JPG/PNG, max 2MB |

**Wireframe:**
```
+----------------------------------------------------------+
|  ONBOARDING DE CONSULTOR                    Paso 1 de 5  |
|  [====          ]  20%                                    |
|                                                           |
|  DATOS PERSONALES                                         |
|  -------------------------------------------------------- |
|                                                           |
|  Nombre completo *                                        |
|  [________________________________]                       |
|                                                           |
|  Email corporativo *                                      |
|  [________________________________]                       |
|                                                           |
|  Cedula *                    Telefono                     |
|  [________________]          [________________]           |
|                                                           |
|  Foto de perfil (opcional)                                |
|  +-------------------+                                    |
|  |                   |                                    |
|  |   [+] Subir foto  |                                    |
|  |                   |                                    |
|  +-------------------+                                    |
|                                                           |
|                              [Cancelar]  [Siguiente -->]  |
+----------------------------------------------------------+
```

---

### Paso 2: Credenciales y Rol

**Roles disponibles:**

| Rol | Permisos | Descripcion |
|-----|----------|-------------|
| `consultor` | Ver y editar datos de empresas asignadas. Cargar documentos, generar reportes. Sin acceso a configuracion del sistema ni gestion de usuarios. | Consultor operativo estandar. |
| `consultor_senior` | Todo lo de `consultor` + puede validar/aprobar documentos, generar actas oficiales, y ver metricas de cumplimiento de otros consultores de su equipo. | Lider de equipo o consultor con experiencia. |
| `admin` | Acceso total: gestion de usuarios, configuracion del sistema, todos los modulos, reportes globales, auditoria. | Solo personal directivo de Regis. |

**Campos:**
| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| Rol | select | Si | consultor / consultor_senior / admin |
| Generar clave temporal | toggle | Si (default: on) | Si esta activo, se genera link de reset |
| Clave manual | password | Condicional | Min 8 chars, 1 mayuscula, 1 numero. Solo si toggle = off |

**Wireframe:**
```
+----------------------------------------------------------+
|  ONBOARDING DE CONSULTOR                    Paso 2 de 5  |
|  [========        ]  40%                                  |
|                                                           |
|  CREDENCIALES Y ROL                                       |
|  -------------------------------------------------------- |
|                                                           |
|  Rol del consultor *                                      |
|  ( ) Consultor                                            |
|      Acceso operativo a empresas asignadas                |
|  ( ) Consultor Senior                                     |
|      Operativo + validacion + metricas de equipo          |
|  ( ) Administrador                                        |
|      Acceso total al sistema                              |
|                                                           |
|  Credenciales de acceso                                   |
|  [x] Generar enlace de clave temporal (recomendado)       |
|  [ ] Establecer clave manual                              |
|                                                           |
|  [Si clave manual esta activo:]                           |
|  Clave *                                                  |
|  [________________________________]                       |
|  Confirmar clave *                                        |
|  [________________________________]                       |
|                                                           |
|                     [<-- Atras]  [Cancelar]  [Siguiente]  |
+----------------------------------------------------------+
```

---

### Paso 3: Empresas Asignadas

**Funcionalidad:**
- Multi-select de empresas existentes en `empresas_cliente`.
- Barra de busqueda por `razon_social` o `nit`.
- Para cada empresa se muestra: razon social, NIT, consultor actual (si tiene), num. trabajadores.
- Panel lateral: "Carga por consultor" — lista de consultores con cantidad de empresas cada uno para balanceo.
- Advertencia si se reasigna una empresa que ya tiene consultor.

**Wireframe:**
```
+----------------------------------------------------------+
|  ONBOARDING DE CONSULTOR                    Paso 3 de 5  |
|  [============    ]  60%                                  |
|                                                           |
|  EMPRESAS ASIGNADAS                                       |
|  -------------------------------------------------------- |
|                                                           |
|  Buscar empresa: [___________________] [Buscar]           |
|                                                           |
|  +----------------------------------+  +--------------+  |
|  | [ ] Construandes Ltda            |  | CARGA ACTUAL |  |
|  |     NIT: 900.123.456-7          |  |              |  |
|  |     Consultor: (sin asignar)    |  | Ana G.    5  |  |
|  |     Trabajadores: 12           |  | Carlos M. 8  |  |
|  | [x] DevCo Technologies S.A.S.   |  | Nuevo     0  |  |
|  |     NIT: 900.789.012-3          |  |              |  |
|  |     Consultor: Ana G.           |  +--------------+  |
|  |     [!] Ya tiene consultor       |  |                  |
|  | [x] Sabor Criollo S.A.S.        |  |                  |
|  |     NIT: 900.456.789-0          |  |                  |
|  |     Consultor: (sin asignar)    |  |                  |
|  +----------------------------------+  |                  |
|                                                           |
|  Empresas seleccionadas: 2                                |
|                                                           |
|                     [<-- Atras]  [Cancelar]  [Siguiente]  |
+----------------------------------------------------------+
```

---

### Paso 4: Permisos y Notificaciones

**Tipos de alerta:**

| Alerta | Descripcion |
|--------|-------------|
| PILA vencida | Cuando una empresa no sube la PILA despues de la fecha limite |
| Equipos por vencer | Extintores, botiquines u otros equipos proximos a fecha de vencimiento |
| Nuevos documentos | Cuando un cliente sube un documento nuevo |
| Examenes pendientes | Examenes medicos proximos a vencer |
| Cumplimiento bajo | Empresa cae por debajo de umbral de cumplimiento (ej. < 60%) |

**Frecuencia:**

| Opcion | Descripcion |
|--------|-------------|
| Inmediata | Notificacion en tiempo real por email |
| Resumen diario | Un email consolidado al final del dia (6:00 PM) |
| Resumen semanal | Un email consolidado los lunes a las 8:00 AM |

**Wireframe:**
```
+----------------------------------------------------------+
|  ONBOARDING DE CONSULTOR                    Paso 4 de 5  |
|  [================]  80%                                  |
|                                                           |
|  PERMISOS Y NOTIFICACIONES                                |
|  -------------------------------------------------------- |
|                                                           |
|  Alertas que recibira el consultor:                       |
|                                                           |
|  [x] PILA vencida                                         |
|  [x] Equipos por vencer                                   |
|  [ ] Nuevos documentos                                    |
|  [x] Examenes pendientes                                  |
|  [x] Cumplimiento bajo                                    |
|                                                           |
|  Frecuencia de notificaciones:                            |
|  ( ) Inmediata (cada evento)                              |
|  (x) Resumen diario (6:00 PM)                             |
|  ( ) Resumen semanal (lunes 8:00 AM)                      |
|                                                           |
|  Canal preferido:                                         |
|  [x] Email                                                |
|  [ ] WhatsApp (requiere verificacion)                     |
|                                                           |
|                     [<-- Atras]  [Cancelar]  [Siguiente]  |
+----------------------------------------------------------+
```

---

### Paso 5: Resumen y Envio de Credenciales

**Funcionalidad:**
- Muestra un resumen de toda la informacion ingresada.
- Boton "Guardar borrador" para completar despues.
- Boton "Crear consultor y enviar credenciales" ejecuta:
  1. Crea usuario en Supabase Auth (email + clave temporal o manual).
  2. Inserta registro en tabla `usuarios`.
  3. Actualiza `empresas_cliente.consultor_id` para empresas seleccionadas.
  4. Inserta preferencias de notificacion (tabla nueva o JSON en `usuarios.metadata`).
  5. Envia correo de bienvenida via Edge Function o Resend.
  6. Registra en `logs_actividad`.

**Wireframe:**
```
+----------------------------------------------------------+
|  ONBOARDING DE CONSULTOR                    Paso 5 de 5  |
|  [====================]  100%                             |
|                                                           |
|  RESUMEN                                                  |
|  -------------------------------------------------------- |
|                                                           |
|  Datos Personales                          [Editar]       |
|  Nombre:    Juan Perez Martinez                           |
|  Email:     juan.perez@regis.com.co                       |
|  Cedula:    1234567890                                    |
|  Telefono:  310 456 7890                                  |
|                                                           |
|  Rol y Credenciales                        [Editar]       |
|  Rol:       Consultor                                     |
|  Clave:     Enlace temporal (se enviara por email)        |
|                                                           |
|  Empresas Asignadas (2)                    [Editar]       |
|  - DevCo Technologies S.A.S.                              |
|  - Sabor Criollo S.A.S.                                   |
|                                                           |
|  Notificaciones                            [Editar]       |
|  Alertas:   PILA, Equipos, Examenes, Cumplimiento        |
|  Frecuencia: Resumen diario                               |
|  Canal:     Email                                         |
|                                                           |
|  [Guardar borrador]     [Crear consultor y enviar creds]  |
+----------------------------------------------------------+
```

---

## 3. Reglas de Validacion

### Por paso:

**Paso 1:**
- `nombre`: obligatorio, 3-100 chars, sin caracteres especiales excepto tildes y espacios.
- `email`: obligatorio, formato valido, debe ser unico (verificar contra `usuarios.email`).
- `cedula`: obligatorio, solo digitos, 6-12 chars, unica (verificar contra tabla).
- `telefono`: opcional, si se ingresa debe cumplir formato `3[0-9]{9}`.
- `foto`: opcional, solo JPG/PNG, max 2MB.

**Paso 2:**
- `rol`: obligatorio, uno de los tres valores.
- Si clave manual: min 8 chars, al menos 1 mayuscula, 1 numero, debe coincidir confirmacion.

**Paso 3:**
- Al menos 1 empresa seleccionada (warning, no bloqueo — un consultor podria crearse antes de asignar empresas).
- Si se selecciona empresa con consultor existente, mostrar dialogo de confirmacion de reasignacion.

**Paso 4:**
- Al menos 1 alerta seleccionada (warning).
- Frecuencia obligatoria.
- Al menos 1 canal seleccionado.

**Paso 5:**
- Validacion final de todos los campos antes de envio.
- Email debe seguir siendo unico al momento del submit (race condition check).

### Validacion global:
- El wizard permite navegar hacia atras sin perder datos.
- "Guardar borrador" persiste en `localStorage` (no en DB).
- Al cerrar el navegador con wizard incompleto, mostrar `beforeunload` warning.

---

## 4. Plantilla de Correo de Bienvenida

**Asunto:** Bienvenido al equipo Regis - Tus credenciales de acceso

```
Hola {nombre},

Bienvenido(a) al equipo de consultores de Regis Colombia.

Tu cuenta ha sido creada exitosamente en la plataforma SG-SST de Regis.

DATOS DE ACCESO:
- Plataforma: {url_plataforma}
- Email: {email}
- Clave temporal: {enlace_reset_clave}

IMPORTANTE: Por seguridad, debes cambiar tu clave en el primer inicio de sesion.
El enlace de clave temporal expira en 48 horas.

EMPRESAS ASIGNADAS:
{lista_empresas}

NOTIFICACIONES CONFIGURADAS:
- Alertas activas: {alertas}
- Frecuencia: {frecuencia}

Si tienes preguntas, contacta a tu administrador en soporte@regis.com.co.

Atentamente,
Equipo Regis Colombia
Sistema de Gestion de Seguridad y Salud en el Trabajo
```

---

## 5. Consideraciones Tecnicas

### Tablas afectadas:
- `usuarios` — INSERT nuevo registro
- `empresas_cliente` — UPDATE `consultor_id` en empresas seleccionadas
- `logs_actividad` — INSERT registro de auditoria
- Supabase Auth — Crear usuario con email + clave temporal

### Tabla nueva sugerida (opcional):
```sql
CREATE TABLE preferencias_notificacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  tipo_alerta TEXT NOT NULL,        -- 'pila_vencida', 'equipos_vencer', etc.
  activo BOOLEAN DEFAULT true,
  frecuencia TEXT DEFAULT 'diario', -- 'inmediata', 'diario', 'semanal'
  canal TEXT DEFAULT 'email',       -- 'email', 'whatsapp'
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Edge Function nueva sugerida:
- `send-welcome-email` — Recibe datos del consultor, renderiza template, envia via Resend.

### Seguridad:
- Solo rol `admin` puede acceder al wizard.
- La clave temporal se genera via `supabase.auth.admin.createUser()` con `email_confirm: true`.
- Enlace de reset via `supabase.auth.admin.generateLink({ type: 'recovery', email })`.
