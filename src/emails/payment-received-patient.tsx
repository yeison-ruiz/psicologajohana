import React from "react";
import { Text, Heading, Section } from "@react-email/components";
import { BaseEmail } from "./base-template";

export interface PaymentReceivedPatientEmailProps {
  patientName: string;
}

export function PaymentReceivedPatientEmail({
  patientName,
}: PaymentReceivedPatientEmailProps) {
  return (
    <BaseEmail previewText="Hemos recibido tu comprobante de pago 📥">
      <Heading style={h1}>¡Comprobante Recibido!</Heading>
      
      <Text style={text}>
        Hola {patientName}, gracias por enviar tu comprobante de pago. Queremos confirmarte que ya lo tenemos en nuestro sistema y ha entrado en la etapa de revisión.
      </Text>

      <Section style={statusCard}>
        <Text style={statusLabel}>ESTADO DEL PAGO</Text>
        <Text style={statusValue}>⏳ Pendiente de Verificación</Text>
      </Section>

      <Text style={text}>
        La Psicóloga Johana Villabón revisará la información en breve. Tan pronto como el pago sea validado, recibirás un correo de confirmación con el enlace para tu sesión.
      </Text>

      <Section style={noteBox}>
        <Text style={noteText}>
          <strong>Nota:</strong> Este proceso suele tomar poco tiempo, pero puede variar dependiendo del horario. No es necesario que realices ninguna otra acción por ahora.
        </Text>
      </Section>

      <Text style={footerText}>
        Gracias por tu confianza y por formar parte de PSICOCONNECT.
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

const statusCard = {
  backgroundColor: "#f8fafc",
  borderRadius: "16px",
  padding: "24px",
  margin: "32px 0",
  border: "1px solid #e2e8f0",
  textAlign: "center" as const,
};

const statusLabel = {
  color: "#64748b",
  fontSize: "12px",
  fontWeight: "bold",
  letterSpacing: "1px",
  margin: "0 0 8px 0",
};

const statusValue = {
  color: "#9c7155",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0",
};

const noteBox = {
  marginTop: "32px",
  padding: "20px",
  backgroundColor: "#fff",
  border: "1px dashed #cbd5e1",
  borderRadius: "12px",
};

const noteText = {
  color: "#64748b",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
};

const footerText = {
  color: "#475569",
  fontSize: "15px",
  fontWeight: "600",
  textAlign: "center" as const,
  marginTop: "40px",
};
