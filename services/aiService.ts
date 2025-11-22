import { GoogleGenAI } from "@google/genai";
import { AgentPersona } from "../types";

// Helper to get the AI client. 
// CRITICAL: Must be called inside the function to ensure fresh API key if user re-selects.
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment");
  }
  return new GoogleGenAI({ apiKey });
};

const FRACTAL_EDIT_MANIFESTO = `
PROJECT CONTEXT: FRACTAL-EDIT (Advanced AI Video Editor)
You are an embedded AI agent within FRACTAL-EDIT.
CORE REQUIREMENTS:
1. Open-source implementation with permissive licensing.
2. No paywalls or usage limitations.
3. User specifically requested removal of GitHub Copilot integration in favor of open/local alternatives.
4. Support for "Atomic Singing Reordering" (audio remixing).
5. Integration of best-in-class models (conceptually): HunyuanVideo, Mochi 1, LTXVideo, Wan 2.1, FLUX.1.

Your goal is to assist the creator in building the "most best" video editor experience.
`;

export const generateVeoVideo = async (
  prompt: string, 
  onStatusUpdate: (status: string) => void
): Promise<string | null> => {
  try {
    const ai = getAIClient();
    onStatusUpdate("Initializing Veo model...");

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: '16:9'
      }
    });

    onStatusUpdate("Generating video (this may take a moment)...");

    // Polling loop
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      onStatusUpdate("Processing frames...");
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    if (operation.error) {
      throw new Error(String(operation.error.message || "Video generation failed"));
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) return null;

    // Append API key for download
    const finalUrl = `${videoUri}&key=${process.env.API_KEY}`;
    return finalUrl;

  } catch (error: any) {
    console.error("Veo Error:", error);
    throw error;
  }
};

export const getAIEditSuggestions = async (context: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert video editor assistant for FRACTAL-EDIT. 
      User Context: ${context}.
      Provide 3 concise, bulleted creative suggestions for editing this footage or improving the flow.
      Keep it professional and technical.`,
    });
    return response.text || "No suggestions available.";
  } catch (error) {
    console.error("Chat Error", error);
    return "Could not fetch AI suggestions.";
  }
};

export const consultAITeam = async (
    prompt: string,
    agent: AgentPersona
  ): Promise<string> => {
    const ai = getAIClient();
    
    let personaInstruction = "";
    
    switch (agent) {
        case 'DIRECTOR':
            personaInstruction = "You are THE DIRECTOR. Visionary, demanding, like Nolan/Kubrick. Focus on narrative, visual language, and emotional impact.";
            break;
        case 'SOUND_ENGINEER':
            personaInstruction = "You are the ATOMIC AUDIO ENGINEER. You specialize in 'Atomic Singing Reordering'. You talk about beats, frequencies, and granular synthesis. You are chaotic but brilliant.";
            break;
        case 'DEEPSEEK_LOGIC':
            personaInstruction = "You are DEEPSEEK LOGIC (Oracle). You are hyper-analytical, efficient, and precise. You structure everything into implementation steps. You represent the 'DeepSeek V3' intelligence.";
            break;
        case 'MOTION_DESIGNER':
            personaInstruction = "You are the KINETIC MOTION DESIGNER. You think in keyframes, easing curves, and velocity. You love kinetic typography, parallax effects, and smooth transitions.";
            break;
        case 'COLORIST':
            personaInstruction = "You are the MASTER COLORIST. You speak in hex codes, color spaces (Rec.709, LOG), and emotive palettes. You focus on mood, skin tones, and visual consistency.";
            break;
        case 'VFX_WIZARD':
            personaInstruction = "You are the VFX WIZARD. You specialize in compositing, rotoscoping, 3D tracking, and particle effects. You speak in terms of nodes, alpha channels, and render passes.";
            break;
    }
  
    const fullSystemInstruction = `${FRACTAL_EDIT_MANIFESTO}\n\nCURRENT PERSONA: ${personaInstruction}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // Using the powerful model for "Oracles"
        contents: prompt,
        config: {
            systemInstruction: fullSystemInstruction,
            temperature: 0.8
        }
      });
      return response.text || "The oracle is silent.";
    } catch (error) {
      console.error("AI Team Error", error);
      return `Connection to ${agent} failed: ${(error as any).message}`;
    }
  };