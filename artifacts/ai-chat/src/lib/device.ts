export type DeviceType = "phone" | "tablet" | "desktop" | "watch" | "tv" | "consolex" | "consolep";

export function detectDevice(): DeviceType {
  const ua = navigator.userAgent.toLowerCase();
  if (/playstation/i.test(ua)) return "consolep";
  if (/xbox|nintendo/i.test(ua)) return "consolex";
  if (/smart-?tv|smarttv|tizen|webos|viera|hbbtv|netcast|aquos/i.test(ua)) return "tv";
  if (screen.width <= 240 || /watch/i.test(ua)) return "watch";
  if (/iphone|android.*mobile|windows phone/i.test(ua)) return "phone";
  if (/ipad|android(?!.*mobile)|tablet/i.test(ua)) return "tablet";
  return "desktop";
}

export function getDevicePath(device: DeviceType): string {
  return `/${device}`;
}

export const DEVICE_LABELS: Record<DeviceType, string> = {
  phone: "Phone",
  tablet: "Tablet",
  desktop: "Desktop",
  watch: "Watch",
  tv: "TV",
  consolex: "Xbox",
  consolep: "PlayStation",
};
