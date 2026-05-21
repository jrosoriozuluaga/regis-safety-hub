# Biblioteca de Plantillas de Correo — Regis SG-SST

> **Plataforma:** Regis Safety Hub  
> **Proveedor de envío:** Resend (via Supabase Edge Functions)  
> **Colores de marca:** Primario `#1B4F72` | Acento `#2E86C1` | Fondo `#F4F6F9`  
> **Última actualización:** 2026-05-21

---

## Variables Globales Disponibles

| Variable | Descripción |
|----------|-------------|
| `{{empresa}}` | Nombre de la empresa cliente |
| `{{contacto}}` | Nombre del contacto principal |
| `{{periodo}}` | Periodo en formato YYYY-MM |
| `{{fecha_limite}}` | Fecha límite de la acción |
| `{{url_plataforma}}` | URL de login de la plataforma |
| `{{url_upload}}` | URL pública de carga (con token) |
| `{{anio}}` | Año en curso |
| `{{mes}}` | Mes en texto (ej. "Mayo") |

---

## A) Onboarding

---

### 1. `welcome_empresa`

- **Asunto:** `Bienvenido a Regis Safety Hub — {{empresa}}`
- **Trigger:** Cuando el admin de Regis registra una nueva empresa cliente en la plataforma.
- **Variables requeridas:** `{{empresa}}`, `{{contacto}}`, `{{email_usuario}}`, `{{password_temporal}}`, `{{url_plataforma}}`, `{{consultor_nombre}}`, `{{consultor_email}}`

**Cuerpo:**

```html
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F4F6F9;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F9;">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr><td style="background-color:#1B4F72;padding:32px 40px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Regis Colombia — SG-SST</h1>
    <p style="margin:8px 0 0;color:#A9CCE3;font-size:13px;">Sistema de Gestión de Seguridad y Salud en el Trabajo</p>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:40px;">
    <h2 style="margin:0 0 16px;color:#1B4F72;font-size:20px;">¡Bienvenido, {{contacto}}!</h2>
    <p style="margin:0 0 16px;color:#333333;font-size:15px;line-height:1.6;">
      Nos complace informarle que <strong>{{empresa}}</strong> ha sido registrada exitosamente en
      <strong>Regis Safety Hub</strong>, nuestra plataforma para la gestión integral del SG-SST
      conforme a la Resolución 0312 de 2019.
    </p>
    <p style="margin:0 0 16px;color:#333333;font-size:15px;line-height:1.6;">
      A través de la plataforma podrá:
    </p>
    <ul style="margin:0 0 24px;padding-left:20px;color:#333333;font-size:15px;line-height:1.8;">
      <li>Cargar documentos de cumplimiento (PILA, exámenes médicos, matrices)</li>
      <li>Consultar el estado de cumplimiento de su empresa en tiempo real</li>
      <li>Recibir alertas de vencimientos y fechas límite</li>
      <li>Acceder a actas, reportes y planes de emergencia</li>
    </ul>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;background-color:#F4F6F9;border-radius:6px;">
    <tr><td style="padding:20px;">
      <p style="margin:0 0 8px;color:#1B4F72;font-size:14px;font-weight:700;">Sus credenciales de acceso:</p>
      <p style="margin:0 0 4px;color:#333;font-size:14px;"><strong>Correo:</strong> {{email_usuario}}</p>
      <p style="margin:0;color:#333;font-size:14px;"><strong>Contraseña temporal:</strong> {{password_temporal}}</p>
    </td></tr>
    </table>

    <p style="margin:0 0 24px;color:#666;font-size:13px;line-height:1.5;">
      Le recomendamos cambiar su contraseña en el primer inicio de sesión.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
    <tr><td style="background-color:#2E86C1;border-radius:6px;">
      <a href="{{url_plataforma}}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Ingresar a la Plataforma</a>
    </td></tr>
    </table>

    <p style="margin:0 0 8px;color:#333;font-size:14px;line-height:1.6;">
      Su consultor asignado es <strong>{{consultor_nombre}}</strong> (<a href="mailto:{{consultor_email}}" style="color:#2E86C1;">{{consultor_email}}</a>),
      quien estará disponible para cualquier duda o acompañamiento.
    </p>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background-color:#F4F6F9;padding:24px 40px;border-top:1px solid #E5E8EB;">
    <p style="margin:0 0 4px;color:#888;font-size:12px;text-align:center;">Regis Colombia S.A.S. — Consultoría en SG-SST</p>
    <p style="margin:0;color:#888;font-size:12px;text-align:center;">Este correo fue enviado automáticamente desde Regis Safety Hub.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
```

---

### 2. `welcome_consultor`

- **Asunto:** `Bienvenido al equipo Regis — Acceso a Safety Hub`
- **Trigger:** Cuando se crea un nuevo usuario con rol `consultor` en la plataforma.
- **Variables requeridas:** `{{contacto}}`, `{{email_usuario}}`, `{{password_temporal}}`, `{{url_plataforma}}`, `{{empresas_asignadas}}`

**Cuerpo:**

```html
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F4F6F9;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F9;">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

  <tr><td style="background-color:#1B4F72;padding:32px 40px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Regis Colombia — SG-SST</h1>
    <p style="margin:8px 0 0;color:#A9CCE3;font-size:13px;">Sistema de Gestión de Seguridad y Salud en el Trabajo</p>
  </td></tr>

  <tr><td style="padding:40px;">
    <h2 style="margin:0 0 16px;color:#1B4F72;font-size:20px;">¡Bienvenido al equipo, {{contacto}}!</h2>
    <p style="margin:0 0 16px;color:#333;font-size:15px;line-height:1.6;">
      Ha sido registrado como <strong>consultor</strong> en Regis Safety Hub. Desde la plataforma podrá
      gestionar el SG-SST de las empresas que le han sido asignadas.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;background-color:#F4F6F9;border-radius:6px;">
    <tr><td style="padding:20px;">
      <p style="margin:0 0 8px;color:#1B4F72;font-size:14px;font-weight:700;">Credenciales de acceso:</p>
      <p style="margin:0 0 4px;color:#333;font-size:14px;"><strong>Correo:</strong> {{email_usuario}}</p>
      <p style="margin:0;color:#333;font-size:14px;"><strong>Contraseña temporal:</strong> {{password_temporal}}</p>
    </td></tr>
    </table>

    <p style="margin:0 0 12px;color:#333;font-size:15px;font-weight:600;">Empresas asignadas:</p>
    <p style="margin:0 0 24px;color:#333;font-size:14px;line-height:1.8;">{{empresas_asignadas}}</p>

    <p style="margin:0 0 16px;color:#333;font-size:15px;line-height:1.6;"><strong>Primeros pasos:</strong></p>
    <ol style="margin:0 0 24px;padding-left:20px;color:#333;font-size:14px;line-height:1.8;">
      <li>Ingrese a la plataforma y cambie su contraseña temporal</li>
      <li>Revise el estado de cumplimiento de cada empresa asignada</li>
      <li>Verifique los documentos pendientes de validación</li>
      <li>Configure sus preferencias de notificaciones</li>
    </ol>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
    <tr><td style="background-color:#2E86C1;border-radius:6px;">
      <a href="{{url_plataforma}}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Ingresar a Safety Hub</a>
    </td></tr>
    </table>

    <p style="margin:0;color:#666;font-size:13px;line-height:1.5;">
      Si tiene dudas sobre el uso de la plataforma, contacte al administrador del sistema.
    </p>
  </td></tr>

  <tr><td style="background-color:#F4F6F9;padding:24px 40px;border-top:1px solid #E5E8EB;">
    <p style="margin:0 0 4px;color:#888;font-size:12px;text-align:center;">Regis Colombia S.A.S. — Consultoría en SG-SST</p>
    <p style="margin:0;color:#888;font-size:12px;text-align:center;">Este correo fue enviado automáticamente desde Regis Safety Hub.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
```

---

### 3. `setup_password`

- **Asunto:** `Configure su contraseña — Regis Safety Hub`
- **Trigger:** Cuando se envía invitación de primer acceso o se solicita restablecimiento de contraseña.
- **Variables requeridas:** `{{contacto}}`, `{{url_reset_password}}`, `{{horas_expiracion}}`

**Cuerpo:**

```html
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F4F6F9;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F9;">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

  <tr><td style="background-color:#1B4F72;padding:32px 40px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Regis Colombia — SG-SST</h1>
  </td></tr>

  <tr><td style="padding:40px;">
    <h2 style="margin:0 0 16px;color:#1B4F72;font-size:20px;">Configure su contraseña</h2>
    <p style="margin:0 0 16px;color:#333;font-size:15px;line-height:1.6;">
      Hola <strong>{{contacto}}</strong>, haga clic en el siguiente botón para configurar su contraseña
      de acceso a Regis Safety Hub.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
    <tr><td style="background-color:#2E86C1;border-radius:6px;">
      <a href="{{url_reset_password}}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Configurar Contraseña</a>
    </td></tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;background-color:#FFF8E1;border-radius:6px;border-left:4px solid #F9A825;">
    <tr><td style="padding:16px 20px;">
      <p style="margin:0;color:#795548;font-size:13px;line-height:1.5;">
        <strong>Importante:</strong> Este enlace expira en <strong>{{horas_expiracion}} horas</strong>.
        Si no configuró su contraseña a tiempo, solicite un nuevo enlace a su consultor.
      </p>
    </td></tr>
    </table>

    <p style="margin:0 0 8px;color:#333;font-size:14px;line-height:1.6;">
      <strong>Recomendaciones de seguridad:</strong>
    </p>
    <ul style="margin:0 0 24px;padding-left:20px;color:#555;font-size:13px;line-height:1.8;">
      <li>Use una contraseña de al menos 8 caracteres</li>
      <li>Combine letras mayúsculas, minúsculas y números</li>
      <li>No comparta su contraseña con terceros</li>
    </ul>

    <p style="margin:0;color:#999;font-size:12px;line-height:1.5;">
      Si usted no solicitó este enlace, puede ignorar este correo con tranquilidad.
    </p>
  </td></tr>

  <tr><td style="background-color:#F4F6F9;padding:24px 40px;border-top:1px solid #E5E8EB;">
    <p style="margin:0;color:#888;font-size:12px;text-align:center;">Regis Colombia S.A.S. — Consultoría en SG-SST</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
```

---

## B) Operacionales SG-SST

---

### 4. `pila_recordatorio`

- **Asunto:** `Recordatorio: Planilla PILA {{periodo}} — {{empresa}}`
- **Trigger:** Automatizado por n8n: día 16 del mes (solicitud), luego recordatorios cada N días según `pila_dias_recordatorio`.
- **Variables requeridas:** `{{empresa}}`, `{{contacto}}`, `{{periodo}}`, `{{fecha_limite}}`, `{{url_upload}}`, `{{numero_recordatorio}}`, `{{max_recordatorios}}`

**Cuerpo:**

```html
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F4F6F9;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F9;">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

  <tr><td style="background-color:#1B4F72;padding:32px 40px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Regis Colombia — SG-SST</h1>
    <p style="margin:8px 0 0;color:#A9CCE3;font-size:13px;">Módulo PILA — Planilla Integrada</p>
  </td></tr>

  <tr><td style="padding:40px;">
    <h2 style="margin:0 0 16px;color:#1B4F72;font-size:20px;">Recordatorio de Planilla PILA</h2>
    <p style="margin:0 0 16px;color:#333;font-size:15px;line-height:1.6;">
      Estimado(a) <strong>{{contacto}}</strong>, le recordamos que la planilla PILA correspondiente al periodo
      <strong>{{periodo}}</strong> de <strong>{{empresa}}</strong> aún no ha sido cargada en la plataforma.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;background-color:#F4F6F9;border-radius:6px;">
    <tr><td style="padding:20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:4px 0;color:#555;font-size:14px;width:140px;"><strong>Empresa:</strong></td>
          <td style="padding:4px 0;color:#333;font-size:14px;">{{empresa}}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#555;font-size:14px;"><strong>Periodo:</strong></td>
          <td style="padding:4px 0;color:#333;font-size:14px;">{{periodo}}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#555;font-size:14px;"><strong>Fecha límite:</strong></td>
          <td style="padding:4px 0;color:#E74C3C;font-size:14px;font-weight:700;">{{fecha_limite}}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#555;font-size:14px;"><strong>Recordatorio:</strong></td>
          <td style="padding:4px 0;color:#333;font-size:14px;">{{numero_recordatorio}} de {{max_recordatorios}}</td>
        </tr>
      </table>
    </td></tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
    <tr><td style="background-color:#2E86C1;border-radius:6px;">
      <a href="{{url_upload}}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Cargar Planilla PILA</a>
    </td></tr>
    </table>

    <p style="margin:0 0 16px;color:#333;font-size:14px;line-height:1.6;">
      Puede cargar el archivo PDF de la planilla directamente desde el enlace anterior. No requiere iniciar sesión.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;background-color:#FDEDEC;border-radius:6px;border-left:4px solid #E74C3C;">
    <tr><td style="padding:16px 20px;">
      <p style="margin:0;color:#922B21;font-size:13px;line-height:1.5;">
        <strong>Nota:</strong> La planilla PILA es un requisito obligatorio del SG-SST.
        El incumplimiento puede generar sanciones por parte de la ARL y afectar el puntaje
        de cumplimiento de la Resolución 0312 de 2019.
      </p>
    </td></tr>
    </table>
  </td></tr>

  <tr><td style="background-color:#F4F6F9;padding:24px 40px;border-top:1px solid #E5E8EB;">
    <p style="margin:0 0 4px;color:#888;font-size:12px;text-align:center;">Regis Colombia S.A.S. — Consultoría en SG-SST</p>
    <p style="margin:0;color:#888;font-size:12px;text-align:center;">Este correo fue enviado automáticamente. No responda a este mensaje.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
```

---

### 5. `examen_vencimiento`

- **Asunto:** `Alerta: Examen médico ocupacional próximo a vencer — {{trabajador}}`
- **Trigger:** Cron diario que verifica exámenes con fecha de vencimiento en los próximos 30 días.
- **Variables requeridas:** `{{empresa}}`, `{{contacto}}`, `{{trabajador}}`, `{{tipo_examen}}`, `{{fecha_vencimiento}}`, `{{dias_restantes}}`, `{{url_plataforma}}`

**Cuerpo:**

```html
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F4F6F9;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F9;">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

  <tr><td style="background-color:#1B4F72;padding:32px 40px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Regis Colombia — SG-SST</h1>
    <p style="margin:8px 0 0;color:#A9CCE3;font-size:13px;">Módulo Exámenes Médicos Ocupacionales</p>
  </td></tr>

  <tr><td style="padding:40px;">
    <h2 style="margin:0 0 16px;color:#1B4F72;font-size:20px;">Examen Médico Próximo a Vencer</h2>
    <p style="margin:0 0 16px;color:#333;font-size:15px;line-height:1.6;">
      Estimado(a) <strong>{{contacto}}</strong>, le informamos que el siguiente examen médico ocupacional
      está próximo a vencer y requiere renovación oportuna.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;background-color:#F4F6F9;border-radius:6px;">
    <tr><td style="padding:20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:4px 0;color:#555;font-size:14px;width:160px;"><strong>Trabajador:</strong></td>
          <td style="padding:4px 0;color:#333;font-size:14px;">{{trabajador}}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#555;font-size:14px;"><strong>Tipo de examen:</strong></td>
          <td style="padding:4px 0;color:#333;font-size:14px;">{{tipo_examen}}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#555;font-size:14px;"><strong>Fecha de vencimiento:</strong></td>
          <td style="padding:4px 0;color:#E74C3C;font-size:14px;font-weight:700;">{{fecha_vencimiento}}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#555;font-size:14px;"><strong>Días restantes:</strong></td>
          <td style="padding:4px 0;color:#E67E22;font-size:14px;font-weight:700;">{{dias_restantes}} días</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#555;font-size:14px;"><strong>Empresa:</strong></td>
          <td style="padding:4px 0;color:#333;font-size:14px;">{{empresa}}</td>
        </tr>
      </table>
    </td></tr>
    </table>

    <p style="margin:0 0 16px;color:#333;font-size:14px;line-height:1.6;">
      <strong>Acción requerida:</strong> Programe la cita para el examen médico ocupacional con la IPS
      contratada antes de la fecha de vencimiento. Una vez realizado, cargue el certificado en la plataforma.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
    <tr><td style="background-color:#2E86C1;border-radius:6px;">
      <a href="{{url_plataforma}}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Ver en la Plataforma</a>
    </td></tr>
    </table>
  </td></tr>

  <tr><td style="background-color:#F4F6F9;padding:24px 40px;border-top:1px solid #E5E8EB;">
    <p style="margin:0;color:#888;font-size:12px;text-align:center;">Regis Colombia S.A.S. — Consultoría en SG-SST</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
```

---

### 6. `equipo_vencimiento`

- **Asunto:** `Alerta: {{tipo_equipo}} vencido en {{ubicacion}} — {{empresa}}`
- **Trigger:** Cron diario que verifica equipos con fecha de vencimiento en los próximos 30 días.
- **Variables requeridas:** `{{empresa}}`, `{{contacto}}`, `{{tipo_equipo}}`, `{{ubicacion}}`, `{{fecha_vencimiento}}`, `{{dias_restantes}}`, `{{serial}}`, `{{url_plataforma}}`

**Cuerpo:**

```html
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F4F6F9;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F9;">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

  <tr><td style="background-color:#1B4F72;padding:32px 40px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Regis Colombia — SG-SST</h1>
    <p style="margin:8px 0 0;color:#A9CCE3;font-size:13px;">Módulo Inventario de Equipos</p>
  </td></tr>

  <tr><td style="padding:40px;">
    <h2 style="margin:0 0 16px;color:#E67E22;font-size:20px;">Equipo Próximo a Vencer</h2>
    <p style="margin:0 0 16px;color:#333;font-size:15px;line-height:1.6;">
      Estimado(a) <strong>{{contacto}}</strong>, el siguiente equipo de seguridad de <strong>{{empresa}}</strong>
      requiere renovación o mantenimiento antes de su vencimiento.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;background-color:#F4F6F9;border-radius:6px;">
    <tr><td style="padding:20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:4px 0;color:#555;font-size:14px;width:160px;"><strong>Equipo:</strong></td>
          <td style="padding:4px 0;color:#333;font-size:14px;">{{tipo_equipo}}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#555;font-size:14px;"><strong>Serial / ID:</strong></td>
          <td style="padding:4px 0;color:#333;font-size:14px;">{{serial}}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#555;font-size:14px;"><strong>Ubicación:</strong></td>
          <td style="padding:4px 0;color:#333;font-size:14px;">{{ubicacion}}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#555;font-size:14px;"><strong>Fecha de vencimiento:</strong></td>
          <td style="padding:4px 0;color:#E74C3C;font-size:14px;font-weight:700;">{{fecha_vencimiento}}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#555;font-size:14px;"><strong>Días restantes:</strong></td>
          <td style="padding:4px 0;color:#E67E22;font-size:14px;font-weight:700;">{{dias_restantes}} días</td>
        </tr>
      </table>
    </td></tr>
    </table>

    <p style="margin:0 0 16px;color:#333;font-size:14px;line-height:1.6;">
      <strong>Acción requerida:</strong> Contacte al proveedor para programar la recarga, mantenimiento o
      reemplazo del equipo. Recuerde que los equipos de seguridad vencidos comprometen la protección de sus
      trabajadores y pueden generar observaciones en auditorías.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
    <tr><td style="background-color:#2E86C1;border-radius:6px;">
      <a href="{{url_plataforma}}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Ver Inventario</a>
    </td></tr>
    </table>
  </td></tr>

  <tr><td style="background-color:#F4F6F9;padding:24px 40px;border-top:1px solid #E5E8EB;">
    <p style="margin:0;color:#888;font-size:12px;text-align:center;">Regis Colombia S.A.S. — Consultoría en SG-SST</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
```

---

### 7. `citacion_comite`

- **Asunto:** `Citación: Reunión {{tipo_comite}} — {{empresa}} — {{fecha}}`
- **Trigger:** Cuando el consultor programa una reunión de comité COPASST o Convivencia.
- **Variables requeridas:** `{{empresa}}`, `{{tipo_comite}}`, `{{fecha}}`, `{{hora}}`, `{{lugar}}`, `{{agenda}}`, `{{contacto}}`, `{{convocante}}`

**Cuerpo:**

```html
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F4F6F9;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F9;">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

  <tr><td style="background-color:#1B4F72;padding:32px 40px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Regis Colombia — SG-SST</h1>
    <p style="margin:8px 0 0;color:#A9CCE3;font-size:13px;">Módulo Comités</p>
  </td></tr>

  <tr><td style="padding:40px;">
    <h2 style="margin:0 0 16px;color:#1B4F72;font-size:20px;">Citación a Reunión de {{tipo_comite}}</h2>
    <p style="margin:0 0 16px;color:#333;font-size:15px;line-height:1.6;">
      Estimado(a) <strong>{{contacto}}</strong>, por medio de la presente se le cita a la reunión ordinaria
      del <strong>{{tipo_comite}}</strong> de <strong>{{empresa}}</strong>, conforme a lo establecido en la
      Resolución 0312 de 2019.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;background-color:#EBF5FB;border-radius:6px;border-left:4px solid #2E86C1;">
    <tr><td style="padding:20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;color:#1B4F72;font-size:14px;width:100px;font-weight:700;">Fecha:</td>
          <td style="padding:6px 0;color:#333;font-size:14px;">{{fecha}}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#1B4F72;font-size:14px;font-weight:700;">Hora:</td>
          <td style="padding:6px 0;color:#333;font-size:14px;">{{hora}}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#1B4F72;font-size:14px;font-weight:700;">Lugar:</td>
          <td style="padding:6px 0;color:#333;font-size:14px;">{{lugar}}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#1B4F72;font-size:14px;font-weight:700;">Convoca:</td>
          <td style="padding:6px 0;color:#333;font-size:14px;">{{convocante}}</td>
        </tr>
      </table>
    </td></tr>
    </table>

    <p style="margin:0 0 8px;color:#1B4F72;font-size:15px;font-weight:700;">Orden del día:</p>
    <div style="margin:0 0 24px;padding:16px 20px;background-color:#F4F6F9;border-radius:6px;color:#333;font-size:14px;line-height:1.8;">
      {{agenda}}
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;background-color:#FFF8E1;border-radius:6px;border-left:4px solid #F9A825;">
    <tr><td style="padding:16px 20px;">
      <p style="margin:0;color:#795548;font-size:13px;line-height:1.5;">
        <strong>Importante:</strong> La asistencia a las reuniones de comité es de carácter obligatorio.
        En caso de no poder asistir, informe con antelación para designar un suplente.
      </p>
    </td></tr>
    </table>
  </td></tr>

  <tr><td style="background-color:#F4F6F9;padding:24px 40px;border-top:1px solid #E5E8EB;">
    <p style="margin:0;color:#888;font-size:12px;text-align:center;">Regis Colombia S.A.S. — Consultoría en SG-SST</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
```

---

### 8. `acta_para_firmar`

- **Asunto:** `Acta {{numero_acta}} lista para firma — {{tipo_comite}} {{empresa}}`
- **Trigger:** Cuando el consultor genera un acta y la marca como lista para firmas.
- **Variables requeridas:** `{{empresa}}`, `{{contacto}}`, `{{tipo_comite}}`, `{{numero_acta}}`, `{{fecha_reunion}}`, `{{resumen_acta}}`, `{{fecha_limite}}`, `{{url_plataforma}}`

**Cuerpo:**

```html
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F4F6F9;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F9;">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

  <tr><td style="background-color:#1B4F72;padding:32px 40px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Regis Colombia — SG-SST</h1>
    <p style="margin:8px 0 0;color:#A9CCE3;font-size:13px;">Módulo Comités — Actas</p>
  </td></tr>

  <tr><td style="padding:40px;">
    <h2 style="margin:0 0 16px;color:#1B4F72;font-size:20px;">Acta Lista para Firma</h2>
    <p style="margin:0 0 16px;color:#333;font-size:15px;line-height:1.6;">
      Estimado(a) <strong>{{contacto}}</strong>, el acta <strong>{{numero_acta}}</strong> de la reunión del
      <strong>{{tipo_comite}}</strong> de <strong>{{empresa}}</strong> ({{fecha_reunion}}) ha sido generada
      y está lista para su revisión y firma.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;background-color:#F4F6F9;border-radius:6px;">
    <tr><td style="padding:20px;">
      <p style="margin:0 0 8px;color:#1B4F72;font-size:14px;font-weight:700;">Resumen del acta:</p>
      <p style="margin:0;color:#333;font-size:14px;line-height:1.6;">{{resumen_acta}}</p>
    </td></tr>
    </table>

    <p style="margin:0 0 16px;color:#333;font-size:14px;line-height:1.6;">
      Por favor, revise el contenido del acta en la plataforma y confirme su firma antes del
      <strong style="color:#E74C3C;">{{fecha_limite}}</strong>.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
    <tr><td style="background-color:#2E86C1;border-radius:6px;">
      <a href="{{url_plataforma}}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Revisar y Firmar Acta</a>
    </td></tr>
    </table>

    <p style="margin:0;color:#666;font-size:13px;line-height:1.5;">
      Si encuentra alguna observación, comuníquese con su consultor antes de firmar.
    </p>
  </td></tr>

  <tr><td style="background-color:#F4F6F9;padding:24px 40px;border-top:1px solid #E5E8EB;">
    <p style="margin:0;color:#888;font-size:12px;text-align:center;">Regis Colombia S.A.S. — Consultoría en SG-SST</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
```

---

### 9. `reporte_mensual_cumplimiento`

- **Asunto:** `Reporte de cumplimiento SG-SST {{mes}} {{anio}} — {{empresa}}`
- **Trigger:** Generado automáticamente el primer día hábil de cada mes por la Edge Function `generate-bitacora`.
- **Variables requeridas:** `{{empresa}}`, `{{contacto}}`, `{{mes}}`, `{{anio}}`, `{{porcentaje_cumplimiento}}`, `{{items_completados}}`, `{{items_pendientes}}`, `{{items_vencidos}}`, `{{proximas_acciones}}`, `{{url_plataforma}}`

**Cuerpo:**

```html
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F4F6F9;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F9;">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

  <tr><td style="background-color:#1B4F72;padding:32px 40px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Regis Colombia — SG-SST</h1>
    <p style="margin:8px 0 0;color:#A9CCE3;font-size:13px;">Reporte Mensual de Cumplimiento</p>
  </td></tr>

  <tr><td style="padding:40px;">
    <h2 style="margin:0 0 16px;color:#1B4F72;font-size:20px;">Reporte {{mes}} {{anio}}</h2>
    <p style="margin:0 0 24px;color:#333;font-size:15px;line-height:1.6;">
      Estimado(a) <strong>{{contacto}}</strong>, a continuación encuentra el resumen del estado de cumplimiento
      del SG-SST de <strong>{{empresa}}</strong> correspondiente al mes de <strong>{{mes}} {{anio}}</strong>.
    </p>

    <!-- Score -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
    <tr><td style="text-align:center;padding:24px 40px;background-color:#EBF5FB;border-radius:8px;">
      <p style="margin:0 0 4px;color:#555;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Cumplimiento General</p>
      <p style="margin:0;color:#1B4F72;font-size:48px;font-weight:700;">{{porcentaje_cumplimiento}}%</p>
    </td></tr>
    </table>

    <!-- Stats -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
    <tr>
      <td width="33%" style="text-align:center;padding:16px 8px;">
        <p style="margin:0;color:#27AE60;font-size:28px;font-weight:700;">{{items_completados}}</p>
        <p style="margin:4px 0 0;color:#555;font-size:12px;">Completados</p>
      </td>
      <td width="33%" style="text-align:center;padding:16px 8px;">
        <p style="margin:0;color:#E67E22;font-size:28px;font-weight:700;">{{items_pendientes}}</p>
        <p style="margin:4px 0 0;color:#555;font-size:12px;">Pendientes</p>
      </td>
      <td width="33%" style="text-align:center;padding:16px 8px;">
        <p style="margin:0;color:#E74C3C;font-size:28px;font-weight:700;">{{items_vencidos}}</p>
        <p style="margin:4px 0 0;color:#555;font-size:12px;">Vencidos</p>
      </td>
    </tr>
    </table>

    <p style="margin:0 0 8px;color:#1B4F72;font-size:15px;font-weight:700;">Próximas acciones:</p>
    <div style="margin:0 0 24px;padding:16px 20px;background-color:#F4F6F9;border-radius:6px;color:#333;font-size:14px;line-height:1.8;">
      {{proximas_acciones}}
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
    <tr><td style="background-color:#2E86C1;border-radius:6px;">
      <a href="{{url_plataforma}}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Ver Detalle Completo</a>
    </td></tr>
    </table>
  </td></tr>

  <tr><td style="background-color:#F4F6F9;padding:24px 40px;border-top:1px solid #E5E8EB;">
    <p style="margin:0 0 4px;color:#888;font-size:12px;text-align:center;">Regis Colombia S.A.S. — Consultoría en SG-SST</p>
    <p style="margin:0;color:#888;font-size:12px;text-align:center;">Reporte generado automáticamente por Regis Safety Hub.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
```

---

## C) Alertas

---

### 10. `cumplimiento_bajo`

- **Asunto:** `⚠️ Alerta: Cumplimiento SG-SST por debajo del {{umbral}}% — {{empresa}}`
- **Trigger:** Cuando el puntaje de cumplimiento de una empresa cae por debajo del umbral configurado (por defecto 60%).
- **Variables requeridas:** `{{empresa}}`, `{{contacto}}`, `{{porcentaje_actual}}`, `{{umbral}}`, `{{items_criticos}}`, `{{consultor_nombre}}`, `{{url_plataforma}}`

**Cuerpo:**

```html
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F4F6F9;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F9;">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

  <tr><td style="background-color:#922B21;padding:32px 40px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">⚠️ Alerta de Cumplimiento</h1>
    <p style="margin:8px 0 0;color:#F5B7B1;font-size:13px;">Regis Colombia — SG-SST</p>
  </td></tr>

  <tr><td style="padding:40px;">
    <h2 style="margin:0 0 16px;color:#922B21;font-size:20px;">Cumplimiento por debajo del umbral</h2>
    <p style="margin:0 0 16px;color:#333;font-size:15px;line-height:1.6;">
      Estimado(a) <strong>{{contacto}}</strong>, el nivel de cumplimiento del SG-SST de
      <strong>{{empresa}}</strong> se encuentra actualmente en <strong style="color:#E74C3C;">{{porcentaje_actual}}%</strong>,
      por debajo del umbral mínimo establecido del <strong>{{umbral}}%</strong>.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;background-color:#FDEDEC;border-radius:6px;border-left:4px solid #E74C3C;">
    <tr><td style="padding:20px;">
      <p style="margin:0 0 8px;color:#922B21;font-size:14px;font-weight:700;">Ítems críticos que requieren atención inmediata:</p>
      <div style="margin:0;color:#333;font-size:14px;line-height:1.8;">{{items_criticos}}</div>
    </td></tr>
    </table>

    <p style="margin:0 0 16px;color:#333;font-size:14px;line-height:1.6;">
      <strong>Consecuencias del incumplimiento:</strong> La Resolución 0312 de 2019 establece que las empresas
      con bajo cumplimiento pueden ser objeto de investigación administrativa por parte del Ministerio de
      Trabajo, con posibles sanciones económicas según el artículo 13 de la Ley 1562 de 2012.
    </p>

    <p style="margin:0 0 24px;color:#333;font-size:14px;line-height:1.6;">
      Su consultor asignado, <strong>{{consultor_nombre}}</strong>, le contactará para definir un plan de
      acción prioritario.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
    <tr><td style="background-color:#E74C3C;border-radius:6px;">
      <a href="{{url_plataforma}}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Ver Estado de Cumplimiento</a>
    </td></tr>
    </table>
  </td></tr>

  <tr><td style="background-color:#F4F6F9;padding:24px 40px;border-top:1px solid #E5E8EB;">
    <p style="margin:0;color:#888;font-size:12px;text-align:center;">Regis Colombia S.A.S. — Consultoría en SG-SST</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
```

---

### 11. `documento_rechazado`

- **Asunto:** `Documento rechazado: {{tipo_documento}} — {{empresa}}`
- **Trigger:** Cuando un consultor o admin rechaza un documento cargado durante el flujo de validación.
- **Variables requeridas:** `{{empresa}}`, `{{contacto}}`, `{{tipo_documento}}`, `{{nombre_archivo}}`, `{{motivo_rechazo}}`, `{{fecha_limite}}`, `{{url_upload}}`, `{{validador_nombre}}`

**Cuerpo:**

```html
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F4F6F9;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F9;">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

  <tr><td style="background-color:#1B4F72;padding:32px 40px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Regis Colombia — SG-SST</h1>
    <p style="margin:8px 0 0;color:#A9CCE3;font-size:13px;">Validación de Documentos</p>
  </td></tr>

  <tr><td style="padding:40px;">
    <h2 style="margin:0 0 16px;color:#E74C3C;font-size:20px;">Documento Rechazado</h2>
    <p style="margin:0 0 16px;color:#333;font-size:15px;line-height:1.6;">
      Estimado(a) <strong>{{contacto}}</strong>, le informamos que el documento cargado para
      <strong>{{empresa}}</strong> ha sido revisado y no cumple con los requisitos. A continuación los detalles:
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;background-color:#F4F6F9;border-radius:6px;">
    <tr><td style="padding:20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:4px 0;color:#555;font-size:14px;width:140px;"><strong>Documento:</strong></td>
          <td style="padding:4px 0;color:#333;font-size:14px;">{{tipo_documento}}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#555;font-size:14px;"><strong>Archivo:</strong></td>
          <td style="padding:4px 0;color:#333;font-size:14px;">{{nombre_archivo}}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#555;font-size:14px;"><strong>Revisado por:</strong></td>
          <td style="padding:4px 0;color:#333;font-size:14px;">{{validador_nombre}}</td>
        </tr>
      </table>
    </td></tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;background-color:#FDEDEC;border-radius:6px;border-left:4px solid #E74C3C;">
    <tr><td style="padding:20px;">
      <p style="margin:0 0 8px;color:#922B21;font-size:14px;font-weight:700;">Motivo del rechazo:</p>
      <p style="margin:0;color:#333;font-size:14px;line-height:1.6;">{{motivo_rechazo}}</p>
    </td></tr>
    </table>

    <p style="margin:0 0 16px;color:#333;font-size:14px;line-height:1.6;">
      Por favor, corrija el documento y cárguelo nuevamente antes del
      <strong style="color:#E74C3C;">{{fecha_limite}}</strong>.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
    <tr><td style="background-color:#2E86C1;border-radius:6px;">
      <a href="{{url_upload}}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Cargar Documento Corregido</a>
    </td></tr>
    </table>
  </td></tr>

  <tr><td style="background-color:#F4F6F9;padding:24px 40px;border-top:1px solid #E5E8EB;">
    <p style="margin:0;color:#888;font-size:12px;text-align:center;">Regis Colombia S.A.S. — Consultoría en SG-SST</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
```

---

### 12. `equipo_critico_vencido`

- **Asunto:** `🔴 URGENTE: {{tipo_equipo}} vencido — {{empresa}}`
- **Trigger:** Cuando un equipo de seguridad crítico (extintor, botiquín) lleva más de 0 días vencido.
- **Variables requeridas:** `{{empresa}}`, `{{contacto}}`, `{{tipo_equipo}}`, `{{ubicacion}}`, `{{fecha_vencimiento}}`, `{{dias_vencido}}`, `{{serial}}`, `{{url_plataforma}}`

**Cuerpo:**

```html
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F4F6F9;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F9;">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

  <tr><td style="background-color:#7B241C;padding:32px 40px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">🔴 ALERTA URGENTE</h1>
    <p style="margin:8px 0 0;color:#F5B7B1;font-size:13px;">Regis Colombia — SG-SST</p>
  </td></tr>

  <tr><td style="padding:40px;">
    <h2 style="margin:0 0 16px;color:#7B241C;font-size:20px;">Equipo de Seguridad Vencido</h2>
    <p style="margin:0 0 16px;color:#333;font-size:15px;line-height:1.6;">
      Estimado(a) <strong>{{contacto}}</strong>, el siguiente equipo de seguridad de <strong>{{empresa}}</strong>
      se encuentra <strong style="color:#E74C3C;">VENCIDO</strong> y requiere atención inmediata.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;background-color:#FDEDEC;border-radius:6px;">
    <tr><td style="padding:20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:4px 0;color:#555;font-size:14px;width:160px;"><strong>Equipo:</strong></td>
          <td style="padding:4px 0;color:#333;font-size:14px;font-weight:700;">{{tipo_equipo}}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#555;font-size:14px;"><strong>Serial / ID:</strong></td>
          <td style="padding:4px 0;color:#333;font-size:14px;">{{serial}}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#555;font-size:14px;"><strong>Ubicación:</strong></td>
          <td style="padding:4px 0;color:#333;font-size:14px;">{{ubicacion}}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#555;font-size:14px;"><strong>Venció el:</strong></td>
          <td style="padding:4px 0;color:#E74C3C;font-size:14px;font-weight:700;">{{fecha_vencimiento}}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#555;font-size:14px;"><strong>Días vencido:</strong></td>
          <td style="padding:4px 0;color:#E74C3C;font-size:14px;font-weight:700;">{{dias_vencido}} días</td>
        </tr>
      </table>
    </td></tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;background-color:#FDEDEC;border-radius:6px;border-left:4px solid #7B241C;">
    <tr><td style="padding:16px 20px;">
      <p style="margin:0 0 8px;color:#7B241C;font-size:14px;font-weight:700;">Implicaciones legales:</p>
      <p style="margin:0;color:#333;font-size:13px;line-height:1.6;">
        Operar con equipos de seguridad vencidos constituye una falta grave según el Decreto 1072 de 2015.
        En caso de accidente laboral, la empresa podría enfrentar sanciones del Ministerio de Trabajo y
        responsabilidad civil ante la ARL. Se recomienda actuar de inmediato.
      </p>
    </td></tr>
    </table>

    <p style="margin:0 0 24px;color:#333;font-size:14px;line-height:1.6;">
      <strong>Acción inmediata:</strong> Contacte a su proveedor de equipos de seguridad para la recarga o
      reemplazo. Mientras tanto, señalice la zona y tome medidas preventivas alternativas.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
    <tr><td style="background-color:#E74C3C;border-radius:6px;">
      <a href="{{url_plataforma}}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Ver en la Plataforma</a>
    </td></tr>
    </table>
  </td></tr>

  <tr><td style="background-color:#F4F6F9;padding:24px 40px;border-top:1px solid #E5E8EB;">
    <p style="margin:0;color:#888;font-size:12px;text-align:center;">Regis Colombia S.A.S. — Consultoría en SG-SST</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
```

---

## D) Lifecycle

---

### 13. `inactividad_30_dias`

- **Asunto:** `Lo extrañamos — Su cuenta Regis Safety Hub`
- **Trigger:** Cron semanal que detecta usuarios que no han iniciado sesión en los últimos 30 días.
- **Variables requeridas:** `{{contacto}}`, `{{empresa}}`, `{{dias_inactivo}}`, `{{items_pendientes}}`, `{{url_plataforma}}`

**Cuerpo:**

```html
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F4F6F9;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F9;">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

  <tr><td style="background-color:#1B4F72;padding:32px 40px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Regis Colombia — SG-SST</h1>
  </td></tr>

  <tr><td style="padding:40px;">
    <h2 style="margin:0 0 16px;color:#1B4F72;font-size:20px;">¡Le echamos de menos, {{contacto}}!</h2>
    <p style="margin:0 0 16px;color:#333;font-size:15px;line-height:1.6;">
      Hemos notado que hace <strong>{{dias_inactivo}} días</strong> no ingresa a Regis Safety Hub.
      Queremos recordarle que el cumplimiento del SG-SST de <strong>{{empresa}}</strong> requiere
      seguimiento continuo.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;background-color:#FFF8E1;border-radius:6px;border-left:4px solid #F9A825;">
    <tr><td style="padding:20px;">
      <p style="margin:0 0 8px;color:#795548;font-size:14px;font-weight:700;">Mientras tanto, se han acumulado:</p>
      <div style="margin:0;color:#333;font-size:14px;line-height:1.8;">{{items_pendientes}}</div>
    </td></tr>
    </table>

    <p style="margin:0 0 24px;color:#333;font-size:14px;line-height:1.6;">
      Lo invitamos a ingresar a la plataforma para revisar el estado de su empresa y atender
      los pendientes. Su consultor está disponible para apoyarle.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
    <tr><td style="background-color:#2E86C1;border-radius:6px;">
      <a href="{{url_plataforma}}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Ingresar a la Plataforma</a>
    </td></tr>
    </table>
  </td></tr>

  <tr><td style="background-color:#F4F6F9;padding:24px 40px;border-top:1px solid #E5E8EB;">
    <p style="margin:0;color:#888;font-size:12px;text-align:center;">Regis Colombia S.A.S. — Consultoría en SG-SST</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
```

---

### 14. `resumen_trimestral`

- **Asunto:** `Resumen trimestral SG-SST {{trimestre}} {{anio}} — {{empresa}}`
- **Trigger:** Generado al final de cada trimestre (marzo, junio, septiembre, diciembre).
- **Variables requeridas:** `{{empresa}}`, `{{contacto}}`, `{{trimestre}}`, `{{anio}}`, `{{porcentaje_actual}}`, `{{porcentaje_anterior}}`, `{{tendencia}}`, `{{logros}}`, `{{pendientes}}`, `{{url_plataforma}}`

**Cuerpo:**

```html
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F4F6F9;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F9;">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

  <tr><td style="background-color:#1B4F72;padding:32px 40px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Regis Colombia — SG-SST</h1>
    <p style="margin:8px 0 0;color:#A9CCE3;font-size:13px;">Resumen Trimestral</p>
  </td></tr>

  <tr><td style="padding:40px;">
    <h2 style="margin:0 0 16px;color:#1B4F72;font-size:20px;">Resumen {{trimestre}} {{anio}}</h2>
    <p style="margin:0 0 24px;color:#333;font-size:15px;line-height:1.6;">
      Estimado(a) <strong>{{contacto}}</strong>, le presentamos el resumen trimestral del SG-SST de
      <strong>{{empresa}}</strong>.
    </p>

    <!-- Comparison -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
    <tr>
      <td width="48%" style="text-align:center;padding:20px;background-color:#F4F6F9;border-radius:8px;">
        <p style="margin:0 0 4px;color:#888;font-size:12px;text-transform:uppercase;">Trimestre Anterior</p>
        <p style="margin:0;color:#555;font-size:36px;font-weight:700;">{{porcentaje_anterior}}%</p>
      </td>
      <td width="4%"></td>
      <td width="48%" style="text-align:center;padding:20px;background-color:#EBF5FB;border-radius:8px;">
        <p style="margin:0 0 4px;color:#888;font-size:12px;text-transform:uppercase;">Trimestre Actual</p>
        <p style="margin:0;color:#1B4F72;font-size:36px;font-weight:700;">{{porcentaje_actual}}%</p>
      </td>
    </tr>
    </table>

    <p style="margin:0 0 24px;color:#333;font-size:15px;line-height:1.6;text-align:center;">
      Tendencia: <strong>{{tendencia}}</strong>
    </p>

    <!-- Logros -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;width:100%;background-color:#EAFAF1;border-radius:6px;border-left:4px solid #27AE60;">
    <tr><td style="padding:20px;">
      <p style="margin:0 0 8px;color:#1E8449;font-size:14px;font-weight:700;">Logros del trimestre:</p>
      <div style="margin:0;color:#333;font-size:14px;line-height:1.8;">{{logros}}</div>
    </td></tr>
    </table>

    <!-- Pendientes -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;background-color:#FFF8E1;border-radius:6px;border-left:4px solid #F9A825;">
    <tr><td style="padding:20px;">
      <p style="margin:0 0 8px;color:#795548;font-size:14px;font-weight:700;">Pendientes para el próximo trimestre:</p>
      <div style="margin:0;color:#333;font-size:14px;line-height:1.8;">{{pendientes}}</div>
    </td></tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
    <tr><td style="background-color:#2E86C1;border-radius:6px;">
      <a href="{{url_plataforma}}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Ver Dashboard Completo</a>
    </td></tr>
    </table>
  </td></tr>

  <tr><td style="background-color:#F4F6F9;padding:24px 40px;border-top:1px solid #E5E8EB;">
    <p style="margin:0;color:#888;font-size:12px;text-align:center;">Regis Colombia S.A.S. — Consultoría en SG-SST</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
```

---

### 15. `felicitacion_100`

- **Asunto:** `🎉 ¡Felicitaciones! 100% cumplimiento SG-SST — {{empresa}}`
- **Trigger:** Cuando una empresa alcanza el 100% de cumplimiento en la Resolución 0312.
- **Variables requeridas:** `{{empresa}}`, `{{contacto}}`, `{{fecha_logro}}`, `{{consultor_nombre}}`, `{{url_plataforma}}`

**Cuerpo:**

```html
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F4F6F9;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F9;">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

  <tr><td style="background-color:#1B4F72;padding:40px;text-align:center;">
    <p style="margin:0 0 8px;font-size:48px;">🎉</p>
    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">¡Felicitaciones!</h1>
    <p style="margin:8px 0 0;color:#A9CCE3;font-size:14px;">Regis Colombia — SG-SST</p>
  </td></tr>

  <tr><td style="padding:40px;">
    <h2 style="margin:0 0 16px;color:#1B4F72;font-size:20px;">100% de Cumplimiento SG-SST</h2>
    <p style="margin:0 0 16px;color:#333;font-size:15px;line-height:1.6;">
      Estimado(a) <strong>{{contacto}}</strong>, nos complace informarle que <strong>{{empresa}}</strong>
      ha alcanzado el <strong style="color:#27AE60;">100% de cumplimiento</strong> en los estándares mínimos
      de la Resolución 0312 de 2019.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
    <tr><td style="text-align:center;padding:32px 48px;background-color:#EAFAF1;border-radius:12px;">
      <p style="margin:0;color:#27AE60;font-size:64px;font-weight:700;">100%</p>
      <p style="margin:8px 0 0;color:#1E8449;font-size:14px;font-weight:600;">CUMPLIMIENTO TOTAL</p>
      <p style="margin:4px 0 0;color:#888;font-size:12px;">Logrado el {{fecha_logro}}</p>
    </td></tr>
    </table>

    <p style="margin:0 0 16px;color:#333;font-size:15px;line-height:1.6;">
      Este logro refleja el compromiso de su empresa con la seguridad y salud de sus trabajadores.
      Cumplir con el 100% de los estándares mínimos significa que:
    </p>
    <ul style="margin:0 0 24px;padding-left:20px;color:#333;font-size:14px;line-height:1.8;">
      <li>Su empresa cumple plenamente con la normatividad colombiana en SG-SST</li>
      <li>Sus trabajadores cuentan con un entorno de trabajo seguro y controlado</li>
      <li>Está preparado para cualquier auditoría del Ministerio de Trabajo</li>
      <li>Reduce significativamente los riesgos de sanciones y accidentes laborales</li>
    </ul>

    <p style="margin:0 0 24px;color:#333;font-size:14px;line-height:1.6;">
      Agradecemos la colaboración de todo su equipo. Su consultor <strong>{{consultor_nombre}}</strong>
      seguirá acompañándole para mantener este nivel de excelencia.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
    <tr><td style="background-color:#27AE60;border-radius:6px;">
      <a href="{{url_plataforma}}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Ver Dashboard de Cumplimiento</a>
    </td></tr>
    </table>

    <p style="margin:0;color:#666;font-size:13px;line-height:1.5;text-align:center;">
      Recuerde: mantener el cumplimiento requiere seguimiento continuo.
      ¡Siga adelante!
    </p>
  </td></tr>

  <tr><td style="background-color:#F4F6F9;padding:24px 40px;border-top:1px solid #E5E8EB;">
    <p style="margin:0 0 4px;color:#888;font-size:12px;text-align:center;">Regis Colombia S.A.S. — Consultoría en SG-SST</p>
    <p style="margin:0;color:#888;font-size:12px;text-align:center;">Comprometidos con la seguridad y salud en el trabajo.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
```

---

## Notas de Implementación

### Integración con Resend (Edge Functions)

```typescript
// Ejemplo de uso en Edge Function
import { Resend } from "npm:resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

await resend.emails.send({
  from: "Regis SG-SST <notificaciones@regis.com.co>",
  to: [destinatario],
  subject: asunto.replace("{{empresa}}", empresa.nombre),
  html: cuerpo
    .replace(/\{\{empresa\}\}/g, empresa.nombre)
    .replace(/\{\{contacto\}\}/g, contacto.nombre)
    .replace(/\{\{url_plataforma\}\}/g, "https://app.regis.com.co"),
});
```

### Reemplazo de Variables

Todas las variables usan formato `{{nombre_variable}}`. El reemplazo se realiza con `.replace(/\{\{variable\}\}/g, valor)` antes de enviar.

### Compatibilidad

- Todos los templates usan tablas HTML para compatibilidad con clientes de correo antiguos (Outlook, Gmail, Yahoo).
- Estilos 100% inline (sin `<style>` en `<head>`).
- Ancho máximo de 600px para visualización óptima en móviles y escritorio.
- No se usan imágenes externas (excepto el logo que puede añadirse como adjunto CID).

### Registro de Envíos

Cada envío de correo debe registrarse en `logs_actividad` con:
- `tipo`: "email_enviado"
- `modulo`: módulo correspondiente (ej. "pila", "equipos", "comites")
- `descripcion`: asunto del correo + destinatario
- `empresa_id`: ID de la empresa (cuando aplique)
- `metadata`: `{ template: "nombre_template", destinatario: "email", variables: {...} }`
