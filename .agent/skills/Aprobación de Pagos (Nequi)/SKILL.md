---
description: Flujo completo de pagos por Nequi en PsicoConnect. Usar cuando se trabaje en la subida de comprobantes por parte del paciente, el panel de revisión de la psicóloga, la aprobación o rechazo de pagos, o la creación automática del link de Google Meet al aprobar.
---

Skill: Aprobación de Pagos (Nequi)
Este skill cubre el ciclo completo del pago: desde que el paciente sube el comprobante hasta que la psicóloga lo aprueba o rechaza, incluyendo las acciones atómicas que se ejecutan al aprobar.
Cuándo usar este skill

Cuando se implemente el upload de comprobantes (paciente)
Cuando se construya el panel de pagos pendientes (psicóloga)
Cuando se implemente la lógica de aprobar/rechazar con sus efectos secundarios
Cuando se trabaje en la expiración automática de citas sin pago (48h)
Cuando se gestione el almacenamiento seguro de comprobantes en Supabase Storage

Modelo de datos
typescript// Tabla: payments
{
id: uuid
appointment_id: uuid // FK → appointments
amount_expected: numeric // precio fijo al momento de crear la cita
amount_declared: numeric // monto que el paciente dice haber pagado
proof_url: string | null // URL en Supabase Storage (bucket privado)
status: 'awaiting_proof' | 'pending_approval' | 'approved' | 'rejected' | 'inactive'
attempt_count: number // máximo 3 (PAY-04)
rejection_reason: string | null
approved_at: timestamptz | null
approved_by: uuid | null // FK → profiles (psicologa)
created_at: timestamptz
}
Flujo de estados del pago
awaiting_proof
│ (paciente sube comprobante)
pending_approval
├── approved → (psicóloga aprueba) → dispara Meet + Calendar + notificaciones
└── rejected → (psicóloga rechaza con motivo) → paciente puede reintentar
Upload de comprobante (paciente)
typescript// Server Action: uploadPaymentProof
async function uploadPaymentProof(appointmentId: string, file: File) {
// 1. Validaciones (también hacer en cliente para UX)
if (file.size > 5_000_000) throw new Error('Archivo muy grande (máx 5MB)')
if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type))
throw new Error('Formato no válido (JPG, PNG o PDF)')

// 2. Verificar que la cita le pertenece y está en PENDING_PAYMENT
const appointment = await getAppointment(appointmentId)
if (appointment.status !== 'PENDING_PAYMENT') throw new Error('Estado inválido')

// 3. Verificar intentos restantes
const payment = await getPaymentByAppointment(appointmentId)
if (payment.attempt_count >= 3) throw new Error('Límite de intentos superado')

// 4. Subir a Supabase Storage (bucket privado)
const path = `comprobantes/${payment.id}_${Date.now()}.${ext}`
await supabase.storage.from('comprobantes').upload(path, file)

// 5. Actualizar BD (atómico)
await supabase.rpc('submit_payment_proof', {
p_appointment_id: appointmentId,
p_proof_url: path,
p_amount_declared: amountDeclared
})
// La función RPC actualiza payments + appointments.status en una transacción

// 6. Notificar a la psicóloga
await enqueueNotification('payment_uploaded', psicologaId, { appointmentId })
}
Aprobación de pago (psicóloga) — Acción atómica
Al aprobar, todas las siguientes acciones ocurren en una sola transacción. Si una falla, ninguna se confirma:
typescriptasync function approvePayment(paymentId: string) {
// Ejecutar vía Supabase RPC para garantizar atomicidad
await supabase.rpc('approve_payment', { p_payment_id: paymentId })
/_
La función RPC hace en orden: 1. UPDATE payments SET status = 'approved', approved_at = now(), approved_by = auth.uid() 2. UPDATE appointments SET status = 'CONFIRMED' 3. Llama a Edge Function: create_google_meet(appointment_id)
→ Guarda meet_link y calendar_event_id en appointments 4. INSERT INTO notifications (para paciente: email + push)
_/
}
Rechazo de pago
typescriptasync function rejectPayment(paymentId: string, reason: string) {
if (reason.length < 10) throw new Error('El motivo debe tener al menos 10 caracteres')

await supabase.rpc('reject_payment', {
p_payment_id: paymentId,
p_reason: reason
})
// RPC: UPDATE payments SET status='rejected', rejection_reason=reason
// UPDATE appointments SET status='REJECTED'
// INSERT INTO notifications (para paciente: motivo + opción de reintentar)
}
Acceso a comprobantes (signed URLs)
Los comprobantes están en un bucket privado. Para mostrarlos, generar URL firmada temporal:
typescriptasync function getProofSignedUrl(proofPath: string): Promise<string> {
const { data } = await supabase.storage
.from('comprobantes')
.createSignedUrl(proofPath, 3600) // 1 hora de validez
return data.signedUrl
}
Panel de pagos pendientes (psicóloga)
typescript// Query para el panel
const pendingPayments = await supabase
.from('payments')
.select(`     id, amount_expected, amount_declared, proof_url, created_at, attempt_count,
    appointments(id, start_at, status,
      patients(id, profiles(full_name, avatar_url))
    )
  `)
.eq('status', 'pending_approval')
.eq('appointments.psicologa_id', psicologaId)
.order('created_at', { ascending: true }) // más antiguos primero
Componentes de UI
PendingPaymentsList
├── PaymentCard
│ ├── PatientAvatar + Nombre
│ ├── ProofThumbnail (imagen pequeña, click → modal)
│ ├── AmountExpected vs AmountDeclared
│ ├── WaitingTime (tiempo desde que se subió)
│ └── QuickActions: [Aprobar] [Rechazar]
│
└── PaymentDetailModal
├── ProofImage (pantalla completa, zoomable)
├── AppointmentInfo (fecha, hora, tipo)
├── PatientInfo
└── ActionPanel
├── ApproveButton (verde, prominente)
└── RejectFlow
├── ReasonInput (texto libre)
└── ReasonChips: ['Monto incorrecto', 'Imagen ilegible', 'Pago no encontrado', 'Otro']
Reglas a respetar

PAY-01: Expirar cita si han pasado 48h sin comprobante (cron job, no en este skill)
PAY-02: Validar formato y tamaño en cliente (UX) Y en servidor (seguridad)
PAY-03: NO validar automáticamente el monto — la validación es manual por la psicóloga
PAY-04: Máximo 3 intentos. Al tercer rechazo → cita pasa a CANCELLED automáticamente
PAY-07: Registros en payments son inmutables. Nunca hacer DELETE, solo marcar inactive
PAY-08: El amount_expected se fija al crear la cita y no cambia aunque la psicóloga modifique precios

Bucket de Storage (configuración Supabase)
sql-- Bucket privado para comprobantes
INSERT INTO storage.buckets (id, name, public) VALUES ('comprobantes', 'comprobantes', false);

-- Solo la psicóloga dueña y el paciente dueño pueden ver el archivo
CREATE POLICY "owner_access" ON storage.objects
FOR SELECT USING (
bucket_id = 'comprobantes' AND (
auth.uid() = (SELECT psicologa_id FROM appointments a
JOIN payments p ON p.appointment_id = a.id
WHERE p.proof_url = name)
OR
auth.uid() = (SELECT patient_id FROM appointments a
JOIN payments p ON p.appointment_id = a.id
WHERE p.proof_url = name)
)
);
