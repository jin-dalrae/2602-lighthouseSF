
import { GoogleGenAI, Type } from "@google/genai";
import { MODEL_FLASH, MODEL_PRO, MODEL_VIDEO, SYSTEM_INSTRUCTIONS } from "../constants";
import { Area } from "../types";

// Imagen 4 model for static frame generation
const MODEL_IMAGEN = 'imagen-4.0-generate-preview-05-20';

// Helper to check for API key (safely)
const getApiKey = (): string | undefined => {
  return process.env.API_KEY;
};

// Initialize GenAI
const createClient = () => {
  const key = getApiKey();
  if (!key) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey: key });
};

// Helper to clean JSON markdown
const cleanJson = (text: string) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

// Text Generation (Flash)
export const generateAgentContent = async (
  systemInstruction: string,
  prompt: string
): Promise<string> => {
  try {
    const ai = createClient();
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

// News Agent using Gemini Search Grounding
export const fetchNewsWithGrounding = async (
  keywords: string
): Promise<string> => {
  // Use Gemini Search Grounding directly (no external agent - causes CORS issues)
  try {
    const ai = createClient();
    const prompt = `Search nbcbayarea.com for recent news regarding: ${keywords}.
    Limit to 5 articles.
    Format the output strictly as a JSON object with the following schema:
    {
      "articles": [
        {
          "title": "Article Headline",
          "summary": "Brief summary (max 2 sentences)",
          "date": "YYYY-MM-DD",
          "relevance_score": 10
        }
      ]
    }
    Ensure valid JSON.`;

    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType: "application/json", // Removed per rules for Search Grounding
      },
    });

    const sources: string[] = [];
    response.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach((c: any) => {
      if (c.web?.uri) sources.push(c.web.uri);
    });

    const jsonStr = cleanJson(response.text || "{}");
    let data;
    try {
      data = JSON.parse(jsonStr);
    } catch {
      data = { articles: [], raw: response.text };
    }

    // Inject sources into the payload
    data.groundingSources = sources;
    data.source = "Gemini Grounding (Fallback)";

    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error("News Agent Error:", error);
    // Return a safe error object instead of throwing to prevent crashing the whole pipeline
    return JSON.stringify({ error: "News Fetch Failed", details: String(error) });
  }
};

// Gov Agent Two-Pass Fetch (Spec-3)
export const fetchGovData = async (area: Area): Promise<string> => {
  const startTime = Date.now();

  // Define queries based on Area
  let passAQuery = "";
  let passBQuery = "";

  if (area === Area.PS) {
    passAQuery = "San Francisco Public Safety Scorecard data, SFPD news, Mayor London Breed public safety news";
    passBQuery = "San Francisco Legistar Public Safety and Neighborhood Services Committee agenda items 2024 2025";
  } else if (area === Area.IU) {
    passAQuery = "San Francisco Streets Scorecard Potholes, SFPUC water infrastructure news, Mayor London Breed infrastructure news";
    passBQuery = "San Francisco Legistar Budget and Finance Committee agenda items 2024 2025";
  } else { // LZ
    passAQuery = "San Francisco Planning Department Family Zoning news, DBI permit processing times, Mayor London Breed housing news";
    passBQuery = "San Francisco Legistar Land Use and Transportation Committee agenda items 2024 2025";
  }

  const ai = createClient();
  let passAData = {};
  let passBData = {};
  let sourcesA: string[] = [];
  let sourcesB: string[] = [];

  // --- PASS A: SF.gov Ecosystem ---
  try {
    const promptA = `Search for: ${passAQuery}.
    Extract key metrics (values + trends) and top 3 news headlines with summaries.
    Format as JSON: { "metrics": [], "news": [{ "title": "", "summary": "", "date": "" }] }`;

    const resA = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: promptA,
      config: { tools: [{ googleSearch: {} }] }
    });

    resA.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach((c: any) => {
      if (c.web?.uri) sourcesA.push(c.web.uri);
    });

    const jsonStrA = cleanJson(resA.text || "{}");
    try { passAData = JSON.parse(jsonStrA); } catch { passAData = { raw: resA.text }; }
  } catch (e) {
    console.error("Pass A Error", e);
    passAData = { error: "Pass A Failed" };
  }

  // --- CHECK TIMEOUT (90s budget) ---
  const elapsed = (Date.now() - startTime) / 1000;
  if (elapsed > 90) {
    return JSON.stringify({
      pass_a: passAData,
      pass_b: { status: "SKIPPED_TIMEOUT" },
      sources: sourcesA
    }, null, 2);
  }

  // --- PASS B: Legistar ---
  try {
    const promptB = `Search for: ${passBQuery}.
    Extract recent legislative items (max 10).
    Format as JSON: { "legislation": [{ "title": "", "status": "", "sponsor": "", "date": "" }] }`;

    const resB = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: promptB,
      config: { tools: [{ googleSearch: {} }] }
    });

    resB.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach((c: any) => {
      if (c.web?.uri) sourcesB.push(c.web.uri);
    });

    const jsonStrB = cleanJson(resB.text || "{}");
    try { passBData = JSON.parse(jsonStrB); } catch { passBData = { raw: resB.text }; }

  } catch (e) {
    console.error("Pass B Error", e);
    passBData = { error: "Pass B Failed" };
  }

  const allSources = [...new Set([...sourcesA, ...sourcesB])];

  return JSON.stringify({
    pass_a: passAData,
    pass_b: passBData,
    sources: allSources
  }, null, 2);
};

// Consolidator Logic (Stage 3)
export const consolidateAreaFindings = async (
  systemInstruction: string,
  agentReports: string
): Promise<string> => {
  try {
    const ai = createClient();
    const response = await ai.models.generateContent({
      model: MODEL_PRO, // Use Pro for synthesis
      contents: agentReports,
      config: {
        systemInstruction,
        temperature: 0.4,
        responseMimeType: "application/json"
      }
    });
    return cleanJson(response.text || "{}");
  } catch (e) {
    console.error("Consolidation Error:", e);
    throw e;
  }
}

// Single-turn Cross-Area Discussion (Legacy/Individual check)
export const crossAreaDiscussion = async (
  systemInstruction: string,
  otherReports: string
): Promise<string> => {
  try {
    const ai = createClient();
    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: `Here are the reports from the other urban areas:\n${otherReports}\n\nDo these findings impact your area? Identify cross-area connections.`,
      config: {
        systemInstruction,
        temperature: 0.5,
      }
    });
    return response.text || "No connections found.";
  } catch (e) {
    console.error("Discussion Error:", e);
    throw e;
  }
}

// NEW: Roundtable Orchestrator (Stage 4 - Centralized)
export const runRoundtableDiscussion = async (
  reports: Record<string, string>
): Promise<any> => {
  try {
    const ai = createClient();

    const prompt = `Initial summaries:
    PS: ${reports[Area.PS] || 'No Data'}
    IU: ${reports[Area.IU] || 'No Data'}
    LZ: ${reports[Area.LZ] || 'No Data'}
    
    Execute the round-robin discussion.`;

    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.CROSS_AREA_ORCHESTRATOR,
        temperature: 0.3, // Low temp for rigid process following
        responseMimeType: "application/json"
      }
    });

    const jsonStr = cleanJson(response.text || "{}");
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Roundtable Orchestrator Error:", e);
    throw e;
  }
};

// Complex Reasoning (Pro)
export const generateOrchestratorContent = async (
  systemInstruction: string,
  prompt: string,
  jsonMode = false
): Promise<string> => {
  try {
    const ai = createClient();
    const config: any = {
      systemInstruction,
      temperature: 0.4, // Lower temp for logic
    };

    if (jsonMode) {
      config.responseMimeType = "application/json";
    }

    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: prompt,
      config,
    });
    return response.text || "";
  } catch (error) {
    console.error("Orchestrator Error:", error);
    throw error;
  }
};

// Generate a 3-part video script based on the issue
export const generateVideoScript = async (
  issueTitle: string,
  issueSummary: string
): Promise<string[]> => {
  try {
    const ai = createClient();
    const prompt = `You are a documentary filmmaker. Create a 3-part video storyboard script for a short report about the San Francisco city issue: "${issueTitle}".
    Summary: ${issueSummary}
    
    For each part, provide a highly descriptive prompt (shot-by-shot details) for a video generation AI (Veo 3.1).
    Part 1: The Problem - A cinematic establishing shot of a SF neighborhood or landmark affected by this specific issue. 
    Part 2: The Evidence - A shot that visualizes the data or the impact. (e.g., if it's crime, show police activity; if it's infrastructure, show construction or decay).
    Part 3: The Future - A hopeful or contemplative closing shot of the SF skyline or community, representing the forecast or action impact.
    
    Output STRICT JSON array of 3 strings: ["prompt 1", "prompt 2", "prompt 3"]`;

    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7
      }
    });

    const jsonStr = cleanJson(response.text || "[]");
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Video Script Generation Error:", error);
    return [
      `Cinematic drone shot of San Francisco, representing the issue: ${issueTitle}. Photorealistic, 4K.`,
      `Street level view in San Francisco showing impact of ${issueTitle}. Documentary style.`,
      `Establishing shot of San Francisco Bay Area at dawn, contemplative mood.`
    ];
  }
};

// Video Generation (Veo)
export const generateReportVideo = async (
  prompt: string
): Promise<{ uri: string } | null> => {
  // Check specifically for Veo key requirement
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
      // We can't proceed immediately after openSelectKey because it's a user interaction flow
      // In a real app we might wait or re-trigger. For this pattern, we'll throw to prompt retry.
      throw new Error("Please select an API Key for Veo generation and try again.");
    }
  }

  try {
    // Re-instantiate with potentially new key from environment if injected
    const ai = createClient();

    let operation = await ai.models.generateVideos({
      model: MODEL_VIDEO,
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9',
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({ operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (videoUri) {
      return { uri: videoUri };
    }
    return null;
  } catch (error) {
    console.error("Veo Generation Error:", error);
    throw error;
  }
};

// Imagen 4 - Generate static storyboard frames
export const generateStoryboardFrame = async (
  prompt: string
): Promise<{ imageData: string; mimeType: string } | null> => {
  try {
    const ai = createClient();

    const response = await ai.models.generateImages({
      model: MODEL_IMAGEN,
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
        // Output as base64 for easier handling
        outputMimeType: 'image/png',
      }
    });

    const generatedImage = response.generatedImages?.[0];
    if (generatedImage?.image?.imageBytes) {
      return {
        imageData: generatedImage.image.imageBytes,
        mimeType: 'image/png'
      };
    }
    return null;
  } catch (error) {
    console.error("Imagen Generation Error:", error);
    throw error;
  }
};

// Enhanced Video Pipeline: Imagen 4 storyboard + Veo 3.1 chaining
export const generateEnhancedReportVideo = async (
  issueTitle: string,
  issueDescription: string,
  onProgress?: (stage: string, percent: number) => void
): Promise<{ videoUri: string; storyboardFrames?: string[] } | null> => {
  const ai = createClient();
  const storyboardFrames: string[] = [];

  try {
    // Step 1: Generate storyboard scenes with Imagen 4
    onProgress?.('Generating storyboard frames...', 10);

    const scenePrompts = [
      `Cinematic aerial view of San Francisco skyline at golden hour, representing urban issue: ${issueTitle}. Photorealistic, 4K, documentary style.`,
      `Street-level view of San Francisco neighborhood showing ${issueDescription.slice(0, 100)}. Photorealistic urban photography.`,
      `Close-up detail shot related to ${issueTitle} in San Francisco. Documentary style, dramatic lighting.`,
      `Wide establishing shot of San Francisco Bay Area at dusk, contemplative mood, representing the impact of ${issueTitle}. Cinematic 4K.`
    ];

    for (let i = 0; i < scenePrompts.length; i++) {
      try {
        onProgress?.(`Generating frame ${i + 1}/${scenePrompts.length}...`, 10 + (i * 15));
        const frame = await generateStoryboardFrame(scenePrompts[i]);
        if (frame) {
          storyboardFrames.push(frame.imageData);
        }
      } catch (e) {
        console.warn(`Failed to generate frame ${i + 1}:`, e);
        // Continue with remaining frames
      }
    }

    // Step 2: Generate video with Veo 3.1
    onProgress?.('Generating video with Veo 3.1...', 70);

    const videoPrompt = `A photorealistic, cinematic drone shot of San Francisco, representing the issue: ${issueTitle}. ${issueDescription}. High quality, 4k, urban documentary style. Smooth camera movement, golden hour lighting.`;

    let operation = await ai.models.generateVideos({
      model: MODEL_VIDEO,
      prompt: videoPrompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9',
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    onProgress?.('Video complete!', 100);

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (videoUri) {
      return {
        videoUri,
        storyboardFrames: storyboardFrames.length > 0 ? storyboardFrames : undefined
      };
    }
    return null;
  } catch (error) {
    console.error("Enhanced Video Pipeline Error:", error);
    throw error;
  }
};

// Stage 7: Follow-Up Check
// Data agents re-check past issues against fresh data
export const runFollowUpCheck = async (
  pastIssues: Array<{ id: number; title: string; severity: string; dataRefs: string[] }>,
  freshDataSummary: string
): Promise<Array<{
  issueId: number;
  title: string;
  status: 'improving' | 'worsening' | 'stagnant';
  explanation: string;
  escalate: boolean;
}>> => {
  if (pastIssues.length === 0) {
    return [];
  }

  try {
    const ai = createClient();

    const prompt = `You are the Marathon Orchestrator performing Stage 7: Follow-Up Check.

PAST ISSUES TO CHECK:
${JSON.stringify(pastIssues, null, 2)}

FRESH DATA SUMMARY FROM CURRENT CYCLE:
${freshDataSummary}

For EACH past issue, determine:
1. Status: Is the issue "improving", "worsening", or "stagnant"?
2. Explanation: Brief reason for your assessment (1 sentence)
3. Escalate: If worsening, should this be escalated? (true/false)

Output STRICT JSON array:
[
  {
    "issueId": number,
    "title": "string",
    "status": "improving" | "worsening" | "stagnant",
    "explanation": "string",
    "escalate": boolean
  }
]`;

    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.MARATHON_ORCHESTRATOR,
        temperature: 0.3,
        responseMimeType: "application/json"
      }
    });

    const jsonStr = cleanJson(response.text || "[]");
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Follow-Up Check Error:", e);
    return pastIssues.map(p => ({
      issueId: p.id,
      title: p.title,
      status: 'stagnant' as const,
      explanation: 'Follow-up check failed',
      escalate: false
    }));
  }
};
