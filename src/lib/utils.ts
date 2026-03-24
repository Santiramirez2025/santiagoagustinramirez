import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getWaLink(isAd: boolean) {
  return isAd
    ? `https://wa.me/5493536561265?text=${encodeURIComponent("Hola Santiago, vi tu anuncio y quiero una demo gratis")}`
    : `https://wa.me/5493536561265?text=${encodeURIComponent("Hola Santiago, quiero digitalizar mi negocio")}`;
}
