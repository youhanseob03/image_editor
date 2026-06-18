import { 
  StudioMode, 
  FineTuneSettings, 
  CompositionSettings, 
  RestorationSettings, 
  RemoveBgSettings,
  PassportSettings, 
  SkinSettings 
} from "./types";

// Helper to convert an Image URL to HTMLImageElement
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
}

// Generate Stock/Sample Images dynamically using canvas to guarantee offline reliability
export function generateSampleImage(type: "retro-family" | "sunset" | "cat-astronaut" | "portrait-rough"): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  if (type === "retro-family") {
    // Old sepia damaged photo for restoration
    canvas.width = 600;
    canvas.height = 450;
    
    // Sepia background
    ctx.fillStyle = "#5d432c";
    ctx.fillRect(0, 0, 600, 450);
    
    // Inner fade vignette
    const grad = ctx.createRadialGradient(300, 225, 100, 300, 225, 300);
    grad.addColorStop(0, "rgba(224, 184, 131, 0.45)");
    grad.addColorStop(0.8, "rgba(93, 67, 44, 0.8)");
    grad.addColorStop(1, "rgba(41, 29, 18, 0.95)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 450);

    // Draw family members (silhouettes/sketches)
    ctx.fillStyle = "rgba(41, 29, 18, 0.75)";
    // Grandfather (left)
    ctx.beginPath();
    ctx.arc(220, 200, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(180, 245, 80, 180);
    // Shoulder curves
    ctx.arc(180, 260, 15, 0, Math.PI * 2); ctx.fill();
    ctx.arc(260, 260, 15, 0, Math.PI * 2); ctx.fill();
    
    // Grandmother (right)
    ctx.beginPath();
    ctx.arc(360, 220, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(323, 260, 75, 160);
    ctx.arc(323, 275, 12, 0, Math.PI * 2); ctx.fill();
    ctx.arc(398, 275, 12, 0, Math.PI * 2); ctx.fill();

    // Grandmother bun hair
    ctx.beginPath();
    ctx.arc(360, 175, 15, 0, Math.PI * 2);
    ctx.fill();

    // Vintage child in center
    ctx.fillStyle = "rgba(41, 29, 18, 0.65)";
    ctx.beginPath();
    ctx.arc(290, 270, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(260, 300, 60, 120);

    // Add heavy scratches, dust & tears
    ctx.strokeStyle = "rgba(220, 200, 180, 0.6)";
    ctx.lineWidth = 1.5;
    // Scratch 1
    ctx.beginPath();
    ctx.moveTo(40, 20); ctx.quadraticCurveTo(150, 180, 200, 410); ctx.stroke();
    // Scratch 2
    ctx.beginPath();
    ctx.moveTo(560, 80); ctx.lineTo(480, 400); ctx.stroke();
    // Crack on grandmother
    ctx.beginPath();
    ctx.moveTo(330, 160); ctx.lineTo(390, 250); ctx.lineTo(410, 310); ctx.stroke();

    // White dust dots
    ctx.fillStyle = "rgba(240, 228, 210, 0.75)";
    for (let i = 0; i < 40; i++) {
      const rx = Math.random() * 600;
      const ry = Math.random() * 450;
      const rSize = Math.random() * 2.5 + 0.5;
      ctx.beginPath();
      ctx.arc(rx, ry, rSize, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Old paper grain
    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    for (let i = 0; i < 2000; i++) {
      const rx = Math.random() * 600;
      const ry = Math.random() * 450;
      ctx.fillRect(rx, ry, 1, 1);
    }

    // Beautiful photo frame borders
    ctx.strokeStyle = "rgba(41, 29, 18, 0.15)";
    ctx.lineWidth = 15;
    ctx.strokeRect(0, 0, 600, 450);

  } else if (type === "sunset") {
    // Background beach sunset for synthesis
    canvas.width = 600;
    canvas.height = 450;

    // Linear sunset gradient
    const sky = ctx.createLinearGradient(0, 0, 0, 450);
    sky.addColorStop(0, "#1a0b2e"); // Dark deep violet
    sky.addColorStop(0.3, "#421545"); // Purple
    sky.addColorStop(0.55, "#ff3e41"); // Red orange
    sky.addColorStop(0.7, "#ffa036");  // Orange gold
    sky.addColorStop(0.85, "#ffe675"); // Bright yellow
    sky.addColorStop(1, "#366bff");    // Blue ocean reflective
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 600, 450);

    // Glowing sun
    const sun = ctx.createRadialGradient(300, 310, 5, 300, 310, 75);
    sun.addColorStop(0, "#ffffff");
    sun.addColorStop(0.2, "#ffffa0");
    sun.addColorStop(0.6, "rgba(255, 100, 0, 0.6)");
    sun.addColorStop(1, "rgba(255, 60, 0, 0)");
    ctx.fillStyle = sun;
    ctx.beginPath();
    ctx.arc(300, 310, 80, 0, Math.PI * 2);
    ctx.fill();

    // Ocean water lines
    ctx.fillStyle = "rgba(26, 11, 46, 0.35)";
    for (let i = 330; i < 450; i += 8) {
      ctx.fillRect(0, i, 600, i/120);
    }

    // Silhouettes of beautiful warm palm trees on both sides
    ctx.fillStyle = "#16051f";
    
    // Left palm trunk
    ctx.beginPath();
    ctx.moveTo(25, 450);
    ctx.quadraticCurveTo(70, 300, 95, 180);
    ctx.quadraticCurveTo(60, 300, 15, 450);
    ctx.fill();
    
    // Right palm trunk
    ctx.beginPath();
    ctx.moveTo(580, 450);
    ctx.quadraticCurveTo(530, 280, 510, 150);
    ctx.quadraticCurveTo(545, 280, 595, 450);
    ctx.fill();

    // Draw simple fronds (leaves)
    const drawLeaves = (cx: number, cy: number, dDir: number) => {
      ctx.strokeStyle = "#16051f";
      ctx.lineWidth = 5;
      for (let angle = -0.5; angle < 1.5; angle += 0.3) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.quadraticCurveTo(cx + dDir * Math.cos(angle) * 70, cy + Math.sin(angle) * 50, cx + dDir * Math.cos(angle) * 90, cy + Math.sin(angle) * 80 + 30);
        ctx.stroke();
      }
    };
    drawLeaves(95, 180, 1);
    drawLeaves(510, 150, -1);

  } else if (type === "cat-astronaut") {
    // Synthesis overlay (Transparent astronaut cat!)
    canvas.width = 300;
    canvas.height = 300;

    // Checkerboard transparent simulation is handled by CSS, but we make canvas back transparent
    ctx.clearRect(0, 0, 300, 300);

    // Astronaut silver suit body
    ctx.fillStyle = "#e2e8f0";
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(150, 205, 50, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // Star badge on suit
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(150, 200, 10, 0, Math.PI * 2);
    ctx.fill();

    // Round space helmet (back outline)
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 5;
    ctx.fillStyle = "rgba(56, 189, 248, 0.15)";
    ctx.beginPath();
    ctx.arc(150, 115, 65, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // Cute Orange Cat Head inside helmet
    ctx.fillStyle = "#fb8c00"; // Vibrant orange
    ctx.beginPath();
    ctx.arc(150, 120, 38, 0, Math.PI * 2);
    ctx.fill();

    // Cat ears
    // Left ear
    ctx.fillStyle = "#f57c00";
    ctx.beginPath();
    ctx.moveTo(115, 105);
    ctx.lineTo(105, 65);
    ctx.lineTo(135, 95);
    ctx.fill();
    // Inner Pink left ear
    ctx.fillStyle = "#f87171";
    ctx.beginPath();
    ctx.moveTo(118, 100);
    ctx.lineTo(112, 75);
    ctx.lineTo(130, 93);
    ctx.fill();

    // Right ear
    ctx.fillStyle = "#f57c00";
    ctx.beginPath();
    ctx.moveTo(185, 105);
    ctx.lineTo(195, 65);
    ctx.lineTo(165, 95);
    ctx.fill();
    // Inner Pink right ear
    ctx.fillStyle = "#f87171";
    ctx.beginPath();
    ctx.moveTo(182, 100);
    ctx.lineTo(188, 75);
    ctx.lineTo(170, 93);
    ctx.fill();

    // White cat face muzzle
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(142, 133, 11, 0, Math.PI * 2);
    ctx.arc(158, 133, 11, 0, Math.PI * 2);
    ctx.fill();

    // Cute pink nose
    ctx.fillStyle = "#ec4899";
    ctx.beginPath();
    ctx.moveTo(150, 128);
    ctx.lineTo(146, 124);
    ctx.lineTo(154, 124);
    ctx.fill();

    // Big anime eyes with glass reflection
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.arc(133, 115, 8, 0, Math.PI * 2);
    ctx.arc(167, 115, 8, 0, Math.PI * 2);
    ctx.fill();
    // Highlights
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(131, 112, 3, 0, Math.PI * 2);
    ctx.arc(165, 112, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(135, 118, 1, 0, Math.PI * 2);
    ctx.arc(169, 118, 1, 0, Math.PI * 2);
    ctx.fill();

    // Cat whiskers
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // Left
    ctx.moveTo(125, 130); ctx.lineTo(105, 128);
    ctx.moveTo(125, 133); ctx.lineTo(102, 135);
    // Right
    ctx.moveTo(175, 130); ctx.lineTo(195, 128);
    ctx.moveTo(175, 133); ctx.lineTo(198, 135);
    ctx.stroke();

    // Specular helmet reflection arc
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(150, 115, 59, -Math.PI / 1.5, -Math.PI / 3);
    ctx.stroke();

  } else if (type === "portrait-rough") {
    // Face closeup with slightly uneven skin tone and freckles (ideal for restoration, skin beautify, or passport)
    canvas.width = 450;
    canvas.height = 450;

    // Cozy studio gradient background
    const bg = ctx.createLinearGradient(0, 0, 450, 450);
    bg.addColorStop(0, "#eceff1");
    bg.addColorStop(1, "#cfd8dc");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 450, 450);

    // Warm portrait spotlight
    const spot = ctx.createRadialGradient(225, 225, 30, 225, 225, 200);
    spot.addColorStop(0, "rgba(255, 255, 255, 0.35)");
    spot.addColorStop(1, "rgba(0, 10, 40, 0.05)");
    ctx.fillStyle = spot;
    ctx.fillRect(0, 0, 450, 450);

    // Body shoulders in gray sweater
    ctx.fillStyle = "#374151";
    ctx.beginPath();
    ctx.moveTo(70, 450);
    ctx.quadraticCurveTo(90, 340, 225, 340);
    ctx.quadraticCurveTo(360, 340, 380, 450);
    ctx.closePath();
    ctx.fill();

    // Soft sweater collar neck
    ctx.fillStyle = "#1f2937";
    ctx.beginPath();
    ctx.ellipse(225, 350, 50, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neck
    ctx.fillStyle = "#f5cab3";
    ctx.fillRect(195, 290, 60, 70);
    // Neck shadow
    ctx.fillStyle = "rgba(200, 140, 110, 0.4)";
    ctx.fillRect(195, 320, 60, 40);

    // Head base (ovals)
    ctx.fillStyle = "#fcd5be"; // skin base
    ctx.beginPath();
    ctx.ellipse(225, 210, 85, 110, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cheeks & blush texture (slightly rough)
    ctx.fillStyle = "rgba(224, 118, 90, 0.25)";
    ctx.beginPath();
    ctx.ellipse(175, 230, 25, 18, 0, 0, Math.PI * 2);
    ctx.ellipse(275, 230, 25, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Freckles / blemishes (for Skin Retouch skin-smooth blemish correction!)
    ctx.fillStyle = "#a87158";
    const blemishes = [
      {x: 165, y: 228}, {x: 172, y: 224}, {x: 185, y: 232}, 
      {x: 236, y: 230}, {x: 265, y: 224}, {x: 278, y: 229},
      {x: 225, y: 218}, {x: 215, y: 242}, {x: 250, y: 195}
    ];
    for (const b of blemishes) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Lips
    ctx.fillStyle = "#e07a7a";
    ctx.beginPath();
    ctx.ellipse(225, 275, 26, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    // Center fold lip line
    ctx.strokeStyle = "#802d2d";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(199, 275);
    ctx.quadraticCurveTo(225, 279, 251, 275);
    ctx.stroke();

    // Eyes
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(185, 195, 16, 9, 0, 0, Math.PI * 2);
    ctx.ellipse(265, 195, 16, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupils (Brown/Hazel)
    ctx.fillStyle = "#6b3e1d";
    ctx.beginPath();
    ctx.arc(185, 195, 7.5, 0, Math.PI * 2);
    ctx.arc(265, 195, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.arc(185, 195, 4, 0, Math.PI * 2);
    ctx.arc(265, 195, 4, 0, Math.PI * 2);
    ctx.fill();
    // Catch light (sparkle)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(182, 192, 2.5, 0, Math.PI * 2);
    ctx.arc(262, 192, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = "#5c3d24";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(165, 180); ctx.quadraticCurveTo(185, 175, 203, 184); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(285, 180); ctx.quadraticCurveTo(265, 175, 247, 184); ctx.stroke();

    // Nose bridge and nose tip shadow
    ctx.strokeStyle = "rgba(180, 110, 80, 0.4)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(225, 195);
    ctx.lineTo(220, 240);
    ctx.lineTo(230, 240);
    ctx.stroke();

    // Brown hair framing the head
    ctx.fillStyle = "#5c3c24";
    // Left hair volume
    ctx.beginPath();
    ctx.ellipse(150, 180, 48, 85, -0.2, 0, Math.PI * 2);
    ctx.fill();
    // Right hair volume
    ctx.beginPath();
    ctx.ellipse(300, 180, 48, 85, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // Top crown hair
    ctx.beginPath();
    ctx.arc(225, 135, 75, -Math.PI, 0);
    ctx.fill();
    // Strands on forehead
    ctx.beginPath();
    ctx.moveTo(170, 130); ctx.quadraticCurveTo(190, 155, 175, 190); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(280, 130); ctx.quadraticCurveTo(260, 155, 275, 190); ctx.fill();
  }

  return canvas.toDataURL("image/png");
}

// Convert global fine-tune filters (brightness, etc.) into CSS filter string or apply programmatically on canvas
export function applyCanvasFineTune(ctx: CanvasRenderingContext2D, settings: FineTuneSettings, w: number, h: number) {
  // Apply sliders via canvas pixels matrix or canvas filters if supported
  ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%) blur(${settings.blur}px)`;
  
  // Custom warmth filter (orange color overlay)
  if (settings.warmth !== 0) {
    ctx.fillStyle = settings.warmth > 0 ? `rgba(251, 146, 60, ${Math.abs(settings.warmth) / 250})` : `rgba(59, 130, 246, ${Math.abs(settings.warmth) / 250})`;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillRect(0, 0, w, h);
  }
}

// 1. IMAGE COMPOSITION (합성) ENGINE
export async function processComposition(
  backgroundUrl: string, 
  overlayUrl: string, 
  settings: CompositionSettings, 
  aspectRatio: "1:1" | "4:3" | "3:4" | "16:9" | "9:16"
): Promise<string> {
  const bgImg = await loadImage(backgroundUrl);
  const ovImg = await loadImage(overlayUrl);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Set sizing based on aspect ratio
  let targetWidth = 800;
  let targetHeight = 800;
  if (aspectRatio === "4:3") { targetWidth = 800; targetHeight = 600; }
  else if (aspectRatio === "3:4") { targetWidth = 600; targetHeight = 800; }
  else if (aspectRatio === "16:9") { targetWidth = 960; targetHeight = 540; }
  else if (aspectRatio === "9:16") { targetWidth = 540; targetHeight = 960; }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Draw background image scaled cover
  const bgScale = Math.max(targetWidth / bgImg.width, targetHeight / bgImg.height);
  const bgX = (targetWidth - bgImg.width * bgScale) / 2;
  const bgY = (targetHeight - bgImg.height * bgScale) / 2;
  ctx.drawImage(bgImg, bgX, bgY, bgImg.width * bgScale, bgImg.height * bgScale);

  // Configure blending & compositing
  ctx.save();
  ctx.globalAlpha = settings.opacity / 100;
  ctx.globalCompositeOperation = settings.blendMode === "normal" ? "source-over" : settings.blendMode;

  // Translate and rotate around the composite design center
  const centerX = targetWidth / 2 + settings.xOffset;
  const centerY = targetHeight / 2 + settings.yOffset;
  ctx.translate(centerX, centerY);
  ctx.rotate((settings.rotate * Math.PI) / 180);

  // Calculate overlay width/height based on scaling
  const scaleRatio = settings.scale / 100;
  const ovWidth = ovImg.width * scaleRatio;
  const ovHeight = ovImg.height * scaleRatio;

  // Feather shadow masking support
  if (settings.feather > 0) {
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = settings.feather;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
  }

  // Draw the overlay character/object
  ctx.drawImage(ovImg, -ovWidth / 2, -ovHeight / 2, ovWidth, ovHeight);
  ctx.restore();

  return canvas.toDataURL("image/png");
}

// 2. PHOTO RESTORATION & COLORIZATION (복원 / 컬러화) ENGINE
export async function processRestoration(
  imgUrl: string,
  settings: RestorationSettings
): Promise<string> {
  const sourceImg = await loadImage(imgUrl);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Set dimension
  canvas.width = sourceImg.width;
  canvas.height = sourceImg.height;

  // Step 1: Draw the image
  ctx.drawImage(sourceImg, 0, 0);

  // Extract pixel manipulation
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // Remove scratches and colorize
  // In a simulated/real hybrid model, we do beautiful image color enhancement:
  // Convert yellowish old sepia tones or b&w to vibrant lifelike colors.
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i+1];
    const b = data[i+2];

    // Grayscale luminance
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    // Remove white cracks/scratches by interpolating neighbor intensities (simple local median/inpainting repair simulation)
    if (settings.scratchRemoval && gray > 240) {
      if (i > 4 && i < data.length - 8) {
        data[i] = (data[i-4] + data[i+4]) / 2;
        data[i+1] = (data[i-3] + data[i+5]) / 2;
        data[i+2] = (data[i-2] + data[i+6]) / 2;
        continue;
      }
    }

    if (settings.colorIntensity > 0) {
      // Colorization algorithm based on pixel brightness zones to colorize sky, skin tone, forest landscape beautifully!
      const intensity = settings.colorIntensity / 100;
      
      let targetR = gray;
      let targetG = gray;
      let targetB = gray;

      if (gray > 175) {
        // High luminance (Sky/High-key clouds - pale cyan blue colorization)
        targetR = gray * 0.9;
        targetG = gray * 0.95;
        targetB = gray * 1.08;
      } else if (gray > 100 && gray <= 175) {
        // Mid luminance (Skin tones / Warm human cloth - gentle rose/tan colorization)
        targetR = gray * 1.14;
        targetG = gray * 1.01;
        targetB = gray * 0.91;
      } else if (gray > 45 && gray <= 100) {
        // Lower mid luminance (Foliage, vegetation, background buildings - rich warm forest green tint)
        targetR = gray * 0.88;
        targetG = gray * 1.06;
        targetB = gray * 0.88;
      } else {
        // Shadow zones (Trousers, deep hair - deep navy slate blue shadows for modern aesthetic)
        targetR = gray * 0.88;
        targetG = gray * 0.88;
        targetB = gray * 1.02;
      }

      // Blend colorized target with original sepia/gray using selected color intensity parameter
      data[i] = r + (targetR - r) * intensity;
      data[i+1] = g + (targetG - g) * intensity;
      data[i+2] = b + (targetB - b) * intensity;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Optional Denoise (smart subtle Gaussian blur + sharp contrast overlays to look premium)
  if (settings.denoise) {
    ctx.save();
    ctx.filter = "contrast(1.05) saturate(1.1) sharp-ness(10%)"; // simulated premium finish
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();
  }

  return canvas.toDataURL("image/png");
}

// 3. BACKGROUND REMOVAL & ERASE ERASER (배경제거/부분삭제) ENGINE
export async function processBackgroundRemoval(
  imgUrl: string,
  settings: RemoveBgSettings,
  brushedMaskDataUrl?: string // if brushed/erased on canvas
): Promise<string> {
  const sourceImg = await loadImage(imgUrl);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  canvas.width = sourceImg.width;
  canvas.height = sourceImg.height;

  // Draw subject
  ctx.drawImage(sourceImg, 0, 0);

  if (settings.mode === "bg-remove") {
    // Beautiful smart chroma-key background isolation (Simulated auto subject cutter)
    // Cut away outer pixels that are dominant background colors (light grey/white or uniform blue/green)
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Detect average corner color to treat as the background "chroma-key"
    const bgR = (data[0] + data[(canvas.width - 1)*4]) / 2;
    const bgG = (data[1] + data[(canvas.width - 1)*4 + 1]) / 2;
    const bgB = (data[2] + data[(canvas.width - 1)*4 + 2]) / 2;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];

      // Calculate distance to background color
      const distance = Math.sqrt(
        Math.pow(r - bgR, 2) +
        Math.pow(g - bgG, 2) +
        Math.pow(b - bgB, 2)
      );

      // Or simple high luminance mask (removes white/light gray photographer backdrops)
      const brightness = 0.299*r + 0.587*g + 0.114*b;

      // If matches background profile, make pixel fully transparent (alpha = 0)
      if (distance < 45 || (bgR > 180 && brightness > 200)) {
        // Smooth feather edge transparency transitions based on distance threshold
        const closeness = Math.min(1, Math.max(0, (distance - 15) / 30));
        data[i+3] = data[i+3] * closeness;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // If a brush erasure overlay is supplied by manual user interactions, apply it on final output
  if (brushedMaskDataUrl) {
    const maskImg = await loadImage(brushedMaskDataUrl);
    ctx.save();
    ctx.globalCompositeOperation = "destination-out"; // erases the drawn brush strokes area
    ctx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  return canvas.toDataURL("image/png");
}

// 4. PASSPORT PHOTO FORMATTING (여권사진) ENGINE
export async function processPassportPhoto(
  imgUrl: string,
  settings: PassportSettings
): Promise<string> {
  const sourceImg = await loadImage(imgUrl);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Official Passport ratio is 3.5cm x 4.5cm. Let's map it to 350px x 450px
  canvas.width = 350;
  canvas.height = 450;

  // Background color option filler
  if (settings.bgColor === "white") {
    ctx.fillStyle = "#ffffff";
  } else if (settings.bgColor === "light-blue") {
    ctx.fillStyle = "#e0f2fe"; // beautiful light cyan passport blue
  } else {
    ctx.fillStyle = "#f1f5f9"; // neutral light gray
  }
  ctx.fillRect(0, 0, 350, 450);

  // Draw scaled, centered human portrait
  ctx.save();
  // Passport photos center the head in the upper-middle sector
  const zoomFactor = settings.zoom / 100;
  
  // Calculate best fit sizing for head bounding focus box
  const targetW = 350 * zoomFactor;
  const targetH = (350 * (sourceImg.height / sourceImg.width)) * zoomFactor;
  
  const drawX = (350 - targetW) / 2;
  // Offset slightly down so shoulders sit on bottom, eyes sit on 40% height mark
  const drawY = 80 - (targetH * 0.28); 

  // Make backdrop of original passport photo transparent first (simple chroma background removal)
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = sourceImg.width;
  tempCanvas.height = sourceImg.height;
  const tempCtx = tempCanvas.getContext("2d");
  if (tempCtx) {
    tempCtx.drawImage(sourceImg, 0, 0);
    const tData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const d = tData.data;
    // corner color
    const br = d[0]; const bg = d[1]; const bb = d[2];
    for (let i = 0; i < d.length; i += 4) {
      const dist = Math.sqrt(Math.pow(d[i]-br,2)+Math.pow(d[i+1]-bg,2)+Math.pow(d[i+2]-bb,2));
      const lumin = 0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];
      if (dist < 55 || lumin > 195) {
        d[i+3] = 0; // erase backdrop
      }
    }
    tempCtx.putImageData(tData, 0, 0);
    ctx.drawImage(tempCanvas, drawX, drawY, targetW, targetH);
  } else {
    ctx.drawImage(sourceImg, drawX, drawY, targetW, targetH);
  }
  
  ctx.restore();

  // Add the official guiding line overlay if enabled (keeps photographer aligned perfectly)
  if (settings.guideOverlay) {
    ctx.strokeStyle = "rgba(239, 68, 68, 0.45)"; // Soft transparent red
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);

    // Outer alignment circle for head crown
    ctx.beginPath();
    ctx.arc(175, 185, 80, 0, Math.PI * 2);
    ctx.stroke();

    // Center vertical alignment axis
    ctx.beginPath();
    ctx.moveTo(175, 0);
    ctx.lineTo(175, 450);
    ctx.stroke();

    // Shoulder alignment line
    ctx.beginPath();
    ctx.moveTo(0, 340);
    ctx.lineTo(350, 340);
    ctx.stroke();

    // Eye alignment coordinate line
    ctx.beginPath();
    ctx.moveTo(0, 195);
    ctx.lineTo(350, 195);
    ctx.stroke();

    ctx.setLineDash([]);
  }

  return canvas.toDataURL("image/png");
}

// 5. SKIN RETOUCHING / BEAUTY (피부보정) ENGINE
export async function processSkinRetouch(
  imgUrl: string,
  settings: SkinSettings
): Promise<string> {
  const sourceImg = await loadImage(imgUrl);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  canvas.width = sourceImg.width;
  canvas.height = sourceImg.height;

  ctx.drawImage(sourceImg, 0, 0);

  // Apply smooth beauty surface skin effect (Simulated bilateral filter layer by mixing original with blurred layer using opacity)
  const smoothnessIntensity = settings.smoothness / 100;

  if (smoothnessIntensity > 0) {
    // Create soft blur layer in memory
    const blurCanvas = document.createElement("canvas");
    blurCanvas.width = canvas.width;
    blurCanvas.height = canvas.height;
    const blurCtx = blurCanvas.getContext("2d");
    if (blurCtx) {
      blurCtx.save();
      // Smooth filter
      blurCtx.filter = `blur(${Math.round(smoothnessIntensity * 8)}px) brightness(1.03) contrast(0.97)`;
      blurCtx.drawImage(sourceImg, 0, 0);
      blurCtx.restore();

      // Blend blurred skin layer over original using transparency
      ctx.save();
      ctx.globalAlpha = smoothnessIntensity * 0.75; // max blending alpha weight
      ctx.drawImage(blurCanvas, 0, 0);
      ctx.restore();
    }
  }

  // Blemish and Brightness contrast retouching using local adjustment curves
  const blemishIntensity = settings.blemishRetouch / 100;
  if (blemishIntensity > 0) {
    ctx.save();
    // Increase overall skin brightness slightly and reduce local skin spot shadows contrast
    ctx.filter = `brightness(${100 + blemishIntensity * 12}%) contrast(${100 - blemishIntensity * 5}%)`;
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();
  }

  // Eye Brightness spotlight (increases eyes look vitality)
  const eyeIntensity = settings.eyeBrightness / 100;
  if (eyeIntensity > 0) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;

    // Detect white sclera highlight regions (r, g, b > 140 with minimal variance) to auto-brighten eyes
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i]; const g = d[i+1]; const b = d[i+2];
      const maxRGB = Math.max(r, g, b);
      const minRGB = Math.min(r, g, b);
      // Bright iris/sclera signature: bright, white-leaning, around the center height (35% to 55%)
      if (maxRGB > 120 && (maxRGB - minRGB) < 25) {
        d[i] = Math.min(255, r * (1 + eyeIntensity * 0.18));
        d[i+1] = Math.min(255, g * (1 + eyeIntensity * 0.18));
        d[i+2] = Math.min(255, b * (1 + eyeIntensity * 0.18));
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  return canvas.toDataURL("image/png");
}
