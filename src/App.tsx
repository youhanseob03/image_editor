import React, { useState, useEffect } from "react";
import { 
  StudioMode, 
  UploadedFile, 
  FineTuneSettings, 
  CompositionSettings, 
  RestorationSettings, 
  RemoveBgSettings, 
  PassportSettings, 
  SkinSettings, 
  GenerationOptions, 
  GeneratedResult 
} from "./types";
import { 
  generateSampleImage, 
  processComposition, 
  processRestoration, 
  processBackgroundRemoval, 
  processPassportPhoto, 
  processSkinRetouch,
  loadImage,
  applyCanvasFineTune
} from "./utils";
import InputPanel from "./components/InputPanel";
import ControlPanel from "./components/ControlPanel";
import ResultPanel from "./components/ResultPanel";
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react";

export default function App() {
  // 1. Files & Inputs State
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [prompt, setPrompt] = useState("");
  
  // 2. Control Options State
  const [currentMode, setCurrentMode] = useState<StudioMode>(StudioMode.COMPOSITION);
  
  const [compSettings, setCompSettings] = useState<CompositionSettings>({
    scale: 80,
    rotate: 0,
    xOffset: 0,
    yOffset: 0,
    opacity: 100,
    feather: 3,
    blendMode: "normal"
  });

  const [restSettings, setRestSettings] = useState<RestorationSettings>({
    colorIntensity: 85,
    scratchRemoval: true,
    denoise: true
  });

  const [removeBgSettings, setRemoveBgSettings] = useState<RemoveBgSettings>({
    mode: "bg-remove",
    brushSize: 18
  });

  const [passportSettings, setPassportSettings] = useState<PassportSettings>({
    guideOverlay: true,
    bgColor: "light-blue",
    zoom: 95
  });

  const [skinSettings, setSkinSettings] = useState<SkinSettings>({
    smoothness: 60,
    blemishRetouch: 50,
    eyeBrightness: 40
  });

  const [genOptions, setGenOptions] = useState<GenerationOptions>({
    aspectRatio: "1:1",
    count: 1
  });

  // 3. Output Generation State
  const [results, setResults] = useState<GeneratedResult[]>([]);
  const [activeResultId, setActiveResultId] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState("");
  const [generationPercent, setGenerationPercent] = useState(0);

  // 4. Brush Eraser Overlay state
  const [localBrushMaskUrl, setLocalBrushMaskUrl] = useState<string | null>(null);

  // 5. Fine Tune Calibration State
  const [fineTune, setFineTune] = useState<FineTuneSettings>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    warmth: 0
  });
  const [isApplyingFineTune, setIsApplyingFineTune] = useState(false);

  // 6. Preload default example on mount so the workspace looks immediately gorgeous
  useEffect(() => {
    const loadDefaultStateByVector = async () => {
      try {
        // Pre-build samples
        const sunsetBgUrl = generateSampleImage("sunset");
        const catUrl = generateSampleImage("cat-astronaut");

        // Put default uploaded files
        setUploadedFiles([
          { id: "def-bg", name: "이탈리아 저녁 노을.png", url: sunsetBgUrl, size: 450000 },
          { id: "def-ov", name: "우주비행사 캐릭터.png", url: catUrl, size: 120000 }
        ]);
        setPrompt("A cute orange astronaut cat standing on a beautiful Italian beach landscape during an orange sunset, cinematic, 8k resolution, volumetric light.");
        
        // Generate pre-calculated default result so user is amazed right on launch!
        setIsGenerating(true);
        setGenerationPhase("초기 데모 렌더링 준비 중...");
        setGenerationPercent(20);
        
        // Compose background and character
        const defaultCompositeUrl = await processComposition(
          sunsetBgUrl, 
          catUrl, 
          {
            scale: 75,
            rotate: 0,
            xOffset: 0,
            yOffset: 25,
            opacity: 100,
            feather: 4,
            blendMode: "normal"
          }, 
          "1:1"
        );

        const defaultResult: GeneratedResult = {
          id: "def-res",
          originalUrl: sunsetBgUrl,
          resultUrl: defaultCompositeUrl,
          mode: StudioMode.COMPOSITION,
          prompt: "A gorgeous orange cute cat composite on sandy golden beach",
          aspectRatio: "1:1",
          timestamp: new Date().toLocaleTimeString()
        };

        setResults([defaultResult]);
        setActiveResultId("def-res");
      } catch (err) {
        console.error("Failed to load initial demo:", err);
      } finally {
        setIsGenerating(false);
      }
    };
    loadDefaultStateByVector();
  }, []);

  // Update Fine-Tuning parameters applied on the result image (baking into base64)
  const handleApplyFineTune = async () => {
    const activeResult = results.find(r => r.id === activeResultId);
    if (!activeResult) return;

    setIsApplyingFineTune(true);
    try {
      // Load raw calculated result base64
      const rImg = await loadImage(activeResult.resultUrl);
      const canvas = document.createElement("canvas");
      canvas.width = rImg.width;
      canvas.height = rImg.height;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        ctx.drawImage(rImg, 0, 0);
        applyCanvasFineTune(ctx, fineTune, canvas.width, canvas.height);
        
        const outputBase64 = canvas.toDataURL("image/png");
        
        // Save back to list
        setResults(prev => prev.map(res => {
          if (res.id === activeResult.id) {
            return { ...res, fineTunedUrl: outputBase64 };
          }
          return res;
        }));
      }
    } catch (err) {
      console.error("Failed to bake fine tune settings:", err);
    } finally {
      setIsApplyingFineTune(false);
    }
  };

  // Triggers when fine tune values change - auto-calculate for real-time responsiveness
  useEffect(() => {
    if (activeResultId && results.length > 0) {
      // Debounce slightly or run instantly for lightweight canvas baking
      const timer = setTimeout(() => {
        handleApplyFineTune();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [fineTune, activeResultId]);

  // Handle uploaded files callbacks
  const handleUpload = (newFiles: UploadedFile[]) => {
    setUploadedFiles(prev => {
      const merged = [...prev, ...newFiles];
      return merged.slice(0, 3); // cap at 3
    });
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  // Pre-load specific sample workspace designs based on template clicking
  const handleSelectSample = (type: "retro-family" | "sunset" | "cat-astronaut" | "portrait-rough") => {
    const imgDataUrl = generateSampleImage(type);
    
    if (type === "retro-family") {
      setUploadedFiles([{ id: "sample-retro", name: "부모님 옛날 흑백사진.png", url: imgDataUrl, size: 280000 }]);
      setCurrentMode(StudioMode.RESTORATION);
      setPrompt("Restore this old, damaged retro sepia portrait, remove dust and scratches, perform beautiful soft colorization with realistic skin tones and clothing.");
      setRestSettings({ colorIntensity: 85, scratchRemoval: true, denoise: true });
    } 
    else if (type === "sunset") {
      setUploadedFiles([{ id: "sample-sunset", name: "이탈리아 노을 해변.png", url: imgDataUrl, size: 450000 }]);
      setCurrentMode(StudioMode.COMPOSITION);
      setPrompt("A beautiful ocean sunset in Amalfi coast, vibrant orange sky reflected in water, highly detailed.");
    } 
    else if (type === "cat-astronaut") {
      setUploadedFiles([{ id: "sample-cat", name: "우주비행사 마스코트 고양이.png", url: imgDataUrl, size: 110000 }]);
      setCurrentMode(StudioMode.REMOVE_BG);
      setPrompt("Isolate this white outer-space astronaut cat, cut the background cleanly away to transparent checkered alpha.");
    } 
    else if (type === "portrait-rough") {
      setUploadedFiles([{ id: "sample-portrait", name: "여권용 인물 원본.png", url: imgDataUrl, size: 300000 }]);
      setCurrentMode(StudioMode.SKIN);
      setPrompt("Beautify this studio portrait closeup, smooth skin tone blemishes while preserving hair and eyes, bright gaze.");
      setSkinSettings({ smoothness: 70, blemishRetouch: 60, eyeBrightness: 50 });
    }
  };

  // Absolute central action - GENERATES the filtered imagery
  const handleGenerate = async () => {
    if (uploadedFiles.length === 0) {
      alert("변환할 이미지 원본을 왼쪽 패널에 업로드하거나, 하단의 고화질 실습 샘플을 로드해 주세요!");
      return;
    }

    setIsGenerating(true);
    setLocalBrushMaskUrl(null);
    setFineTune({ brightness: 100, contrast: 100, saturation: 100, blur: 0, warmth: 0 }); // reset tuning

    // Sequential premium phases loading indicators
    const phases = [
      { text: "AI 가상 인코더 가동 및 프롬프트 인코딩 중...", delay: 600, pct: 15 },
      { text: "선택된 제어 모델 분석 및 윤곽 행렬 세분화 중...", delay: 800, pct: 40 },
      { text: "선택 필터 레이어 렌더링 및 픽셀 보정 행렬 가동 중...", delay: 500, pct: 70 },
      { text: "8K UHD 오버샘플링 업스케일 및 자외선 디노이즈 중...", delay: 700, pct: 90 },
      { text: "최종 마스터링 및 전후 다이어그램 렌더링 중...", delay: 300, pct: 100 },
    ];

    for (const phase of phases) {
      setGenerationPhase(phase.text);
      setGenerationPercent(phase.pct);
      await new Promise(r => setTimeout(r, phase.delay));
    }

    try {
      const activeUploaded = uploadedFiles[0]; // main source
      const outputs: GeneratedResult[] = [];

      // Loop generation count
      for (let i = 0; i < genOptions.count; i++) {
        let resultImageBase64 = "";

        // Mode specific routing
        if (currentMode === StudioMode.COMPOSITION) {
          // Needs 2 images for synthesis, if 1 image we duplicate background or combine with default cat astronaut!
          const bgImgUrl = activeUploaded.url;
          const overlayImgUrl = uploadedFiles[1]?.url || generateSampleImage("cat-astronaut");
          
          // Randomize positioning slightly if generating multiple copies for creative variety
          const variationOffset = i * 20; 
          const currentCompSettings = {
            ...compSettings,
            xOffset: compSettings.xOffset + variationOffset,
            yOffset: compSettings.yOffset - (variationOffset / 2)
          };

          resultImageBase64 = await processComposition(
            bgImgUrl,
            overlayImgUrl,
            currentCompSettings,
            genOptions.aspectRatio
          );
        } 
        else if (currentMode === StudioMode.RESTORATION) {
          // Slight color bias variety if multi generate
          const colorVariation = Math.max(0, Math.min(100, restSettings.colorIntensity + (i * 8)));
          resultImageBase64 = await processRestoration(
            activeUploaded.url,
            { ...restSettings, colorIntensity: colorVariation }
          );
        } 
        else if (currentMode === StudioMode.REMOVE_BG) {
          resultImageBase64 = await processBackgroundRemoval(
            activeUploaded.url,
            removeBgSettings,
            localBrushMaskUrl || undefined
          );
        } 
        else if (currentMode === StudioMode.PASSPORT) {
          resultImageBase64 = await processPassportPhoto(
            activeUploaded.url,
            passportSettings
          );
        } 
        else if (currentMode === StudioMode.SKIN) {
          const smoothVariation = Math.min(100, skinSettings.smoothness + (i * 10));
          resultImageBase64 = await processSkinRetouch(
            activeUploaded.url,
            { ...skinSettings, smoothness: smoothVariation }
          );
        }

        outputs.push({
          id: `res-${crypto.randomUUID()}`,
          originalUrl: activeUploaded.url,
          resultUrl: resultImageBase64,
          mode: currentMode,
          prompt: prompt || `${activeUploaded.name} processed with ${currentMode}`,
          aspectRatio: genOptions.aspectRatio,
          timestamp: new Date().toLocaleTimeString()
        });
      }

      setResults(outputs);
      setActiveResultId(outputs[0].id);

    } catch (err: any) {
      console.error("Generation Error:", err);
      alert("연산 이미지 픽셀 매트릭스를 조합하는 과정에서 오류가 발생했습니다. 입력을 확인해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setUploadedFiles([]);
    setPrompt("");
    setResults([]);
    setActiveResultId(null);
    setLocalBrushMaskUrl(null);
    setFineTune({ brightness: 100, contrast: 100, saturation: 100, blur: 0, warmth: 0 });
    setCompSettings({ scale: 80, rotate: 0, xOffset: 0, yOffset: 0, opacity: 100, feather: 3, blendMode: "normal" });
    setRestSettings({ colorIntensity: 85, scratchRemoval: true, denoise: true });
    setRemoveBgSettings({ mode: "bg-remove", brushSize: 18 });
    setPassportSettings({ guideOverlay: true, bgColor: "light-blue", zoom: 95 });
    setSkinSettings({ smoothness: 60, blemishRetouch: 50, eyeBrightness: 40 });
  };

  // Called when manual brush canvas output changes
  const handleBrushStroke = async (maskDataUrl: string) => {
    setLocalBrushMaskUrl(maskDataUrl);
    
    // Live update removed bg with brush stroke instantly
    if (uploadedFiles.length > 0) {
      const activeUploaded = uploadedFiles[0];
      const updatedUrl = await processBackgroundRemoval(
        activeUploaded.url,
        removeBgSettings,
        maskDataUrl
      );
      
      setResults(prev => prev.map(res => {
        if (res.id === activeResultId) {
          return { ...res, resultUrl: updatedUrl, fineTunedUrl: undefined };
        }
        return res;
      }));
    }
  };

  const clearBrushStroke = () => {
    setLocalBrushMaskUrl(null);
    handleGenerate(); // re-generate default
  };

  return (
    <div id="image-studio-app-root" className="flex flex-col lg:flex-row w-screen h-screen bg-[#07080a] select-none overflow-hidden font-sans">
      
      {/* Loading overlay */}
      {isGenerating && (
        <div className="absolute inset-0 z-50 flex flex-col justify-center items-center bg-[#07080ae0] backdrop-blur-md animate-fadeIn text-center">
          <div className="relative w-24 h-24 mb-6">
            {/* Pulsing ring outer edge */}
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping"></div>
            {/* Spinning colorful loader */}
            <div className="absolute inset-0 rounded-full border-t-4 border-l-4 border-indigo-500 animate-spin"></div>
            {/* Central glowing core logo */}
            <div className="absolute inset-2 bg-[#0d0f14] border border-[#212635] rounded-full flex items-center justify-center text-white">
              <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-lg font-bold text-white tracking-widest uppercase font-sans flex items-center gap-2">
            이미지 스튜디오 AI 연산기 가동 중
          </h2>
          <p className="text-sm font-semibold text-cyan-300 font-mono mt-3 animate-pulse">{generationPhase}</p>
          
          {/* Progression strip bar */}
          <div className="w-80 bg-gray-900 border border-gray-800 rounded-full h-2 mt-5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full transition-all duration-300"
              style={{ width: `${generationPercent}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 font-mono mt-2 font-bold">{generationPercent}%</span>
        </div>
      )}

      {/* 3-column Layout structure */}
      
      {/* 1. Left Panel (입력) */}
      <div className="w-full lg:w-[28%] xl:w-[25%] h-[35vh] lg:h-full shrink-0">
        <InputPanel
          uploadedFiles={uploadedFiles}
          onUpload={handleUpload}
          onRemove={handleRemoveFile}
          prompt={prompt}
          onPromptChange={setPrompt}
          onSelectSample={handleSelectSample}
        />
      </div>

      {/* 2. Middle Panel (제어) */}
      <div className="w-full lg:w-[32%] xl:w-[30%] h-[30vh] lg:h-full shrink-0">
        <ControlPanel
          currentMode={currentMode}
          onModeSelect={setCurrentMode}
          compSettings={compSettings}
          setCompSettings={setCompSettings}
          restSettings={restSettings}
          setRestSettings={setRestSettings}
          removeBgSettings={removeBgSettings}
          setRemoveBgSettings={setRemoveBgSettings}
          passportSettings={passportSettings}
          setPassportSettings={setPassportSettings}
          skinSettings={skinSettings}
          setSkinSettings={setSkinSettings}
          genOptions={genOptions}
          setGenOptions={setGenOptions}
          onReset={handleReset}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          uploadedCount={uploadedFiles.length}
        />
      </div>

      {/* 3. Right Panel (결과 화면 및 정밀 수정) */}
      <div className="flex-1 h-[35vh] lg:h-full">
        <ResultPanel
          results={results}
          activeResultId={activeResultId}
          setActiveResultId={setActiveResultId}
          isEraserMode={currentMode === StudioMode.REMOVE_BG && removeBgSettings.mode === "erase-brush"}
          brushSize={removeBgSettings.brushSize}
          onBrushStroke={handleBrushStroke}
          localBrushMaskUrl={localBrushMaskUrl}
          clearBrushStroke={clearBrushStroke}
          fineTune={fineTune}
          setFineTune={setFineTune}
          onApplyFineTune={handleApplyFineTune}
          isApplyingFineTune={isApplyingFineTune}
        />
      </div>

    </div>
  );
}
