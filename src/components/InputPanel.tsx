import React, { useState, useRef } from "react";
import { Upload, Sparkles, Image as ImageIcon, X, AlertCircle } from "lucide-react";
import { UploadedFile } from "../types";

interface InputPanelProps {
  uploadedFiles: UploadedFile[];
  onUpload: (files: UploadedFile[]) => void;
  onRemove: (id: string) => void;
  prompt: string;
  onPromptChange: (val: string) => void;
  onSelectSample: (type: "retro-family" | "sunset" | "cat-astronaut" | "portrait-rough") => void;
}

export default function InputPanel({
  uploadedFiles,
  onUpload,
  onRemove,
  prompt,
  onPromptChange,
  onSelectSample,
}: InputPanelProps) {
  const [ideaInput, setIdeaInput] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementInfo, setEnhancementInfo] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File parsing to base64
  const processFiles = (files: FileList) => {
    const currentCount = uploadedFiles.length;
    const filesToRead = Array.from(files).slice(0, 3 - currentCount);

    if (filesToRead.length === 0) return;

    filesToRead.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const newFile: UploadedFile = {
            id: crypto.randomUUID(),
            name: file.name,
            url: e.target.result as string,
            size: file.size,
          };
          onUpload([newFile]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // call server-side gemini api to enhance prompt
  const handleEnhancePrompt = async () => {
    if (!ideaInput.trim()) return;
    setIsEnhancing(true);
    setEnhancementInfo(null);

    try {
      const res = await fetch("/api/prompt-enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: ideaInput }),
      });
      const data = await res.json();
      if (data.enhancedPrompt) {
        onPromptChange(data.enhancedPrompt);
        setEnhancementInfo(data.explanationKr);
      }
    } catch (err) {
      console.error("Failed to enhance prompt:", err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div id="input-panel-section" className="flex flex-col h-full bg-[#111318] border-r border-[#222630] p-5 overflow-y-auto custom-scrollbar text-gray-200">
      {/* Visual Identity Logo & Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white font-sans">이미지 스튜디오</h1>
          <p className="text-xs text-[#6e768a] font-mono">AI Image Studio Workspace</p>
        </div>
      </div>

      {/* Idea Inputs (AI Prompt Enhancer) Section */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          1. 아이디어 입력 및 인핸서
        </label>
        
        <div className="bg-[#181a20] rounded-xl p-4 border border-[#262c3a] shadow-inner">
          <textarea
            className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-500 border-none outline-none resize-none focus:ring-0"
            rows={3}
            placeholder="상상하는 편집 아이디어를 한국어로 자유롭게 입력하세요. (예: 저녁 노을빛 해변을 달리는 멋진 하얀 고양이)"
            value={ideaInput}
            onChange={(e) => setIdeaInput(e.target.value)}
          />
          
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#222630]">
            <span className="text-[10px] text-gray-500 font-mono">
              {ideaInput.length}자 입력됨
            </span>
            <button
              id="ai-prompt-btn"
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md ${
                ideaInput.trim()
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-indigo-900/30"
                  : "bg-[#222630] text-gray-500 cursor-not-allowed"
              }`}
              disabled={!ideaInput.trim() || isEnhancing}
              onClick={handleEnhancePrompt}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isEnhancing ? "animate-spin" : ""}`} />
              {isEnhancing ? "최적화 중..." : "AI 프롬프트 인핸서"}
            </button>
          </div>
        </div>

        {/* Real-time explanation output */}
        {enhancementInfo && (
          <div className="mt-3 p-3 bg-indigo-950/30 border border-indigo-900/50 rounded-xl flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-indigo-200 font-medium">AI 번역 및 디테일 강화 완료</p>
              <p className="text-[11px] text-[#8fa0c9] mt-0.5 leading-relaxed">{enhancementInfo}</p>
            </div>
          </div>
        )}

        {/* Enhanced Prompt Preview */}
        {prompt && (
          <div className="mt-3">
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">최적화된 생성 영어 프롬프트</label>
            <div className="bg-[#12141a] border border-[#1b1e26] p-3 rounded-lg text-[11px] text-cyan-300 font-mono leading-relaxed select-all">
              {prompt}
            </div>
          </div>
        )}
      </div>

      {/* Image Upload (Optional, Max 3) Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            2. 이미지 업로드 (선택, 최대 3장)
          </label>
          <span className="text-[11px] text-cyan-400 font-mono">
            {uploadedFiles.length} / 3 장
          </span>
        </div>

        {/* Drag and Drop Zone */}
        {uploadedFiles.length < 3 && (
          <div
            id="drag-drop-zone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragging
                ? "border-cyan-400 bg-cyan-950/10 text-cyan-200"
                : "border-[#262c3a] bg-[#181a20] hover:bg-[#1a1d25] text-gray-400"
            }`}
          >
            <Upload className="w-8 h-8 mb-2.5 text-indigo-400 shrink-0" />
            <p className="text-xs font-medium text-gray-200">파일 찾기 또는 드래그 & 드롭</p>
            <p className="text-[10px] text-gray-500 mt-1">PNG, JPG, BMP 지원 (최대 10MB)</p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* List of uploaded files */}
        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {uploadedFiles.map((file, idx) => (
              <div
                key={file.id}
                className="flex items-center gap-3 bg-[#181a20] p-2.5 rounded-xl border border-[#222630] group hover:border-[#3b4254] transition-all"
              >
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-10 h-10 rounded-lg object-cover bg-black border border-gray-800 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-200 truncate">{file.name}</p>
                  <p className="text-[10px] text-gray-500 font-mono">
                    {idx === 0 ? "메인 썸네일" : `파일 ${idx + 1}`} · {formatSize(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  className="w-6 h-6 rounded-full bg-red-950/20 text-red-400 flex items-center justify-center hover:bg-red-950/50 hover:text-red-300 transition-all cursor-pointer"
                  onClick={() => onRemove(file.id)}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preset Library for instant playground */}
      <div className="mt-auto pt-6 border-t border-[#1d212a]">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          ⚡ 실습용 고화질 샘플 로드
        </h3>
        <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
          업로드할 이미지가 없어도 제공되는 샘플 미디어를 로드하여 원클릭으로 모든 기능을 테스트할 수 있습니다.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="flex items-center gap-1 text-left px-3 py-2 bg-[#181a20] hover:bg-[#1f232c] border border-[#262c3a] rounded-lg transition-all text-[11px] text-gray-300 cursor-pointer"
            onClick={() => onSelectSample("retro-family")}
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
            부모님 옛날 흑백사진
          </button>
          <button
            type="button"
            className="flex items-center gap-1 text-left px-3 py-2 bg-[#181a20] hover:bg-[#1f232c] border border-[#262c3a] rounded-lg transition-all text-[11px] text-gray-300 cursor-pointer"
            onClick={() => onSelectSample("sunset")}
          >
            <ImageIcon className="w-3.5 h-3.5 text-red-500" />
            이탈리아 저녁 노을
          </button>
          <button
            type="button"
            className="flex items-center gap-1 text-left px-3 py-2 bg-[#181a20] hover:bg-[#1f232c] border border-[#262c3a] rounded-lg transition-all text-[11px] text-gray-300 cursor-pointer"
            onClick={() => onSelectSample("cat-astronaut")}
          >
            <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
            우주비행사 캐릭터
          </button>
          <button
            type="button"
            className="flex items-center gap-1 text-left px-3 py-2 bg-[#181a20] hover:bg-[#1f232c] border border-[#262c3a] rounded-lg transition-all text-[11px] text-gray-300 cursor-pointer"
            onClick={() => onSelectSample("portrait-rough")}
          >
            <ImageIcon className="w-3.5 h-3.5 text-green-500" />
            여권용 인물 클로즈업
          </button>
        </div>
      </div>
    </div>
  );
}
