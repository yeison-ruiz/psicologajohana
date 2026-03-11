---
description: Plataforma digital para consulta psicológica | Stack gratuito · Google Meet · Nequi
---

# 🔄 PsicoConnect — Workflows

> Plataforma digital para consulta psicológica | Stack gratuito · Google Meet · Nequi

---

## Índice

1. [Flujo Principal: Del Registro a la Sesión](#1-flujo-principal-del-registro-a-la-sesión)
2. [Fase 1 — Registro y Onboarding](#fase-1--registro-y-onboarding)
3. [Fase 2 — Agendamiento](#fase-2--agendamiento)
4. [Fase 3 — Pago por Nequi](#fase-3--pago-por-nequi)
5. [Fase 4 — Aprobación por Psicóloga](#fase-4--aprobación-por-psicóloga)
6. [Fase 5 — La Sesión](#fase-5--la-sesión)
7. [Máquina de Estados — Cita](#7-máquina-de-estados--cita)
8. [Flujos Secundarios](#8-flujos-secundarios)

---

## 1. Flujo Principal: Del Registro a la Sesión

```
[Paciente] ──registro──► [Perfil creado] ──agenda──► [Slot seleccionado]
                                                              │
                                                     [Cita: PENDING_PAYMENT]
                                                              │
                                                   [Pago por Nequi + Comprobante]
                                                              │
                                                     [Cita: PENDING_APPROVAL]
                                                              │
                                                    [Psicóloga revisa comprobante]
                                                         ┌────┴────┐
                                                      Aprueba    Rechaza
                                                         │          │
                                              [CONFIRMED]      [REJECTED]
                                                   │            (paciente reintenta)
                                         [Google Meet creado]
                                                   │
                                         [Recordatorios 24h/1h]
                                                   │
                                            [Sesión activa]
                                                   │
                                             [Notas clínicas]
                                                   │
                                               [DONE ✓]
```

---

## Fase 1 — Registro y Onboarding

**Actores:** Paciente, Sistema  
**Estado inicial:** Anónimo  
**Estado final:** Perfil creado y confirmado

| #   | Paso                       | Descripción                                                                                        | Actor    | Disparador                |
| --- | -------------------------- | -------------------------------------------------------------------------------------------------- | -------- | ------------------------- |
| 1   | **Acceso a la plataforma** | El paciente recibe enlace o busca la URL directa de la psicóloga                                   | Paciente | Externo                   |
| 2   | **Registro con Google**    | Click en "Continuar con Google". Se crea perfil automáticamente vía NextAuth + Google OAuth        | Paciente | OAuth callback            |
| 3   | **Completar perfil**       | Nombre completo, fecha de nacimiento, motivo de consulta, aceptación de consentimiento HABEAS DATA | Paciente | Primer login              |
| 4   | **Email de bienvenida**    | Resend envía email con instrucciones para agendar la primera cita                                  | Sistema  | Evento: `profile_created` |

**Postcondiciones:**

- Registro en tabla `profiles` con `role = 'paciente'`
- Registro en tabla `patients` con datos clínicos básicos
- Consentimiento guardado con timestamp y versión del documento

---

## Fase 2 — Agendamiento

**Actores:** Paciente, Sistema  
**Precondición:** Paciente autenticado con perfil completo  
**Estado inicial:** Sin cita  
**Estado final:** Cita en estado `PENDING_PAYMENT`

| #   | Paso                         | Descripción                                                                                 | Actor    | Disparador                    |
| --- | ---------------------------- | ------------------------------------------------------------------------------------------- | -------- | ----------------------------- |
| 5   | **Ver disponibilidad**       | Calendario visual con slots habilitados por la psicóloga. Verde = libre, Gris = ocupado     | Paciente | Dashboard paciente            |
| 6   | **Seleccionar horario**      | Click en slot disponible. Se muestra resumen: fecha, hora, duración, costo de la sesión     | Paciente | Click en slot                 |
| 7   | **Confirmar solicitud**      | Paciente confirma la cita. Se crea registro en `appointments` con estado `PENDING_PAYMENT`  | Paciente | Botón "Confirmar"             |
| 8   | **Instrucciones de pago**    | Sistema muestra: número Nequi de la psicóloga, monto exacto, y botón para subir comprobante | Sistema  | Appointment creado            |
| 9   | **Notificación a psicóloga** | Email + push: _"Nueva solicitud de cita de [Nombre] para [Fecha]"_                          | Sistema  | Evento: `appointment_created` |

**Postcondiciones:**

- Slot marcado como no disponible en el calendario público
- Registro en `payments` con `status = 'awaiting_proof'`
- Timer de 48h iniciado para expiración automática

---

## Fase 3 — Pago por Nequi

**Actores:** Paciente, Sistema  
**Precondición:** Cita en estado `PENDING_PAYMENT`  
**Estado inicial:** `PENDING_PAYMENT`  
**Estado final:** `PENDING_APPROVAL`

| #   | Paso                        | Descripción                                                                                              | Actor    | Disparador                 |
| --- | --------------------------- | -------------------------------------------------------------------------------------------------------- | -------- | -------------------------- |
| 10  | **Pago por Nequi**          | Paciente abre su app Nequi, transfiere al número registrado de la psicóloga con el monto indicado        | Paciente | Manual (app Nequi)         |
| 11  | **Captura del comprobante** | Paciente toma screenshot del recibo Nequi mostrando: número de transacción, monto, fecha y destinatario  | Paciente | Post-pago                  |
| 12  | **Subida del comprobante**  | Drag & drop o selección de archivo. Validaciones: formato JPG/PNG/PDF, tamaño máx 5 MB, fecha reciente   | Paciente | Upload form                |
| 13  | **Almacenamiento seguro**   | Imagen guardada en Supabase Storage bucket privado. Nombre del archivo: `{payment_id}_{timestamp}.{ext}` | Sistema  | Post-upload exitoso        |
| 14  | **Cambio de estado**        | Appointment pasa a `PENDING_APPROVAL`. Payment record actualizado con URL del comprobante                | Sistema  | Upload exitoso             |
| 15  | **Alerta a psicóloga**      | Email + push: _"Pago recibido de [Nombre], monto $[X]. Requiere tu aprobación"_                          | Sistema  | Evento: `payment_uploaded` |

**Validaciones en paso 12:**

- ✅ Formato: JPG, PNG, PDF
- ✅ Tamaño: máximo 5 MB
- ✅ La cita asociada debe estar en estado `PENDING_PAYMENT`
- ✅ No superar el límite de 3 intentos por cita (ver Rules)
- ❌ Si falla cualquier validación → mostrar error descriptivo, no cambiar estado

---

## Fase 4 — Aprobación por Psicóloga

**Actores:** Psicóloga, Sistema  
**Precondición:** Cita en estado `PENDING_APPROVAL`  
**Estado inicial:** `PENDING_APPROVAL`  
**Estado final:** `CONFIRMED` o `REJECTED`

| #   | Paso                            | Descripción                                                                                                                         | Actor     | Disparador                                              |
| --- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------- |
| 16  | **Dashboard pendientes**        | Psicóloga ve lista de pagos pendientes con: foto del comprobante en miniatura, nombre paciente, monto esperado, tiempo transcurrido | Psicóloga | Login dashboard                                         |
| 17  | **Revisión comprobante**        | Psicóloga abre imagen del comprobante en modal a pantalla completa con zoom para verificar datos                                    | Psicóloga | Click en pendiente                                      |
| 18  | **Aprobar cita**                | Click en "Aprobar". El sistema: crea link Google Meet, crea evento en Google Calendar, actualiza estado a `CONFIRMED`               | Psicóloga | Botón "Aprobar"                                         |
| 19  | **Rechazar cita**               | Click en "Rechazar". Psicóloga escribe motivo obligatorio (pago insuficiente, imagen ilegible, monto incorrecto, etc.)              | Psicóloga | Botón "Rechazar"                                        |
| 20  | **Notificación de resultado**   | Si aprobado: email + push con link de Meet y fecha. Si rechazado: email + push con motivo y opción de reintentar                    | Sistema   | Evento: `appointment_approved` / `appointment_rejected` |
| 21  | **Recordatorio automático 24h** | Email + push a paciente y psicóloga: datos de la sesión y link directo a Google Meet                                                | Sistema   | Cron job — 24h antes                                    |
| 22  | **Recordatorio automático 1h**  | Push notification: _"Tu sesión comienza en 1 hora"_ con link de Meet                                                                | Sistema   | Cron job — 1h antes                                     |

**Al aprobar (paso 18) — acciones atómicas del sistema:**

1. `POST /api/google/calendar` → crea evento con ambos emails como participantes
2. `POST /api/google/meet` → genera link de Meet único para esa sesión
3. `UPDATE appointments SET status = 'CONFIRMED', meet_link = '...', calendar_event_id = '...'`
4. `UPDATE payments SET status = 'approved'`
5. `INSERT INTO sessions (appointment_id, meet_link)`
6. `ENQUEUE notification email/push`

---

## Fase 5 — La Sesión

**Actores:** Psicóloga, Paciente, Sistema  
**Precondición:** Cita en estado `CONFIRMED`, hora de inicio alcanzada  
**Estado inicial:** `CONFIRMED`  
**Estado final:** `DONE`

| #   | Paso                            | Descripción                                                                                                                            | Actor     | Disparador              |
| --- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------------------- |
| 23  | **Acceso a la sala**            | Ambas partes hacen click en el link de Google Meet desde la plataforma o desde el email de confirmación                                | Ambos     | Hora de sesión          |
| 24  | **Sesión en Google Meet**       | Videoconferencia normal. La plataforma no interfiere con la llamada; Google Meet es totalmente externo                                 | Ambos     | Manual                  |
| 25  | **Marcar sesión completada**    | Psicóloga hace click en "Sesión completada" en su dashboard post-sesión                                                                | Psicóloga | Post-sesión             |
| 26  | **Notas clínicas privadas**     | Psicóloga escribe notas en editor de texto. Se cifran con AES-256 en el browser antes de enviarse al servidor. Solo ella puede leerlas | Psicóloga | Post-sesión             |
| 27  | **Resumen para el paciente**    | Psicóloga puede enviar un resumen NO clínico al paciente: indicaciones, tareas terapéuticas, próximos pasos                            | Psicóloga | Opcional                |
| 28  | **Cierre automático del ciclo** | Appointment pasa a `DONE`. Slot liberado si aplica para reutilización. Métricas actualizadas                                           | Sistema   | Paso 25 / Cron fallback |

**Fallback automático (paso 28):**  
Si la psicóloga no marca la sesión como completada, el cron job que corre cada 30 minutos detecta citas `CONFIRMED` cuya hora de fin ya pasó y las cierra automáticamente con `auto_closed = true`.

---

## 7. Máquina de Estados — Cita

```
                    ┌─────────────────────────────────────────────────┐
                    │                                                  │
              [Paciente agenda]                                        │
                    │                                                  │
            ┌───────▼────────┐                                        │
            │ PENDING_PAYMENT │ ◄─── Reintento de pago ──────────┐   │
            └───────┬────────┘                                    │   │
                    │ Sube comprobante                             │   │
            ┌───────▼────────┐         ┌──────────┐              │   │
            │PENDING_APPROVAL│──rechaza─► REJECTED │──────────────┘   │
            └───────┬────────┘         └──────────┘                   │
                    │ Aprueba                                          │
            ┌───────▼────────┐                                        │
            │   CONFIRMED    │──cancelación──────────────────────────►│
            └───────┬────────┘                                 ┌──────▼──────┐
                    │ Hora llegó                                │  CANCELLED  │
            ┌───────▼────────┐                                 └─────────────┘
            │  IN_PROGRESS   │
            └───────┬────────┘
                    │ Marca completada
            ┌───────▼────────┐                ┌──────────┐
            │      DONE      │                │ EXPIRED  │
            └────────────────┘                └──────────┘
                                              (48h sin comprobante → cron job)
```
