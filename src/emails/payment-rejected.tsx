import React from "react";
import { Text, Link, Heading, Section } from "@react-email/components";
import { BaseEmail } from "./base-template";

export interface PaymentRejectedEmailProps {
  patientName: string;
  reason: string;
  paymentUrl: string;
  attemptsLeft: number;
}

export function PaymentRejectedEmail({
  patientName,
  reason,
  paymentUrl,
  attemptsLeft,
}: PaymentRejectedEmailProps) {
  return (
    <BaseEmail previewText="Novedad con tu comprobante de pago ⚠️">
      <Heading style={h1}>Actualización de Pago</Heading>
      
      <Text style={text}>
        Hola {patientName}, lamentamos informarte que hemos encontrado un inconveniente con el comprobante de pago que adjuntaste recientemente.
      </Text>

      <Section style={reasonCard}>
        <Text style={reasonLabel}>MOTIVO DEL RECHAZO</Text>
        <Text style={reasonValue}>&quot;{reason}&quot;</Text>
      </Section>

      <Text style={text}>
        Aún tienes <strong style={{ color: "#ef4444" }}>{attemptsLeft} {attemptsLeft === 1 ? "intento restante" : "intentos restantes"}</strong> para subir un comprobante válido antes de que el espacio de tu sesión sea liberado automáticamente por el sistema.
      </Text>

      <Section style={buttonContainer}>
        <Link
          href={paymentUrl}
          style={button}
        >
          Subir Nuevo Comprobante
        </Link>
      </Section>

      <Section style={helpBox}>
        <Text style={helpText}>
          Si tienes dudas sobre por qué fue rechazado o necesitas asistencia técnica, por favor contáctanos respondiendo a este correo o por nuestros canales oficiales. Estamos para ayudarte.
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

const reasonCard = {
  backgroundColor: "#fef2f2",
  borderRadius: "16px",
  padding: "24px",
  margin: "32px 0",
  border: "1px solid #fee2e2",
};

const reasonLabel = {
  color: "#991b1b",
  fontSize: "12px",
  fontWeight: "bold",
  letterSpacing: "1px",
  margin: "0 0 8px 0",
};

const reasonValue = {
  color: "#b91c1c",
  fontSize: "16px",
  fontWeight: "600",
  fontStyle: "italic",
  margin: "0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "40px 0",
};

const button = {
  backgroundColor: "#ef4444",
  color: "#ffffff",
  padding: "16px 32px",
  borderRadius: "12px",
  textDecoration: "none",
  display: "inline-block",
  fontWeight: "bold",
  fontSize: "16px",
  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
};

const helpBox = {
  marginTop: "40px",
  padding: "20px",
  backgroundColor: "#f8fafc",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
};

const helpText = {
  color: "#64748b",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
};
