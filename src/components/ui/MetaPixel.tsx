"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

// ═══════════════════════════════════════════
// CONFIGURACION: Pone tu Pixel ID aca
// ═══════════════════════════════════════════
const PIXEL_ID = "1419051696174763"; // Ejemplo: "123456789012345"

// Declaracion global de fbq para TypeScript
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: (...args: unknown[]) => void;
  }
}

/**
 * Componente que carga el Meta Pixel y trackea:
 * - PageView en cada cambio de ruta
 * - ViewContent al cargar la landing
 *
 * Para trackear clicks a WhatsApp, usa trackWhatsAppClick()
 * exportada abajo.
 */
export function MetaPixel() {
  const pathname = usePathname();

  // Trackear PageView en cada navegacion
  useEffect(() => {
    if (typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  }, [pathname]);

  // Si no hay Pixel ID, no renderizar nada
  if (!PIXEL_ID || PIXEL_ID === "1419051696174763") {
    return null;
  }

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

// ═══════════════════════════════════════════
// FUNCIONES DE TRACKING PARA USAR EN BOTONES
// ═══════════════════════════════════════════

/**
 * Trackea click a WhatsApp como evento Lead.
 * Llamar esta funcion en el onClick de cada boton CTA de WhatsApp.
 *
 * @param source - Identificador de donde viene el click (ej: "hero", "services", "coaching")
 */
export function trackWhatsAppClick(source: string = "general") {
  if (typeof window.fbq === "function") {
    // Evento estandar Lead - es el que Meta optimiza mejor para campanas de conversion
    window.fbq("track", "Lead", {
      content_name: `whatsapp_click_${source}`,
      content_category: "whatsapp_lead",
    });
  }
}

/**
 * Trackea cuando alguien ve la seccion de servicios/precios.
 * Util para crear audiencias de remarketing.
 */
export function trackViewContent(contentName: string) {
  if (typeof window.fbq === "function") {
    window.fbq("track", "ViewContent", {
      content_name: contentName,
    });
  }
}

/**
 * Trackea cuando alguien hace scroll hasta el final (alto interes).
 * Usar con IntersectionObserver en la seccion FinalCta.
 */
export function trackCompleteRegistration() {
  if (typeof window.fbq === "function") {
    window.fbq("track", "CompleteRegistration", {
      content_name: "scroll_complete",
    });
  }
}