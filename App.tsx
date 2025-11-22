import React, { useState, useEffect } from 'react';
import { 
  Layout, Clapperboard, Upload, Settings, 
  Play, Pause, SkipBack, SkipForward, 
  Download, Mic, Cpu, Layers, Sparkles, MonitorDown, Users, Monitor, Terminal, Shield, Wifi
} from 'lucide-react';
import { Timeline } from './components/Timeline';
import { VeoGenerator } from './components/VeoGenerator';
import { AITeam } from './components/AITeam';
import { MediaType, MediaAsset, TimelineTrack } from './types';
import { getAIEditSuggestions } from './services/aiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'EDITOR' | 'VEO' | 'AI_TEAM' | 'SETTINGS'>('EDITOR');
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [tracks, setTracks] = useState<TimelineTrack[]>([
    { id: 't1', type: MediaType.VIDEO, name: 'VID_STREAM_01', items: [], locked: false, muted: false },
    { id: 't2', type: MediaType.VIDEO, name: 'VID_STREAM_02', items: [], locked: false, muted: false },
    { id: 't3', type: MediaType.AUDIO, name: 'AUD_CHANNEL_A', items: [], locked: false, muted: false },
  ]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(60); 
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  // Initial Setup for API Key and Diagnostics
  useEffect(() => {
    console.log("SYS_BOOT: KERNEL_INIT... OK");
    console.log("SYS_BOOT: LOADING_MODULES... OK");
    console.log("SYS_BOOT: MATRIX_UI_INTERFACE... READY");
    
    const checkKey = async () => {
        if (window.aistudio && window.aistudio.hasSelectedApiKey) {
            try {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                if (hasKey) {
                    console.log("AUTH: API_KEY_DETECTED");
                }
            } catch (e) {
                console.warn("AUTH: KEY_CHECK_FAILED");
            }
        }
    };
    checkKey();
  }, []);

  // Playback Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newAssets = Array.from(e.target.files).map(file => ({
        id: crypto.randomUUID(),
        name: file.name.toUpperCase(),
        type: file.type.startsWith('video') ? MediaType.VIDEO : file.type.startsWith('audio') ? MediaType.AUDIO : MediaType.IMAGE,
        url: URL.createObjectURL(file),
        duration: 10
      }));
      setAssets(prev => [...prev, ...newAssets]);
    }
  };

  const addToTimeline = (asset: MediaAsset) => {
    const trackIndex = tracks.findIndex(t => t.type === asset.type);
    if (trackIndex === -1) return;

    const newTracks = [...tracks];
    const track = newTracks[trackIndex];
    if (track.locked) return;

    const lastItem = track.items[track.items.length - 1];
    const startTime = lastItem ? lastItem.startTime + lastItem.duration : 0;

    track.items.push({
      id: crypto.randomUUID(),
      assetId: asset.id,
      name: asset.name,
      trackId: track.id,
      startTime: startTime,
      duration: asset.duration || 5,
      offset: 0
    });

    setTracks(newTracks);
    if (startTime + (asset.duration || 5) > duration) {
        setDuration(startTime + (asset.duration || 5) + 10);
    }
  };

  const updateTrack = (trackId: string, updates: Partial<TimelineTrack>) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, ...updates } : t));
  };

  const deleteTrack = (trackId: string) => {
      if (confirm("CONFIRM DELETION OF TRACK PROTOCOL?")) {
        setTracks(prev => prev.filter(t => t.id !== trackId));
      }
  };

  const handleAtomicReorder = () => {
    const newTracks = [...tracks];
    const audioTracks = newTracks.filter(t => t.type === MediaType.AUDIO && !t.locked);
    
    audioTracks.forEach(track => {
        for (let i = track.items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [track.items[i], track.items[j]] = [track.items[j], track.items[i]];
        }
        let currentStart = 0;
        track.items.forEach(item => {
            item.startTime = currentStart;
            currentStart += item.duration;
        });
    });
    setTracks(newTracks);
    alert("ATOMIC REORDERING SEQUENCE COMPLETE.");
    setActiveTab('EDITOR');
  };

  const downloadInstaller = () => {
      const element = document.createElement("a");
      const file = new Blob(["Simulated Installer Content - use electron-builder to generate real .exe"], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = "FractalEdit_Setup_x64.exe";
      document.body.appendChild(element);
      element.click();
      alert("INITIATING BINARY DOWNLOAD...");
  };

  const requestAISuggestions = async () => {
    if (assets.length === 0) {
        setAiSuggestion("ERROR: NO ASSETS DETECTED IN MEDIA POOL.");
        return;
    }
    
    if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if(!hasKey) await window.aistudio.openSelectKey();
    }

    setAiSuggestion("ANALYZING METADATA STREAMS...");
    const context = `I have ${assets.length} files: ${assets.map(a => a.name).join(', ')}. The timeline has ${tracks.reduce((acc, t) => acc + t.items.length, 0)} clips placed.`;
    const suggestion = await getAIEditSuggestions(context);
    setAiSuggestion(suggestion);
  };

  return (
    <div className="flex flex-col h-screen bg-black text-[#00ff41] overflow-hidden font-mono tracking-wide selection:bg-[#00ff41] selection:text-black">
      {/* Top Bar - Matrix Header */}
      <header className="h-14 border-b border-[#003b00] bg-[#050505] flex items-center justify-between px-4 shrink-0 select-none shadow-[0_0_15px_rgba(0,255,65,0.1)] z-50">
        <div className="flex items-center gap-4">
            <div className="w-8 h-8 border border-[#00ff41] bg-[#001a00] flex items-center justify-center animate-pulse">
                <Terminal size={18} className="text-[#00ff41]" />
            </div>
            <div>
                <h1 className="font-bold text-lg tracking-widest text-[#00ff41] matrix-text-glow">FRACTAL<span className="text-white">_EDIT</span></h1>
                <p className="text-[10px] text-[#008f11] font-bold">V.24.0.1 :: SYS_READY</p>
            </div>
        </div>
        
        <div className="flex gap-2 bg-[#0a0f0a] p-1 border border-[#003b00]">
            <button 
                onClick={() => setActiveTab('EDITOR')}
                className={`px-4 py-1.5 text-xs font-bold transition-all border ${activeTab === 'EDITOR' ? 'bg-[#003b00] text-[#00ff41] border-[#00ff41]' : 'text-[#008f11] border-transparent hover:text-[#00ff41] hover:border-[#003b00]'}`}
            >
                TIMELINE_CORE
            </button>
            <button 
                onClick={() => setActiveTab('VEO')}
                className={`px-4 py-1.5 text-xs font-bold transition-all flex items-center gap-2 border ${activeTab === 'VEO' ? 'bg-[#003b00] text-[#00ff41] border-[#00ff41]' : 'text-[#008f11] border-transparent hover:text-[#00ff41] hover:border-[#003b00]'}`}
            >
                <Cpu size={12} /> VEO_GEN
            </button>
            <button 
                onClick={() => setActiveTab('AI_TEAM')}
                className={`px-4 py-1.5 text-xs font-bold transition-all flex items-center gap-2 border ${activeTab === 'AI_TEAM' ? 'bg-[#003b00] text-[#00ff41] border-[#00ff41]' : 'text-[#008f11] border-transparent hover:text-[#00ff41] hover:border-[#003b00]'}`}
            >
                <Users size={12} /> ORACLES
            </button>
        </div>

        <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-[10px] text-[#008f11]">
                 <Wifi size={12} className="animate-pulse" />
                 <span>NET: SECURE</span>
             </div>
             <button 
                className="p-2 hover:bg-[#003b00] border border-transparent hover:border-[#00ff41] text-[#00ff41] transition-all"
                onClick={() => window.aistudio?.openSelectKey()}
                title="API_KEY_CONFIG"
            >
                <Settings size={18} />
             </button>
             <button 
                onClick={downloadInstaller}
                className="flex items-center gap-2 bg-black hover:bg-[#001a00] border border-[#008f11] text-[#008f11] hover:text-[#00ff41] px-3 py-1.5 text-xs font-medium transition-all"
            >
                <MonitorDown size={14} /> INSTALL_EXE
             </button>
             <button className="bg-[#003b00] hover:bg-[#00ff41] text-[#00ff41] hover:text-black border border-[#00ff41] px-4 py-1.5 text-sm font-bold shadow-[0_0_10px_rgba(0,255,65,0.2)] transition-all">
                RENDER_OUT
             </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden bg-black bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        
        {/* Left Sidebar: Assets */}
        {activeTab === 'EDITOR' && (
        <div className="w-72 border-r border-[#003b00] bg-[#050505] flex flex-col shrink-0 z-10">
            <div className="p-4 border-b border-[#003b00] flex justify-between items-center bg-[#0a0f0a]">
                <span className="font-bold text-xs uppercase tracking-widest text-[#00ff41]">DATA_POOL</span>
                <label className="cursor-pointer p-1.5 hover:bg-[#003b00] border border-transparent hover:border-[#00ff41] text-[#00ff41] transition-colors">
                    <Upload size={16} />
                    <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                </label>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {assets.length === 0 && (
                    <div className="text-center mt-10 text-[#008f11] text-xs p-4 border border-dashed border-[#003b00] mx-2 font-mono">
                        <Upload className="mx-auto mb-2 opacity-50" size={24} />
                        <p>[EMPTY_BUFFER]</p>
                        <p className="mt-1">AWAITING INPUT STREAM...</p>
                    </div>
                )}
                {assets.map(asset => (
                    <div 
                        key={asset.id} 
                        className="group relative h-20 bg-[#0a0f0a] border border-[#003b00] overflow-hidden cursor-pointer hover:border-[#00ff41] transition-all flex"
                        onClick={() => addToTimeline(asset)}
                    >
                        <div className="w-20 bg-black shrink-0 border-r border-[#003b00] relative">
                             {asset.type === MediaType.VIDEO ? (
                                <video src={asset.url} className="w-full h-full object-cover opacity-50 grayscale" />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#001a00]">
                                    <Layers size={16} className="text-[#008f11]" />
                                </div>
                             )}
                        </div>
                        <div className="flex-1 p-2 flex flex-col justify-between">
                            <p className="text-[10px] text-[#00ff41] truncate font-bold">{asset.name}</p>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] text-[#008f11] bg-[#001a00] px-1 border border-[#003b00]">{asset.type}</span>
                                <span className="text-[9px] text-[#008f11] font-mono">{asset.duration}s</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        )}

        {activeTab === 'EDITOR' && (
            <>
                {/* Center: Preview Area */}
                <div className="flex-1 flex flex-col bg-black relative">
                    <div className="flex-1 p-6 flex items-center justify-center relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#001a00] to-black">
                        {/* Matrix Grid Background */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#00ff41 1px, transparent 1px), linear-gradient(90deg, #00ff41 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        
                        {/* Viewport */}
                        <div className="aspect-video w-full max-w-4xl bg-black border border-[#00ff41] shadow-[0_0_20px_rgba(0,255,65,0.1)] relative overflow-hidden flex items-center justify-center group z-10">
                             <div className="absolute top-2 right-2 font-mono text-[#00ff41] text-[10px] bg-[#001a00] border border-[#003b00] px-2 py-0.5">
                                 OUTPUT_MONITOR
                             </div>
                             <div className="absolute top-2 left-2 flex gap-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                             </div>

                             <div className="text-[#008f11] text-sm font-mono flex flex-col items-center gap-2">
                                 <Monitor size={48} className="opacity-50" />
                                 <span className="animate-pulse">{currentTime.toFixed(2)}s / {duration.toFixed(2)}s</span>
                             </div>
                             
                             {!isPlaying && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <Play size={48} className="text-[#00ff41]" fill="#00ff41" />
                                </div>
                             )}
                        </div>
                    </div>
                    
                    {/* Transport Controls */}
                    <div className="h-12 border-t border-[#003b00] border-b border-[#003b00] flex items-center justify-between px-4 bg-[#050505]">
                        <div className="flex items-center gap-2 text-xs text-[#00ff41] font-mono w-32 bg-[#001a00] p-1 border border-[#003b00] justify-center">
                            TC: {new Date(currentTime * 1000).toISOString().substr(14, 9)}
                        </div>
                        <div className="flex items-center gap-4">
                            <button 
                                className="text-[#008f11] hover:text-[#00ff41] transition-colors"
                                onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}
                            >
                                <SkipBack size={20} />
                            </button>
                            <button 
                                className={`w-10 h-10 border border-[#00ff41] flex items-center justify-center hover:shadow-[0_0_10px_rgba(0,255,65,0.4)] transition-all ${isPlaying ? 'bg-[#00ff41] text-black' : 'bg-black text-[#00ff41]'}`}
                                onClick={() => setIsPlaying(!isPlaying)}
                            >
                                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                            </button>
                            <button 
                                className="text-[#008f11] hover:text-[#00ff41] transition-colors"
                                onClick={() => setCurrentTime(Math.min(duration, currentTime + 5))}
                            >
                                <SkipForward size={20} />
                            </button>
                        </div>
                        <div className="w-32 flex justify-end">
                            <Settings size={16} className="text-[#008f11] hover:text-[#00ff41] cursor-pointer animate-spin-slow" />
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="h-80 shrink-0 border-t border-[#003b00] bg-[#050505]">
                        <Timeline 
                            tracks={tracks} 
                            currentTime={currentTime} 
                            duration={duration}
                            onSeek={setCurrentTime}
                            onTrackUpdate={updateTrack}
                            onDeleteTrack={deleteTrack}
                        />
                    </div>
                </div>

                {/* Right Sidebar: Inspector */}
                <div className="w-80 border-l border-[#003b00] bg-[#050505] flex flex-col shrink-0">
                     <div className="p-4 border-b border-[#003b00]">
                        <h3 className="font-bold text-xs tracking-widest text-[#00ff41] mb-4 flex items-center gap-2">
                            <Shield size={14} /> AI_ANALYSIS_MOD
                        </h3>
                        <div className="bg-[#0a0f0a] border border-[#003b00] p-3 text-xs text-[#00ff41] min-h-[100px] font-mono shadow-inner">
                            {aiSuggestion ? (
                                <div className="whitespace-pre-wrap typewriter">{aiSuggestion}</div>
                            ) : (
                                <p className="opacity-50 text-[10px] blink">>> AWAITING SCAN COMMAND...</p>
                            )}
                        </div>
                        <button 
                            onClick={requestAISuggestions}
                            className="mt-3 w-full bg-[#001a00] hover:bg-[#003b00] text-[#00ff41] border border-[#00ff41] py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_10px_rgba(0,255,65,0.3)]"
                        >
                            <Sparkles size={14} /> EXECUTE_ANALYSIS
                        </button>
                     </div>
                     
                     <div className="p-4 flex-1">
                        <h3 className="font-bold text-xs tracking-widest text-[#008f11] mb-4 border-b border-[#003b00] pb-2">PARAM_CONTROLS</h3>
                        <div className="space-y-6">
                            {['SCALE', 'OPACITY', 'ROTATION'].map((label) => (
                                <div className="space-y-1" key={label}>
                                    <div className="flex justify-between text-[10px] text-[#00ff41]">
                                        <span>{label}</span>
                                        <span className="font-mono">100%</span>
                                    </div>
                                    <input type="range" className="w-full h-1 bg-[#003b00] appearance-none cursor-pointer accent-[#00ff41]" />
                                </div>
                            ))}
                        </div>
                     </div>
                </div>
            </>
        )}

        {activeTab === 'VEO' && (
             <div className="flex-1 bg-black flex justify-center p-8 overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                <div className="w-full max-w-5xl border border-[#00ff41] bg-[#050505] shadow-[0_0_30px_rgba(0,255,65,0.1)] overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#00ff41] animate-pulse"></div>
                    <VeoGenerator onVideoGenerated={(asset) => {
                        setAssets(prev => [...prev, asset]);
                    }} />
                </div>
             </div>
        )}

        {activeTab === 'AI_TEAM' && (
            <div className="flex-1 overflow-hidden">
                <AITeam onReorderAudio={handleAtomicReorder} />
            </div>
        )}

      </div>
    </div>
  );
};

export default App;