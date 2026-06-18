import React from "react";
import { 
  Layers, 
  Trash2, 
  RotateCcw, 
  Scissors, 
  UserSquare, 
  Smile, 
  VolumeX, 
  Zap, 
  Plus, 
  Minus 
} from "lucide-react";
import { 
  StudioMode, 
  CompositionSettings, 
  RestorationSettings, 
  RemoveBgSettings, 
  PassportSettings, 
  SkinSettings, 
  GenerationOptions 
} from "../types";

interface ControlPanelProps {
  currentMode: StudioMode;
  onModeSelect: (mode: StudioMode) => void;
  // Options
  compSettings: CompositionSettings;
  setCompSettings: React.Dispatch<React.SetStateAction<CompositionSettings>>;
  restSettings: RestorationSettings;
  setRestSettings: React.Dispatch<React.SetStateAction<RestorationSettings>>;
  removeBgSettings: RemoveBgSettings;
  setRemoveBgSettings: React.Dispatch<React.SetStateAction<RemoveBgSettings>>;
  passportSettings: PassportSettings;
  setPassportSettings: React.Dispatch<React.SetStateAction<PassportSettings>>;
  skinSettings: SkinSettings;
  setSkinSettings: React.Dispatch<React.SetStateAction<SkinSettings>>;
  
  genOptions: GenerationOptions;
  setGenOptions: React.Dispatch<React.SetStateAction<GenerationOptions>>;

  onReset: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  uploadedCount: number;
}

export default function ControlPanel({
  currentMode,
  onModeSelect,
  compSettings,
  setCompSettings,
  restSettings,
  setRestSettings,
  removeBgSettings,
  setRemoveBgSettings,
  passportSettings,
  setPassportSettings,
  skinSettings,
  setSkinSettings,
  genOptions,
  setGenOptions,
  onReset,
  onGenerate,
  isGenerating,
  uploadedCount,
}: ControlPanelProps) {

  const activeTabClass = "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-950/45 border-none";
  const inactiveTabClass = "bg-[#181a20] text-gray-400 hover:text-white border border-[#232731] hover:bg-[#1a1d24]";

  const updateComp = (field: keyof CompositionSettings, val: any) => {
    setCompSettings(prev => ({ ...prev, [field]: val }));
  };

  const updateRest = (field: keyof RestorationSettings, val: any) => {
    setRestSettings(prev => ({ ...prev, [field]: val }));
  };

  const updateRemoveBg = (field: keyof RemoveBgSettings, val: any) => {
    setRemoveBgSettings(prev => ({ ...prev, [field]: val }));
  };

  const updatePassport = (field: keyof PassportSettings, val: any) => {
    setPassportSettings(prev => ({ ...prev, [field]: val }));
  };

  const updateSkin = (field: keyof SkinSettings, val: any) => {
    setSkinSettings(prev => ({ ...prev, [field]: val }));
  };

  return (
    <div id="control-panel-section" className="flex flex-col h-full bg-[#0d0f13] border-r border-[#1e222c] p-5 overflow-y-auto custom-scrollbar text-gray-200">
      
      {/* 1. Feature Tabs Selector */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          1. 제어 기능 선택
        </label>
        
        <div className="flex flex-col gap-2">
          {/* 이미지 합성/생성 */}
          <button
            type="button"
            className={`flex items-center gap-2.5 w-full text-left px-3.5 py-3 rounded-xl text-xs font-medium transition-all ${
              currentMode === StudioMode.COMPOSITION ? activeTabClass : inactiveTabClass
            }`}
            onClick={() => onModeSelect(StudioMode.COMPOSITION)}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-xs">이미지 합성 / 생성</p>
              <p className="text-[10px] text-gray-400 mt-0.5 group-hover:text-white">사진 배경과 피사체 레이어 원활한 혼합</p>
            </div>
          </button>

          {/* 사진복원/업스케일 */}
          <button
            type="button"
            className={`flex items-center gap-2.5 w-full text-left px-3.5 py-3 rounded-xl text-xs font-medium transition-all ${
              currentMode === StudioMode.RESTORATION ? activeTabClass : inactiveTabClass
            }`}
            onClick={() => onModeSelect(StudioMode.RESTORATION)}
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-xs">사진 복원 / 업스케일</p>
              <p className="text-[10px] text-gray-400 mt-0.5">오래된 빛바랜 사진의 보정 및 선명화</p>
            </div>
          </button>

          {/* 배경제거/부분삭제 */}
          <button
            type="button"
            className={`flex items-center gap-2.5 w-full text-left px-3.5 py-3 rounded-xl text-xs font-medium transition-all ${
              currentMode === StudioMode.REMOVE_BG ? activeTabClass : inactiveTabClass
            }`}
            onClick={() => onModeSelect(StudioMode.REMOVE_BG)}
          >
            <Scissors className="w-4 h-4 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-xs">배경 제거 / 부분 삭제</p>
              <p className="text-[10px] text-gray-400 mt-0.5">수동 및 AI 배경 제거 및 지우개 브러시</p>
            </div>
          </button>

          {/* 여권사진 제작 */}
          <button
            type="button"
            className={`flex items-center gap-2.5 w-full text-left px-3.5 py-3 rounded-xl text-xs font-medium transition-all ${
              currentMode === StudioMode.PASSPORT ? activeTabClass : inactiveTabClass
            }`}
            onClick={() => onModeSelect(StudioMode.PASSPORT)}
          >
            <UserSquare className="w-4 h-4 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-xs">여권 사진 제작</p>
              <p className="text-[10px] text-gray-400 mt-0.5">배경 자동 교체 및 오버레이 규격 장치</p>
            </div>
          </button>

          {/* 피부보정 */}
          <button
            type="button"
            className={`flex items-center gap-2.5 w-full text-left px-3.5 py-3 rounded-xl text-xs font-medium transition-all ${
              currentMode === StudioMode.SKIN ? activeTabClass : inactiveTabClass
            }`}
            onClick={() => onModeSelect(StudioMode.SKIN)}
          >
            <Smile className="w-4 h-4 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-xs">피부 보정</p>
              <p className="text-[10px] text-gray-400 mt-0.5">피부 결 매끄럽게 만들기 및 미백 뷰티 필터</p>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Mode Specific Dynamic Controls */}
      <div className="flex-1 mb-6 border-t border-[#1e222c] pt-5">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          2. 정밀 제어 변수 설정
        </label>

        {/* COMPOSITION Controls */}
        {currentMode === StudioMode.COMPOSITION && (
          <div className="space-y-4 animate-fadeIn">
            {uploadedCount < 2 && (
              <div className="bg-[#a855f7]/10 border border-[#a855f7]/20 p-3 rounded-lg mb-2">
                <p className="text-[11px] text-purple-300 leading-relaxed">
                  💡 <strong>합성 모드 팁:</strong> 이미지 합성을 위해서는 최소 2장의 사진(예: 배경 사진 1장 + 개체 사진 1장)을 업로드하거나 아래의 샘플을 불러와주세요.
                </p>
              </div>
            )}
            
            {/* Scale */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">합성 개체 크기 배율 (Scale)</span>
                <span className="text-cyan-400 font-mono font-bold">{compSettings.scale}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={200}
                value={compSettings.scale}
                onChange={(e) => updateComp("scale", parseInt(e.target.value))}
                className="w-full accent-indigo-600 bg-gray-800 rounded-lg appearance-none h-1.5 cursor-pointer"
              />
            </div>

            {/* Rotation */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">회전 각도 (Rotate)</span>
                <span className="text-cyan-400 font-mono font-bold">{compSettings.rotate}°</span>
              </div>
              <input
                type="range"
                min={-180}
                max={180}
                value={compSettings.rotate}
                onChange={(e) => updateComp("rotate", parseInt(e.target.value))}
                className="w-full accent-indigo-600 bg-gray-800 rounded-lg appearance-none h-1.5 cursor-pointer"
              />
            </div>

            {/* X Offset */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">가로 위치 조정 (X Offset)</span>
                <span className="text-cyan-400 font-mono font-bold">{compSettings.xOffset} px</span>
              </div>
              <input
                type="range"
                min={-250}
                max={250}
                value={compSettings.xOffset}
                onChange={(e) => updateComp("xOffset", parseInt(e.target.value))}
                className="w-full accent-indigo-600 bg-gray-800 rounded-lg appearance-none h-1.5 cursor-pointer"
              />
            </div>

            {/* Y Offset */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">세로 위치 조정 (Y Offset)</span>
                <span className="text-cyan-400 font-mono font-bold">{compSettings.yOffset} px</span>
              </div>
              <input
                type="range"
                min={-250}
                max={250}
                value={compSettings.yOffset}
                onChange={(e) => updateComp("yOffset", parseInt(e.target.value))}
                className="w-full accent-indigo-600 bg-gray-800 rounded-lg appearance-none h-1.5 cursor-pointer"
              />
            </div>

            {/* Opacity */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">개체 불투명도 (Opacity)</span>
                <span className="text-cyan-400 font-mono font-bold">{compSettings.opacity}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={compSettings.opacity}
                onChange={(e) => updateComp("opacity", parseInt(e.target.value))}
                className="w-full accent-indigo-600 bg-gray-800 rounded-lg appearance-none h-1.5 cursor-pointer"
              />
            </div>

            {/* Feather Shadow */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">경계면 페더링 블러 (Feathering)</span>
                <span className="text-cyan-400 font-mono font-bold">{compSettings.feather}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                value={compSettings.feather}
                onChange={(e) => updateComp("feather", parseInt(e.target.value))}
                className="w-full accent-indigo-600 bg-gray-800 rounded-lg appearance-none h-1.5 cursor-pointer"
              />
            </div>

            {/* Blend Mode */}
            <div>
              <span className="block text-xs text-gray-400 mb-1.5">블렌딩 혼합 모드 (Blend Mode)</span>
              <select
                value={compSettings.blendMode}
                onChange={(e) => updateComp("blendMode", e.target.value)}
                className="w-full bg-[#181a20] border border-[#262c3a] rounded-xl text-xs text-gray-200 px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="normal">Normal (표준 합성)</option>
                <option value="multiply">Multiply (곱하기 - 어두운 음영 매칭)</option>
                <option value="screen">Screen (스크린 - 빛 입히기 및 태양광 발광)</option>
                <option value="overlay">Overlay (오버레이 - 입체감 대조 합성)</option>
                <option value="soft-light">Soft Light (소프트 라이트 - 부드러운 안개 광원)</option>
              </select>
            </div>
          </div>
        )}

        {/* RESTORATION Controls */}
        {currentMode === StudioMode.RESTORATION && (
          <div className="space-y-4 animate-fadeIn">
            {/* Colorize Intensity */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">인공지능 컬러화 채색 정도</span>
                <span className="text-cyan-400 font-mono font-bold">{restSettings.colorIntensity}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={restSettings.colorIntensity}
                onChange={(e) => updateRest("colorIntensity", parseInt(e.target.value))}
                className="w-full accent-indigo-600 bg-gray-800 rounded-lg appearance-none h-1.5 cursor-pointer"
              />
            </div>

            {/* Scratch Removal Toggle */}
            <div className="flex items-center justify-between p-3 bg-[#181a20] rounded-xl border border-[#232731] hover:border-[#2d323f] transition-all">
              <div>
                <span className="block text-xs font-semibold text-gray-200">자동 미세 크랙 및 스크래치 복원</span>
                <span className="text-[10px] text-gray-500">사진의 물리적 접힘 및 하얀 실선 제거</span>
              </div>
              <input
                type="checkbox"
                checked={restSettings.scratchRemoval}
                onChange={(e) => updateRest("scratchRemoval", e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-gray-800 border-gray-700 rounded focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Denoise Toggle */}
            <div className="flex items-center justify-between p-3 bg-[#181a20] rounded-xl border border-[#232731] hover:border-[#2d323f] transition-all">
              <div>
                <span className="block text-xs font-semibold text-gray-200">노이즈 억제 및 대비 선명화</span>
                <span className="text-[10px] text-gray-500">흐린 입자 디테일 업스케일 처리</span>
              </div>
              <input
                type="checkbox"
                checked={restSettings.denoise}
                onChange={(e) => updateRest("denoise", e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-gray-800 border-gray-700 rounded focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* REMOVE_BG Controls */}
        {currentMode === StudioMode.REMOVE_BG && (
          <div className="space-y-4 animate-fadeIn">
            {/* Background mode Selector */}
            <div>
              <span className="block text-xs text-gray-400 mb-1.5">배경 처리 방식 선택</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                    removeBgSettings.mode === "bg-remove"
                      ? "bg-indigo-600/20 text-indigo-300 border-indigo-600"
                      : "bg-[#181a20] text-gray-400 border-[#232731]"
                  }`}
                  onClick={() => updateRemoveBg("mode", "bg-remove")}
                >
                  기본 자동 배경 투명화
                </button>
                <button
                  type="button"
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                    removeBgSettings.mode === "erase-brush"
                      ? "bg-indigo-600/20 text-indigo-300 border-indigo-600"
                      : "bg-[#181a20] text-gray-400 border-[#232731]"
                  }`}
                  onClick={() => updateRemoveBg("mode", "erase-brush")}
                >
                  수동 부분 브러시 삭제
                </button>
              </div>
            </div>

            {/* Brush Size (enabled for brush deletes) */}
            {removeBgSettings.mode === "erase-brush" && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">지우개 지우기 브러시 크기</span>
                  <span className="text-cyan-400 font-mono font-bold">{removeBgSettings.brushSize} px</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={removeBgSettings.brushSize}
                  onChange={(e) => updateRemoveBg("brushSize", parseInt(e.target.value))}
                  className="w-full accent-indigo-600 bg-gray-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                />
                <p className="text-[10px] text-gray-500 mt-1">오른쪽 생성 결과창의 원본 사진 위에 직접 문질러 수동으로 부분을 투명하게 깎을 수 있습니다.</p>
              </div>
            )}
          </div>
        )}

        {/* PASSPORT Controls */}
        {currentMode === StudioMode.PASSPORT && (
          <div className="space-y-4 animate-fadeIn">
            {/* Template guides */}
            <div className="flex items-center justify-between p-3 bg-[#181a20] rounded-xl border border-[#232731]">
              <div>
                <span className="block text-xs font-semibold text-gray-200">국제 표준 정렬 가이드 표시</span>
                <span className="text-[10px] text-gray-500">눈, 수평, 어깨 기준 중심 점선 구도 출력</span>
              </div>
              <input
                type="checkbox"
                checked={passportSettings.guideOverlay}
                onChange={(e) => updatePassport("guideOverlay", e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-gray-800 border-gray-700 rounded focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Background Color chooser */}
            <div>
              <span className="block text-xs text-gray-400 mb-2">여권 공식 가상 배경색 지정</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  className={`px-3 py-2 text-xs rounded-lg border transition-all cursor-pointer ${
                    passportSettings.bgColor === "white"
                      ? "bg-white text-gray-900 border-white font-bold"
                      : "bg-[#181a20] text-gray-300 border-[#232731]"
                  }`}
                  onClick={() => updatePassport("bgColor", "white")}
                >
                  순백색 (white)
                </button>
                <button
                  type="button"
                  className={`px-3 py-2 text-xs rounded-lg border transition-all cursor-pointer ${
                    passportSettings.bgColor === "light-blue"
                      ? "bg-sky-100 text-sky-900 border-sky-200 font-bold"
                      : "bg-[#181a20] text-gray-300 border-[#232731]"
                  }`}
                  onClick={() => updatePassport("bgColor", "light-blue")}
                >
                  연청색 (blue)
                </button>
                <button
                  type="button"
                  className={`px-3 py-2 text-xs rounded-lg border transition-all cursor-pointer ${
                    passportSettings.bgColor === "gray"
                      ? "bg-slate-300 text-gray-950 border-slate-400 font-bold"
                      : "bg-[#181a20] text-gray-300 border-[#232731]"
                  }`}
                  onClick={() => updatePassport("bgColor", "gray")}
                >
                  회색 (gray)
                </button>
              </div>
            </div>

            {/* Frame crop zoom scale */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">인물 크롭 프레임 확대률</span>
                <span className="text-cyan-400 font-mono font-bold">{passportSettings.zoom}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={150}
                value={passportSettings.zoom}
                onChange={(e) => updatePassport("zoom", parseInt(e.target.value))}
                className="w-full accent-indigo-600 bg-gray-800 rounded-lg appearance-none h-1.5 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* SKIN Controls */}
        {currentMode === StudioMode.SKIN && (
          <div className="space-y-4 animate-fadeIn">
            {/* Smoothness */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">피부 질감 매끄럽게 (Smoothness)</span>
                <span className="text-cyan-400 font-mono font-bold">{skinSettings.smoothness}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={skinSettings.smoothness}
                onChange={(e) => updateSkin("smoothness", parseInt(e.target.value))}
                className="w-full accent-indigo-600 bg-gray-800 rounded-lg appearance-none h-1.5 cursor-pointer"
              />
            </div>

            {/* Blemish Retouch */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">얼굴 잡티 복구 민감도 (Blemish Eraser)</span>
                <span className="text-cyan-400 font-mono font-bold">{skinSettings.blemishRetouch}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={skinSettings.blemishRetouch}
                onChange={(e) => updateSkin("blemishRetouch", parseInt(e.target.value))}
                className="w-full accent-indigo-600 bg-gray-800 rounded-lg appearance-none h-1.5 cursor-pointer"
              />
            </div>

            {/* Eye Highlight brightness */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">눈망울 선명도 및 밝기 (Eyes Highlight)</span>
                <span className="text-cyan-400 font-mono font-bold">{skinSettings.eyeBrightness}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={skinSettings.eyeBrightness}
                onChange={(e) => updateSkin("eyeBrightness", parseInt(e.target.value))}
                className="w-full accent-indigo-600 bg-gray-800 rounded-lg appearance-none h-1.5 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Common Image Output Options Section */}
      <div className="border-t border-[#1e222c] pt-5 mb-5 space-y-4 text-gray-200">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">
          3. 이미지 생성 규격 옵션
        </label>

        {/* Aspect Ratio */}
        <div>
          <span className="block text-xs text-gray-400 mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            이미지 종횡비 일관성 (Aspect Ratio)
          </span>
          <div className="grid grid-cols-5 gap-1 text-[11px] font-mono font-semibold">
            {(["1:1", "4:3", "3:4", "16:9", "9:16"] as const).map((ratio) => (
              <button
                key={ratio}
                type="button"
                className={`py-1.5 rounded transition-all cursor-pointer ${
                  genOptions.aspectRatio === ratio
                    ? "bg-indigo-600 text-white font-bold"
                    : "bg-[#181a20] text-gray-400 hover:text-white"
                }`}
                onClick={() => setGenOptions(prev => ({ ...prev, aspectRatio: ratio }))}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        {/* Generated count */}
        <div>
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>생성 한도 수량 (장수)</span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className="w-6 h-6 rounded-md bg-[#181a20] flex items-center justify-center hover:bg-[#232731] text-gray-300 cursor-pointer"
                onClick={() => setGenOptions(prev => ({ ...prev, count: Math.max(1, prev.count - 1) }))}
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-cyan-400 font-bold font-mono text-xs w-3 text-center">{genOptions.count}</span>
              <button
                type="button"
                className="w-6 h-6 rounded-md bg-[#181a20] flex items-center justify-center hover:bg-[#232731] text-gray-300 cursor-pointer"
                onClick={() => setGenOptions(prev => ({ ...prev, count: Math.min(4, prev.count + 1) }))}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Generate And Reset action buttons footer */}
      <div className="grid grid-cols-3 gap-2 mt-auto border-t border-[#1e222c] pt-5">
        <button
          type="button"
          className="col-span-1 py-3 px-3 rounded-xl border border-[#2c3140] bg-[#14171f] hover:bg-[#1a1d27] text-gray-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer lg:px-1.5"
          onClick={onReset}
        >
          <Trash2 className="w-4 h-4 shrink-0" />
          초기화
        </button>
        <button
          id="generate-studio-btn"
          type="button"
          className={`col-span-2 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
            isGenerating
              ? "bg-indigo-600/50 text-indigo-200 cursor-wait"
              : "bg-gradient-to-r from-indigo-505 via-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          }`}
          disabled={isGenerating}
          onClick={onGenerate}
          style={{ backgroundColor: isGenerating ? undefined : "#4f46e5" }}
        >
          <Zap className={`w-4 h-4 ${isGenerating ? "animate-bounce" : ""}`} />
          {isGenerating ? "이미지 연산중..." : "이미지 생성하기"}
        </button>
      </div>

    </div>
  );
}
