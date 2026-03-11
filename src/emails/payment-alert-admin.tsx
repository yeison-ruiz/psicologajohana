import React from "react";
import { Text, Link, Heading, Section } from "@react-email/components";
import { BaseEmail } from "./base-template";

export interface PaymentAlertAdminEmailProps {
  patientName: string;
  appointmentDate: string;
  adminUrl: string;
}

export function PaymentAlertAdminEmail({
  patientName,
  appointmentDate,
  adminUrl,
}: PaymentAlertAdminEmailProps) {
  return (
    <BaseEmail previewText="Nuevo comprobante de pago recibido 📩">
      <Heading style={h1}>Hola Johana,</Heading>
      
      <Text style={text}>
        Se ha recibido un nuevo movimiento en la plataforma. El paciente <strong style={highlight}>{patientName}</strong> ha adjuntado un comprobante de pago para su próxima sesión.
      </Text>

      <Section style={infoCard}>
        <Text style={infoText}>
          📅 <strong style={{ color: "#1e293b" }}>Fecha de Sesión:</strong> {appointmentDate}
        </Text>
      </Section>

      <Text style={text}>
        Por favor, accede al panel de administración para verificar los detalles y proceder con la aprobación de la cita.
      </Text>

      <Section style={buttonContainer}>
        <Link
          href={adminUrl}
          style={button}
        >
          Gestionar Pago en Admin
        </Link>
      </Section>

      <Text style={note}>
        Recuerda que para que el paciente reciba el enlace de Google Meet, debes marcar el pago como &quot;Confirmado&quot;.
      </Text>
    </BaseEmail>
  );
}

const h1 = {
  color: "#1e293b",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 24px 0",
};

const text = {
  color: "#475569",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const highlight = {
  color: "#059669",
};

const infoCard = {
  backgroundColor: "#f8fafc",
  borderRadius: "12px",
  padding: "20px",
  margin: "24px 0",
  border: "1px solid #e2e8f0",
};

const infoText = {
  margin: "0",
  color: "#64748b",
  fontSize: "15px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#059669",
  color: "#ffffff",
  padding: "16px 32px",
  borderRadius: "12px",
  textDecoration: "none",
  display: "inline-block",
  fontWeight: "bold",
  fontSize: "16px",
  boxShadow: "0 4px 12px rgba(5, 150, 105, 0.2)",
};

const note = {
  color: "#94a3b8",
  fontSize: "14px",
  textAlign: "center" as const,
  marginTop: "40px",
  fontStyle: "italic",
};
