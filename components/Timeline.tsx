import React from 'react';
import { TimelineTrack } from '../types';
import { Video, Music, Image as ImageIcon, Lock, Volume2, Trash2, VolumeX, Unlock } from 'lucide-react';

interface TimelineProps {
  tracks: TimelineTrack[];
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onTrackUpdate: (trackId: string, updates: Partial<TimelineTrack>) => void;
  onDeleteTrack: (trackId: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ tracks, currentTime, duration, onSeek, onTrackUpdate, onDeleteTrack }) => {
  const PIXELS_PER_SECOND = 20;
  
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = Math.max(0, x / PIXELS_PER_SECOND);
    onSeek(newTime);
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] border-t border-[#003b00] select-none font-mono">
      {/* Timeline Ruler */}
      <div 
        className="h-8 bg-[#0a0f0a] border-b border-[#003b00] relative cursor-pointer"
        onClick={handleTimelineClick}
      >
        <div className="absolute top-0 left-0 h-full flex items-end pl-2 text-[10px] text-[#008f11]">
            {Array.from({ length: Math.ceil(duration / 5) }).map((_, i) => (
                <div key={i} className="absolute h-2 border-l border-[#003b00]" style={{ left: i * 5 * PIXELS_PER_SECOND }}>
                    <span className="absolute -top-4 -left-1">{i * 5}s</span>
                </div>
            ))}
        </div>
        {/* Playhead Marker */}
        <div 
            className="absolute top-0 h-full w-px bg-[#00ff41] z-20 pointer-events-none shadow-[0_0_5px_#00ff41]"
            style={{ left: currentTime * PIXELS_PER_SECOND }}
        >
             <div className="w-3 h-3 bg-[#00ff41] transform -translate-x-1/2 rotate-45 -mt-1.5 shadow-[0_0_5px_#00ff41]"></div>
        </div>
      </div>

      {/* Tracks Container */}
      <div className="flex-1 overflow-y-auto relative custom-scrollbar" onClick={handleTimelineClick}>
        {/* Playhead Line extending down */}
        <div 
            className="absolute top-0 bottom-0 w-px bg-[#00ff41] z-10 pointer-events-none opacity-50"
            style={{ left: currentTime * PIXELS_PER_SECOND }}
        />

        {tracks.map((track) => (
          <div key={track.id} className="flex h-24 border-b border-[#003b00] group relative bg-[#050505] hover:bg-[#0a0f0a] transition-colors">
             {/* Locked Overlay */}
             {track.locked && (
                <div className="absolute inset-0 z-30 bg-black/50 flex items-center justify-center pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]">
                    <Lock className="text-[#00ff41] animate-pulse" size={48} />
                </div>
             )}

            {/* Track Header */}
            <div className="w-48 bg-[#0a0f0a] border-r border-[#003b00] p-2 flex flex-col justify-between shrink-0 z-40 relative">
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#003b00]"></div>
              <div className="flex items-center justify-between text-[#00ff41]">
                <div className="flex items-center gap-2">
                    {track.type === 'VIDEO' && <Video size={14} className="text-[#00ff41]" />}
                    {track.type === 'AUDIO' && <Music size={14} className="text-[#00ff41]" />}
                    {track.type === 'IMAGE' && <ImageIcon size={14} className="text-[#00ff41]" />}
                    <span className="text-xs font-bold truncate w-24 tracking-tighter">{track.name}</span>
                </div>
              </div>
              <div className="flex gap-3 text-[#008f11] justify-start items-center pl-1">
                 <button 
                    onClick={(e) => { e.stopPropagation(); onTrackUpdate(track.id, { locked: !track.locked }); }}
                    className={`transition-colors hover:text-[#00ff41] ${track.locked ? 'text-red-500' : ''}`}
                    title={track.locked ? "UNLOCK" : "LOCK"}
                  >
                    {track.locked ? <Lock size={12} /> : <Unlock size={12} />}
                  </button>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); onTrackUpdate(track.id, { muted: !track.muted }); }}
                    className={`transition-colors hover:text-[#00ff41] ${track.muted ? 'text-red-500' : ''}`}
                    title={track.muted ? "UNMUTE" : "MUTE"}
                  >
                     {track.muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  </button>

                  <div className="w-px h-3 bg-[#003b00] mx-1"></div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteTrack(track.id); }}
                    className="transition-colors hover:text-red-500"
                    title="DELETE_TRACK"
                  >
                    <Trash2 size={12} />
                  </button>
              </div>
            </div>

            {/* Track Content Area */}
            <div className={`flex-1 relative transition-colors ${track.muted ? 'bg-[#000]' : ''}`}>
              {/* Grid Background */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(90deg, #003b00 1px, transparent 1px)', backgroundSize: '100px 100%' }}></div>

              {track.items.map((item) => (
                <div
                  key={item.id}
                  className={`absolute top-2 bottom-2 border overflow-hidden cursor-move hover:brightness-110 group
                    ${track.type === 'VIDEO' ? 'bg-[#001a00] border-[#00ff41] shadow-[0_0_5px_rgba(0,255,65,0.2)]' : ''}
                    ${track.type === 'AUDIO' ? 'bg-[#1a0f00] border-orange-500' : ''}
                    ${track.type === 'IMAGE' ? 'bg-[#001a1a] border-cyan-500' : ''}
                    ${track.muted ? 'opacity-30 grayscale' : 'opacity-90'}
                  `}
                  style={{
                    left: item.startTime * PIXELS_PER_SECOND,
                    width: item.duration * PIXELS_PER_SECOND,
                  }}
                >
                  {/* Clip Label */}
                  <div className="px-2 py-0.5 text-[9px] text-white bg-black/50 truncate font-mono tracking-tighter w-full border-b border-white/10">
                    {item.name}
                  </div>
                  
                  {/* Digital Glitch/Waveform Pattern */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
                      <div className="w-full h-full" style={{ 
                          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.1) 5px, rgba(255,255,255,0.1) 10px)' 
                      }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};