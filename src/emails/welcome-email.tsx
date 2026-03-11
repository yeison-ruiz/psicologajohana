import React from "react";
import { Text, Heading, Button, Section } from "@react-email/components";
import { BaseEmail } from "./base-template";

export interface WelcomeEmailProps {
  patientName: string;
  loginUrl: string;
}

export function WelcomeEmail({ patientName, loginUrl }: WelcomeEmailProps) {
  return (
    <BaseEmail previewText="¡Bienvenido/a a mi espacio de consulta! 🌿">
      <Heading style={h1}>¡Hola, {patientName}!</Heading>

      <Text style={text}>
        Es un gusto saludarte. Te doy una cálida bienvenida a mi espacio de
        consulta, diseñado para acompañarte en tu proceso de bienestar emocional
        y salud mental. Soy <strong style={highlight}>Johana Villabón</strong>,
        y será un honor acompañarte en este camino.
      </Text>

      <Text style={text}>
        Tu cuenta ha sido activada correctamente. Desde ahora, a través de mi
        plataforma podrás:
      </Text>

      <Section style={listContainer}>
        <Text style={listItem}>
          ✅ Agendar y reprogramar tus sesiones fácilmente.
        </Text>
        <Text style={listItem}>✅ Gestionar tus pagos de forma segura.</Text>
        <Text style={listItem}>
          ✅ Acceder a tus sesiones virtuales con un solo clic.
        </Text>
      </Section>

      <Section style={buttonContainer}>
        <Button href={loginUrl} style={button}>
          Explorar mi Portal de Paciente
        </Button>
      </Section>

      <Text style={text}>
        Estoy aquí para apoyarte en cada paso. Si necesitas ayuda con el uso de
        la plataforma, mi equipo está a tu disposición para orientarte.
      </Text>

      <Section style={quoteContainer}>
        <Text style={quoteText}>
          &quot;El primer paso no te lleva a donde quieres ir, pero te saca de
          donde estás.&quot;
        </Text>
      </Section>
    </BaseEmail>
  );
}

const h1 = {
  color: "#1e293b",
  fontSize: "28px",
  fontWeight: "900",
  margin: "0 0 24px 0",
};

const text = {
  color: "#475569",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const highlight = {
  color: "#9c7155",
};

const listContainer = {
  margin: "24px 0",
  padding: "0 0 0 10px",
};

const listItem = {
  color: "#475569",
  fontSize: "15px",
  margin: "8px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "40px 0",
};

const button = {
  backgroundColor: "#9c7155",
  color: "#ffffff",
  padding: "16px 36px",
  borderRadius: "14px",
  textDecoration: "none",
  display: "inline-block",
  fontWeight: "900",
  fontSize: "17px",
  boxShadow: "0 5px 15px rgba(156, 113, 85, 0.25)",
};

const quoteContainer = {
  marginTop: "48px",
  padding: "24px",
  backgroundColor: "#f8fafc",
  borderRadius: "16px",
  borderLeft: "4px solid #9c7155",
};

const quoteText = {
  color: "#64748b",
  fontSize: "15px",
  lineHeight: "24px",
  fontStyle: "italic",
  margin: "0",
};
