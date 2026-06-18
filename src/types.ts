export enum StudioMode {
  COMPOSITION = "COMPOSITION",     // 이미지 합성/생성
  RESTORATION = "RESTORATION",     // 사진복원/업스케일
  REMOVE_BG = "REMOVE_BG",         // 배경제거/부분삭제
  PASSPORT = "PASSPORT",           // 여권사진 제작
  SKIN = "SKIN",                   // 피부보정
}

export interface UploadedFile {
  id: string;
  name: string;
  url: string; // Base64 or object URL
  size: number;
}

export interface FineTuneSettings {
  brightness: number;  // 0 - 200 (default 100)
  contrast: number;    // 0 - 200 (default 100)
  saturation: number;  // 0 - 200 (default 100)
  blur: number;        // 0 - 10 (default 0)
  warmth: number;      // -50 - 50 (default 0)
}

export interface CompositionSettings {
  scale: number;       // 10 - 200 (default 100)
  rotate: number;      // -180 - 180 (default 0)
  xOffset: number;     // drag offset X
  yOffset: number;     // drag offset Y
  opacity: number;     // 0 - 100 (default 100)
  feather: number;     // 0 - 20 (default 5)
  blendMode: "normal" | "multiply" | "screen" | "overlay" | "soft-light";
}

export interface RestorationSettings {
  colorIntensity: number; // 0 - 100 (default 80)
  scratchRemoval: boolean; // default true
  denoise: boolean; // default true
}

export interface RemoveBgSettings {
  mode: "bg-remove" | "erase-brush";
  brushSize: number; // 5 - 50
}

export interface PassportSettings {
  guideOverlay: boolean;
  bgColor: "white" | "light-blue" | "gray";
  zoom: number; // 50 - 150
}

export interface SkinSettings {
  smoothness: number;  // 0 - 100 (default 50)
  blemishRetouch: number; // 0 - 100 (default 40)
  eyeBrightness: number; // 0 - 100 (default 30)
}

export interface GenerationOptions {
  aspectRatio: "1:1" | "4:3" | "3:4" | "16:9" | "9:16";
  count: number; // 1 - 4
}

export interface GeneratedResult {
  id: string;
  originalUrl: string; // The primary image being transformed
  resultUrl: string;   // The output image URL (Base64)
  mode: StudioMode;
  prompt: string;
  aspectRatio: "1:1" | "4:3" | "3:4" | "16:9" | "9:16";
  timestamp: string;
  fineTunedUrl?: string; // Cache for the fine-tuned image
}
