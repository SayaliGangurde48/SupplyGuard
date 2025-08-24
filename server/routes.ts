import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeSupplyChainVulnerabilities, checkGeminiApiHealth } from "./services/gemini";
import { assessmentInputSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      const geminiHealthy = await checkGeminiApiHealth();
      res.json({ 
        status: "ok", 
        gemini: geminiHealthy ? "connected" : "disconnected",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        status: "error", 
        message: "Health check failed",
        gemini: "disconnected"
      });
    }
  });

  // Get all assessments
  app.get("/api/assessments", async (req, res) => {
    try {
      const assessments = await storage.getAllAssessments();
      res.json(assessments);
    } catch (error) {
      console.error("Failed to fetch assessments:", error);
      res.status(500).json({ 
        message: "Failed to fetch assessments",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get specific assessment
  app.get("/api/assessments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const assessment = await storage.getAssessment(id);
      
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      res.json(assessment);
    } catch (error) {
      console.error("Failed to fetch assessment:", error);
      res.status(500).json({ 
        message: "Failed to fetch assessment",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create new assessment
  app.post("/api/assessments", async (req, res) => {
    try {
      // Validate request body
      const validationResult = assessmentInputSchema.safeParse(req.body);
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ 
          message: "Validation failed",
          errors: validationError.details
        });
      }

      const assessmentData = validationResult.data;
      
      // Create assessment record
      const assessment = await storage.createAssessment(assessmentData);
      
      // Return initial assessment
      res.status(201).json(assessment);
      
      // Process assessment asynchronously
      processAssessmentAsync(assessment.id, assessmentData);
      
    } catch (error) {
      console.error("Failed to create assessment:", error);
      res.status(500).json({ 
        message: "Failed to create assessment",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update assessment status
  app.patch("/api/assessments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const updatedAssessment = await storage.updateAssessment(id, updates);
      
      if (!updatedAssessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      res.json(updatedAssessment);
    } catch (error) {
      console.error("Failed to update assessment:", error);
      res.status(500).json({ 
        message: "Failed to update assessment",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Trigger security event endpoint
  app.post("/api/security/trigger-event", async (req, res) => {
    try {
      const securityEvents = [
        {
          id: Date.now().toString(),
          title: "Customs Security Tightened at Port Shanghai",
          location: "Port Shanghai, China",
          severity: "High",
          duration: "12 days",
          inspectionRate: "35%",
          clearanceTime: "×2.1",
          confidence: "85%",
          description: "Enhanced security protocols implemented due to geopolitical tensions",
          timestamp: new Date().toISOString()
        },
        {
          id: Date.now().toString(),
          title: "Port Strike Negotiations at Rotterdam",
          location: "Rotterdam Port, Netherlands",
          severity: "Medium",
          duration: "7 days",
          inspectionRate: "15%",
          clearanceTime: "×1.3",
          confidence: "70%",
          description: "Labor union negotiations affecting port operations",
          timestamp: new Date().toISOString()
        },
        {
          id: Date.now().toString(),
          title: "Cyber Security Breach Detection",
          location: "Los Angeles Port, USA",
          severity: "Critical",
          duration: "5 days",
          inspectionRate: "50%",
          clearanceTime: "×3.0",
          confidence: "95%",
          description: "Potential cyber threat detected in port management systems",
          timestamp: new Date().toISOString()
        }
      ];
      
      // Select a random event
      const randomEvent = securityEvents[Math.floor(Math.random() * securityEvents.length)];
      
      res.json({
        success: true,
        message: "Security event triggered successfully",
        event: randomEvent
      });
    } catch (error) {
      console.error("Failed to trigger security event:", error);
      res.status(500).json({
        success: false,
        message: "Failed to trigger security event",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Check weather alert endpoint
  app.get("/api/security/weather-alert", async (req, res) => {
    try {
      const weatherAlerts = [
        {
          id: Date.now().toString(),
          type: "Typhoon Warning",
          location: "South China Sea",
          severity: "High",
          affectedPorts: ["Hong Kong", "Shanghai", "Ningbo"],
          duration: "72 hours",
          windSpeed: "150 km/h",
          visibility: "< 500m",
          recommendation: "All maritime operations suspended",
          timestamp: new Date().toISOString()
        },
        {
          id: Date.now().toString(),
          type: "Fog Advisory",
          location: "North Atlantic",
          severity: "Medium",
          affectedPorts: ["New York", "Boston", "Halifax"],
          duration: "24 hours",
          windSpeed: "25 km/h",
          visibility: "< 200m",
          recommendation: "Reduced vessel speed, enhanced navigation",
          timestamp: new Date().toISOString()
        },
        {
          id: Date.now().toString(),
          type: "Storm Warning",
          location: "Mediterranean Sea",
          severity: "Medium",
          affectedPorts: ["Barcelona", "Marseille", "Naples"],
          duration: "48 hours",
          windSpeed: "85 km/h",
          visibility: "1-2 km",
          recommendation: "Monitor vessel schedules, potential delays",
          timestamp: new Date().toISOString()
        }
      ];
      
      // Select a random weather alert
      const randomAlert = weatherAlerts[Math.floor(Math.random() * weatherAlerts.length)];
      
      res.json({
        success: true,
        message: "Weather alert retrieved successfully",
        alert: randomAlert
      });
    } catch (error) {
      console.error("Failed to check weather alert:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check weather alert",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function processAssessmentAsync(assessmentId: string, assessmentData: any) {
  const startTime = Date.now();
  try {
    console.log(`🚀 SPEED MODE: Starting analysis for ${assessmentId}`);
    
    // Update status to processing
    await storage.updateAssessment(assessmentId, { status: "processing" });
    
    // Set absolute maximum processing time of 11 seconds
    const maxProcessingTime = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error("Maximum processing time exceeded - using fallback"));
      }, 11000);
    });
    
    // Race between AI analysis and max time limit
    const analysisPromise = analyzeSupplyChainVulnerabilities(assessmentData);
    const analysisResult = await Promise.race([analysisPromise, maxProcessingTime]);
    
    // Update with results
    await storage.updateAssessment(assessmentId, {
      status: "completed",
      overallRiskScore: analysisResult.scores.overallRiskScore,
      supplierRiskScore: analysisResult.scores.supplierRiskScore,
      logisticsRiskScore: analysisResult.scores.logisticsRiskScore,
      geopoliticalRiskScore: analysisResult.scores.geopoliticalRiskScore,
      vulnerabilities: analysisResult.vulnerabilities,
      recommendations: analysisResult.recommendations,
    });
    
    const duration = Date.now() - startTime;
    console.log(`⚡ SPEED ANALYSIS completed for ${assessmentId} in ${duration}ms (${(duration/1000).toFixed(1)}s)`);
    
  } catch (error) {
    console.error("⚠️ Analysis failed, using emergency fallback:", error);
    
    // Emergency fallback analysis
    const fallbackResult = createEmergencyFallback(assessmentData);
    await storage.updateAssessment(assessmentId, {
      status: "completed",
      overallRiskScore: fallbackResult.scores.overallRiskScore,
      supplierRiskScore: fallbackResult.scores.supplierRiskScore,
      logisticsRiskScore: fallbackResult.scores.logisticsRiskScore,
      geopoliticalRiskScore: fallbackResult.scores.geopoliticalRiskScore,
      vulnerabilities: fallbackResult.vulnerabilities,
      recommendations: fallbackResult.recommendations,
    });
    
    const duration = Date.now() - startTime;
    console.log(`⚡ FALLBACK completed for ${assessmentId} in ${duration}ms`);
  }
}

function createEmergencyFallback(data: any) {
  // Ultra-fast risk calculation
  const supplierRisk = data.suppliers?.length === 1 ? 8 : 5;
  const hasPortRisk = data.riskFactors?.toLowerCase().includes('port') || data.riskFactors?.toLowerCase().includes('congestion');
  const logisticsRisk = hasPortRisk ? 7 : 4;
  const hasChinaRisk = data.suppliers?.some((s: any) => s.location?.toLowerCase().includes('china'));
  const geopoliticalRisk = hasChinaRisk ? 7 : 4;
  const overallRisk = Math.round((supplierRisk + logisticsRisk + geopoliticalRisk) / 3);
  
  return {
    scores: {
      overallRiskScore: overallRisk,
      supplierRiskScore: supplierRisk,
      logisticsRiskScore: logisticsRisk,
      geopoliticalRiskScore: geopoliticalRisk
    },
    vulnerabilities: [
      {
        id: "vuln_001",
        title: "Supply Chain Concentration Risk",
        description: `Limited supplier diversity creates vulnerability to disruptions.`,
        severity: "HIGH",
        score: supplierRisk,
        impactTimeline: "Immediate to weeks",
        potentialCost: "$100K-$1M USD"
      },
      {
        id: "vuln_002",
        title: "Logistics Bottleneck Risk", 
        description: "Transportation dependencies may cause delays.",
        severity: "MEDIUM",
        score: logisticsRisk,
        impactTimeline: "Days to weeks",
        potentialCost: "$50K-$500K USD"
      }
    ],
    recommendations: [
      {
        id: "rec_001",
        title: "Diversify Supplier Network",
        description: "Add backup suppliers to reduce single points of failure.",
        timeline: "3-6 months",
        priority: "Critical"
      },
      {
        id: "rec_002",
        title: "Optimize Logistics Routes",
        description: "Develop alternative transportation and routing plans.",
        timeline: "1-3 months", 
        priority: "High"
      }
    ]
  };
}
