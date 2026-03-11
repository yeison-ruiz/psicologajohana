# 📋 PsicoConnect — Rules (Reglas de Negocio)

> Plataforma digital para consulta psicológica | Stack gratuito · Google Meet · Nequi

---

## Índice

1. [Reglas de Agendamiento](#1-reglas-de-agendamiento-ag)
2. [Reglas de Pago](#2-reglas-de-pago-pay)
3. [Reglas de Cancelación](#3-reglas-de-cancelación-cancel)
4. [Reglas de Privacidad y Seguridad](#4-reglas-de-privacidad-y-seguridad-sec)
5. [Reglas de Acceso y Roles](#5-reglas-de-acceso-y-roles-acc)
6. [Reglas de Notificaciones](#6-reglas-de-notificaciones-notif)
7. [Reglas de Datos Clínicos](#7-reglas-de-datos-clínicos-clin)
8. [Invariantes del Sistema](#8-invariantes-del-sistema)

---

## 1. Reglas de Agendamiento (AG)

### AG-01 — Una cita activa por paciente
Un paciente **no puede** tener más de 1 cita en estado `PENDING_PAYMENT` o `PENDING_APPROVAL` simultáneamente.

```
WHEN paciente intenta crear nueva cita
AND EXISTS cita con status IN ('PENDING_PAYMENT', 'PENDING_APPROVAL')
THEN REJECT con mensaje: "Tienes una cita pendiente de pago o aprobación. Completa ese proceso primero."
```

### AG-02 — Antelación mínima de 24 horas
No se puede agendar una cita con menos de 24 horas de antelación.

```
WHEN paciente selecciona slot
AND slot.start_at < NOW() + INTERVAL '24 hours'
THEN slot.visible = false (ocultar del calendario)
```

### AG-03 — Slots creados exclusivamente por la psicóloga
Los bloques de disponibilidad solo pueden ser creados, editados y eliminados por usuarios con `role = 'psicologa'`. Los pacientes no tienen permisos de escritura sobre `availability_slots`.

### AG-04 — Slot se bloquea al ser tomado
En el momento en que una cita pasa a estado `PENDING_PAYMENT`, el slot desaparece del calendario público. Se libera únicamente si la cita llega a `EXPIRED`, `CANCELLED` o `REJECTED` (después del tercer intento).

```
slot.is_available = (appointment.status NOT IN ('PENDING_PAYMENT', 'PENDING_APPROVAL', 'CONFIRMED', 'IN_PROGRESS', 'DONE'))
```

### AG-05 — Duración de sesión configurable
La duración por defecto es **50 minutos**. La psicóloga puede configurar la duración por slot: `30 | 45 | 50 | 60 | 90` minutos.

### AG-06 — Bloqueo de agenda por la psicóloga
La psicóloga puede bloquear fechas completas o rangos de horas. Ningún slot en un período bloqueado es visible para los pacientes, aunque exista en la base de datos.

```
WHEN rendering calendario
FILTER OUT slots WHERE EXISTS availability_block OVERLAPPING slot.time_range
```

### AG-07 — Límite diario de sesiones
Máximo **8 sesiones por día** para la psicóloga (configurable en su perfil, rango: 1–12). El sistema no permite crear más slots de los configurados en un mismo día.

```
WHEN psicologa crea slot en fecha X
AND COUNT(slots en fecha X) >= psicologa.max_daily_sessions
THEN REJECT con mensaje: "Has alcanzado el límite de sesiones para ese día."
```

### AG-08 — Precio por tipo de sesión
La psicóloga define el precio según el tipo: `inicial | seguimiento | evaluacion`. El precio se muestra al paciente antes de confirmar y queda fijo en el registro del pago.

---

## 2. Reglas de Pago (PAY)

### PAY-01 — Ventana de pago de 48 horas
El comprobante debe ser subido dentro de las **48 horas** siguientes a la creación de la cita. Al vencerse el plazo, el cron job cambia el estado a `EXPIRED` automáticamente.

```
WHEN cron job ejecuta
AND appointment.status = 'PENDING_PAYMENT'
AND appointment.created_at < NOW() - INTERVAL '48 hours'
THEN SET appointment.status = 'EXPIRED'
AND SET slot.is_available = true
```

### PAY-02 — Formatos y tamaño del comprobante
El comprobante debe cumplir:
- **Formatos aceptados:** JPG, JPEG, PNG, PDF
- **Tamaño máximo:** 5 MB
- **Validación en cliente** (feedback inmediato) y **en servidor** (seguridad)

```
WHEN paciente sube archivo
AND (file.size > 5_000_000 OR file.type NOT IN ['image/jpeg', 'image/png', 'application/pdf'])
THEN REJECT con mensaje descriptivo del error
```

### PAY-03 — Validación manual del comprobante
El sistema **no valida automáticamente** el monto ni la autenticidad del comprobante. La validación es responsabilidad de la psicóloga. Esta decisión es intencional para la fase MVP y puede automatizarse en fases posteriores con la API de Nequi.

### PAY-04 — Límite de 3 intentos por cita
Un comprobante rechazado puede ser reemplazado por uno nuevo. El límite es **3 intentos por cita**.

```
WHEN paciente intenta subir nuevo comprobante
AND payment.attempt_count >= 3
THEN REJECT con mensaje: "Has superado el límite de intentos. Contacta a la psicóloga directamente."
AND SET appointment.status = 'CANCELLED'
```

### PAY-05 — Creación atómica del evento de Meet al aprobar
Al aprobar el pago, las siguientes acciones se ejecutan de forma atómica (transacción). Si cualquiera falla, **ninguna** se confirma:
1. Actualizar `payments.status = 'approved'`
2. Actualizar `appointments.status = 'CONFIRMED'`
3. Crear evento en Google Calendar
4. Obtener link de Google Meet
5. Guardar `meet_link` y `calendar_event_id` en `appointments`
6. Encolar notificaciones

### PAY-06 — Sin reembolsos automáticos
No existe procesamiento automático de devoluciones. Los acuerdos de cancelación y reembolso son negociados directamente entre la psicóloga y el paciente. La psicóloga define su política de reembolsos en su perfil público.

### PAY-07 — Inmutabilidad del historial de pagos
Los registros en la tabla `payments` son inmutables. No se pueden eliminar ni editar retroactivamente. Se pueden marcar como `inactive` para propósitos de auditoría, pero el registro original persiste.

### PAY-08 — Precio fijo al confirmar la cita
El precio mostrado al paciente en el momento de seleccionar el slot queda registrado en `payments.amount_expected`. Si la psicóloga modifica sus precios posteriormente, las citas ya creadas no se ven afectadas.

---

## 3. Reglas de Cancelación (CANCEL)

### CANCEL-01 — Cancelación con más de 24 horas
Cancelar con más de 24 horas de antelación no genera penalización. El slot queda disponible automáticamente.

```
WHEN cancelación solicitada
AND appointment.start_at > NOW() + INTERVAL '24 hours'
THEN sin cargo | slot liberado | estado CANCELLED
```

### CANCEL-02 — Cancelación con menos de 24 horas
La psicóloga define en su configuración si aplica cobro por cancelaciones tardías. El sistema registra el evento, pero el cobro (si aplica) es un acuerdo manual.

### CANCEL-03 — Cancelación por la psicóloga con pago aprobado
Si la psicóloga cancela una cita que ya fue pagada y aprobada, debe ingresar un motivo obligatorio (mínimo 20 caracteres). El paciente recibe notificación inmediata con el motivo y la indicación de contactar a la psicóloga para reprogramar.

### CANCEL-04 — Bandera de ausentismo reiterado
Tres (3) ausencias del paciente sin aviso previo activan una bandera visible `⚠️ Ausentismo reiterado` en la ficha del paciente dentro del dashboard de la psicóloga.

```
WHEN appointment.status = 'DONE' AND appointment.no_show = true
AND COUNT(no_show = true WHERE patient_id = X) >= 3
THEN SET patient.absence_flag = true
```

### CANCEL-05 — No-show del paciente
Si el paciente no se conecta a Google Meet dentro de los primeros **15 minutos** de la sesión, la psicóloga puede:
- Marcar como `DONE` (sesión cobrada, aunque no se realizó)
- Marcar como `CANCELLED` con `no_show = true`

La plataforma no verifica automáticamente la conexión al Meet (no tiene acceso a ese dato de Google).

---

## 4. Reglas de Privacidad y Seguridad (SEC)

### SEC-01 — Cifrado de notas clínicas en el cliente
Las notas clínicas se cifran con **AES-256** en el navegador de la psicóloga **antes** de ser enviadas al servidor. El servidor almacena solo el texto cifrado. La clave de cifrado se deriva de las credenciales de la psicóloga y no se almacena en el servidor.

```
BEFORE saving session_note:
  ciphertext = AES256.encrypt(plaintext, key_derived_from(psicologa.id + secret_pepper))
  STORE ciphertext (not plaintext)
```

### SEC-02 — Acceso exclusivo a notas clínicas
Ningún administrador, soporte técnico ni otro usuario tiene acceso a las notas clínicas de la psicóloga. Esta restricción es técnica (cifrado en cliente), no solo de política.

### SEC-03 — Comprobantes de pago: acceso restringido
Los comprobantes almacenados en Supabase Storage están en un **bucket privado**. Solo pueden accederse mediante URLs firmadas temporales (`signed URLs`) generadas por el servidor, y únicamente cuando:
- La psicóloga dueña del appointment solicita verlo
- El paciente dueño del pago solicita verlo

### SEC-04 — Row Level Security en todas las tablas
Supabase RLS está activado en **todas** las tablas. Las políticas garantizan que cada query retorne únicamente los datos del usuario autenticado.

```sql
-- Ejemplo: pacientes solo ven sus propias citas
CREATE POLICY "patient_own_appointments" ON appointments
FOR SELECT USING (patient_id = auth.uid());

-- Psicóloga ve todas las citas de sus pacientes
CREATE POLICY "psicologa_own_patients_appointments" ON appointments
FOR SELECT USING (psicologa_id = auth.uid());
```

### SEC-05 — Cumplimiento Ley 1581/2012 (Habeas Data Colombia)
- Consentimiento informado explícito en el registro con versión y timestamp
- Política de privacidad visible y aceptada antes de usar la plataforma
- El paciente puede solicitar exportación de sus datos en cualquier momento
- El paciente puede solicitar eliminación de su cuenta y todos sus datos
- Datos sensibles (motivo de consulta, notas) tienen protección reforzada

### SEC-06 — Derecho al olvido
Cuando un paciente solicita eliminación de cuenta:
1. Se anonimiza `profiles` (nombre → "Usuario eliminado", email → hash)
2. Se eliminan físicamente `session_notes` del paciente (ya están cifradas)
3. Se eliminan comprobantes de pago de Storage
4. Se mantienen registros mínimos de `appointments` por obligación contable (sin datos personales)

### SEC-07 — Links de Meet de un solo uso por sesión
Cada sesión tiene su propio link de Google Meet único generado al momento de la aprobación. Los links no se reutilizan entre sesiones.

### SEC-08 — Autenticación exclusivamente vía Google OAuth
No se almacenan contraseñas en la plataforma. La autenticación es delegada completamente a Google (NextAuth.js + Google OAuth 2.0). Esto elimina los riesgos de:
- Contraseñas débiles
- Brechas de contraseñas
- Ataques de fuerza bruta

### SEC-09 — HTTPS obligatorio y headers de seguridad
Vercel provee HTTPS automáticamente. Adicionalmente se configuran:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=()
Content-Security-Policy: [restricción de fuentes externas]
```

---

## 5. Reglas de Acceso y Roles (ACC)

### ACC-01 — Dos roles del sistema
El sistema tiene exactamente dos roles: `psicologa` y `paciente`. Un usuario no puede tener ambos roles simultáneamente.

| Permiso | Paciente | Psicóloga |
|---------|----------|-----------|
| Ver disponibilidad | ✅ | ✅ |
| Crear cita | ✅ | ❌ |
| Subir comprobante | ✅ | ❌ |
| Aprobar/rechazar pago | ❌ | ✅ |
| Ver notas clínicas propias | ❌ | ✅ |
| Crear/editar slots | ❌ | ✅ |
| Ver métricas del negocio | ❌ | ✅ |
| Ver historial propio | ✅ | ✅ |
| Eliminar cuenta propia | ✅ | ✅ |

### ACC-02 — Perfil público de la psicóloga
Existe una página pública (`/psicologa/[slug]`) visible **sin autenticación** con: nombre, especialidades, presentación, precios de referencia, y botón de "Agendar cita" (que requiere login). No se muestra información personal ni clínica.

### ACC-03 — Rutas protegidas
Todas las rutas bajo `(dashboard)` requieren sesión activa. El middleware de Next.js redirige a `/login` si no hay sesión. Las rutas de psicóloga requieren además `role = 'psicologa'`.

---

## 6. Reglas de Notificaciones (NOTIF)

### NOTIF-01 — Eventos que generan notificación obligatoria

| Evento | Notifica a | Canal |
|--------|------------|-------|
| Cita creada | Psicóloga | Email + Push |
| Comprobante subido | Psicóloga | Email + Push |
| Cita aprobada | Paciente | Email + Push |
| Cita rechazada | Paciente | Email + Push |
| Recordatorio 24h antes | Ambos | Email + Push |
| Recordatorio 1h antes | Ambos | Push |
| Cita cancelada | Contraparte | Email + Push |
| Cita expirada | Paciente | Email |
| Resumen semanal | Psicóloga | Email |

### NOTIF-02 — Sin spam de notificaciones
Si una cita genera múltiples cambios de estado en menos de 5 minutos (ej. rechazo inmediato y nuevo intento), se agrupa en una sola notificación.

### NOTIF-03 — Preferencias de notificación
El paciente puede desactivar notificaciones push desde su perfil. Las notificaciones por email de confirmación/cancelación **no son desactivables** (son críticas para el servicio).

---

## 7. Reglas de Datos Clínicos (CLIN)

### CLIN-01 — Separación de datos clínicos y administrativos
Las notas clínicas (`session_notes`) están en una tabla separada de los datos administrativos (`appointments`, `payments`). Esto facilita aplicar controles de acceso diferenciados.

### CLIN-02 — Notas clínicas son privadas por defecto
Las notas en `session_notes` son visibles **solo** para la psicóloga. El sistema no tiene ninguna interfaz ni endpoint que exponga estas notas a los pacientes u otros usuarios.

### CLIN-03 — Resumen para el paciente es distinto a las notas clínicas
Cuando la psicóloga envía un resumen al paciente, este se guarda en `session_summaries` (tabla separada, sin cifrar del mismo modo). El paciente solo ve los contenidos de `session_summaries`, nunca de `session_notes`.

### CLIN-04 — Consentimiento informado versionado
El formulario de consentimiento tiene un número de versión. Si la psicóloga actualiza sus términos de consentimiento, los pacientes que ya consintieron con la versión anterior deben aceptar la nueva versión en su próximo login.

---

## 8. Invariantes del Sistema

Las siguientes condiciones deben ser verdaderas **en todo momento**. Si alguna se viola, es un bug crítico:

```
INV-01: Todo appointment tiene exactamente un payment asociado
INV-02: Un slot en estado 'tomado' tiene exactamente una cita activa asociada
INV-03: No existen dos citas CONFIRMED para el mismo slot
INV-04: Toda cita CONFIRMED tiene meet_link y calendar_event_id no nulos
INV-05: Toda session_note tiene un session_id válido y el texto almacenado está cifrado (no en texto plano)
INV-06: Todo usuario autenticado tiene exactamente un perfil en la tabla profiles
INV-07: El role de un usuario no cambia después de ser asignado en el onboarding
INV-08: No existen citas en estado PENDING_PAYMENT con created_at > 48 horas (el cron las expira)
```

---

*Documento generado para el proyecto PsicoConnect — Versión 1.0*
