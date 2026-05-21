-- Migration 007: Add configuration keys for email and equipment alerts
-- Status: DRAFT — do NOT apply with supabase db push

INSERT INTO configuracion_sistema (clave, valor, descripcion)
VALUES ('email_remitente', 'notificaciones@regiscolombia.com', 'Dirección de email remitente para notificaciones automáticas')
ON CONFLICT (clave) DO NOTHING;

INSERT INTO configuracion_sistema (clave, valor, descripcion)
VALUES ('equipos_dias_aviso_vencimiento', '30', 'Días antes de vencimiento para mostrar alerta en inventario de equipos')
ON CONFLICT (clave) DO NOTHING;
