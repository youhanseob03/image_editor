import React, { useState, useRef, useEffect } from "react";
import { Download, Sliders, RefreshCw, Layers, Sparkles, Scissors, Eye, Image as ImageIcon } from "lucide-react";
import { GeneratedResult, FineTuneSettings } from "../types";

interface ResultPanelProps {
  results: GeneratedResult[];
  activeResultId: string | null;
  setActiveResultId: (id: string | null) => void;
  
  // Brush masking callbacks for manual erase mode
  isEraserMode: boolean;
  brushSize: number;
  onBrushStroke: (maskDataUrl: string) => void;
  localBrushMaskUrl: string | null;
  clearBrushStroke: () => void;
  
  // Fine tune state
  fineTune: FineTuneSettings;
  setFineTune: React.Dispatch<React.SetStateAction<FineTuneSettings>>;
  onApplyFineTune: () => void;
  isApplyingFineTune: boolean;
}

export default function ResultPanel({
  results,
  activeResultId,
  setActiveResultId,
  isEraserMode,
  brushSize,
  onBrushStroke,
  localBrushMaskUrl,
  clearBrushStroke,
  fineTune,
  setFineTune,
  onApplyFineTune,
  isApplyingFineTune,
}: ResultPanelProps) {
  
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  
  // Canvas for manual eraser drawing
  const brushCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Active result object
  const activeResult = results.find(r => r.id === activeResultId) || results[0] || null;

  // Handle slide split calculation
  const handleMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  // BRUSH ERASE DRAWING LOGIC ON CANVAS
  useEffect(() => {
    if (!isEraserMode || !brushCanvasRef.current || !activeResult) return;
    const canvas = brushCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear and match resolution to screen rendering size
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    // Set drawing styles
    ctx.strokeStyle = "rgba(255, 0, 0, 0.4)"; // red overlay for brush stroke
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [isEraserMode, brushSize, activeResult]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEraserMode || !brushCanvasRef.current) return;
    const canvas = brushCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isEraserMode || !brushCanvasRef.current) return;
    const canvas = brushCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing || !brushCanvasRef.current) return;
    setIsDrawing(false);

    // Convert drawn stroke canvas black-and-white mask
    // We convert colored strokes to a proper destination-out transparent mask for synthesis processing
    const canvas = brushCanvasRef.current;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const expCtx = exportCanvas.getContext("2d");
    if (expCtx) {
      // Draw standard plain black stroke on transparent background so utils can read as erase regions
      expCtx.strokeStyle = "#ffffff";
      expCtx.lineWidth = brushSize;
      expCtx.lineCap = "round";
      expCtx.lineJoin = "round";
      expCtx.drawImage(canvas, 0, 0);
      
      onBrushStroke(canvas.toDataURL("image/png"));
    }
  };

  // Helper trigger action for download
  const handleDownload = () => {
    if (!activeResult) return;
    const link = document.createElement("a");
    // If fine tuned version exists, download fine tuned, otherwise download raw result
    link.href = activeResult.fineTunedUrl || activeResult.resultUrl;
    link.download = `image-studio-${activeResult.mode.toLowerCase()}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFineTuneReset = () => {
    setFineTune({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      warmth: 0
    });
  };

  const getFilteredStyle = () => {
    if (isApplyingFineTune) return {}; // CSS filters are baked into the generated base64 at that stage!
    return {
      filter: `brightness(${fineTune.brightness}%) contrast(${fineTune.contrast}%) saturate(${fineTune.saturation}%) blur(${fineTune.blur}px)`
    };
  };

  return (
    <div id="result-panel-section" className="flex flex-col h-full bg-[#0a0c0f] p-5 overflow-y-auto custom-scrollbar text-gray-200">
      
      {/* Panel title */}
      <div className="flex justify-between items-center mb-4">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          3. 생성물 최종 결과 화면
        </label>
        {activeResult && (
          <span className="text-[10px] bg-indigo-950/50 text-indigo-300 border border-indigo-900/40 px-2 py-0.5 rounded-full font-mono">
            {activeResult.mode}
          </span>
        )}
      </div>

      {/* Main workspace container */}
      <div className="flex-1 min-h-[350px] flex flex-col justify-center items-center bg-[#07080a] rounded-2xl border border-[#161a22] p-4 relative overflow-hidden group">
        
        {activeResult ? (
          <div className="w-full h-full flex flex-col items-center justify-center relative">
            
            {/* Split comparison slider wrapper */}
            <div 
              ref={sliderContainerRef}
              className="relative w-full max-w-lg aspect-square rounded-xl bg-[#111317] border border-[#212633] overflow-hidden select-none"
              style={{
                aspectRatio: activeResult.aspectRatio === "1:1" ? "1/1" : 
                             activeResult.aspectRatio === "4:3" ? "4/3" :
                             activeResult.aspectRatio === "3:4" ? "3/4" :
                             activeResult.aspectRatio === "16:9" ? "16/9" : "9/16"
              }}
            >
              {/* Back layer: Original photo (변경 전) */}
              <img
                src={activeResult.originalUrl}
                alt="원본 변경전"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-red-600/80 text-[10px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm shadow z-20">
                변경 전 (Before)
              </div>

              {/* Front layer: Output photo (변경 후, clipped by slider coordinate) */}
              <div 
                className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-all duration-75"
                style={{
                  clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`
                }}
              >
                <img
                  src={activeResult.fineTunedUrl || activeResult.resultUrl}
                  alt="편집 변경후"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none decoration-cyan-400"
                  style={getFilteredStyle()}
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute top-3 right-3 bg-cyan-600/80 text-[10px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm shadow z-20">
                변경 후 (After)
              </div>

              {/* Manual eraser brush overlay (mounts when background-removal brush is active) */}
              {isEraserMode && (
                <div className="absolute inset-0 w-full h-full bg-transparent z-30">
                  <div className="absolute top-10 right-3 bg-amber-500/90 text-[10px] text-black px-2.5 py-1 rounded-md font-bold uppercase backdrop-blur-sm shadow-md animate-bounce">
                    ✏️ 결과물에 브러시질하여 삭제하세요
                  </div>
                  <canvas
                    ref={brushCanvasRef}
                    className="absolute inset-0 w-full h-full cursor-crosshair"
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                  />
                  <div className="absolute bottom-3 left-3 right-3 flex gap-2 z-40 justify-center">
                    <button
                      type="button"
                      className="px-2.5 py-1 text-[10px] bg-red-600 rounded-md font-bold text-white shadow hover:bg-red-500 transition-all cursor-pointer"
                      onClick={clearBrushStroke}
                    >
                      전체 브러쉬 복구
                    </button>
                    <button
                      type="button"
                      className="px-2.5 py-1 text-[10px] bg-emerald-600 rounded-md font-bold text-white shadow hover:bg-emerald-500 transition-all cursor-pointer"
                      onClick={onApplyFineTune}
                    >
                      수정 적용
                    </button>
                  </div>
                </div>
              )}

              {/* Slider boundary tracker line handle */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-cyan-400 z-10 cursor-col-resize shadow-[0_0_12px_#22d3ee]"
                style={{ left: `${sliderPos}%` }}
                onMouseDown={() => setIsDragging(true)}
                onTouchStart={() => setIsDragging(true)}
              >
                <div 
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-cyan-400 border-4 border-slate-900 flex items-center justify-center shadow-lg cursor-col-resize active:scale-110 transition-transform"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-950 rotate-90" />
                </div>
              </div>

              {/* Aspect Ratio Guideline frame indicators for safety */}
              <div className="absolute inset-0 pointer-events-none border border-cyan-400/20 z-0"></div>
            </div>

            {/* Downloader Trigger Toolbar */}
            <div className="w-full max-w-lg mt-4 flex items-center justify-between">
              <div className="text-[11px] text-gray-500">
                중앙 핸들을 좌우로 문질러 <strong>변경 전후</strong> 일관성을 체크하실 수 있습니다.
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-505 via-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs transition-all tracking-wide shadow-md hover:shadow-cyan-900/30 cursor-pointer hover:scale-[1.01]"
                onClick={handleDownload}
                style={{ backgroundColor: "#06b6d4" }}
              >
                <Download className="w-4 h-4 shrink-0" />
                결과 다운로드 (PNG)
              </button>
            </div>

          </div>
        ) : (
          /* Empty / Default upload recommendation visualizer */
          <div className="text-center p-8 max-w-sm flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/20 border border-cyan-900/25 flex items-center justify-center text-cyan-400 mb-4 animate-pulse">
              <ImageIcon className="w-8 h-8" />
            </div>
            <p className="text-gray-300 font-bold text-sm tracking-wide">활성화된 생성물이 없습니다</p>
            <p className="text-[#656e85] text-xs mt-2 leading-relaxed">
              왼쪽 패널에 <strong>아이디어를 입력</strong>하거나 <strong>샘플 미디어</strong>를 선택한 뒤, 하단의 <strong>이미지 생성하기</strong> 버튼을 클릭하면 AI 엔진 연동이 수립됩니다.
            </p>
          </div>
        )}
      </div>

      {/* 4. Fine Tune Adjustments Section */}
      {activeResult && (
        <div className="mt-5 bg-[#0f1116] border border-[#1b1e26] p-4 rounded-2xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#1b1e26]">
            <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              최종 산출물 정밀 보정 (Precision Tuner)
            </span>
            <button
              type="button"
              className="text-[10px] text-gray-500 hover:text-white flex items-center gap-0.5 transition-all cursor-pointer"
              onClick={handleFineTuneReset}
            >
              <RefreshCw className="w-2.5 h-2.5" />
              보정 초기화
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
            {/* Brightness */}
            <div>
              <div className="flex justify-between mb-1">
                <span>밝기 (Brightness)</span>
                <span className="text-cyan-400 font-mono font-bold">{fineTune.brightness}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={150}
                value={fineTune.brightness}
                onChange={(e) => setFineTune(p => ({ ...p, brightness: parseInt(e.target.value) }))}
                className="w-full accent-cyan-400 bg-gray-800 rounded-lg appearance-none h-1 cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div>
              <div className="flex justify-between mb-1">
                <span>대비 (Contrast)</span>
                <span className="text-cyan-400 font-mono font-bold">{fineTune.contrast}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={150}
                value={fineTune.contrast}
                onChange={(e) => setFineTune(p => ({ ...p, contrast: parseInt(e.target.value) }))}
                className="w-full accent-cyan-400 bg-gray-800 rounded-lg appearance-none h-1 cursor-pointer"
              />
            </div>

            {/* Saturation */}
            <div>
              <div className="flex justify-between mb-1">
                <span>채도 (Saturation)</span>
                <span className="text-cyan-400 font-mono font-bold">{fineTune.saturation}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                value={fineTune.saturation}
                onChange={(e) => setFineTune(p => ({ ...p, saturation: parseInt(e.target.value) }))}
                className="w-full accent-cyan-400 bg-gray-800 rounded-lg appearance-none h-1 cursor-pointer"
              />
            </div>

            {/* Blur */}
            <div>
              <div className="flex justify-between mb-1">
                <span>샤프니스 / 흐림 (Blur)</span>
                <span className="text-cyan-400 font-mono font-bold">{fineTune.blur}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={fineTune.blur}
                onChange={(e) => setFineTune(p => ({ ...p, blur: parseInt(e.target.value) }))}
                className="w-full accent-cyan-400 bg-gray-800 rounded-lg appearance-none h-1 cursor-pointer"
              />
            </div>

            {/* Warmth */}
            <div className="col-span-2">
              <div className="flex justify-between mb-1">
                <span>색온도 냉정/태양빛 (Color Temperature)</span>
                <span className="text-cyan-400 font-mono font-bold">{fineTune.warmth > 0 ? `+${fineTune.warmth}` : fineTune.warmth}</span>
              </div>
              <input
                type="range"
                min={-50}
                max={50}
                value={fineTune.warmth}
                onChange={(e) => setFineTune(p => ({ ...p, warmth: parseInt(e.target.value) }))}
                className="w-full accent-cyan-400 bg-gray-800 rounded-lg appearance-none h-1 cursor-pointer"
              />
            </div>
          </div>

          <button
            type="button"
            className="w-full py-2 bg-indigo-950/40 border border-indigo-900/50 hover:bg-indigo-950/70 text-indigo-300 font-bold rounded-xl text-xs flex justify-center items-center gap-1.5 transition-all cursor-pointer"
            onClick={onApplyFineTune}
            disabled={isApplyingFineTune}
          >
            {isApplyingFineTune ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                보정 필터 이미지에 병합 적용 중...
              </>
            ) : (
              <>
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                정밀 보정 병합 및 인코딩
              </>
            )}
          </button>
        </div>
      )}

      {/* 5. Live Multi-generation list (If count > 1) */}
      {results.length > 1 && (
        <div className="mt-5">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            🖼️ 동시 생성 장수 목록 ({results.length}장 생성됨)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {results.map((res, idx) => (
              <div
                key={res.id}
                onClick={() => setActiveResultId(res.id)}
                className={`aspect-square rounded-lg overflow-hidden border cursor-pointer relative group transition-all ${
                  activeResultId === res.id ? "border-cyan-400 ring-2 ring-cyan-900" : "border-[#1e222d] opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={res.fineTunedUrl || res.resultUrl}
                  alt={`Result ${idx+1}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-1 right-1 bg-black/60 text-[8px] text-white px-1.5 py-0.5 rounded-full font-mono">
                  #{idx+1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
