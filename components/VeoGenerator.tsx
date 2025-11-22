import React, { useState } from 'react';
import { Video, Loader2, Download, Sparkles, Terminal } from 'lucide-react';
import { generateVeoVideo } from '../services/aiService';
import { MediaAsset, MediaType } from '../types';

interface VeoGeneratorProps {
  onVideoGenerated: (asset: MediaAsset) => void;
}

export const VeoGenerator: React.FC<VeoGeneratorProps> = ({ onVideoGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await window.aistudio.openSelectKey();
        }
    }

    setIsGenerating(true);
    setGeneratedUrl(null);
    
    try {
      const url = await generateVeoVideo(prompt, (s) => setStatus(s));
      if (url) {
        setGeneratedUrl(url);
        
        const newAsset: MediaAsset = {
            id: crypto.randomUUID(),
            name: `VEO_GEN_${Date.now()}`,
            type: MediaType.VIDEO,
            url: url,
            duration: 5,
        };
        onVideoGenerated(newAsset);
      }
    } catch (err) {
      setStatus(`ERROR: ${(err as Error).message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 flex flex-col h-full overflow-y-auto font-mono bg-[#050505]">
      <div className="flex items-center gap-3 mb-8 border-b border-[#003b00] pb-4">
        <div className="p-2 border border-[#00ff41] bg-[#001a00]">
            <Terminal className="text-[#00ff41]" size={24} />
        </div>
        <div>
            <h2 className="text-xl font-bold text-[#00ff41] tracking-widest">VEO_STUDIO_PROTOCOL</h2>
            <p className="text-[#008f11] text-xs">AI_VIDEO_GENERATION_MODULE // V.3.1</p>
        </div>
      </div>

      <div className="space-y-6 max-w-3xl mx-auto w-full">
        <div>
          <label className="block text-xs font-bold text-[#00ff41] mb-2 uppercase tracking-wider">
            >> INPUT_PROMPT_SEQUENCE
          </label>
          <div className="relative">
             <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00ff41]"></div>
             <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00ff41]"></div>
             <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#00ff41]"></div>
             <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00ff41]"></div>
             
             <textarea
                className="w-full bg-black border border-[#003b00] p-4 text-[#00ff41] focus:border-[#00ff41] focus:outline-none h-40 resize-none font-mono text-sm placeholder-[#003b00]"
                placeholder="ENTER VISUAL PARAMETERS..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
          className={`w-full py-4 border-2 flex items-center justify-center gap-3 font-bold text-sm tracking-widest transition-all uppercase
            ${isGenerating || !prompt 
                ? 'border-[#003b00] text-[#003b00] cursor-not-allowed' 
                : 'border-[#00ff41] bg-[#001a00] text-[#00ff41] hover:bg-[#00ff41] hover:text-black hover:shadow-[0_0_20px_rgba(0,255,65,0.4)]'
            }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>{status || 'PROCESSING...'}</span>
            </>
          ) : (
            <>
              <Video size={18} />
              <span>INITIATE_GENERATION</span>
            </>
          )}
        </button>

        {/* Console Log Output */}
        <div className="bg-black border border-[#003b00] p-4 font-mono text-xs">
            <h3 className="text-[#008f11] mb-2 border-b border-[#003b00] pb-1">SYSTEM_LOGS:</h3>
            <ul className="text-[#003b00] space-y-1">
                <li>[INFO] MODEL: VEO-3.1-FAST-PREVIEW</li>
                <li>[INFO] RESOLUTION: 1080P // RATIO: 16:9</li>
                <li>[INFO] LATENCY: OPTIMIZED</li>
                <li className="text-[#008f11] mt-2">>> <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline hover:text-[#00ff41]">CHECK_CREDITS</a></li>
            </ul>
        </div>

        {generatedUrl && (
          <div className="mt-8">
            <h3 className="text-sm font-bold text-[#00ff41] mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00ff41] animate-pulse"></span> OUTPUT_RENDER_COMPLETE
            </h3>
            <div className="border border-[#00ff41] bg-black aspect-video relative group shadow-[0_0_20px_rgba(0,255,65,0.2)]">
              <video src={generatedUrl} controls className="w-full h-full object-contain" />
              <a 
                href={generatedUrl} 
                download="veo-generation.mp4"
                className="absolute top-4 right-4 p-2 bg-black border border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black transition-colors"
              >
                <Download size={20} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};