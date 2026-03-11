---
description: Guía de escalabilidad futura de PsicoConnect. Usar cuando se trabaje en preparar la arquitectura para múltiples psicólogas (multi-tenant), integrar pasarelas de pago automáticas como PSE o Wompi, habilitar feature flags por psicóloga, migrar a app móvil nativa, o implementar historial clínico avanzado. También usar al tomar decisiones de arquitectura que deben ser compatibles con el crecimiento futuro.
---

Skill: Escalabilidad Futura
Este skill define cómo PsicoConnect debe crecer sin reescribir su base. Cada decisión de arquitectura del MVP fue tomada pensando en estas expansiones.
Cuándo usar este skill

Cuando se tomen decisiones de arquitectura que puedan afectar el escalado
Cuando se agregue una segunda psicóloga a la plataforma
Cuando se quiera integrar una pasarela de pago automática
Cuando se habiliten feature flags por psicóloga
Cuando se decida migrar de PWA a app nativa
Cuando se implemente historial clínico avanzado

SCALE-01: Multi-Psicóloga (SaaS)
Qué ya está listo en el MVP
Toda la base de datos tiene psicologa_id en cada tabla relevante. Las políticas de RLS ya filtran por psicóloga. Agregar una segunda psicóloga no requiere cambiar el schema.
sql-- Esto ya existe y funciona para N psicólogas
ALTER TABLE appointments ADD COLUMN psicologa_id uuid REFERENCES profiles(id);
ALTER TABLE availability_slots ADD COLUMN psicologa_id uuid REFERENCES profiles(id);
ALTER TABLE patients ADD COLUMN psicologa_id uuid REFERENCES profiles(id);
Qué falta implementar al escalar
typescript// 1. Sistema de invitaciones
async function invitePsicologa(email: string, invitedBy: string) {
await supabase.from('invitations').insert({
email,
role: 'psicologa',
invited_by: invitedBy,
token: generateSecureToken(),
expires_at: addDays(new Date(), 7)
})
await sendEmail('invitation', email, { inviteUrl: `${BASE_URL}/join?token=...` })
}

// 2. Panel de super-admin
// Ruta: /admin/ (solo accessible con role='admin')
// Capacidades: ver todas las psicólogas, métricas globales, desactivar cuentas

// 3. Billing por psicóloga (cuando se monetice la plataforma)
// Opciones: Stripe subscriptions, cobro porcentual por sesión
Convención multi-tenant a respetar SIEMPRE
typescript// ✅ CORRECTO: siempre filtrar por psicologa_id
const slots = await supabase
.from('availability_slots')
.select('\*')
.eq('psicologa_id', currentPsicologaId) // SIEMPRE incluir esto

// ❌ INCORRECTO: queries globales sin filtro de psicóloga
const slots = await supabase.from('availability_slots').select('\*') // peligroso
SCALE-02: Pasarela de Pago Automática
Interfaz que debe implementarse desde el MVP
typescript// domain/payment-gateway.ts
interface PaymentGateway {
createPaymentLink(amount: number, reference: string, description: string): Promise<string>
verifyPayment(reference: string): Promise<{ verified: boolean; amount: number }>
getTransactionStatus(transactionId: string): Promise<PaymentStatus>
}

// Implementación actual (manual Nequi)
class ManualNequiGateway implements PaymentGateway {
async createPaymentLink() { return 'nequi://...' } // muestra el número
async verifyPayment() { return { verified: false, amount: 0 } } // siempre manual
}

// Implementación futura (automática)
class WompiGateway implements PaymentGateway {
async createPaymentLink(amount, reference, description) {
// Wompi Checkout API
const { data } = await fetch('https://checkout.wompi.co/p/', { ... })
return data.payment_link_url
}
async verifyPayment(reference) {
// Wompi Webhook + verificación de firma
const transaction = await this.getTransaction(reference)
return { verified: transaction.status === 'APPROVED', amount: transaction.amount_in_cents / 100 }
}
}
Opciones de pasarelas para Colombia
PasarelaMétodoComisiónIntegraciónWompiPSE, tarjetas, Nequi2.95% + $900API REST simplePayUPSE, tarjetas3.49% + $900SDK disponibleBoldTarjetas, Nequi2.9%API RESTNequi APINequiPor definirRequiere empresa
Recomendación: Wompi para el primer upgrade. Documentación clara y plan sin mensualidad.
Webhook de confirmación de pago
typescript// app/api/webhooks/wompi/route.ts
export async function POST(request: Request) {
const payload = await request.json()

// Verificar firma HMAC
const signature = request.headers.get('x-wompi-signature')
if (!verifyWompiSignature(payload, signature)) {
return new Response('Invalid signature', { status: 401 })
}

if (payload.event === 'transaction.updated' && payload.data.transaction.status === 'APPROVED') {
const reference = payload.data.transaction.reference // = appointment_id
await supabase.rpc('auto_approve_payment', { p_appointment_id: reference })
// Misma lógica que aprobación manual pero sin intervención de la psicóloga
}

return new Response('OK', { status: 200 })
}
SCALE-03: Feature Flags por Psicóloga
Permite activar/desactivar funcionalidades para psicólogas específicas sin hacer deploy.
Schema
sqlCREATE TABLE feature_flags (
id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
psicologa_id uuid REFERENCES profiles(id), -- null = global
feature_name text NOT NULL,
enabled boolean DEFAULT false,
config jsonb DEFAULT '{}'::jsonb, -- parámetros opcionales
created_at timestamptz DEFAULT now()
);

-- Ejemplos de features
-- { feature_name: 'auto_payment_approval', enabled: true }
-- { feature_name: 'advanced_clinical_notes', enabled: false }
-- { feature_name: 'multi_currency', enabled: false, config: { currencies: ['COP', 'USD'] } }
Uso en el código
typescript// lib/features.ts
export async function isFeatureEnabled(
featureName: string,
psicologaId?: string
): Promise<boolean> {
// Primero buscar flag específico de la psicóloga
if (psicologaId) {
const { data: specific } = await supabase
.from('feature_flags')
.select('enabled')
.eq('feature_name', featureName)
.eq('psicologa_id', psicologaId)
.single()
if (specific) return specific.enabled
}

// Fallback: flag global
const { data: global } = await supabase
.from('feature_flags')
.select('enabled')
.eq('feature_name', featureName)
.is('psicologa_id', null)
.single()
return global?.enabled ?? false
}

// Uso en componente
const hasAdvancedNotes = await isFeatureEnabled('advanced_clinical_notes', psicologaId)
if (hasAdvancedNotes) {
// Mostrar editor SOAP avanzado
} else {
// Mostrar editor básico
}
SCALE-04: App Móvil Nativa
Estrategia progresiva
Fase 0 (MVP): PWA — Ya funciona como app en móvil con "Add to Home Screen". Sin costo adicional.
Fase 1: React Native con Expo + mismo backend
typescript// El backend Next.js actúa como API para la app nativa
// Mismas Server Actions expuestas como API Routes

// app/api/mobile/appointments/route.ts
export async function GET(request: Request) {
const session = await getMobileSession(request) // JWT del móvil
const appointments = await getPatientAppointments(session.userId)
return Response.json(appointments)
}
Fase 2: Notificaciones push nativas con Expo Push Notifications (reemplaza web-push)
typescript// Guardar Expo push token en lugar de (o además de) web-push subscription
await supabase.from('push_subscriptions').upsert({
user_id: userId,
expo_push_token: 'ExponentPushToken[xxx]', // del móvil
web_push_subscription: null
})
Componentes reutilizables desde web
La lógica de negocio (hooks, Server Actions, Supabase queries) puede reutilizarse casi 1:1 en React Native. Solo cambia la capa de UI (componentes nativos en lugar de HTML/Tailwind).
SCALE-05: Historial Clínico Avanzado
Notas SOAP (cuando la psicóloga lo solicite)
typescript// domain/session-note.ts
interface SOAPNote {
subjective: string // Lo que el paciente reporta
objective: string // Observaciones clínicas
assessment: string // Evaluación y diagnóstico
plan: string // Plan de tratamiento

// Extras
mood_rating: 1 | 2 | 3 | 4 | 5
goals_progress: GoalProgress[]
next_session_focus: string
}
Escalas de evaluación estandarizadas
typescript// Ejemplos a implementar bajo feature flag
const SCALES = {
PHQ9: 'Patient Health Questionnaire (depresión)',
GAD7: 'Generalized Anxiety Disorder Scale',
PCL5: 'PTSD Checklist',
BDI: 'Beck Depression Inventory'
}
// El paciente completa la escala online antes de la sesión
// La psicóloga ve el score en la ficha clínica
Checklist de decisiones compatibles con escalabilidad
Antes de implementar cualquier feature, verificar:

¿La query filtra por psicologa_id? (multi-tenant)
¿La tabla tiene RLS activado?
¿La lógica de negocio está en Server Actions (no en componentes)?
¿Los precios/montos se guardan en el momento de la transacción, no se recalculan?
¿Las integraciones externas implementan una interfaz (PaymentGateway, NotificationProvider) que permite swapear providers?
¿Los feature flags permiten activar la funcionalidad gradualmente?
¿El endpoint de cron verifica el CRON_SECRET?
¿Las notas clínicas se cifran en el cliente antes de llegar al servidor?
