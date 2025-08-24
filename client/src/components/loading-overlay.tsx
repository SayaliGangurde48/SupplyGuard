import { useState, useEffect } from "react";

export default function LoadingOverlay() {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);

  const stages = [
    { progress: 20, text: 'Validating supply chain data...' },
    { progress: 40, text: 'Sending data to Gemini API...' },
    { progress: 60, text: 'AI analyzing vulnerabilities...' },
    { progress: 80, text: 'Generating recommendations...' },
    { progress: 100, text: 'Finalizing assessment report...' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentStage < stages.length - 1) {
        setCurrentStage(prev => prev + 1);
        setProgress(stages[currentStage + 1].progress);
      } else {
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [currentStage, stages]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="loading-overlay">
      <div className="bg-white rounded-lg p-8 max-w-md mx-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Supply Chain</h3>
          <p className="text-gray-600 text-sm mb-4" data-testid="text-loading-description">
            Gemini AI is processing your data and identifying vulnerabilities...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-1000" 
              style={{ width: `${progress}%` }}
              data-testid="progress-bar"
            />
          </div>
          <p className="text-xs text-gray-500" data-testid="text-progress-stage">
            {stages[currentStage]?.text || 'Initializing analysis...'}
          </p>
        </div>
      </div>
    </div>
  );
}
