import React, { useState, useEffect, useRef } from 'react';
import { Mic, Users, Bot, Zap, Brain, Sparkles, Move, Palette, Layers, Terminal, Wand2 } from 'lucide-react';
import { consultAITeam } from '../services/aiService';
import { AgentPersona, ChatMessage } from '../types';

interface AITeamProps {
    onReorderAudio: () => void;
}

export const AITeam: React.FC<AITeamProps> = ({ onReorderAudio }) => {
    const [selectedAgent, setSelectedAgent] = useState<AgentPersona>('DIRECTOR');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // System Diagnostic Log
        console.log("MATRIX_CORE: AI_TEAM_MODULE_LOADED // DIAGNOSTIC_OK");
    }, []);

    // Enhanced Auto-scroll logic
    useEffect(() => {
        if (scrollRef.current) {
            // Using a slight delay ensures the DOM has updated with the new message height
            // or the typing indicator before we attempt to scroll.
            const timeoutId = setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTo({
                        top: scrollRef.current.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            }, 100);
            return () => clearTimeout(timeoutId);
        }
    }, [chatHistory, isProcessing]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            sender: 'USER',
            text: input,
            timestamp: Date.now()
        };

        setChatHistory(prev => [...prev, userMsg]);
        setInput('');
        setIsProcessing(true);

        if (window.aistudio && window.aistudio.hasSelectedApiKey) {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await window.aistudio.openSelectKey();
            }
        }

        try {
            const responseText = await consultAITeam(input, selectedAgent);
            const agentMsg: ChatMessage = {
                id: crypto.randomUUID(),
                sender: selectedAgent,
                text: responseText,
                timestamp: Date.now()
            };
            setChatHistory(prev => [...prev, agentMsg]);
        } catch (e) {
            console.error(e);
            const errorMsg: ChatMessage = {
                id: crypto.randomUUID(),
                sender: selectedAgent,
                text: "ERROR: UPLINK_FAILED. RETRY_CONNECTION.",
                timestamp: Date.now()
            };
            setChatHistory(prev => [...prev, errorMsg]);
        } finally {
            setIsProcessing(false);
        }
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const agentList: { id: AgentPersona; name: string; role: string; icon: React.ReactNode }[] = [
        { id: 'DIRECTOR', name: 'THE_DIRECTOR', role: 'STRATEGY_CORE', icon: <Sparkles size={18} /> },
        { id: 'DEEPSEEK_LOGIC', name: 'DEEPSEEK_V3', role: 'LOGIC_ENGINE', icon: <Brain size={18} /> },
        { id: 'SOUND_ENGINEER', name: 'ATOMIC_AUDIO', role: 'WAVEFORM_OPS', icon: <Mic size={18} /> },
        { id: 'MOTION_DESIGNER', name: 'KINETIC_OPS', role: 'MOTION_GRAPHICS', icon: <Layers size={18} /> },
        { id: 'COLORIST', name: 'CHROMA_MASTER', role: 'COLOR_GRADE', icon: <Palette size={18} /> },
        { id: 'VFX_WIZARD', name: 'VFX_WIZARD', role: 'COMPOSITING', icon: <Wand2 size={18} /> },
    ];

    return (
        <div className="h-full flex flex-col bg-[#050505] font-mono">
            {/* Header */}
            <div className="p-6 border-b border-[#003b00] bg-[#0a0f0a] shrink-0">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-[#00ff41] flex items-center gap-2 matrix-text-glow">
                            <Terminal className="text-[#00ff41]" /> ORACLE_UPLINK
                        </h2>
                        <p className="text-[#008f11] text-xs mt-1 tracking-wider">>> ESTABLISHED CONNECTION TO HIVE MIND</p>
                    </div>
                    <div className="flex items-center gap-2 bg-[#001a00] px-2 py-1 border border-[#003b00]">
                        <span className="text-[10px] text-[#00ff41] animate-pulse flex items-center gap-1">
                            <Zap size={10} fill="currentColor" /> LITE_LLM::ACTIVE
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
                    {agentList.map((agent) => (
                        <AgentCard 
                            key={agent.id}
                            persona={agent.id}
                            name={agent.name}
                            role={agent.role}
                            icon={agent.icon}
                            active={selectedAgent === agent.id}
                            onClick={() => setSelectedAgent(agent.id)}
                            isTyping={isProcessing && selectedAgent === agent.id}
                        />
                    ))}
                </div>
            </div>

            {/* Terminal Feed */}
            <div className="flex-1 overflow-hidden flex">
                <div className="flex-1 flex flex-col relative bg-black">
                    <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10" />
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar" ref={scrollRef}>
                         {chatHistory.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-[#003b00]">
                                <Bot size={64} className="mb-4 opacity-20" />
                                <p className="text-xs">>> INITIALIZING NEURAL LINK...</p>
                                <p className="text-xs">>> WAITING FOR USER INPUT...</p>
                            </div>
                         )}
                         {chatHistory.map(msg => (
                            <div key={msg.id} className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] p-3 border ${
                                    msg.sender === 'USER' 
                                        ? 'bg-[#001a00] border-[#00ff41] text-[#00ff41]' 
                                        : 'bg-[#0a0f0a] border-[#003b00] text-[#008f11]'
                                }`}>
                                    <div className="flex items-center gap-4 mb-2 text-[10px] font-bold border-b border-current pb-1 opacity-70">
                                        <span>[{formatTime(msg.timestamp)}]</span>
                                        <span>{msg.sender === 'USER' ? 'USR_ROOT' : `AI_NODE::${msg.sender}`}</span>
                                    </div>
                                    <div className="whitespace-pre-wrap text-xs leading-relaxed font-mono">
                                        <span className="mr-2">>></span>{msg.text}
                                    </div>
                                </div>
                            </div>
                         ))}
                         {isProcessing && (
                            <div className="flex justify-start">
                                <div className="bg-black border border-[#00ff41] p-3 text-[#00ff41] text-xs">
                                    <div className="flex items-center gap-2">
                                        <Loader2 size={14} className="animate-spin text-[#00ff41]" />
                                        <span className="animate-pulse">
                                            {selectedAgent} IS TYPING... [||||||    ]
                                        </span>
                                    </div>
                                </div>
                            </div>
                         )}
                    </div>

                    {/* CLI Input */}
                    <div className="p-4 bg-[#0a0f0a] border-t border-[#003b00] flex gap-2 shrink-0 z-20">
                        <span className="text-[#00ff41] py-3 font-bold">{'>'}</span>
                        <input 
                            type="text" 
                            className="flex-1 bg-black border border-[#003b00] px-4 py-3 text-[#00ff41] focus:outline-none focus:border-[#00ff41] placeholder-[#003b00] font-mono text-sm"
                            placeholder="ENTER_COMMAND..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            disabled={isProcessing}
                            autoFocus
                        />
                        <button 
                            onClick={handleSend}
                            disabled={isProcessing || !input.trim()}
                            className="bg-[#003b00] hover:bg-[#00ff41] text-black px-6 font-bold disabled:opacity-50 transition-colors"
                        >
                            SEND
                        </button>
                    </div>
                </div>

                {/* Right Panel: Tools */}
                <div className="w-72 bg-[#050505] border-l border-[#003b00] p-4 flex flex-col shrink-0">
                    <h3 className="font-bold text-[#00ff41] text-xs mb-4 flex items-center gap-2 border-b border-[#003b00] pb-2">
                        <Wand2 size={14} /> ATOMIC_UTILITIES
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="p-4 border border-[#003b00] bg-[#0a0f0a] hover:border-orange-500 transition-colors group">
                            <h4 className="text-xs font-bold text-orange-500 mb-2">ATOMIC_REMIXER_V1</h4>
                            <p className="text-[10px] text-[#008f11] mb-4">
                                >> INITIATE AUDIO SHUFFLE ALGORITHM
                                <br/>>> RANDOMIZE SEED: TRUE
                            </p>
                            <button 
                                onClick={onReorderAudio}
                                className="w-full bg-orange-900/20 text-orange-500 border border-orange-500 hover:bg-orange-500 hover:text-black py-2 text-[10px] font-bold flex items-center justify-center gap-2 transition-all"
                            >
                                <Move size={12} /> EXECUTE_REMIX
                            </button>
                        </div>

                        <div className="p-4 border border-[#003b00] bg-[#0a0f0a] opacity-70">
                             <h4 className="text-xs font-bold text-blue-500 mb-2">GIT_SYNC_MODULE</h4>
                             <div className="text-[10px] text-[#008f11] font-mono bg-black p-2 border border-[#003b00]">
                                 $ git status<br/>
                                 > On branch main<br/>
                                 > Your branch is up to date
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Add Loader2 component locally if not available globally or use spinner logic
const Loader2 = ({ size, className }: { size: number, className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

interface AgentCardProps {
    persona: string;
    name: string;
    role: string;
    icon: React.ReactNode;
    active: boolean;
    isTyping?: boolean;
    onClick: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ name, role, icon, active, isTyping, onClick }) => (
    <div 
        onClick={onClick}
        className={`relative cursor-pointer p-3 border transition-all duration-300
        ${active 
            ? 'bg-[#001a00] border-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.2)]' 
            : 'bg-black border-[#003b00] hover:border-[#008f11] hover:bg-[#0a0f0a]'
        }`}
    >
        <div className="flex items-center gap-3">
             <div className={`text-[#00ff41]`}>
                {icon}
             </div>
             <div className="flex-1 overflow-hidden">
                 <div className="font-bold text-[#00ff41] text-[10px] tracking-widest truncate">{name}</div>
                 <div className="flex items-center">
                    <span className="text-[9px] text-[#008f11] truncate">{role}</span>
                    {isTyping && (
                        <span className="ml-2 text-[9px] text-[#00ff41] animate-pulse truncate">
                             >> TRANSMITTING...
                        </span>
                    )}
                 </div>
             </div>
        </div>
    </div>
);