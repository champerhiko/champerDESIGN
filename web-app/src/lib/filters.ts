export type Adjustments = { brightness: number; contrast: number; saturate: number };

export const DEFAULT_ADJUSTMENTS: Adjustments = { brightness: 100, contrast: 100, saturate: 100 };

export const PRESETS = [
  { name: "Orijinal", filter: "" },
  { name: "S/B", filter: "grayscale(100%)" },
  { name: "Sepya", filter: "sepia(100%)" },
  // Negatif hue-rotate tonları maviye/camgöbeğine doğru hafifçe kaydırır
  { name: "Soğuk", filter: "hue-rotate(-15deg) saturate(90%) brightness(105%)" },
  { name: "Sıcak", filter: "sepia(35%) saturate(140%) hue-rotate(-10deg)" },
  { name: "Yüksek Kontrast", filter: "contrast(160%) saturate(120%)" },
] as const;

export type PresetName = (typeof PRESETS)[number]["name"];

// Preset önce, manuel ayarlar sonra uygulanır
export function buildFilter(preset: PresetName, a: Adjustments): string {
  const presetFilter = PRESETS.find((p) => p.name === preset)?.filter ?? "";
  return `${presetFilter} brightness(${a.brightness}%) contrast(${a.contrast}%) saturate(${a.saturate}%)`.trim();
}
