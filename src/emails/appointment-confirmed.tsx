import React from "react";
import { Text, Button, Heading, Section, Row, Column } from "@react-email/components";
import { BaseEmail } from "./base-template";

export interface AppointmentConfirmedEmailProps {
  patientName: string;
  date: string;
  time: string;
}

export function AppointmentConfirmedEmail({
  patientName,
  date,
  time,
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
          ⚠️ <strong>Paso Obligatorio:</strong> Para habilitar el enlace de tu sesión, es necesario que realices primero tu <strong>Presesión IA</strong>. Haz clic en el siguiente botón para completarla:
        </Text>
        <Button
          href="https://psicoconnect.online/paciente"
          style={button}
        >
          Realizar Mi Presesión IA
        </Button>
      </Section>

      <Section style={footerNote}>
        <Text style={noteText}>
          📌 <strong>Importante:</strong> Una vez completes la presesión, el botón para unirte a Google Meet se activará automáticamente en tu panel de &quot;Mis Citas&quot;. Te sugerimos realizarla con tiempo para evitar retrasos el día de tu sesión.
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
  color: "#1e293b",
  fontSize: "15px",
  marginBottom: "20px",
  lineHeight: "24px",
};

const button = {
  backgroundColor: "#9c7155",
  color: "#ffffff",
  padding: "16px 32px",
  borderRadius: "14px",
  textDecoration: "none",
  display: "inline-block",
  fontWeight: "900",
  fontSize: "17px",
  boxShadow: "0 5px 15px rgba(156, 113, 85, 0.25)",
};

const footerNote = {
  marginTop: "40px",
  padding: "24px",
  backgroundColor: "#fff7ed",
  borderRadius: "16px",
  border: "1px solid #ffedd5",
};

const noteText = {
  color: "#9a3412",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
};
