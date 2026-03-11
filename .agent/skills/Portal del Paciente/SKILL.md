---
description: Portal completo del paciente en PsicoConnect. Usar cuando se trabaje en el agendamiento de citas, visualización del estado de la cita (stepper), subida de comprobante, unirse a sesión de Google Meet, historial de sesiones, notificaciones push, o gestión del perfil personal del paciente.
---

Skill: Portal del Paciente
Este skill cubre todas las pantallas y funcionalidades desde la perspectiva del paciente: agendar, pagar, hacer seguimiento de su cita y acceder a la sesión.
Cuándo usar este skill

Cuando se construya cualquier pantalla del dashboard del paciente
Cuando se implemente el flujo de agendamiento (calendario → slot → confirmación)
Cuando se trabaje en el stepper de estado de la cita
Cuando se implemente el botón "Unirse a sesión" con countdown
Cuando se configuren las notificaciones push (Service Worker)
Cuando se construya el historial de sesiones del paciente

Rutas del portal del paciente
/paciente/ → Dashboard home
/paciente/agendar/ → Paso 1: Calendario
/paciente/agendar/[slotId]/ → Paso 2: Confirmar cita
/paciente/pagar/[appointmentId]/ → Subir comprobante
/paciente/mis-citas/ → Estado de cita activa + historial
/paciente/perfil/ → Datos personales y preferencias
Flujo de agendamiento
Paso 1 — Calendario de disponibilidad
typescript// Query: slots disponibles de la psicóloga
const slots = await supabase
.from('availability_slots')
.select('id, start_at, end_at, duration_minutes, price, session_type')
.eq('psicologa_id', PSICOLOGA_ID)
.eq('is_available', true)
.gte('start_at', addHours(new Date(), 24)) // regla AG-02
.order('start_at')

// Agrupar por día para el calendario mensual
const availableDays = groupBy(slots, slot => format(slot.start_at, 'yyyy-MM-dd'))
UI: Calendario mensual. Días con slots disponibles resaltados en #6BBF9E. Días sin slots en gris. Click en día → lista de horarios de ese día.
Paso 2 — Confirmación
Mostrar card resumen antes de confirmar:
┌─────────────────────────────┐
│ 📅 Martes 15 de abril, 2025 │
│ ⏰ 10:00 AM — 10:50 AM │
│ 🎯 Sesión inicial │
│ 💰 $80.000 COP │
│ 👩‍⚕️ Psicóloga [Nombre] │
└─────────────────────────────┘
[Confirmar cita →]
typescript// Server Action
async function createAppointment(slotId: string) {
// Validar que el paciente no tenga cita activa pendiente (regla AG-01)
const existing = await getActivePendingAppointment(patientId)
if (existing) throw new Error('Ya tienes una cita pendiente')

// Crear cita + payment en transacción
await supabase.rpc('create_appointment', {
p_slot_id: slotId,
p_patient_id: patientId
})
// Redirigir a /paciente/pagar/[appointmentId]
}
Stepper de estado de la cita
Mostrar el estado actual de la cita de forma visual y en lenguaje no técnico:
typescriptconst STEPS = [
{
status: 'PENDING_PAYMENT',
label: 'Cita creada',
description: 'Realiza tu pago por Nequi y sube el comprobante',
icon: '📋',
cta: { label: 'Subir comprobante', href: '/paciente/pagar/[id]' }
},
{
status: 'PENDING_APPROVAL',
label: 'Comprobante enviado',
description: 'La psicóloga revisará tu pago en las próximas 24 horas',
icon: '⏳',
cta: null
},
{
status: 'CONFIRMED',
label: 'Cita confirmada',
description: 'Tu pago fue aprobado. Recibirás recordatorios antes de la sesión',
icon: '✅',
cta: { label: 'Agregar a calendario', action: 'addToCalendar' }
},
{
status: 'DONE',
label: 'Sesión completada',
description: 'Sesión finalizada. ¡Gracias por tu confianza!',
icon: '🎉',
cta: { label: 'Agendar próxima cita', href: '/paciente/agendar' }
}
]
Botón "Unirse a sesión" con countdown
El botón se activa 10 minutos antes de la hora de la sesión:
typescript// Client component
function JoinSessionButton({ sessionStartAt, meetLink }: Props) {
const [timeUntil, setTimeUntil] = useState(differenceInSeconds(sessionStartAt, new Date()))
const isActive = timeUntil <= 600 // 10 minutos = 600 segundos

useEffect(() => {
const interval = setInterval(() => {
setTimeUntil(differenceInSeconds(sessionStartAt, new Date()))
}, 1000)
return () => clearInterval(interval)
}, [sessionStartAt])

if (timeUntil > 1800) return null // No mostrar si faltan más de 30 min

if (timeUntil > 600) return (
<div className="countdown-card">
Tu sesión comienza en {formatCountdown(timeUntil)}
</div>
)

return (
<a href={meetLink} target="_blank" className="join-button pulse-animation">
🟢 Unirme a la sesión ahora
</a>
)
}
Nota importante: El botón abre Google Meet en una nueva pestaña. La plataforma no controla la videollamada.
Notificaciones push (Service Worker)
Configuración inicial
typescript// lib/push/subscribe.ts
export async function subscribeToPush(userId: string) {
const registration = await navigator.serviceWorker.ready
const subscription = await registration.pushManager.subscribe({
userVisibleOnly: true,
applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
})

// Guardar subscription en Supabase
await supabase.from('push_subscriptions').upsert({
user_id: userId,
subscription: JSON.stringify(subscription),
updated_at: new Date()
})
}
Eventos que disparan push al paciente
EventoMensajeappointment_confirmed"✅ Tu cita fue confirmada. Nos vemos el [fecha] a las [hora]"appointment_rejected"❌ Tu comprobante fue rechazado: [motivo]. Puedes reintentar."reminder_24h"📅 Mañana tienes sesión a las [hora]. Link: [meet_url]"reminder_1h"⏰ Tu sesión comienza en 1 hora. ¿Estás listo?"appointment_cancelled"La psicóloga canceló tu cita del [fecha]: [motivo]"
Historial de sesiones
typescript// Query: sesiones pasadas del paciente
const history = await supabase
.from('appointments')
.select(`     id, start_at, status, duration_minutes,
    sessions(id, meet_link,
      session_summaries(content, sent_at)  // resumen enviado por psicóloga
    ),
    payments(id, amount_expected, proof_url, status)
  `)
.eq('patient_id', patientId)
.eq('status', 'DONE')
.order('start_at', { ascending: false })
UI: Lista de cards ordenadas por fecha. Cada card muestra:

Fecha y hora de la sesión
Tipo de sesión
Resumen/indicaciones de la psicóloga (si fue enviado)
Botón "Ver comprobante" (descarga desde Storage con signed URL)

Perfil del paciente
typescript// Server Action: updateProfile
async function updateProfile(data: {
full_name: string
phone: string
push_notifications_enabled: boolean
}) {
await supabase.from('profiles')
.update(data)
.eq('id', userId)
}

// Server Action: requestDataExport
async function requestDataExport() {
// Genera ZIP con JSON de appointments, payments, session_summaries
// Envía por email al paciente
await enqueueJob('data_export', { userId })
}

// Server Action: requestAccountDeletion
async function requestAccountDeletion(confirmText: string) {
if (confirmText !== 'ELIMINAR MI CUENTA') throw new Error('Confirmación incorrecta')
// Proceso de 2 pasos: primero marcar pending_deletion, luego ejecutar en 7 días
await supabase.from('profiles').update({ pending_deletion: true }).eq('id', userId)
await enqueueJob('account_deletion', { userId, executeAt: addDays(new Date(), 7) })
}
Realtime: actualización automática del estado
typescript// Suscribirse a cambios en la cita activa
useEffect(() => {
const channel = supabase
.channel(`appointment-${appointmentId}`)
.on('postgres_changes', {
event: 'UPDATE',
schema: 'public',
table: 'appointments',
filter: `id=eq.${appointmentId}`
}, (payload) => {
setAppointmentStatus(payload.new.status)
// Actualizar stepper automáticamente sin reload
})
.subscribe()

return () => supabase.removeChannel(channel)
}, [appointmentId])
Reglas a respetar

AG-01: Bloquear agendamiento si ya hay cita activa pendiente
AG-02: No mostrar slots con menos de 24h de antelación
PAY-04: Mostrar contador de intentos restantes en el upload ("Intento X de 3")
CANCEL-01: Mostrar botón de cancelar solo si la cita empieza en más de 24h
SEC-04: Aplicar RLS — el paciente solo puede ver SUS citas y SUS pagos
NOTIF-03: Respetar preferencia push_notifications_enabled del perfil

Mobile first
El portal del paciente tiene mayor uso desde móvil. Usar:

Bottom navigation bar en mobile (Home, Mis Citas, Perfil)
Sidebar colapsable en desktop
Botón "Unirse" con tamaño mínimo de 48px para touch
Drag & drop de comprobante con fallback a selector de archivos nativo en móvil
