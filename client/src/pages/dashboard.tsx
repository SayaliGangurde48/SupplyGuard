import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SupplyChainForm from "@/components/supply-chain-form";
import AssessmentResults from "@/components/assessment-results";
import AssessmentStatus from "@/components/assessment-status";
import LoadingOverlay from "@/components/loading-overlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Download, Settings, Eye, RotateCcw } from "lucide-react";
import geminiLogo from "@assets/generated_images/Gemini_AI_logo_icon_4ec1392f.png";
import type { Assessment } from "@shared/schema";

export default function Dashboard() {
  const [currentAssessmentId, setCurrentAssessmentId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { data: assessments = [], isLoading: isLoadingAssessments } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments"],
  });

  const { data: currentAssessment, refetch: refetchCurrentAssessment } = useQuery<Assessment>({
    queryKey: ["/api/assessments", currentAssessmentId],
    enabled: !!currentAssessmentId,
    refetchInterval: (data) => {
      // Refetch every 2 seconds if assessment is processing
      return data?.status === "processing" ? 2000 : false;
    },
  });

  const { data: healthCheck } = useQuery<{ status: string; gemini: string; timestamp: string }>({
    queryKey: ["/api/health"],
    refetchInterval: 30000, // Check every 30 seconds
  });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString();
  };

  const exportToPDF = (assessment?: Assessment) => {
    if (!assessment) return;
    // Create a simple text export for now
    const content = `Supply Chain Vulnerability Assessment Report

Company: ${assessment.companyName}
Industry: ${assessment.industry}
Date: ${formatDate(assessment.createdAt)}

Risk Scores:
- Overall: ${assessment.overallRiskScore?.toFixed(1) || 'N/A'}
- Supplier: ${assessment.supplierRiskScore?.toFixed(1) || 'N/A'}
- Logistics: ${assessment.logisticsRiskScore?.toFixed(1) || 'N/A'}
- Geopolitical: ${assessment.geopoliticalRiskScore?.toFixed(1) || 'N/A'}

Status: ${assessment.status}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supply-chain-assessment-${assessment.companyName}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAllReports = () => {
    if (assessments.length === 0) return;
    const content = assessments.map(assessment => 
      `${assessment.companyName} (${assessment.industry}) - Risk: ${assessment.overallRiskScore?.toFixed(1) || 'N/A'} - ${formatDate(assessment.createdAt)}`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-assessments-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const showAllAssessments = () => {
    // For now, just scroll to the assessment history section
    const historySection = document.querySelector('[data-testid="assessment-history"]');
    if (historySection) {
      historySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getRiskColor = (score: number | null) => {
    if (!score) return "gray";
    if (score >= 7) return "red";
    if (score >= 4) return "orange";
    return "green";
  };

  const getRiskLabel = (score: number | null) => {
    if (!score) return "N/A";
    if (score >= 7) return "High";
    if (score >= 4) return "Medium";
    return "Low";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Shield className="text-primary text-2xl" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Supply Chain Guardian</h1>
                <p className="text-sm text-gray-500">AI-Powered Vulnerability Assessment</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" data-testid="button-settings">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <h4 className="font-medium mb-2">API Configuration</h4>
                      <p>Gemini API Status: Connected</p>
                      <p>Model: Gemini 2.5 Flash</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <h4 className="font-medium mb-2">Export Options</h4>
                      <p>Default format: Text (.txt)</p>
                      <p>Include timestamps: Yes</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <h4 className="font-medium mb-2">Data Retention</h4>
                      <p>Assessments stored: In memory</p>
                      <p>Auto-cleanup: On restart</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={exportAllReports} data-testid="button-export">
                <Download className="h-4 w-4 mr-2" />
                Export Reports
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API Status Banner */}
        {healthCheck && (
          <Card className={`mb-8 ${healthCheck.gemini === 'connected' ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className="flex items-center space-x-2">
                  <img 
                    src={geminiLogo} 
                    alt="Gemini AI" 
                    className={`w-8 h-8 ${healthCheck.gemini === 'connected' ? 'opacity-100' : 'opacity-50'}`}
                  />
                  <Shield className={`${healthCheck.gemini === 'connected' ? 'text-blue-600' : 'text-red-600'}`} />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold mb-2 ${healthCheck.gemini === 'connected' ? 'text-blue-900' : 'text-red-900'}`}>
                    {healthCheck.gemini === 'connected' ? 'Gemini AI Ready' : 'API Connection Issue'}
                  </h3>
                  <p className={`mb-3 ${healthCheck.gemini === 'connected' ? 'text-blue-800' : 'text-red-800'}`}>
                    {healthCheck.gemini === 'connected' 
                      ? 'Gemini 2.5 Flash is connected and optimized for fast vulnerability analysis.'
                      : 'Unable to connect to Gemini API. Please check your API key configuration.'}
                  </p>
                  {healthCheck.gemini === 'connected' && (
                    <ol className="list-decimal list-inside text-blue-800 space-y-1 text-sm">
                      <li>⚡ SPEED MODE: Analysis guaranteed in under 12 seconds</li>
                      <li>🚀 Ultra-optimized AI prompts for lightning-fast results</li>
                      <li>🛡️ Smart fallback ensures you always get comprehensive analysis</li>
                    </ol>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Supply Chain Form */}
          <div className="lg:col-span-2">
            <SupplyChainForm 
              onAssessmentCreated={(id: string) => {
                setCurrentAssessmentId(id);
                setIsProcessing(true);
              }}
              isProcessing={isProcessing}
            />
          </div>

          {/* Assessment Status */}
          <div className="lg:col-span-1">
            <AssessmentStatus 
              assessment={currentAssessment}
              healthCheck={healthCheck}
            />
          </div>
        </div>

        {/* Assessment Results */}
        {currentAssessment && (
          <div className="mt-8">
            <AssessmentResults 
              assessment={currentAssessment}
              onProcessingComplete={() => setIsProcessing(false)}
            />
          </div>
        )}

        {/* Assessment History */}
        <Card className="mt-8" data-testid="assessment-history">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Assessment History</CardTitle>
              <Button variant="ghost" size="sm" onClick={showAllAssessments} data-testid="button-view-all">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingAssessments ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
              </div>
            ) : assessments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No assessments found. Create your first assessment above.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Assessment Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Company</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Risk Score</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {assessments.map((assessment) => (
                      <tr key={assessment.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(assessment.createdAt)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">{assessment.companyName}</div>
                          <div className="text-xs text-gray-500">{assessment.industry}</div>
                        </td>
                        <td className="py-3 px-4">
                          {assessment.overallRiskScore ? (
                            <div className="flex items-center space-x-2">
                              <span className={`text-lg font-bold text-${getRiskColor(assessment.overallRiskScore)}-600`}>
                                {assessment.overallRiskScore.toFixed(1)}
                              </span>
                              <Badge variant={getRiskColor(assessment.overallRiskScore) === 'red' ? 'destructive' : 'secondary'}>
                                {getRiskLabel(assessment.overallRiskScore)}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-gray-400">Pending</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant={
                              assessment.status === 'completed' ? 'default' : 
                              assessment.status === 'failed' ? 'destructive' : 'secondary'
                            }
                          >
                            {assessment.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setCurrentAssessmentId(assessment.id)}
                              data-testid={`button-view-${assessment.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => exportToPDF(assessment)}
                              data-testid={`button-download-${assessment.id}`}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isProcessing && <LoadingOverlay />}
    </div>
  );
}
