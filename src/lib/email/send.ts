import { transporter } from "./client";
import { render } from "@react-email/render";
import { AppointmentConfirmedEmail, AppointmentConfirmedEmailProps } from "@/emails/appointment-confirmed";
import { PaymentRejectedEmail, PaymentRejectedEmailProps } from "@/emails/payment-rejected";
import { WelcomeEmail, WelcomeEmailProps } from "@/emails/welcome-email";
import { SessionReminderEmail, SessionReminderEmailProps } from "@/emails/session-reminder";
import { PaymentReceivedPatientEmail, PaymentReceivedPatientEmailProps } from "@/emails/payment-received-patient";
import { PaymentAlertAdminEmail, PaymentAlertAdminEmailProps } from "@/emails/payment-alert-admin";

export type EmailTemplate = 
  | "appointment_confirmed" 
  | "payment_rejected" 
  | "welcome" 
  | "session_reminder"
  | "payment_received_patient"
  | "payment_alert_admin";

const EMAIL_TEMPLATES: Record<
  EmailTemplate,
  {
    subject: (data: Record<string, unknown>) => string;
    component: (data: Record<string, unknown>) => React.ReactElement;
  }
> = {
  appointment_confirmed: {
    subject: () => `¡Tu cita ha sido confirmada! - Psicóloga Johana Villabón`,
    component: (data: Record<string, unknown>) => AppointmentConfirmedEmail(data as unknown as AppointmentConfirmedEmailProps),
  },
  payment_rejected: {
    subject: () => `Revisión de tu comprobante de pago - Psicóloga Johana Villabón`,
    component: (data: Record<string, unknown>) => PaymentRejectedEmail(data as unknown as PaymentRejectedEmailProps),
  },
  welcome: {
    subject: (data: Record<string, unknown>) => `¡Bienvenida a mi espacio de consulta, ${(data as { patientName: string }).patientName}! 🌿`,
    component: (data: Record<string, unknown>) => WelcomeEmail(data as unknown as WelcomeEmailProps),
  },
  session_reminder: {
    subject: () => `Recordatorio de tu sesión - Psicóloga Johana Villabón`,
    component: (data: Record<string, unknown>) => SessionReminderEmail(data as unknown as SessionReminderEmailProps),
  },
  payment_received_patient: {
    subject: () => `Hemos recibido tu comprobante de pago - Psicóloga Johana Villabón`,
    component: (data: Record<string, unknown>) => PaymentReceivedPatientEmail(data as unknown as PaymentReceivedPatientEmailProps),
  },
  payment_alert_admin: {
    subject: (data: Record<string, unknown>) => `Nuevo pago por revisar de ${(data as { patientName: string }).patientName}`,
    component: (data: Record<string, unknown>) => PaymentAlertAdminEmail(data as unknown as PaymentAlertAdminEmailProps),
  },
};

export async function sendEmail(
  template: EmailTemplate,
  to: string,
  data: Record<string, unknown>
) {
  const { subject, component } = EMAIL_TEMPLATES[template];

  try {
    const html = await render(component(data));
    
    await transporter.sendMail({
      from: `"Psicóloga Johana Villabón" <${process.env.GMAIL_USER}>`,
      to,
      subject: subject(data),
      html,
    });
  } catch (error) {
    console.error(`[Email Error] Failed to send ${template}:`, error);
  }
}
