# Biblioteca de Plantillas WhatsApp — Regis SG-SST

> **Plataforma:** Regis SG-SST  
> **Proveedor:** Twilio (sandbox actual, migración a WhatsApp Business API planificada)  
> **Límite por mensaje:** 1024 caracteres  
> **Idioma:** Español (Colombia)

---

## Índice de Plantillas

| # | Nombre | Categoría | Trigger |
|---|--------|-----------|---------|
| 1 | `pila_recordatorio` | UTILITY | Día 16 del mes + recordatorios de seguimiento |
| 2 | `pila_confirmacion` | UTILITY | Carga exitosa de PILA |
| 3 | `pila_aprobada` | UTILITY | Consultor aprueba PILA |
| 4 | `citacion_comite_urgente` | UTILITY | Envío manual por consultor |
| 5 | `equipo_critico_vencido` | UTILITY | Equipo pasó fecha de vencimiento |
| 6 | `examen_medico_vencido` | UTILITY | Examen ocupacional próximo a vencer |
| 7 | `felicitacion_cumplimiento` | MARKETING | Empresa alcanza 100% de cumplimiento mensual |
| 8 | `resumen_semanal_consultor` | UTILITY | Cron semanal (lunes en la mañana) |

---

## 1. pila_recordatorio

**Nombre:** `pila_recordatorio`  
**Categoría Twilio:** UTILITY  
**Trigger:** Se envía el día 16 de cada mes (o día configurado en `pila_dia_solicitud`) y en cada recordatorio de seguimiento posterior hasta alcanzar `pila_max_recordatorios`.

**Variables:**

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{1}}` | Nombre de la empresa | Construandes Ltda |
| `{{2}}` | Periodo (YYYY-MM) | 2026-05 |
| `{{3}}` | Fecha límite de entrega | 25 de mayo de 2026 |
| `{{4}}` | URL de carga pública | https://app.regis.com.co/upload-pila?t=abc123 |

**Cuerpo:**

```
Hola, un saludo cordial de Regis Colombia. 👋

Le recordamos que la planilla PILA del periodo {{2}} para *{{1}}* está pendiente de entrega.

📅 Fecha límite: {{3}}

Puede cargar el archivo de forma rápida y segura usando el siguiente enlace:
{{4}}

Formatos aceptados: PDF o imagen legible.

Si tiene alguna duda, responda a este mensaje y con gusto le ayudamos.

Regis Colombia — Gestión SG-SST
```

**Botones:**

| Tipo | Texto | Acción |
|------|-------|--------|
| URL | Subir PILA | `{{4}}` |

**Caracteres:** ~480

---

## 2. pila_confirmacion

**Nombre:** `pila_confirmacion`  
**Categoría Twilio:** UTILITY  
**Trigger:** Se envía automáticamente después de una carga exitosa de PILA (vía formulario público o carga en plataforma).

**Variables:**

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{1}}` | Nombre de la empresa | DevCo Technologies S.A.S. |
| `{{2}}` | Periodo (YYYY-MM) | 2026-05 |

**Cuerpo:**

```
✅ ¡PILA recibida exitosamente!

Hemos recibido la planilla PILA del periodo {{2}} para *{{1}}*.

Nuestro equipo revisará el documento y le notificaremos una vez sea validado y aprobado.

Tiempo estimado de revisión: 1-2 días hábiles.

Gracias por su cumplimiento.

Regis Colombia — Gestión SG-SST
```

**Botones:** Ninguno

**Caracteres:** ~320

---

## 3. pila_aprobada

**Nombre:** `pila_aprobada`  
**Categoría Twilio:** UTILITY  
**Trigger:** Se envía cuando el consultor cambia el estado de la PILA a "aprobado" en la plataforma.

**Variables:**

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{1}}` | Nombre de la empresa | Sabor Criollo S.A.S. |
| `{{2}}` | Periodo (YYYY-MM) | 2026-05 |

**Cuerpo:**

```
✅ PILA aprobada — Periodo {{2}}

La planilla PILA del periodo {{2}} para *{{1}}* ha sido revisada y aprobada por nuestro equipo.

Este periodo se encuentra al día en materia de seguridad social.

¡Gracias por su gestión oportuna! Si tiene preguntas, no dude en escribirnos.

Regis Colombia — Gestión SG-SST
```

**Botones:** Ninguno

**Caracteres:** ~340

---

## 4. citacion_comite_urgente

**Nombre:** `citacion_comite_urgente`  
**Categoría Twilio:** UTILITY  
**Trigger:** Envío manual por parte del consultor desde el módulo de Comités cuando se requiere convocar una reunión urgente de COPASST, Convivencia o Vigía.

**Variables:**

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{1}}` | Tipo de comité | COPASST |
| `{{2}}` | Nombre de la empresa | Construandes Ltda |
| `{{3}}` | Fecha de la reunión | 22 de mayo de 2026 |
| `{{4}}` | Hora de la reunión | 10:00 a.m. |
| `{{5}}` | Lugar o enlace virtual | Sala de juntas piso 3 |

**Cuerpo:**

```
⚠️ CITACIÓN URGENTE — Comité de {{1}}

Empresa: *{{2}}*

Se convoca a reunión extraordinaria del comité de {{1}} con carácter urgente.

📅 Fecha: {{3}}
🕐 Hora: {{4}}
📍 Lugar: {{5}}

La asistencia es de carácter obligatorio conforme a la normatividad vigente del SG-SST.

En caso de no poder asistir, notifique con anticipación al consultor asignado.

Regis Colombia — Gestión SG-SST
```

**Botones:** Ninguno

**Caracteres:** ~470

---

## 5. equipo_critico_vencido

**Nombre:** `equipo_critico_vencido`  
**Categoría Twilio:** UTILITY  
**Trigger:** Se envía automáticamente cuando un equipo de seguridad registrado en el inventario supera su fecha de vencimiento. Evaluado diariamente por cron.

**Variables:**

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{1}}` | Tipo de equipo | Extintor multipropósito ABC |
| `{{2}}` | Ubicación del equipo | Bodega principal - Estante 3 |
| `{{3}}` | Nombre de la empresa | DevCo Technologies S.A.S. |
| `{{4}}` | Días vencido | 5 |

**Cuerpo:**

```
🚨 ALERTA: Equipo de seguridad vencido

Empresa: *{{3}}*

El siguiente equipo tiene el mantenimiento o certificación vencida:

🔧 Equipo: {{1}}
📍 Ubicación: {{2}}
⏰ Días vencido: {{4}} día(s)

Un equipo vencido pone en riesgo la seguridad de los trabajadores y puede generar sanciones ante una inspección del Ministerio de Trabajo.

Gestione la renovación o reemplazo de forma inmediata.

Regis Colombia — Gestión SG-SST
```

**Botones:** Ninguno

**Caracteres:** ~480

---

## 6. examen_medico_vencido

**Nombre:** `examen_medico_vencido`  
**Categoría Twilio:** UTILITY  
**Trigger:** Se envía cuando un examen médico ocupacional (periódico, de ingreso pendiente, etc.) está próximo a vencer o ya venció, según la programación del módulo de Exámenes Médicos.

**Variables:**

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{1}}` | Nombre del trabajador | Carlos Andrés López |
| `{{2}}` | Tipo de examen | Periódico |
| `{{3}}` | Nombre de la empresa | Sabor Criollo S.A.S. |

**Cuerpo:**

```
📋 Examen ocupacional pendiente

Empresa: *{{3}}*

El trabajador *{{1}}* requiere la realización de su examen médico ocupacional de tipo *{{2}}*.

De acuerdo con la Resolución 0312 de 2019, los exámenes médicos ocupacionales son obligatorios para el cumplimiento del SG-SST.

Por favor, coordine la cita con la IPS ocupacional lo antes posible.

Si ya fue realizado, puede cargar el resultado en la plataforma Regis.

Regis Colombia — Gestión SG-SST
```

**Botones:** Ninguno

**Caracteres:** ~470

---

## 7. felicitacion_cumplimiento

**Nombre:** `felicitacion_cumplimiento`  
**Categoría Twilio:** MARKETING  
**Trigger:** Se envía automáticamente cuando una empresa alcanza el 100% de cumplimiento en todos sus ítems para el mes evaluado.

**Variables:**

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{1}}` | Nombre de la empresa | Construandes Ltda |
| `{{2}}` | Mes de cumplimiento | mayo de 2026 |

**Cuerpo:**

```
🎉 ¡Felicitaciones, {{1}}!

Su empresa ha alcanzado el *100% de cumplimiento* del SG-SST durante el mes de {{2}}.

Este logro refleja el compromiso de su organización con la seguridad y salud de sus trabajadores.

¡Sigan así! 💪

Regis Colombia — Gestión SG-SST
```

**Botones:** Ninguno

**Caracteres:** ~310

---

## 8. resumen_semanal_consultor

**Nombre:** `resumen_semanal_consultor`  
**Categoría Twilio:** UTILITY  
**Trigger:** Cron semanal ejecutado los lunes a las 7:00 a.m. Envía un resumen del portafolio de empresas asignadas al consultor.

**Variables:**

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{1}}` | Nombre del consultor | María González |
| `{{2}}` | Número de tareas pendientes | 12 |
| `{{3}}` | Número de ítems vencidos | 3 |
| `{{4}}` | URL del dashboard | https://app.regis.com.co/dashboard |

**Cuerpo:**

```
Buenos días, {{1}}. 👋

Resumen semanal de su portafolio SG-SST:

📌 Tareas pendientes: {{2}}
🔴 Ítems vencidos: {{3}}

Ingrese al panel para ver el detalle completo y priorizar sus actividades de la semana.

{{4}}

Regis Colombia — Gestión SG-SST
```

**Botones:**

| Tipo | Texto | Acción |
|------|-------|--------|
| URL | Ver Dashboard | `{{4}}` |

**Caracteres:** ~330

---

## Guía de Migración a WhatsApp Business API

### Estado Actual: Twilio Sandbox

La plataforma actualmente opera con el sandbox de WhatsApp de Twilio, lo cual implica:

- **Número compartido:** Todos los mensajes salen desde un número de sandbox de Twilio, no desde un número propio de Regis.
- **Opt-in cada 72 horas:** Los destinatarios deben enviar el mensaje de activación (`join <palabra-clave>`) al número sandbox cada 72 horas para seguir recibiendo mensajes.
- **Sin plantillas aprobadas:** En sandbox se pueden enviar mensajes de formato libre, pero no se usan plantillas aprobadas por Meta.
- **Límite de destinatarios:** Solo usuarios que hayan hecho opt-in al sandbox.

### Pasos para Migración a Producción

1. **Solicitar número de WhatsApp Business**
   - Registrar un número telefónico colombiano dedicado para Regis Colombia.
   - El número no debe estar vinculado a ninguna cuenta personal de WhatsApp.
   - Se recomienda un número fijo o móvil exclusivo para este fin.

2. **Crear perfil de WhatsApp Business**
   - Nombre del negocio: "Regis Colombia"
   - Categoría: Consultoría / Servicios profesionales
   - Descripción, logo, dirección y horario de atención.

3. **Enviar plantillas para aprobación de Meta**
   - Acceder a la consola de Twilio > Messaging > WhatsApp > Senders > Templates.
   - Crear cada plantilla con el nombre, categoría, idioma (es) y cuerpo del mensaje.
   - Las variables se definen como `{{1}}`, `{{2}}`, etc. en orden secuencial.
   - Agregar ejemplos de contenido para cada variable (Meta los requiere para revisión).
   - Enviar para revisión.

4. **Tiempo de aprobación**
   - Meta revisa las plantillas en un plazo de 24 a 48 horas.
   - Las plantillas rechazadas pueden editarse y reenviarse.
   - Motivos comunes de rechazo: contenido promocional en categoría UTILITY, falta de ejemplos, texto ambiguo.

### Requisitos de las Plantillas (Meta)

- **Categoría UTILITY:** Solo mensajes transaccionales (confirmaciones, alertas, recordatorios). No incluir contenido promocional, ofertas ni llamados a la acción de marketing.
- **Categoría MARKETING:** Permite contenido promocional y felicitaciones. Requiere opción de opt-out.
- **Variables numeradas:** Deben ser secuenciales (`{{1}}`, `{{2}}`, `{{3}}`). No se permiten variables con nombre.
- **Sin URLs acortadas:** Meta puede rechazar plantillas con enlaces acortados (bit.ly, etc.). Usar URLs completas o variables de URL.
- **Sin contenido amenazante:** Evitar lenguaje que pueda interpretarse como coercitivo, incluso en alertas de seguridad.
- **Idioma:** Debe coincidir con el idioma declarado en la plantilla.

### Costos Estimados

| Categoría | Costo por mensaje (Colombia) |
|-----------|------------------------------|
| UTILITY | ~$0.005 - $0.02 USD |
| MARKETING | ~$0.04 - $0.08 USD |
| AUTHENTICATION | ~$0.03 - $0.05 USD |

- Los costos varían según el país del destinatario y el volumen.
- Twilio cobra adicionalmente una tarifa por mensaje (~$0.005 USD).
- Las conversaciones iniciadas por el usuario (respuestas) dentro de la ventana de 24 horas no tienen costo adicional de Meta.

### Requisitos de Opt-in

Antes de enviar mensajes a cualquier usuario, se debe obtener consentimiento explícito:

- **Formulario de opt-in:** Incluir un checkbox de autorización en el formulario de registro de empresa cliente.
- **Texto sugerido:** "Autorizo a Regis Colombia a enviarme notificaciones relacionadas con la gestión del SG-SST a través de WhatsApp al número proporcionado."
- **Registro del consentimiento:** Almacenar fecha, hora y medio de opt-in en la base de datos (`empresas_cliente.whatsapp_optin`, `whatsapp_optin_fecha`).
- **Opt-out:** Cada mensaje de categoría MARKETING debe incluir la opción de dejar de recibir mensajes. Se recomienda responder automáticamente al texto "PARAR" o "STOP".

### Cambios Técnicos Requeridos

1. **Edge Function `send-whatsapp-reminder`:** Actualizar para usar el Content SID de la plantilla aprobada en lugar de un mensaje de texto libre.
2. **Base de datos:** Agregar campos `whatsapp_optin` (boolean) y `whatsapp_optin_fecha` (timestamp) a `empresas_cliente`.
3. **Twilio Content API:** Migrar de `body` a `contentSid` + `contentVariables` en las llamadas a la API.
4. **Manejo de respuestas:** Configurar webhook de Twilio para recibir respuestas de los usuarios (opt-out, confirmaciones, preguntas).

### Ejemplo de Código — Envío con Plantilla Aprobada

```typescript
// Antes (sandbox — texto libre)
await client.messages.create({
  from: 'whatsapp:+14155238886',
  to: `whatsapp:${telefono}`,
  body: `Recordatorio PILA para ${empresa}...`
});

// Después (producción — plantilla aprobada)
await client.messages.create({
  from: 'whatsapp:+573001234567',  // Número propio de Regis
  to: `whatsapp:${telefono}`,
  contentSid: 'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',  // SID de la plantilla
  contentVariables: JSON.stringify({
    '1': empresa,
    '2': periodo,
    '3': fechaLimite,
    '4': urlUpload
  })
});
```
