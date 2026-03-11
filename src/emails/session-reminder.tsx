import React from "react";
import { Text, Heading, Button, Section, Row, Column, Link } from "@react-email/components";
import { BaseEmail } from "./base-template";

export interface SessionReminderEmailProps {
  patientName: string;
  dateStr: string;
  timeStr: string;
  meetLink: string;
}

export function SessionReminderEmail({
  patientName,
  dateStr,
  timeStr,
  meetLink,
}: SessionReminderEmailProps) {
  return (
    <BaseEmail previewText="Recordatorio: Tu sesión es mañana 🗓️">
      <Heading style={h1}>Recordatorio de Sesión</Heading>
      
      <Text style={text}>
        Hola {patientName}, esperamos que estés teniendo un buen día. Este es un recordatorio amigable de nuestro próximo encuentro terapéutico.
      </Text>

      <Section style={infoCard}>
        <Row style={infoRow}>
          <Column style={infoColumn}>
            <Text style={infoLabel}>FECHA</Text>
            <Text style={infoValue}>📅 {dateStr}</Text>
          </Column>
          <Column style={infoColumn}>
            <Text style={infoLabel}>HORA</Text>
            <Text style={infoValue}>⏰ {timeStr}</Text>
          </Column>
        </Row>
      </Section>

      <Section style={buttonContainer}>
        <Text style={instructionText}>
          Podrás unirte a la sesión directamente desde este botón en el horario programado:
        </Text>
        <Button
          href={meetLink}
          style={button}
        >
          Unirse a Google Meet
        </Button>
      </Section>

      <Section style={footerAction}>
        <Text style={footerNote}>
          ¿Necesitas revisar tus tareas o notas previas?
        </Text>
        <Link
          href="https://psicologajohanavillabon.com/dashboard"
          style={dashboardLink}
        >
          Ir a mi Portal de Paciente →
        </Link>
      </Section>

      <Text style={disclaimer}>
        Si por algún motivo de fuerza mayor no puedes asistir, por favor infórmanos lo antes posible a través de la plataforma para reprogramar tu espacio.
      </Text>
    </BaseEmail>
  );
}

const h1 = {
  color: "#1e293b",
  fontSize: "26px",
  fontWeight: "900",
  margin: "0 0 24px 0",
};

const text = {
  color: "#475569",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const infoCard = {
  backgroundColor: "#f8fafc",
  borderRadius: "16px",
  padding: "24px",
  margin: "32px 0",
  border: "1px solid #e2e8f0",
};

const infoRow = {
  width: "100%",
};

const infoColumn = {
  padding: "0 10px",
};

const infoLabel = {
  color: "#94a3b8",
  fontSize: "11px",
  fontWeight: "bold",
  letterSpacing: "1px",
  margin: "0 0 8px 0",
};

const infoValue = {
  color: "#1e293b",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "40px 0",
};

const instructionText = {
  color: "#64748b",
  fontSize: "14px",
  marginBottom: "16px",
  lineHeight: "22px",
};

const button = {
  backgroundColor: "#9c7155",
  color: "#ffffff",
  padding: "16px 32px",
  borderRadius: "12px",
  textDecoration: "none",
  display: "inline-block",
  fontWeight: "bold",
  fontSize: "16px",
  boxShadow: "0 4px 12px rgba(156, 113, 85, 0.2)",
};

const footerAction = {
  marginTop: "40px",
  padding: "24px",
  backgroundColor: "#f1f5f9",
  borderRadius: "16px",
  textAlign: "center" as const,
};

const footerNote = {
  color: "#475569",
  fontSize: "14px",
  margin: "0 0 12px 0",
};

const dashboardLink = {
  color: "#9c7155",
  fontSize: "15px",
  fontWeight: "bold",
  textDecoration: "none",
};

const disclaimer = {
  color: "#94a3b8",
  fontSize: "13px",
  lineHeight: "20px",
  textAlign: "center" as const,
  marginTop: "32px",
};
