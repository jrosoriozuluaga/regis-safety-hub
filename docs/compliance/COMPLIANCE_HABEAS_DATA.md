# Cumplimiento Ley 1581 de 2012 (Habeas Data) — Plataforma Regis SG-SST

**Fecha de elaboracion:** Mayo 2026
**Normativa aplicable:** Ley Estatutaria 1581 de 2012, Decreto 1377 de 2013, Resolucion 1266 de 2022 SIC
**Responsable del tratamiento:** Regis Colombia S.A.S.
**Plataforma analizada:** Regis SG-SST (app web React + Supabase + Edge Functions)

---

## 1. Identificacion de datos personales tratados

### 1.1 Datos por tabla

| Tabla | Datos personales | Categoria |
|-------|-----------------|-----------|
| `trabajadores` | Nombre completo, numero de cedula, cargo, area, fecha de ingreso | Dato personal privado |
| `examenes_medicos` | Tipo de examen, fecha, concepto de aptitud (apto/no apto/apto con restricciones), recomendaciones medicas, archivo PDF | **Dato sensible (salud)** |
| `recomendaciones_medicas` | Recomendaciones extraidas por IA de examenes medicos, restricciones laborales | **Dato sensible (salud)** |
| `usuarios` (Supabase Auth) | Email, nombre completo, rol (admin/consultor/cliente), empresa_id | Dato personal privado |
| `empresas_cliente` | NIT, razon social, nombre contacto PILA, email contacto PILA, telefono contacto PILA, direccion, CIIU, ARL | Dato personal privado / dato empresarial |
| `pila_records` | Empresa + periodo, estado de pago, archivo de planilla | Dato empresarial con referencia indirecta a trabajadores |
| `planes_emergencia` | Grabaciones de audio transcritas, analisis de IA | Potencialmente **dato sensible** si contiene voces identificables |
| `actas_comite` | Contenido de actas, asistentes, temas discutidos | Dato personal privado |
| `integrantes_comite` | Nombre, cargo, rol en comite | Dato personal privado |
| `logs_actividad` | Usuario que realizo la accion, IP implicita, timestamp | Dato personal privado |
| `inventario_equipos` | No contiene datos personales directos | N/A |

### 1.2 Categorias sensibles identificadas

Conforme al articulo 5 de la Ley 1581 de 2012, se consideran **datos sensibles** aquellos que afectan la intimidad del titular o cuyo uso indebido puede generar discriminacion. En la plataforma se tratan:

1. **Datos de salud:** Resultados de examenes medicos ocupacionales, concepto de aptitud laboral, recomendaciones medicas. Estos datos estan protegidos con regimen reforzado bajo el articulo 6 de la Ley 1581.
2. **Datos potencialmente biometricos:** Grabaciones de audio en el modulo de planes de emergencia. Si las voces son identificables, constituyen dato biometrico bajo interpretacion de la SIC.

### 1.3 Flujos de datos internacionales

Los siguientes datos **salen del territorio colombiano** hacia servidores en Estados Unidos:

| Servicio | Ubicacion | Datos transferidos | Proposito |
|----------|-----------|-------------------|-----------|
| **Supabase (AWS us-east-1)** | Virginia, EE.UU. | Toda la base de datos, archivos de Storage | Alojamiento principal de la plataforma |
| **Anthropic Claude API** | EE.UU. | Texto de examenes medicos (PDF), contenido de actas, datos de matrices de riesgo | Procesamiento con IA: extraccion de datos, generacion de documentos |
| **OpenAI Whisper API** | EE.UU. | Archivos de audio (grabaciones de emergencia) | Transcripcion de audio a texto |
| **Resend** | EE.UU. | Direcciones de email, contenido de correos (nombres, datos de empresa) | Envio de correos electronicos |
| **Twilio** | EE.UU. | Numeros de telefono, contenido de mensajes WhatsApp | Envio de recordatorios por WhatsApp |

**Implicacion legal:** Toda transferencia internacional requiere (i) que el pais receptor tenga nivel adecuado de proteccion declarado por la SIC, o (ii) autorizacion del titular, o (iii) contrato con clausulas contractuales tipo (art. 26, Ley 1581; arts. 24-25, Decreto 1377). Estados Unidos **no** esta en la lista de paises con nivel adecuado de proteccion de la SIC.

---

## 2. Bases legales para el tratamiento

### 2.1 Consentimiento previo, expreso e informado (Art. 9, Ley 1581)

Es la base legal principal para la mayoria de tratamientos en la plataforma. Requiere:

- Informar al titular de forma clara y expresa sobre la finalidad
- Obtener autorizacion previa (puede ser escrita, oral o mediante conducta inequivoca)
- Para **datos sensibles (salud, biometricos):** la autorizacion debe ser **explicita y por escrito**, indicando el caracter facultativo de la respuesta y los derechos del titular

### 2.2 Obligacion legal (Art. 10 literal c, Ley 1581)

Ciertos tratamientos se amparan en obligaciones legales del empleador:

- **Resolucion 0312 de 2019:** Obliga a los empleadores a realizar examenes medicos ocupacionales y mantener registros de cumplimiento SG-SST
- **Decreto 1072 de 2015 (Decreto Unico Reglamentario del Sector Trabajo):** Establece la obligatoriedad del SG-SST
- **Ley 100 de 1993 y normas concordantes:** Obligacion de pago de aportes a seguridad social (PILA)

Sin embargo, la obligacion legal **no exime** del deber de informar al titular sobre el tratamiento, ni elimina los derechos ARCO.

### 2.3 Contrato laboral (Art. 10 literal b, Ley 1581)

El contrato de trabajo y el contrato de prestacion de servicios de consultoria SG-SST entre Regis y las empresas cliente constituyen base legal complementaria para el tratamiento de datos de trabajadores y contactos empresariales.

### 2.4 Requisitos especificos para datos sensibles

Conforme al articulo 6 de la Ley 1581 de 2012:

- Se prohibe el tratamiento de datos sensibles, **salvo** que el titular autorice explicitamente
- La autorizacion debe informar al titular que no esta obligado a autorizar el tratamiento de datos sensibles
- Los datos de salud (examenes medicos, concepto de aptitud) requieren autorizacion reforzada
- El envio de datos de salud a servidores en EE.UU. (Anthropic Claude para extraccion de examenes) requiere autorizacion **especifica** para transferencia internacional de datos sensibles

---

## 3. Politica de Privacidad

*Texto completo listo para publicacion en la plataforma.*

---

### POLITICA DE TRATAMIENTO DE DATOS PERSONALES — REGIS COLOMBIA S.A.S.

**Ultima actualizacion:** Mayo 2026

#### 3.1 Identificacion del Responsable del Tratamiento

| Campo | Detalle |
|-------|---------|
| Razon social | Regis Colombia S.A.S. |
| NIT | [Insertar NIT de Regis] |
| Domicilio | [Insertar direccion fisica], Colombia |
| Correo electronico para ejercicio de derechos | protecciondatos@regiscolombia.com |
| Telefono | [Insertar telefono] |
| Sitio web | [Insertar URL de la plataforma] |

#### 3.2 Definiciones

- **Titular:** Persona natural cuyos datos personales son objeto de tratamiento (trabajadores, usuarios de la plataforma, contactos empresariales).
- **Responsable del tratamiento:** Regis Colombia S.A.S., quien decide sobre la base de datos y/o el tratamiento de los datos.
- **Encargado del tratamiento:** Persona natural o juridica que realiza el tratamiento de datos por cuenta de Regis Colombia (incluye proveedores tecnologicos).
- **Tratamiento:** Cualquier operacion sobre datos personales: recoleccion, almacenamiento, uso, circulacion, supresion.
- **Dato sensible:** Dato que afecta la intimidad del titular o cuyo uso indebido puede generar discriminacion (datos de salud, biometricos, entre otros).
- **Autorizacion:** Consentimiento previo, expreso e informado del titular para el tratamiento de sus datos.

#### 3.3 Datos personales que recolectamos

Regis Colombia trata las siguientes categorias de datos a traves de su plataforma SG-SST:

**a) Datos de identificacion:** Nombre completo, numero de cedula de ciudadania, cargo, area de trabajo, fecha de ingreso laboral.

**b) Datos de contacto:** Correo electronico, numero de telefono, direccion.

**c) Datos empresariales:** NIT, razon social, codigo CIIU, nivel de riesgo ARL, ARL contratada.

**d) Datos sensibles de salud:** Resultados de examenes medicos ocupacionales (tipo de examen, fecha, concepto de aptitud: apto, no apto, apto con restricciones), recomendaciones medicas derivadas de dichos examenes.

**e) Datos potencialmente biometricos:** Grabaciones de audio realizadas en el contexto de inspecciones o evaluaciones de planes de emergencia.

**f) Datos de uso de la plataforma:** Registros de actividad (logs), acciones realizadas, marcas de tiempo.

#### 3.4 Finalidades del tratamiento

Los datos personales seran utilizados para las siguientes finalidades:

**Finalidades primarias (necesarias para la prestacion del servicio):**

1. Gestionar el cumplimiento del Sistema de Gestion de Seguridad y Salud en el Trabajo (SG-SST) conforme a la Resolucion 0312 de 2019 y el Decreto 1072 de 2015.
2. Registrar y dar seguimiento a los aportes de seguridad social (PILA) de las empresas cliente.
3. Almacenar y gestionar resultados de examenes medicos ocupacionales para cumplimiento normativo.
4. Elaborar matrices de identificacion de peligros, evaluacion y valoracion de riesgos (metodologia GTC 45).
5. Gestionar la conformacion y funcionamiento de comites (COPASST, Convivencia, Vigia SST).
6. Generar actas de reunion, reportes de cumplimiento e informes periodicos.
7. Enviar comunicaciones operativas relacionadas con el servicio (recordatorios de vencimiento, solicitudes de documentos, notificaciones de estado).
8. Procesar documentos mediante inteligencia artificial para extraccion de informacion relevante al SG-SST.
9. Transcribir grabaciones de audio para documentacion de inspecciones y planes de emergencia.
10. Mantener trazabilidad y auditoria de las acciones realizadas en la plataforma.

**Finalidades secundarias (no estrictamente necesarias):**

11. Elaborar estadisticas agregadas y anonimizadas sobre cumplimiento SG-SST.
12. Mejorar los algoritmos y funcionalidades de la plataforma.

#### 3.5 Transferencias internacionales de datos

Para la prestacion del servicio, Regis Colombia transfiere datos personales a los siguientes encargados del tratamiento ubicados en Estados Unidos de America:

| Encargado | Pais | Datos transferidos | Finalidad | Garantias |
|-----------|------|-------------------|-----------|-----------|
| Supabase Inc. | EE.UU. (AWS us-east-1) | Todos los datos almacenados en la plataforma | Almacenamiento y procesamiento de base de datos | Contrato con clausulas contractuales tipo; cifrado en transito (TLS) y en reposo (AES-256) |
| Anthropic PBC | EE.UU. | Texto de documentos medicos y laborales | Extraccion automatizada de informacion mediante IA | Contrato de procesamiento de datos; los datos no se usan para entrenamiento de modelos |
| OpenAI Inc. | EE.UU. | Archivos de audio | Transcripcion de audio a texto | Contrato de procesamiento de datos; los datos no se usan para entrenamiento de modelos |
| Resend Inc. | EE.UU. | Direcciones de email, contenido de correos | Envio de comunicaciones electronicas | Contrato de procesamiento de datos |
| Twilio Inc. | EE.UU. | Numeros de telefono, contenido de mensajes | Envio de recordatorios por WhatsApp | Contrato de procesamiento de datos |

Dado que Estados Unidos no cuenta con declaracion de nivel adecuado de proteccion por parte de la SIC, Regis Colombia se compromete a:

- Suscribir contratos de transmision de datos con clausulas contractuales tipo con cada encargado
- Obtener autorizacion expresa del titular para la transferencia internacional
- Verificar que los encargados cuenten con politicas de seguridad de la informacion adecuadas

#### 3.6 Derechos de los titulares

Conforme a los articulos 8 y 15 de la Ley 1581 de 2012, los titulares tienen derecho a:

1. **Acceso:** Conocer, consultar y obtener copia de sus datos personales almacenados en la plataforma.
2. **Rectificacion:** Solicitar la correccion de datos inexactos, incompletos o desactualizados.
3. **Cancelacion (supresion):** Solicitar la eliminacion de sus datos cuando (i) no sean necesarios para la finalidad para la cual fueron recolectados, (ii) se haya vencido el termino de conservacion, o (iii) se revoque la autorizacion. Excepto cuando exista obligacion legal de conservarlos.
4. **Oposicion:** Oponerse al tratamiento de sus datos cuando no medie obligacion legal o contractual.
5. **Revocatoria de la autorizacion:** Revocar la autorizacion otorgada para el tratamiento, cuando no lo impida una disposicion legal o contractual.
6. **Portabilidad:** Solicitar que sus datos sean entregados en un formato estructurado de uso comun.
7. **Informacion sobre transferencias:** Conocer a que terceros se han transferido sus datos.

#### 3.7 Procedimiento para ejercicio de derechos

Los titulares podran ejercer sus derechos mediante los siguientes canales:

- **Correo electronico:** protecciondatos@regiscolombia.com
- **Correo fisico:** [Insertar direccion], dirigido al area de Proteccion de Datos Personales
- **Formulario web:** [Insertar URL cuando se implemente]

**Procedimiento:**

1. El titular envia su solicitud identificandose plenamente (nombre, cedula, datos de contacto) e indicando el derecho que desea ejercer y los datos sobre los cuales recae la solicitud.
2. Regis Colombia acusara recibo dentro de los **dos (2) dias habiles** siguientes.
3. **Consultas** (acceso): seran atendidas en un termino maximo de **diez (10) dias habiles** contados a partir del recibo. Si no es posible atender en dicho plazo, se informara al titular indicando los motivos y la fecha estimada de respuesta, que no podra superar cinco (5) dias habiles adicionales (art. 14, Ley 1581).
4. **Reclamos** (rectificacion, supresion, revocatoria): seran atendidos en un termino maximo de **quince (15) dias habiles** contados a partir del recibo. Si no es posible atender en dicho plazo, se informara al titular y la respuesta no podra superar ocho (8) dias habiles adicionales (art. 15, Ley 1581).
5. Si el titular considera que su solicitud no fue atendida adecuadamente, podra presentar queja ante la Superintendencia de Industria y Comercio (SIC).

#### 3.8 Conservacion de datos

Los datos personales se conservaran durante los siguientes periodos:

| Tipo de dato | Periodo de conservacion | Base legal |
|-------------|------------------------|------------|
| Datos de trabajadores y examenes medicos | Minimo 20 anios desde la terminacion del vinculo laboral | Art. 2.2.4.6.13, Decreto 1072/2015 |
| Registros PILA | 5 anios desde el periodo correspondiente | Prescripcion de obligaciones parafiscales |
| Actas de comites | 20 anios | Conservacion documental SG-SST |
| Matrices de riesgo | Vigencia del SG-SST + 20 anios | Decreto 1072/2015 |
| Logs de actividad | 3 anios | Necesidad operativa y auditoria |
| Datos de usuarios (auth) | Mientras exista relacion contractual + 1 anio | Periodo de gracia post-terminacion |

Transcurridos los periodos indicados, los datos seran eliminados de forma segura o anonimizados de manera irreversible.

#### 3.9 Medidas de seguridad

Regis Colombia implementa las siguientes medidas tecnicas y organizativas para proteger los datos personales:

- Cifrado en transito mediante TLS 1.2+ en todas las comunicaciones
- Cifrado en reposo (AES-256) en la base de datos y almacenamiento de archivos
- Control de acceso basado en roles (admin, consultor, cliente) con Row Level Security (RLS) en base de datos
- Autenticacion mediante proveedor de identidad (Supabase Auth)
- Registro de auditoria de todas las acciones en la plataforma (logs_actividad)
- Acceso a datos de salud restringido a roles admin y consultor
- Tokens de acceso temporal para paginas publicas (upload PILA) con vigencia limitada

#### 3.10 Vigencia

Esta politica entra en vigencia a partir de su publicacion y permanecera vigente mientras Regis Colombia S.A.S. trate datos personales. Cualquier modificacion sera comunicada a los titulares por los medios disponibles.

---

## 4. Gap analysis del proyecto actual

### 4.1 Estado actual vs. requisitos legales

| Requisito legal | Estado actual | Riesgo |
|----------------|---------------|--------|
| Aviso de privacidad en recoleccion de datos (Art. 12, Ley 1581) | **NO IMPLEMENTADO.** No existe aviso de privacidad en ninguna pantalla de la plataforma | CRITICO |
| Aviso de privacidad en pagina publica UploadPila (`/upload-pila`) | **NO IMPLEMENTADO.** La pagina recolecta archivos con datos de trabajadores sin ningun aviso de privacidad ni consentimiento | CRITICO |
| Autorizacion previa del titular para datos sensibles (Art. 6, Ley 1581) | **NO IMPLEMENTADO.** No existe mecanismo de consentimiento al crear registros de trabajadores ni al procesar examenes medicos | CRITICO |
| Autorizacion para transferencia internacional (Art. 26, Ley 1581) | **NO IMPLEMENTADO.** Los datos se envian a EE.UU. (Anthropic, OpenAI, Supabase, Resend, Twilio) sin autorizacion expresa del titular | CRITICO |
| Mecanismo para ejercicio de derechos ARCO (Arts. 14-15, Ley 1581) | **NO IMPLEMENTADO.** No existe formulario, correo dedicado ni procedimiento documentado para que los titulares ejerzan sus derechos | ALTO |
| Registro Nacional de Bases de Datos (RNBD) ante la SIC (Art. 25, Ley 1581; Decreto 886/2014) | **DESCONOCIDO.** No se tiene evidencia de que Regis Colombia haya registrado sus bases de datos ante la SIC | ALTO |
| Contrato de transmision de datos con encargados (Art. 18, Decreto 1377) | **NO DOCUMENTADO.** No existen contratos formales de encargado del tratamiento con Supabase, Anthropic, OpenAI, Resend ni Twilio | ALTO |
| Oficial de Proteccion de Datos (Art. 23, Decreto 1377) | **NO DESIGNADO.** No se ha designado persona responsable de atencion de consultas y reclamos | MEDIO |
| Politica de tratamiento publicada (Art. 13, Decreto 1377) | **NO PUBLICADA.** No existe politica de privacidad accesible en la plataforma ni en sitio web | CRITICO |
| Evaluacion de impacto de privacidad para datos sensibles | **NO REALIZADA.** El procesamiento de examenes medicos con IA en servidores extranjeros no ha sido evaluado formalmente | MEDIO |
| Aviso de privacidad para comunicaciones (email/WhatsApp) | **NO IMPLEMENTADO.** Los correos y mensajes de WhatsApp no incluyen aviso de privacidad | BAJO |

### 4.2 Hallazgos criticos

1. **Pagina publica sin proteccion de datos:** La ruta `/upload-pila` permite que contactos de empresas suban planillas PILA (que contienen datos de multiples trabajadores: cedula, salario, aportes) sin ningun aviso de privacidad, sin consentimiento, y con autenticacion basada unicamente en un token codificado en base64. Esto constituye recoleccion de datos personales de terceros sin autorizacion.

2. **Datos sensibles de salud procesados por IA en EE.UU.:** Los examenes medicos (concepto de aptitud, restricciones) se envian a la API de Anthropic Claude para extraccion automatizada. Esto implica (i) transferencia internacional de datos sensibles de salud sin autorizacion reforzada, y (ii) procesamiento automatizado de datos sensibles sin evaluacion de impacto.

3. **Ausencia total de consentimiento:** En ningun punto del flujo de la plataforma se solicita autorizacion al titular. Ni al crear un usuario, ni al registrar un trabajador, ni al subir un examen medico, ni al grabar audio.

4. **Sin canal de derechos ARCO:** Los titulares (trabajadores de las empresas cliente) no tienen forma de saber que sus datos estan siendo tratados ni de ejercer sus derechos de acceso, rectificacion, cancelacion u oposicion.

---

## 5. Recomendaciones priorizadas

### P1 — Sin esto no se puede operar legalmente

Estas acciones deben implementarse **antes** de operar la plataforma con datos reales de trabajadores.

| # | Accion | Descripcion | Componente afectado |
|---|--------|-------------|-------------------|
| P1.1 | **Publicar politica de privacidad** | Publicar la politica de la seccion 3 de este documento en la plataforma. Debe ser accesible desde el footer y desde la pantalla de login | Frontend: nuevo componente, link en layout |
| P1.2 | **Agregar aviso de privacidad en UploadPila** | Mostrar aviso de privacidad resumido y checkbox de aceptacion antes de permitir la carga de archivos en `/upload-pila` | `UploadPila.tsx` |
| P1.3 | **Implementar consentimiento en registro de trabajadores** | Al crear un trabajador, mostrar la clausula de autorizacion (ver Anexo 6.1) y registrar la fecha/hora de aceptacion en base de datos | `Trabajadores` UI + nueva columna `fecha_autorizacion` en tabla `trabajadores` |
| P1.4 | **Autorizacion reforzada para datos sensibles** | Implementar autorizacion escrita especifica antes de procesar examenes medicos con IA. Debe indicar expresamente que se trata de datos de salud y que seran enviados a servidores en EE.UU. | `MedicalExams.tsx` + nueva tabla o campo de consentimiento |
| P1.5 | **Registrar bases de datos ante la SIC (RNBD)** | Registrar en el RNBD todas las bases de datos que contienen datos personales. El registro se realiza en linea en rnbd.sic.gov.co | Proceso administrativo |
| P1.6 | **Designar Oficial de Proteccion de Datos** | Designar una persona dentro de Regis Colombia como responsable de atender consultas y reclamos de titulares | Proceso organizacional |

### P2 — Buenas practicas necesarias

Estas acciones fortalecen el cumplimiento y reducen riesgo legal significativamente.

| # | Accion | Descripcion |
|---|--------|-------------|
| P2.1 | **Suscribir contratos de encargado del tratamiento** | Formalizar acuerdos de procesamiento de datos (DPA) con Supabase, Anthropic, OpenAI, Resend y Twilio. La mayoria de estos proveedores ofrecen DPA estandar en sus sitios web |
| P2.2 | **Implementar mecanismo ARCO en la plataforma** | Crear formulario o seccion donde los titulares puedan enviar solicitudes de acceso, rectificacion, cancelacion u oposicion. Incluir workflow para gestion interna |
| P2.3 | **Incluir clausula de proteccion de datos en contratos con empresas cliente** | Agregar al contrato de prestacion de servicios la clausula de encargado del tratamiento (ver Anexo 6.3) |
| P2.4 | **Consentimiento al crear usuarios** | Agregar checkbox de aceptacion de politica de privacidad en el flujo de creacion de usuarios (admin, consultor, cliente) |
| P2.5 | **Aviso de privacidad en correos y WhatsApp** | Incluir pie de pagina con aviso breve de proteccion de datos en todas las comunicaciones automaticas |
| P2.6 | **Evaluacion de impacto de privacidad (PIA)** | Realizar evaluacion formal para el procesamiento de datos sensibles de salud mediante IA |

### P3 — Deseables

| # | Accion | Descripcion |
|---|--------|-------------|
| P3.1 | **Cifrado a nivel de campo para datos sensibles** | Cifrar campos como `concepto_aptitud` y `recomendaciones` con cifrado adicional a nivel de aplicacion |
| P3.2 | **Logs de acceso a datos sensibles** | Registrar especificamente cuando un usuario accede o descarga examenes medicos |
| P3.3 | **Anonimizacion para estadisticas** | Implementar funciones de anonimizacion para cuando se generen reportes agregados |
| P3.4 | **Capacitacion interna** | Programa de formacion para consultores de Regis sobre proteccion de datos personales |
| P3.5 | **Auditoria periodica** | Establecer revision semestral del cumplimiento de esta politica |

---

## 6. Plantillas anexas

### 6.1 Clausula de autorizacion para tratamiento de datos de trabajadores

*Para usar al registrar trabajadores en la plataforma.*

---

> **AUTORIZACION PARA EL TRATAMIENTO DE DATOS PERSONALES**
>
> De conformidad con la Ley 1581 de 2012 y el Decreto 1377 de 2013, autorizo de manera libre, expresa, previa e informada a **Regis Colombia S.A.S.** (en adelante "Regis") y a la empresa **[NOMBRE DE LA EMPRESA CLIENTE]**, para que recolecten, almacenen, usen, procesen, circulen y, en general, traten mis datos personales, incluyendo:
>
> - Datos de identificacion: nombre, numero de cedula, cargo, area de trabajo
> - **Datos sensibles de salud:** resultados de examenes medicos ocupacionales, concepto de aptitud laboral, recomendaciones medicas
>
> **Finalidades del tratamiento:**
> 1. Gestionar el cumplimiento del Sistema de Gestion de Seguridad y Salud en el Trabajo (SG-SST)
> 2. Dar cumplimiento a las obligaciones legales derivadas de la Resolucion 0312 de 2019 y el Decreto 1072 de 2015
> 3. Realizar seguimiento a la aptitud laboral y recomendaciones medicas
> 4. Procesar informacion mediante herramientas de inteligencia artificial para extraccion y analisis de datos
>
> **Transferencia internacional:** Autorizo que mis datos personales, incluyendo datos sensibles de salud, sean transferidos a encargados del tratamiento ubicados en Estados Unidos de America (Supabase Inc., Anthropic PBC, OpenAI Inc.) para las finalidades aqui descritas.
>
> **Derechos del titular:** Como titular de los datos, tengo derecho a conocer, actualizar, rectificar y suprimir mis datos, asi como a revocar esta autorizacion. Puedo ejercer estos derechos escribiendo a protecciondatos@regiscolombia.com.
>
> **Caracter facultativo:** Declaro que he sido informado(a) de que la entrega de datos sensibles (resultados de examenes medicos) es de caracter **facultativo**, y que no estoy obligado(a) a autorizar su tratamiento. Sin embargo, entiendo que ciertos datos de salud son requeridos por la normatividad colombiana para el cumplimiento del SG-SST.
>
> Acepto: [ ] Si / [ ] No
>
> Nombre: ________________________
> Cedula: ________________________
> Fecha: _________________________

---

### 6.2 Aviso de privacidad para pagina publica UploadPila

*Para mostrar en la pagina `/upload-pila` antes del formulario de carga.*

---

> **AVISO DE PRIVACIDAD — Carga de Planilla PILA**
>
> **Responsable:** Regis Colombia S.A.S.
>
> Los archivos que usted cargue en esta pagina contienen datos personales de los trabajadores de su empresa (nombres, numeros de cedula, salarios, aportes a seguridad social). Estos datos seran tratados por Regis Colombia S.A.S. con la finalidad exclusiva de verificar el cumplimiento de las obligaciones de seguridad social en el marco del servicio de consultoria SG-SST contratado por su empresa.
>
> **Informacion importante:**
> - Los archivos seran almacenados en servidores ubicados en Estados Unidos (Supabase/AWS)
> - Los datos seran accesibles unicamente para el personal autorizado de Regis Colombia (consultores y administradores asignados a su empresa)
> - Los datos seran conservados durante el periodo de vigencia del contrato de consultoria mas 5 anios adicionales
>
> **Derechos de los titulares:** Los trabajadores cuyos datos se incluyen en la planilla PILA tienen derecho a conocer, actualizar, rectificar y suprimir sus datos personales. Estos derechos pueden ejercerse escribiendo a protecciondatos@regiscolombia.com.
>
> Al cargar el archivo, usted declara que cuenta con la autorizacion de los titulares de los datos contenidos en la planilla para compartir esta informacion con Regis Colombia S.A.S.
>
> [ ] He leido y acepto el aviso de privacidad

---

### 6.3 Contrato de encargado del tratamiento (Regis <-> Empresa cliente)

*Clausula para incluir en el contrato de prestacion de servicios de consultoria SG-SST.*

---

> **CLAUSULA DE PROTECCION DE DATOS PERSONALES Y ENCARGO DEL TRATAMIENTO**
>
> **PRIMERO. Definiciones.** Para efectos de esta clausula, se entiende por "Responsable del tratamiento" a **[NOMBRE DE LA EMPRESA CLIENTE]** y por "Encargado del tratamiento" a **Regis Colombia S.A.S.**
>
> **SEGUNDO. Objeto del encargo.** EL RESPONSABLE encarga a EL ENCARGADO el tratamiento de los datos personales de sus trabajadores que resulten necesarios para la prestacion del servicio de consultoria en Seguridad y Salud en el Trabajo (SG-SST), conforme a las finalidades establecidas en el contrato principal.
>
> **TERCERO. Datos personales tratados.** EL ENCARGADO tratara las siguientes categorias de datos personales de los trabajadores del RESPONSABLE:
> - Datos de identificacion: nombre completo, numero de cedula de ciudadania, cargo, area de trabajo
> - Datos sensibles de salud: resultados de examenes medicos ocupacionales, concepto de aptitud laboral, recomendaciones medicas
> - Datos de seguridad social: planillas de aportes PILA
>
> **CUARTO. Finalidades.** EL ENCARGADO tratara los datos exclusivamente para:
> a) Gestionar el cumplimiento del SG-SST conforme a la Resolucion 0312 de 2019
> b) Verificar el cumplimiento de aportes a seguridad social
> c) Elaborar matrices de riesgo, actas de comite y demas documentos del SG-SST
> d) Procesar informacion mediante herramientas tecnologicas, incluida inteligencia artificial
>
> **QUINTO. Transferencia internacional.** EL RESPONSABLE autoriza a EL ENCARGADO a transferir los datos personales a sub-encargados ubicados en Estados Unidos de America (Supabase Inc., Anthropic PBC, OpenAI Inc., Resend Inc., Twilio Inc.) exclusivamente para las finalidades descritas en esta clausula. EL ENCARGADO se compromete a suscribir contratos de transmision de datos con dichos sub-encargados que incluyan clausulas de proteccion equivalentes a las establecidas en la Ley 1581 de 2012.
>
> **SEXTO. Obligaciones del Encargado.** EL ENCARGADO se obliga a:
> a) Tratar los datos conforme a las instrucciones del RESPONSABLE y la normatividad aplicable
> b) No utilizar los datos para finalidades distintas a las establecidas en esta clausula
> c) Implementar medidas tecnicas y organizativas de seguridad adecuadas
> d) Informar al RESPONSABLE de cualquier incidente de seguridad que afecte los datos dentro de las 24 horas siguientes a su conocimiento
> e) Permitir auditorias por parte del RESPONSABLE o de la SIC
> f) Suprimir los datos al finalizar el contrato, salvo obligacion legal de conservacion
> g) Designar un Oficial de Proteccion de Datos como canal de comunicacion
>
> **SEPTIMO. Obligaciones del Responsable.** EL RESPONSABLE se obliga a:
> a) Obtener la autorizacion de los titulares para el tratamiento de sus datos, incluyendo la transferencia a EL ENCARGADO
> b) Informar a EL ENCARGADO de cualquier actualizacion o revocatoria de autorizacion
> c) Garantizar que los datos suministrados son exactos y actualizados
>
> **OCTAVO. Confidencialidad.** Las partes se obligan a mantener estricta confidencialidad sobre los datos personales tratados. Esta obligacion subsiste aun despues de finalizado el contrato.
>
> **NOVENO. Vigencia.** Esta clausula tendra la misma vigencia del contrato principal y subsistira mientras EL ENCARGADO conserve datos personales del RESPONSABLE.
>
> **DECIMO. Legislacion aplicable.** Esta clausula se rige por la Ley 1581 de 2012, el Decreto 1377 de 2013, el Decreto 1072 de 2015, la Resolucion 0312 de 2019 y demas normas concordantes y complementarias.

---

*Fin del documento.*
