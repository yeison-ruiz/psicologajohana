import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Preview,
} from "@react-email/components";
import React from "react";

interface BaseEmailProps {
  previewText: string;
  children: React.ReactNode;
}

export function BaseEmail({ previewText, children }: BaseEmailProps) {
  const mainColor = "#9c7155"; // Elegant Brown (primary-500)

  return (
    <Html lang="es">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header Section with Brand */}
          <Section style={header}>
            <Text style={logoText}>
              <span style={{ color: mainColor }}>Johana</span> Villabón
            </Text>
            <Text style={tagline}>Psicóloga</Text>
          </Section>

          {/* Main Content Area */}
          <Section style={contentContainer}>
            <div style={contentPadding}>{children}</div>
          </Section>

          {/* Footer Section */}
          <Section style={footer}>
            <Hr style={hr} />
            <Text style={footerText}>
              Este es un mensaje automático de la plataforma de consulta.
              <br />
              Por favor, no respondas a este correo.
            </Text>
            <Section style={footerLinks}>
              <Text style={footerLinkItem}>
                © {new Date().getFullYear()}{" "}
                <span style={{ fontWeight: "bold" }}>
                  psicologajohanavillabon.com
                </span>
              </Text>
              <Text style={footerLinkItem}>Todos los derechos reservados.</Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f4f7f6",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
  margin: "0 auto",
  padding: "40px 0",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  width: "600px",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
};

const header = {
  backgroundColor: "#ffffff", // Pure white header
  padding: "40px 40px 20px 40px",
  textAlign: "center" as const,
  borderTop: "6px solid #9c7155",
};

const logoText = {
  color: "#1e293b",
  fontSize: "26px",
  fontWeight: "900",
  letterSpacing: "1px",
  margin: "0",
  textTransform: "uppercase" as const,
};

const tagline = {
  color: "#64748b",
  fontSize: "13px",
  fontWeight: "600",
  letterSpacing: "0.5px",
  margin: "4px 0 0 0",
  textTransform: "uppercase" as const,
};

const contentContainer = {
  padding: "0 40px",
};

const contentPadding = {
  padding: "20px 0 40px 0",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "30px 0",
};

const footer = {
  backgroundColor: "#ffffff",
  padding: "0 40px 40px 40px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#94a3b8",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "0 0 20px 0",
};

const footerLinks = {
  marginTop: "16px",
};

const footerLinkItem = {
  color: "#94a3b8",
  fontSize: "12px",
  margin: "4px 0",
};
