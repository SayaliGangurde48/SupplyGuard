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

  const httpServer = createServer(app);
  return httpServer;
}

async function processAssessmentAsync(assessmentId: string, assessmentData: any) {
  try {
    // Update status to processing
    await storage.updateAssessment(assessmentId, { status: "processing" });
    
    // Analyze with Gemini
    const analysisResult = await analyzeSupplyChainVulnerabilities(assessmentData);
    
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
    
  } catch (error) {
    console.error("Assessment processing failed:", error);
    await storage.updateAssessment(assessmentId, { 
      status: "failed",
    });
  }
}
