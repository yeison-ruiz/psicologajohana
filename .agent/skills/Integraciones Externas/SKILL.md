---
description: Integraciones externas de PsicoConnect con Google Meet, Google Calendar, Resend para emails y Supabase Realtime. Usar cuando se trabaje en la creación automática de links de Google Meet al aprobar pagos, envío de emails transaccionales, notificaciones en tiempo real, o cualquier comunicación con APIs de terceros.
---

Skill: Integraciones Externas
Este skill cubre todas las integraciones con servicios externos: Google APIs, Resend y Supabase Realtime.
Cuándo usar este skill

Cuando se configure la integración con Google Calendar / Meet
Cuando se implementen emails transaccionales con Resend
Cuando se trabaje con Supabase Realtime para actualizaciones en vivo
Cuando se configuren los tokens OAuth de Google
Cuando se construyan templates de email con React Email

INT-01: Google Meet (vía Google Calendar API)
Cómo funciona
PsicoConnect NO usa una API directa de Google Meet. En cambio, crea un evento de Google Calendar con videoconferencia habilitada, lo cual genera automáticamente un link de Meet.
Configuración en Google Cloud Console

1. Ir a console.cloud.google.com
2. Crear proyecto "PsicoConnect"
3. Habilitar: Google Calendar API
4. Crear credenciales OAuth 2.0 (tipo: Web Application)
5. Authorized redirect URIs: https://tu-dominio.com/api/auth/callback/google
6. Scopes necesarios:
   - https://www.googleapis.com/auth/calendar.events
   - https://www.googleapis.com/auth/userinfo.email
     Variables de entorno
     envGOOGLE_CLIENT_ID=<from-cloud-console>
     GOOGLE_CLIENT_SECRET=<from-cloud-console>
     NEXTAUTH_SECRET=<random-32-chars>
     NEXTAUTH_URL=https://tu-dominio.com
     NextAuth config para Google
     typescript// app/api/auth/[...nextauth]/route.ts
     import NextAuth from 'next-auth'
     import GoogleProvider from 'next-auth/providers/google'

export const { handlers, auth } = NextAuth({
providers: [
GoogleProvider({
clientId: process.env.GOOGLE_CLIENT_ID!,
clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
authorization: {
params: {
scope: 'openid email profile https://www.googleapis.com/auth/calendar.events',
access_type: 'offline', // necesario para refresh token
prompt: 'consent'
}
}
})
],
callbacks: {
async jwt({ token, account }) {
// Guardar access_token y refresh_token en el JWT
if (account) {
token.access_token = account.access_token
token.refresh_token = account.refresh_token
token.expires_at = account.expires_at
}
return token
},
async session({ session, token }) {
session.access_token = token.access_token
return session
}
}
})
Crear evento de Meet al aprobar pago
typescript// lib/google/calendar.ts
import { google } from 'googleapis'

export async function createMeetSession(appointment: {
start_at: Date
duration_minutes: number
patient_email: string
psicologa_email: string
psicologa_access_token: string
}) {
const auth = new google.auth.OAuth2()
auth.setCredentials({ access_token: appointment.psicologa_access_token })

const calendar = google.calendar({ version: 'v3', auth })

const event = await calendar.events.insert({
calendarId: 'primary',
conferenceDataVersion: 1, // requerido para que genere Meet
requestBody: {
summary: 'Sesión de psicología — PsicoConnect',
start: {
dateTime: appointment.start_at.toISOString(),
timeZone: 'America/Bogota'
},
end: {
dateTime: addMinutes(appointment.start_at, appointment.duration_minutes).toISOString(),
timeZone: 'America/Bogota'
},
attendees: [
{ email: appointment.patient_email },
{ email: appointment.psicologa_email }
],
conferenceData: {
createRequest: {
requestId: `psicoconnect-${Date.now()}`, // debe ser único
conferenceSolutionKey: { type: 'hangoutsMeet' }
}
},
reminders: {
useDefault: false,
overrides: [
{ method: 'email', minutes: 1440 }, // 24h antes
{ method: 'popup', minutes: 60 } // 1h antes
]
}
}
})

return {
meet_link: event.data.hangoutLink!, // https://meet.google.com/xxx-xxxx-xxx
calendar_event_id: event.data.id!,
html_link: event.data.htmlLink!
}
}
Refresh automático de token
typescript// lib/google/refresh.ts
export async function refreshGoogleToken(refreshToken: string): Promise<string> {
const oauth2Client = new google.auth.OAuth2(
process.env.GOOGLE_CLIENT_ID,
process.env.GOOGLE_CLIENT_SECRET
)
oauth2Client.setCredentials({ refresh_token: refreshToken })

const { credentials } = await oauth2Client.refreshAccessToken()
return credentials.access_token!
}

Importante: Guardar el refresh_token de la psicóloga en Supabase (cifrado) para poder crear eventos sin que ella esté conectada. El refresh_token solo se obtiene la primera vez con prompt: 'consent'.

INT-02: Emails con Resend
Instalación y configuración
bashnpm install resend @react-email/components
typescript// lib/email/client.ts
import { Resend } from 'resend'
export const resend = new Resend(process.env.RESEND_API_KEY)
Template base con React Email
typescript// emails/base-template.tsx
import { Html, Head, Body, Container, Img, Text, Button, Hr } from '@react-email/components'

interface BaseEmailProps {
previewText: string
children: React.ReactNode
}

export function BaseEmail({ previewText, children }: BaseEmailProps) {
return (
<Html>
<Head />
<Body style={{ backgroundColor: '#f0f4f8', fontFamily: 'Arial, sans-serif' }}>
<Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '8px' }}>
{/_ Header _/}
<div style={{ backgroundColor: '#1A2E44', padding: '24px', borderRadius: '8px 8px 0 0' }}>
<Text style={{ color: '#ffffff', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
🧠 PsicoConnect
</Text>
</div>
{/_ Content _/}
<div style={{ padding: '32px' }}>
{children}
</div>
{/_ Footer _/}
<Hr />
<div style={{ padding: '16px 32px', textAlign: 'center' }}>
<Text style={{ color: '#94A3B8', fontSize: '12px' }}>
© 2025 PsicoConnect · Bogotá, Colombia
</Text>
</div>
</Container>
</Body>
</Html>
)
}
Templates disponibles
typescript// emails/appointment-confirmed.tsx
export function AppointmentConfirmedEmail({ patientName, date, time, meetLink }: Props) {
return (
<BaseEmail previewText="Tu cita fue confirmada ✅">
<Text>Hola {patientName},</Text>
<Text>Tu cita ha sido <strong>confirmada</strong>. Estos son los detalles:</Text>
<div style={{ backgroundColor: '#E8F4FD', padding: '16px', borderRadius: '8px' }}>
<Text>📅 <strong>{date}</strong></Text>
<Text>⏰ <strong>{time}</strong></Text>
</div>
<Button href={meetLink} style={{ backgroundColor: '#4A90D9', color: '#fff', padding: '12px 24px', borderRadius: '6px' }}>
Unirme a Google Meet
</Button>
</BaseEmail>
)
}
Función de envío centralizada
typescript// lib/email/send.ts
import { resend } from './client'
import { render } from '@react-email/render'

type EmailTemplate = 'welcome' | 'appointment_confirmed' | 'appointment_rejected' |
'payment_uploaded' | 'reminder_24h' | 'appointment_cancelled' | 'weekly_report'

export async function sendEmail(
template: EmailTemplate,
to: string,
data: Record<string, unknown>
) {
const { subject, component } = EMAIL_TEMPLATES[template]

try {
await resend.emails.send({
from: 'PsicoConnect <noreply@psicoconnect.app>',
to,
subject: subject(data),
html: render(component(data))
})
} catch (error) {
// Loguear pero no lanzar — el email no debe bloquear la acción principal
console.error(`Email error [${template}]:`, error)
await supabase.from('email_logs').insert({
template, recipient: to, status: 'failed', error: String(error)
})
}
}

INT-03: Supabase Realtime
Suscripciones activas en la app
Paciente — Estado de su cita en tiempo real
typescript// hooks/useAppointmentStatus.ts
export function useAppointmentStatus(appointmentId: string) {
const [status, setStatus] = useState<AppointmentStatus>()

useEffect(() => {
const channel = supabase
.channel(`apt-${appointmentId}`)
.on('postgres_changes', {
event: 'UPDATE',
schema: 'public',
table: 'appointments',
filter: `id=eq.${appointmentId}`
}, (payload) => {
setStatus(payload.new.status)
// Mostrar toast: "¡Tu pago fue aprobado! 🎉"
if (payload.new.status === 'CONFIRMED') {
toast.success('¡Tu pago fue aprobado! Revisa los detalles de tu sesión.')
}
})
.subscribe()

    return () => { supabase.removeChannel(channel) }

}, [appointmentId])

return status
}
Psicóloga — Badge de pagos pendientes en tiempo real
typescript// hooks/usePendingPaymentsCount.ts
export function usePendingPaymentsCount(psicologaId: string) {
const [count, setCount] = useState(0)

useEffect(() => {
// Cargar count inicial
supabase.rpc('get_pending_payments_count', { p_psicologa_id: psicologaId })
.then(({ data }) => setCount(data))

    // Suscribirse a cambios
    const channel = supabase
      .channel('pending-payments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payments',
        filter: `status=eq.pending_approval`
      }, () => {
        // Recargar count cuando hay cambios
        supabase.rpc('get_pending_payments_count', { p_psicologa_id: psicologaId })
          .then(({ data }) => setCount(data))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }

}, [psicologaId])

return count // Mostrar como badge en el menú lateral
}
Habilitar Realtime en Supabase
sql-- Habilitar realtime para las tablas necesarias
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
Variables de entorno completas
env# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Google OAuth

GOOGLE_CLIENT_ID=<client-id>
GOOGLE_CLIENT_SECRET=<client-secret>

# NextAuth

NEXTAUTH_SECRET=<random-32-chars>
NEXTAUTH_URL=https://tu-dominio.com

# Resend

RESEND_API_KEY=re_xxxxxxxxxxxx

# Push Notifications (VAPID)

NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public-key>
VAPID_PRIVATE_KEY=<private-key>
VAPID_EMAIL=mailto:admin@psicoconnect.app

# Cron Security

CRON_SECRET=<random-32-chars>
