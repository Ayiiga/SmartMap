import type { Coordinates, EmergencyContact } from "@/types/smart-map";
import { coordinateLabel } from "@/lib/geo/reverse-geocode-service";

export function formatSosLocation(coords: Coordinates): string {
  return coordinateLabel(coords);
}

export function buildSosMessage(coords: Coordinates, note = "Smart Map SOS — I need help"): string {
  const gps = formatSosLocation(coords);
  return `${note}. Live GPS: ${gps}. Sent from Smart Map Ghana.`;
}

export function whatsAppShareUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  const text = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${text}`;
}

export function smsShareUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  return `sms:${digits}?body=${encodeURIComponent(message)}`;
}

export function mapsShareUrl(coords: Coordinates): string {
  return `https://maps.google.com/?q=${coords.lat},${coords.lng}`;
}

export interface SosShareResult {
  contact: EmergencyContact;
  whatsAppUrl: string;
  smsUrl: string;
}

export function buildSosShareLinks(
  coords: Coordinates,
  contacts: EmergencyContact[],
): SosShareResult[] {
  const message = buildSosMessage(coords);
  return contacts.map((contact) => ({
    contact,
    whatsAppUrl: whatsAppShareUrl(contact.phone, message),
    smsUrl: smsShareUrl(contact.phone, message),
  }));
}

export function triggerSosShare(coords: Coordinates, contacts: EmergencyContact[]): void {
  const links = buildSosShareLinks(coords, contacts);
  if (links.length === 0) return;

  const primary = links[0];
  const opened = window.open(primary.whatsAppUrl, "_blank", "noopener,noreferrer");
  if (!opened) {
    window.location.href = primary.smsUrl;
  }

  links.slice(1).forEach((link, index) => {
    window.setTimeout(() => {
      window.open(link.smsUrl, "_blank", "noopener,noreferrer");
    }, 800 * (index + 1));
  });
}
