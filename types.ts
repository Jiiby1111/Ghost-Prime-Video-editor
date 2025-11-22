export enum MediaType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
}

export interface MediaAsset {
  id: string;
  name: string;
  type: MediaType;
  url: string;
  duration?: number;
  thumbnail?: string;
}

export interface TrackItem {
  id: string;
  assetId: string;
  startTime: number; // Where it starts on timeline
  duration: number; // How long it plays
  offset: number; // Start point within the media file
  trackId: string;
  name: string;
}

export interface TimelineTrack {
  id: string;
  type: MediaType;
  name: string;
  items: TrackItem[];
  muted?: boolean;
  locked?: boolean;
}

export interface VeoGenerationConfig {
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
}

export type AgentPersona = 'DIRECTOR' | 'SOUND_ENGINEER' | 'DEEPSEEK_LOGIC' | 'MOTION_DESIGNER' | 'COLORIST' | 'VFX_WIZARD';

export interface ChatMessage {
  id: string;
  sender: 'USER' | AgentPersona;
  text: string;
  timestamp: number;
}

// Augment window for AI Studio key selection
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}