import type { Metadata } from "next";
import { Raleway, Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Psicóloga Johana Villabón | Salud Mental",
  description:
    "Plataforma digital para consulta psicológica. Agenda tu sesión online de manera fácil, segura y confidencial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://i.ytimg.com" />
      </head>
      <body
        className={`${poppins.variable} ${raleway.variable} ${playfair.variable}`}
      >
        {children}
        <Toaster
          position="bottom-right"
          duration={6000}
          toastOptions={{
            style: {
              background: "#1C1512",
              border: "none",
              borderRadius: "16px",
              padding: "0",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
              fontFamily: "var(--font-raleway)",
              color: "#ffffff",
            },
          }}
        />
      </body>
    </html>
  );
}
