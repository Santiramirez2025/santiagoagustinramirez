export const WA_NUMBER = "5493536561265";

export const WA_LINKS = {
  default: `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hola Santiago, quiero digitalizar mi negocio")}`,
  ad: `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hola Santiago, vi tu anuncio y quiero una demo gratis")}`,
  demo: `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hola Santiago, quiero ver una demo personalizada de mi negocio")}`,
  call: `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hola Santiago, quiero agendar mi llamada gratis")}`,
  coaching: `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hola Santiago, me interesa el coaching/mentoría. Quiero más info")}`,
} as const;

export type ProjectId = "marketplace-oficios" | "ecommerce-retail" | "marketplace-profesionales" | "plataforma-educativa" | "sistema-gestion" | "landing-conversion";

export interface Project {
  id: ProjectId;
  name: string;
  type: string;
  problem: string;
  solution: string;
  result: string;
  tags: string[];
  color: string;
  sceneColor: string;
  /** Maps to a service type for conversion alignment */
  serviceType: string;
}

export const PROJECTS: Project[] = [
  {
    id: "marketplace-oficios",
    name: "Marketplace de Oficios",
    type: "Marketplace + PWA",
    problem: "Profesionales de oficios sin forma eficiente de conseguir clientes en su zona.",
    solution: "Marketplace con geolocalización por cercanía, perfiles verificados, reseñas y app instalable desde el navegador.",
    result: "8 profesionales activos · 10 categorías · Usuarios recurrentes desde semana 1",
    tags: ["Next.js 15", "PostgreSQL", "PWA", "Geolocalización", "API REST"],
    color: "#F59E0B",
    sceneColor: "#F59E0B",
    serviceType: "marketplace",
  },
  {
    id: "ecommerce-retail",
    name: "E-commerce + Sistema Interno",
    type: "Tienda online + Panel Admin",
    problem: "Cadena retail con 35+ años gestionaba presupuestos y pagos de forma manual.",
    solution: "E-commerce completo con panel admin, generación automática de PDF, tracking de pagos parciales y notificaciones por WhatsApp.",
    result: "Presupuestos en 2 min (antes 30) · Sistema en uso diario · Cero errores de facturación",
    tags: ["Next.js", "Prisma", "PDFKit", "WhatsApp API", "Admin Panel"],
    color: "#3B82F6",
    sceneColor: "#3B82F6",
    serviceType: "ecommerce",
  },
  {
    id: "marketplace-profesionales",
    name: "Marketplace de Profesionales",
    type: "Marketplace SaaS",
    problem: "Profesionales matriculados sin canal digital para captar clientes. Clientes sin forma de comparar y elegir.",
    solution: "Plataforma con turnos online, suscripciones con MercadoPago, verificación profesional y panel admin de aprobación.",
    result: "Auditoría de seguridad completa · Integración de pagos verificada · Sistema de turnos activo",
    tags: ["Next.js", "MercadoPago", "Prisma", "NextAuth", "Webhooks"],
    color: "#10B981",
    sceneColor: "#10B981",
    serviceType: "marketplace",
  },
  {
    id: "plataforma-educativa",
    name: "Plataforma de Cursos Online",
    type: "EdTech interactiva",
    problem: "Creador de contenido necesitaba monetizar su conocimiento con una experiencia premium y diferente.",
    solution: "Plataforma con 29 módulos interactivos, gamificación con sistema de puntos, animaciones, auth y suscripciones.",
    result: "29 módulos · 3 capítulos · Retención del 78% en primeras 2 semanas",
    tags: ["React", "TypeScript", "Firebase", "Framer Motion", "Stripe"],
    color: "#8B5CF6",
    sceneColor: "#8B5CF6",
    serviceType: "sistema",
  },
  {
    id: "sistema-gestion",
    name: "Sistema de Gestión Comercial",
    type: "Sistema a medida",
    problem: "Empresa con +20 empleados gestionaba documentos, clientes y cobros en planillas Excel sin trazabilidad.",
    solution: "Sistema web con generación de remitos/recibos en PDF, gestión de clientes, control de pagos parciales, roles de usuario y reportes.",
    result: "100% de documentos digitalizados · 4 hs/semana ahorradas en administración · 0 documentos perdidos",
    tags: ["Next.js", "PostgreSQL", "PDFKit", "Auth", "Roles", "Dashboard"],
    color: "#EC4899",
    sceneColor: "#EC4899",
    serviceType: "sistema",
  },
  {
    id: "landing-conversion",
    name: "Landing de Ventas para Servicios",
    type: "Landing de alta conversión",
    problem: "Negocio de servicios invertía en Meta Ads pero la página no convertía: alto tráfico, pocas consultas.",
    solution: "Landing optimizada con copywriting persuasivo, formularios inteligentes, integración directa a WhatsApp, SEO técnico y analytics.",
    result: "Tasa de conversión del 8.3% (promedio industria: 2.5%) · +65% de consultas en primer mes",
    tags: ["Next.js", "Tailwind", "SEO", "Meta Pixel", "WhatsApp API"],
    color: "#06B6D4",
    sceneColor: "#06B6D4",
    serviceType: "landing",
  },
];

export const RESULTS_STATS = [
  { value: "6+", key: "businesses" },
  { value: "15", key: "delivery" },
  { value: "48hs", key: "demo" },
] as const;
