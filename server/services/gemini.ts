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
  return `You are an expert supply chain risk analyst with decades of experience in identifying vulnerabilities and providing actionable recommendations. Analyze the following supply chain data and provide a comprehensive vulnerability assessment.

COMPANY INFORMATION:
- Company: ${data.companyName}
- Industry: ${data.industry}

SUPPLIERS:
${data.suppliers.map(supplier => 
  `- ${supplier.name} (${supplier.location}, ${supplier.criticality} criticality): ${supplier.products}`
).join('\n')}

LOGISTICS:
- Routes: ${data.logisticsRoutes}
- Transportation Methods: ${Object.entries(data.transportationMethods)
  .filter(([_, used]) => used)
  .map(([method]) => method)
  .join(', ')}

KNOWN RISK FACTORS:
${data.riskFactors}

Perform a thorough analysis considering:
1. Single points of failure in the supplier network
2. Geographic concentration risks
3. Geopolitical instability in supplier regions
4. Transportation vulnerabilities and bottlenecks
5. Industry-specific risks and regulations
6. Financial stability concerns
7. Cybersecurity and data protection risks
8. Natural disaster and climate change impacts
9. Market volatility and economic factors
10. Compliance and regulatory risks

Provide risk scores from 0-10 (where 10 is highest risk) for:
- Overall risk score (weighted average)
- Supplier risk (concentration, reliability, alternatives)
- Logistics risk (routes, methods, disruption potential)
- Geopolitical risk (stability, trade relations, sanctions)

Identify the top 3-5 most critical vulnerabilities with:
- Clear, actionable titles
- Detailed descriptions explaining the risk
- Severity levels (HIGH/MEDIUM/LOW)
- Numerical risk scores (0-10)
- Impact timelines (immediate, days, weeks, months)
- Potential cost ranges in USD

Provide 3-5 prioritized recommendations with:
- Specific, actionable titles
- Detailed implementation descriptions
- Realistic timelines for implementation
- Priority levels (Critical/High/Medium/Low)

Generate unique IDs for vulnerabilities and recommendations (format: vuln_001, rec_001, etc.).

Focus on practical, implementable solutions that address the highest-impact risks first. Consider both short-term mitigation strategies and long-term resilience building.`;
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
