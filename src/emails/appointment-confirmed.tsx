import React from "react";
import { Text, Button, Heading, Section, Row, Column } from "@react-email/components";
import { BaseEmail } from "./base-template";

export interface AppointmentConfirmedEmailProps {
  patientName: string;
  date: string;
  time: string;
  meetLink: string;
}

export function AppointmentConfirmedEmail({
  patientName,
  date,
  time,
  meetLink,
}: AppointmentConfirmedEmailProps) {
  return (
    <BaseEmail previewText="Tu cita ha sido confirmada ✅">
      <Heading style={h1}>¡Cita Confirmada!</Heading>
      
      <Text style={text}>
        Hola {patientName}, nos alegra confirmarte que tu sesión ha sido agendada con éxito. Aquí tienes los detalles para nuestro próximo encuentro:
      </Text>

      <Section style={infoCard}>
        <Row style={infoRow}>
          <Column style={infoColumn}>
            <Text style={infoLabel}>FECHA</Text>
            <Text style={infoValue}>📅 {date}</Text>
          </Column>
          <Column style={infoColumn}>
            <Text style={infoLabel}>HORA</Text>
            <Text style={infoValue}>⏰ {time}</Text>
          </Column>
        </Row>
      </Section>

      <Section style={buttonContainer}>
        <Text style={instructionText}>
          Para unirte a la sesión virtual, haz clic en el siguiente botón:
        </Text>
        <Button
          href={meetLink}
          style={button}
        >
          Unirme a Google Meet
        </Button>
        <Text style={smallLink}>
          O copia este enlace: {meetLink}
        </Text>
      </Section>

      <Section style={footerNote}>
        <Text style={noteText}>
          📌 <strong>Recomendación:</strong> Te sugerimos conectarte 5 minutos antes para verificar tu conexión y sonido. Si necesitas reprogramar, por favor avísanos con al menos 24 horas de antelación.
        </Text>
      </Section>
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

const smallLink = {
  color: "#94a3b8",
  fontSize: "11px",
  marginTop: "12px",
  wordBreak: "break-all" as const,
};

const footerNote = {
  marginTop: "40px",
  padding: "20px",
  borderTop: "1px solid #f1f5f9",
};

const noteText = {
  color: "#64748b",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
};
