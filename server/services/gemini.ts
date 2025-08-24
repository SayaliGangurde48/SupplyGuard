import { GoogleGenAI } from "@google/genai";
import type { AssessmentInput, Vulnerability, Recommendation } from "@shared/schema";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ""
});

interface AssessmentScores {
  overallRiskScore: number;
  supplierRiskScore: number;
  logisticsRiskScore: number;
  geopoliticalRiskScore: number;
}

interface GeminiAssessmentResponse {
  scores: AssessmentScores;
  vulnerabilities: Vulnerability[];
  recommendations: Recommendation[];
}

export async function analyzeSupplyChainVulnerabilities(
  assessmentData: AssessmentInput
): Promise<GeminiAssessmentResponse> {
  try {
    const prompt = createAssessmentPrompt(assessmentData);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            scores: {
              type: "object",
              properties: {
                overallRiskScore: { type: "number" },
                supplierRiskScore: { type: "number" },
                logisticsRiskScore: { type: "number" },
                geopoliticalRiskScore: { type: "number" }
              },
              required: ["overallRiskScore", "supplierRiskScore", "logisticsRiskScore", "geopoliticalRiskScore"]
            },
            vulnerabilities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  severity: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
                  score: { type: "number" },
                  impactTimeline: { type: "string" },
                  potentialCost: { type: "string" }
                },
                required: ["id", "title", "description", "severity", "score", "impactTimeline", "potentialCost"]
              }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  timeline: { type: "string" },
                  priority: { type: "string", enum: ["Critical", "High", "Medium", "Low"] }
                },
                required: ["id", "title", "description", "timeline", "priority"]
              }
            }
          },
          required: ["scores", "vulnerabilities", "recommendations"]
        }
      },
      contents: prompt
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini API");
    }

    const data: GeminiAssessmentResponse = JSON.parse(rawJson);
    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(`Failed to analyze supply chain vulnerabilities: ${error}`);
  }
}

function createAssessmentPrompt(data: AssessmentInput): string {
  return `Analyze this supply chain for vulnerabilities and provide risk scores (0-10) and actionable recommendations.

COMPANY: ${data.companyName} (${data.industry})

SUPPLIERS:
${data.suppliers.map(supplier => 
  `- ${supplier.name} (${supplier.location}, ${supplier.criticality}): ${supplier.products}`
).join('\n')}

LOGISTICS: ${data.logisticsRoutes}
TRANSPORT: ${Object.entries(data.transportationMethods)
  .filter(([_, used]) => used)
  .map(([method]) => method)
  .join(', ')}

RISKS: ${data.riskFactors}

Provide:
1. Risk scores (0-10): overall, supplier, logistics, geopolitical
2. Top 3-4 vulnerabilities: title, description, severity (HIGH/MEDIUM/LOW), score, timeline, cost
3. Top 3-4 recommendations: title, description, priority (Critical/High/Medium/Low), timeline

Use IDs: vuln_001, rec_001, etc. Be concise but actionable.`;
}

export async function checkGeminiApiHealth(): Promise<boolean> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Respond with 'OK' if you can process this request."
    });
    
    return response.text?.toLowerCase().includes('ok') || false;
  } catch (error) {
    console.error("Gemini API health check failed:", error);
    return false;
  }
}
