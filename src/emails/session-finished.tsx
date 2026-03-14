import React from "react";
import { Text, Heading, Button, Section } from "@react-email/components";
import { BaseEmail } from "./base-template";

export interface SessionFinishedEmailProps {
  patientName: string;
}

export function SessionFinishedEmail({ patientName }: SessionFinishedEmailProps) {
  return (
    <BaseEmail previewText="¡Gracias por asistir a nuestra sesión! 🌿">
      <Heading style={h1}>¡Hola, {patientName}!</Heading>

      <Text style={text}>
        Quería agradecerte por el espacio que compartimos hoy en nuestra sesión de psicoterapia. 
        Reconozco y valoro profundamente tu valentía al priorizar tu bienestar emocional.
      </Text>

      <Text style={text}>
        Cada paso que das en este camino es fundamental. Recuerda que <strong style={highlight}>tu salud mental es el pilar más importante de tu vida</strong>. 
        Seguir trabajando en ti mismo/a es el mejor regalo que te puedes dar.
      </Text>

      <Section style={messageCard}>
        <Text style={messageTitle}>💡 Un recordatorio para hoy:</Text>
        <Text style={messageText}>
          &quot;Sanar no es un camino lineal, pero cada sesión es una semilla que florecerá en tu tranquilidad y fortaleza interna.&quot;
        </Text>
      </Section>

      <Text style={text}>
        Espero que te lleves reflexiones valiosas de nuestro encuentro de hoy. Nos vemos en nuestra próxima cita para seguir construyendo juntos/as tu camino hacia el bienestar.
      </Text>

      <Section style={buttonContainer}>
        <Button href="https://psicoconnect.online/dashboard" style={button}>
          Ir a mi Dashboard de Paciente
        </Button>
      </Section>

      <Text style={text}>
        Con aprecio y compromiso,
      </Text>
      
      <Text style={footerName}>
        Psicóloga Johana Villabón
      </Text>
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

const messageCard = {
  margin: "32px 0",
  padding: "24px",
  backgroundColor: "#fef3f2",
  borderRadius: "20px",
  border: "1px solid #fee2e2",
};

const messageTitle = {
  color: "#991b1b",
  fontSize: "17px",
  fontWeight: "900",
  margin: "0 0 8px 0",
};

const messageText = {
  color: "#b91c1c",
  fontSize: "16px",
  lineHeight: "24px",
  fontStyle: "italic",
  margin: "0",
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

const footerName = {
  color: "#1e293b",
  fontSize: "18px",
  fontWeight: "900",
  margin: "4px 0 0 0",
};
