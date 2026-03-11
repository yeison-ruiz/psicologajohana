import { google } from "googleapis";
import { addMinutes } from "date-fns";

export async function refreshGoogleToken(refreshToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });

  const { credentials } = await oauth2Client.refreshAccessToken();
  return {
    access_token: credentials.access_token,
    expires_at: credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : null
  };
}

export async function createMeetSession(appointment: {
  start_at: Date;
  duration_minutes: number;
  patient_email: string;
  patient_name?: string;
  patient_id?: string;
  psicologa_email: string;
  psicologa_access_token: string;
  psicologa_refresh_token?: string | null;
}) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  
  auth.setCredentials({ 
    access_token: appointment.psicologa_access_token,
    refresh_token: appointment.psicologa_refresh_token || undefined
  });
 
  const calendar = google.calendar({ version: "v3", auth });
 
  try {
    const eventSummary = appointment.patient_name 
      ? `Sesión Psicológica: ${appointment.patient_name}`
      : `Sesión de Consulta - Psicóloga Johana Villabón`;

    const event = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      sendUpdates: "all", // Ensures invitations are sent
      requestBody: {
        summary: eventSummary,
        description: `Sesión confirmada a través de PsicoConnect.\n\nPsicóloga: Johana Villabón\nPaciente: ${appointment.patient_name || appointment.patient_email}\n\nEnlace para unirse a la videollamada adjunto en esta invitación.`,
        start: {
          dateTime: appointment.start_at.toISOString(),
          timeZone: "America/Bogota",
        },
        end: {
          dateTime: addMinutes(
            appointment.start_at,
            appointment.duration_minutes
          ).toISOString(),
          timeZone: "America/Bogota",
        },
        attendees: [
          { email: appointment.patient_email, displayName: appointment.patient_name, responseStatus: "needsAction" },
          { email: appointment.psicologa_email, responseStatus: "accepted" },
        ],
        conferenceData: {
          createRequest: {
            requestId: `psicoconnect-${Date.now()}-${appointment.patient_id || 'guest'}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 1440 }, // 1 day before
            { method: "popup", minutes: 15 },   // 15 mins before
          ],
        },
      },
    });

    return {
      meet_link: event.data.hangoutLink,
      calendar_event_id: event.data.id,
      html_link: event.data.htmlLink,
    };
  } catch (error) {
    console.error("[Google Calendar Error] Failed to create event:", error);
    throw error;
  }
}
