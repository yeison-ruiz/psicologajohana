# Case Study: Plataforma Psicológica Pro

### 🚀 Resumen del Proyecto
Desarrollo de una plataforma integral de teleconsulta para la **Psicóloga Johana Villabón**, diseñada para automatizar la gestión de pacientes, reservas de citas y procesamiento de pagos con una estética premium y fluida.

### 🛠️ Tech Stack
*   **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS.
*   **Backend & DB:** Supabase (PostgreSQL), Auth, Edge Middleware.
*   **Animaciones:** Framer Motion (UX fluida).
*   **Testing:** Playwright (Pruebas E2E automatizadas).
*   **Infraestructura:** CI/CD con GitHub Actions y Vercel.

### 🏗️ Arquitectura
*   **Modular & Escalable:** Arquitectura de componentes desacoplados para fácil mantenimiento.
*   **Hybrid Rendering:** Uso de *Server Components* para SEO y *Client Components* para dashboards interactivos.
*   **Real-time Ready:** Sincronización de citas en tiempo real mediante *Postgres Changes*.
*   **Security First:** Protección de rutas mediante middleware a nivel de servidor y RLS en la base de datos.

### 🌟 Funcionalidades Clave
*   **Sistema de Reservas:** Calendario inteligente con gestión automática de slots.
*   **Portal de Pagos:** Flujo de subida y aprobación de comprobantes (Nequi/Transferencia).
*   **Admin Dashboard:** Panel de control total para la psicóloga con reportes pre-consulta.
*   **SEO Pro:** Metadatos dinámicos, sitemap automático y optimización de redes sociales.
