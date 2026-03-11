---
description: Cron jobs y procesos automáticos del sistema PsicoConnect. Usar cuando se trabaje en la expiración de citas sin pago, recordatorios automáticos de 24h y 1h, cierre automático de sesiones completadas, limpieza de archivos en Storage, o el reporte semanal para la psicóloga.
---

Skill: Automatización del Sistema (Cron Jobs)
Este skill cubre todos los procesos automáticos que corren sin intervención humana: expiración, recordatorios, cierre de sesiones y mantenimiento.
Cuándo usar este skill

Cuando se implementen los cron jobs de Vercel
Cuando se trabaje en la expiración automática de citas (48h)
Cuando se construyan los recordatorios automáticos de 24h y 1h
Cuando se implemente el cierre automático de sesiones no marcadas
Cuando se trabaje en la limpieza periódica de Storage
Cuando se configure el reporte semanal por email

Configuración de Vercel Cron Jobs
json// vercel.json
{
"crons": [
{
"path": "/api/cron/expire-appointments",
"schedule": "0 * * * *"
},
{
"path": "/api/cron/reminders-24h",
"schedule": "0 13 * * *"
},
{
"path": "/api/cron/reminders-1h",
"schedule": "0 * * * *"
},
{
"path": "/api/cron/close-sessions",
"schedule": "*/30 * * * *"
},
{
"path": "/api/cron/cleanup-storage",
"schedule": "0 7 * * 0"
},
{
"path": "/api/cron/weekly-report",
"schedule": "0 12 * * 1"
}
]
}

Nota de horarios: Vercel usa UTC. Colombia es UTC-5. Ajustar horarios sumando 5h (ej: 8 AM Colombia = 13:00 UTC).

Seguridad de los endpoints de cron
Todos los API routes de cron deben verificar el header de Vercel:
typescript// lib/cron/verify.ts
export function verifyCronRequest(request: Request): boolean {
const authHeader = request.headers.get('authorization')
return authHeader === `Bearer ${process.env.CRON_SECRET}`
}

// En cada API route:
export async function GET(request: Request) {
if (!verifyCronRequest(request)) {
return new Response('Unauthorized', { status: 401 })
}
// ... lógica del cron
}
CRON-01: Expiración de Citas (cada hora)
Ruta: GET /api/cron/expire-appointments
Regla: PAY-01 — 48h sin comprobante → EXPIRED
typescriptexport async function GET(request: Request) {
if (!verifyCronRequest(request)) return new Response('Unauthorized', { status: 401 })

// 1. Encontrar citas expiradas
const { data: expiredAppointments } = await supabase
.from('appointments')
.select('id, slot_id, patient_id')
.eq('status', 'PENDING_PAYMENT')
.lt('created_at', new Date(Date.now() - 48 _ 60 _ 60 \* 1000).toISOString())

if (!expiredAppointments?.length) {
return Response.json({ expired: 0 })
}

// 2. Expirar en lote (transacción via RPC)
await supabase.rpc('expire_appointments_batch', {
p_appointment_ids: expiredAppointments.map(a => a.id)
})
// RPC: UPDATE appointments SET status='EXPIRED'
// UPDATE availability_slots SET is_available=true WHERE id IN slot_ids
// INSERT INTO notifications (email a pacientes)

return Response.json({ expired: expiredAppointments.length })
}
CRON-02: Recordatorio 24 Horas (diario 8 AM Colombia)
Ruta: GET /api/cron/reminders-24h
typescriptexport async function GET(request: Request) {
if (!verifyCronRequest(request)) return new Response('Unauthorized', { status: 401 })

const tomorrow = {
start: startOfDay(addDays(new Date(), 1)),
end: endOfDay(addDays(new Date(), 1))
}

// Buscar citas confirmadas para mañana
const { data: appointments } = await supabase
.from('appointments')
.select(`       id, start_at, meet_link, duration_minutes,
      patients(profiles(full_name, email)),
      psicologas:profiles!psicologa_id(full_name, email)
    `)
.eq('status', 'CONFIRMED')
.gte('start_at', tomorrow.start.toISOString())
.lte('start_at', tomorrow.end.toISOString())

// Enviar emails en batch (Resend)
const emails = appointments.flatMap(apt => [
buildReminderEmail('reminder_24h_patient', apt.patients.profiles, apt),
buildReminderEmail('reminder_24h_psicologa', apt.psicologas, apt)
])

await resend.batch.send(emails)

// También enviar push notifications
for (const apt of appointments) {
await sendPushToUser(apt.patients.id, {
title: 'Recordatorio de sesión',
body: `Mañana tienes sesión a las ${format(apt.start_at, 'HH:mm')}`,
url: `/paciente/mis-citas`
})
}

return Response.json({ reminders_sent: appointments.length \* 2 })
}
CRON-03: Recordatorio 1 Hora (cada hora en punto)
Ruta: GET /api/cron/reminders-1h
typescriptexport async function GET(request: Request) {
if (!verifyCronRequest(request)) return new Response('Unauthorized', { status: 401 })

const in55min = addMinutes(new Date(), 55)
const in65min = addMinutes(new Date(), 65)

const { data: appointments } = await supabase
.from('appointments')
.select('id, start_at, meet_link, patient_id, psicologa_id')
.eq('status', 'CONFIRMED')
.eq('reminder_1h_sent', false) // evitar reenvíos
.gte('start_at', in55min.toISOString())
.lte('start_at', in65min.toISOString())

for (const apt of appointments) {
// Push a paciente
await sendPushToUser(apt.patient_id, {
title: '⏰ Tu sesión comienza en 1 hora',
body: 'Haz click aquí para unirte a Google Meet',
url: apt.meet_link
})
// Push a psicóloga
await sendPushToUser(apt.psicologa_id, {
title: '⏰ Sesión en 1 hora',
body: 'Recuerda que tienes una sesión programada',
url: `/psicologa/agenda`
})
// Marcar como enviado
await supabase.from('appointments')
.update({ reminder_1h_sent: true })
.eq('id', apt.id)
}

return Response.json({ reminders_sent: appointments.length })
}
CRON-04: Cierre Automático de Sesiones (cada 30 min)
Ruta: GET /api/cron/close-sessions
typescriptexport async function GET(request: Request) {
if (!verifyCronRequest(request)) return new Response('Unauthorized', { status: 401 })

// Sesiones CONFIRMED cuya hora de fin pasó hace más de 30 min
const { data: staleSessions } = await supabase
.from('appointments')
.select('id')
.eq('status', 'CONFIRMED')
// start_at + duration_minutes + 30min de margen < ahora
.lt('end_at_computed', new Date(Date.now() - 30 _ 60 _ 1000).toISOString())
// Nota: end_at_computed es una columna generada: start_at + duration_minutes \* interval

if (staleSessions?.length) {
await supabase
.from('appointments')
.update({ status: 'DONE', auto_closed: true })
.in('id', staleSessions.map(s => s.id))
}

return Response.json({ auto_closed: staleSessions?.length ?? 0 })
}
CRON-05: Limpieza de Storage (domingos 2 AM Colombia)
Ruta: GET /api/cron/cleanup-storage
typescriptexport async function GET(request: Request) {
if (!verifyCronRequest(request)) return new Response('Unauthorized', { status: 401 })

const ninetyDaysAgo = subDays(new Date(), 90)

// Pagos huérfanos (citas canceladas/expiradas con más de 90 días)
const { data: oldPayments } = await supabase
.from('payments')
.select('id, proof_url')
.not('proof_url', 'is', null)
.lt('updated_at', ninetyDaysAgo.toISOString())
.in('appointments.status', ['EXPIRED', 'CANCELLED'])

let deleted = 0
for (const payment of oldPayments ?? []) {
await supabase.storage.from('comprobantes').remove([payment.proof_url])
await supabase.from('payments').update({ proof_url: null }).eq('id', payment.id)
deleted++
}

return Response.json({ files_deleted: deleted })
}
CRON-06: Reporte Semanal (lunes 7 AM Colombia)
Ruta: GET /api/cron/weekly-report
typescriptexport async function GET(request: Request) {
if (!verifyCronRequest(request)) return new Response('Unauthorized', { status: 401 })

// Obtener todas las psicólogas activas
const { data: psicologas } = await supabase
.from('profiles')
.select('id, full_name, email')
.eq('role', 'psicologa')
.eq('active', true)

for (const psicologa of psicologas ?? []) {
// Obtener métricas de la semana pasada via Supabase RPC
const stats = await supabase.rpc('get_weekly_stats', {
p_psicologa_id: psicologa.id,
p_week_start: startOfLastWeek(),
p_week_end: endOfLastWeek()
})
// stats: { sessions_done, sessions_cancelled, no_shows, income, new_patients, recurring_patients, occupancy_rate }

    await resend.emails.send({
      from: 'PsicoConnect <noreply@psicoconnect.app>',
      to: psicologa.email,
      subject: `📊 Tu resumen semanal — ${format(startOfLastWeek(), 'dd MMM')} al ${format(endOfLastWeek(), 'dd MMM')}`,
      react: WeeklyReportEmail({ psicologa, stats })
    })

}

return Response.json({ reports_sent: psicologas?.length ?? 0 })
}
Logging de cron jobs
Registrar cada ejecución en una tabla de auditoría:
sqlCREATE TABLE cron_logs (
id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
job_name text NOT NULL,
executed_at timestamptz DEFAULT now(),
records_affected int,
status text, -- 'success' | 'error'
error_message text
);
typescript// Helper para loguear
async function logCronExecution(jobName: string, result: { count: number } | { error: string }) {
await supabase.from('cron_logs').insert({
job_name: jobName,
records_affected: 'count' in result ? result.count : 0,
status: 'error' in result ? 'error' : 'success',
error_message: 'error' in result ? result.error : null
})
}
Variables de entorno requeridas
envCRON_SECRET=<random-secret-32-chars> # Para verificar requests de Vercel
RESEND_API_KEY=<resend-api-key>
VAPID_PRIVATE_KEY=<vapid-private-key>
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<vapid-public-key>
