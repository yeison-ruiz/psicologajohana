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
  metadataBase: new URL("https://psicologajohanavillabon.com"),
  title: "Psicóloga Johana Villabón | Terapia y Salud Mental Online",
  description:
    "Descubre un espacio seguro para tu bienestar emocional. Consulta psicológica profesional online con la Psicóloga Johana Villabón. Terapia individual, cognitivo conductual, de pareja y para el desarrollo personal.",
  keywords: ["psicóloga online", "terapia psicológica", "salud mental", "psicóloga colombia", "bienestar emocional", "psicología clínica", "terapia de pareja", "terapia online", "Johana Villabón"],
  authors: [{ name: "Johana Villabón" }],
  icons: {
    icon: [
      { url: '/icon.png', sizes: '256x256', type: 'image/png' },
    ],
    apple: '/icon.png',
  },
  openGraph: {
    title: "Psicóloga Johana Villabón | Salud Mental",
    description: "Agenda tu sesión online de manera fácil, segura y confidencial.",
    url: "https://psicologajohanavillabon.com",
    siteName: "Psicóloga Johana Villabón",
    images: [
      {
        url: "/profesional.png",
        width: 800,
        height: 600,
        alt: "Psicóloga Johana Villabón",
      },
    ],
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Psicóloga Johana Villabón | Salud Mental",
    description: "Terapia psicológica profesional desde la comodidad de tu hogar.",
    images: ["/profesional.png"],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalBusiness',
  name: 'Psicóloga Johana Villabón',
  image: 'https://psicologajohanavillabon.com/profesional.png',
  '@id': 'https://psicologajohanavillabon.com',
  url: 'https://psicologajohanavillabon.com',
  medicalSpecialty: 'Psychiatric',
  description: 'Consulta psicológica profesional online enfocada en el bienestar emocional y la salud mental.',
  areaServed: 'CO',
  availableLanguage: ['es'],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
              background: "transparent",
              border: "none",
              borderRadius: "0",
              padding: "0",
              boxShadow: "none",
              fontFamily: "var(--font-raleway)",
              color: "#ffffff",
            },
          }}
        />
      </body>
    </html>
  );
}
