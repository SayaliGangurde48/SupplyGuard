import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Play, RotateCcw, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ScenarioLabPage() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [scenarios, setScenarios] = useState({
    portCongestion: false,
    weatherDisruption: false,
    geopoliticalTension: false,
    supplierFailure: false,
    cyberAttack: false,
  });
  const [riskFactors, setRiskFactors] = useState({
    portCongestionLevel: [30],
    weatherSeverity: [50],
    geopoliticalImpact: [40],
    supplierReliability: [70],
    cyberSecurityLevel: [80],
  });
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const runSimulation = async () => {
    setIsSimulating(true);
    setSimulationComplete(false);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Calculate simulation results based on selected scenarios
    const activeScenarios = Object.entries(scenarios).filter(([_, active]) => active);
    const baseRisk = 3.0;
    let totalRiskIncrease = 0;
    let impactDetails = [];

    if (scenarios.portCongestion) {
      const increase = (riskFactors.portCongestionLevel[0] / 100) * 2.5;
      totalRiskIncrease += increase;
      impactDetails.push({
        scenario: 'Port Congestion',
        impact: `+${increase.toFixed(1)} risk points`,
        description: `${riskFactors.portCongestionLevel[0]}% congestion level causing shipping delays`,
        severity: increase > 1.5 ? 'high' : increase > 0.8 ? 'medium' : 'low'
      });
    }

    if (scenarios.weatherDisruption) {
      const increase = (riskFactors.weatherSeverity[0] / 100) * 2.0;
      totalRiskIncrease += increase;
      impactDetails.push({
        scenario: 'Weather Disruption',
        impact: `+${increase.toFixed(1)} risk points`,
        description: `${riskFactors.weatherSeverity[0]}% weather severity affecting logistics`,
        severity: increase > 1.2 ? 'high' : increase > 0.6 ? 'medium' : 'low'
      });
    }

    if (scenarios.geopoliticalTension) {
      const increase = (riskFactors.geopoliticalImpact[0] / 100) * 3.0;
      totalRiskIncrease += increase;
      impactDetails.push({
        scenario: 'Geopolitical Tension',
        impact: `+${increase.toFixed(1)} risk points`,
        description: `${riskFactors.geopoliticalImpact[0]}% tension level affecting trade routes`,
        severity: increase > 1.8 ? 'high' : increase > 1.0 ? 'medium' : 'low'
      });
    }

    if (scenarios.supplierFailure) {
      const reliability = riskFactors.supplierReliability[0];
      const increase = ((100 - reliability) / 100) * 2.5;
      totalRiskIncrease += increase;
      impactDetails.push({
        scenario: 'Supplier Failure',
        impact: `+${increase.toFixed(1)} risk points`,
        description: `${reliability}% supplier reliability - potential supply chain breaks`,
        severity: increase > 1.5 ? 'high' : increase > 0.8 ? 'medium' : 'low'
      });
    }

    if (scenarios.cyberAttack) {
      const security = riskFactors.cyberSecurityLevel[0];
      const increase = ((100 - security) / 100) * 1.8;
      totalRiskIncrease += increase;
      impactDetails.push({
        scenario: 'Cyber Security Risk',
        impact: `+${increase.toFixed(1)} risk points`,
        description: `${security}% security level - vulnerability to cyber attacks`,
        severity: increase > 1.2 ? 'high' : increase > 0.6 ? 'medium' : 'low'
      });
    }

    const finalRiskScore = Math.min(baseRisk + totalRiskIncrease, 10);
    const timelineImpact = Math.floor(totalRiskIncrease * 5);
    const costImpact = Math.floor(totalRiskIncrease * 1.2 * 100000);

    setResults({
      baseRisk,
      totalRiskIncrease,
      finalRiskScore,
      timelineImpact,
      costImpact,
      impactDetails,
      scenarioCount: activeScenarios.length
    });

    setIsSimulating(false);
    setSimulationComplete(true);

    toast({
      title: "Simulation Complete",
      description: `Analyzed ${activeScenarios.length} risk scenario${activeScenarios.length !== 1 ? 's' : ''}`,
    });
  };

  const resetSimulation = () => {
    setScenarios({
      portCongestion: false,
      weatherDisruption: false,
      geopoliticalTension: false,
      supplierFailure: false,
      cyberAttack: false,
    });
    setResults(null);
    setSimulationComplete(false);
    
    toast({
      title: "Simulation Reset",
      description: "All scenarios cleared. Ready for new simulation.",
    });
  };

  const toggleScenario = (scenario: keyof typeof scenarios) => {
    setScenarios(prev => ({
      ...prev,
      [scenario]: !prev[scenario]
    }));
  };

  const activeScenarios = Object.values(scenarios).filter(Boolean).length;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Scenario Lab</h1>
            <p className="text-sm text-gray-500 mt-1">Simulate supply chain disruptions and analyze potential impacts</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-sm">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-green-600 font-medium">LIVE</span>
              <span className="text-gray-500">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Control Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-purple-600" />
                <span>Simulation Controls</span>
              </CardTitle>
              <div className="flex space-x-3">
                <Button 
                  onClick={runSimulation} 
                  disabled={isSimulating || activeScenarios === 0}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  data-testid="button-run-simulation"
                >
                  {isSimulating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {isSimulating ? 'Simulating...' : 'Run Simulation'}
                </Button>
                <Button 
                  onClick={resetSimulation}
                  variant="outline"
                  data-testid="button-reset-simulation"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 mb-4">
              Select disruption scenarios and adjust their severity to model potential supply chain impacts.
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={activeScenarios > 0 ? 'default' : 'secondary'}>
                {activeScenarios} Active Scenario{activeScenarios !== 1 ? 's' : ''}
              </Badge>
              {simulationComplete && results && (
                <Badge className="bg-green-100 text-green-800">
                  Last Run: {results.scenarioCount} scenarios analyzed
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scenario Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Risk Scenarios</h3>

            {/* Port Congestion */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={scenarios.portCongestion}
                        onCheckedChange={() => toggleScenario('portCongestion')}
                        data-testid="switch-port-congestion"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">Port Congestion</h4>
                        <p className="text-sm text-gray-600">Major shipping port delays and backups</p>
                      </div>
                    </div>
                    {scenarios.portCongestion && (
                      <div className="mt-4">
                        <label className="text-sm font-medium text-gray-700">Congestion Level: {riskFactors.portCongestionLevel[0]}%</label>
                        <Slider
                          value={riskFactors.portCongestionLevel}
                          onValueChange={(value) => setRiskFactors(prev => ({ ...prev, portCongestionLevel: value }))}
                          max={100}
                          min={10}
                          step={5}
                          className="mt-2"
                          data-testid="slider-port-congestion"
                        />
                      </div>
                    )}
                  </div>
                  <Badge variant={scenarios.portCongestion ? 'default' : 'outline'}>
                    {scenarios.portCongestion ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Weather Disruption */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={scenarios.weatherDisruption}
                        onCheckedChange={() => toggleScenario('weatherDisruption')}
                        data-testid="switch-weather-disruption"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">Weather Disruption</h4>
                        <p className="text-sm text-gray-600">Storms, hurricanes, or severe weather events</p>
                      </div>
                    </div>
                    {scenarios.weatherDisruption && (
                      <div className="mt-4">
                        <label className="text-sm font-medium text-gray-700">Weather Severity: {riskFactors.weatherSeverity[0]}%</label>
                        <Slider
                          value={riskFactors.weatherSeverity}
                          onValueChange={(value) => setRiskFactors(prev => ({ ...prev, weatherSeverity: value }))}
                          max={100}
                          min={20}
                          step={5}
                          className="mt-2"
                          data-testid="slider-weather-severity"
                        />
                      </div>
                    )}
                  </div>
                  <Badge variant={scenarios.weatherDisruption ? 'default' : 'outline'}>
                    {scenarios.weatherDisruption ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Geopolitical Tension */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={scenarios.geopoliticalTension}
                        onCheckedChange={() => toggleScenario('geopoliticalTension')}
                        data-testid="switch-geopolitical-tension"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">Geopolitical Tension</h4>
                        <p className="text-sm text-gray-600">Trade wars, sanctions, or diplomatic conflicts</p>
                      </div>
                    </div>
                    {scenarios.geopoliticalTension && (
                      <div className="mt-4">
                        <label className="text-sm font-medium text-gray-700">Impact Level: {riskFactors.geopoliticalImpact[0]}%</label>
                        <Slider
                          value={riskFactors.geopoliticalImpact}
                          onValueChange={(value) => setRiskFactors(prev => ({ ...prev, geopoliticalImpact: value }))}
                          max={100}
                          min={15}
                          step={5}
                          className="mt-2"
                          data-testid="slider-geopolitical-impact"
                        />
                      </div>
                    )}
                  </div>
                  <Badge variant={scenarios.geopoliticalTension ? 'default' : 'outline'}>
                    {scenarios.geopoliticalTension ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Supplier Failure */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={scenarios.supplierFailure}
                        onCheckedChange={() => toggleScenario('supplierFailure')}
                        data-testid="switch-supplier-failure"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">Supplier Failure</h4>
                        <p className="text-sm text-gray-600">Key supplier bankruptcy or production halt</p>
                      </div>
                    </div>
                    {scenarios.supplierFailure && (
                      <div className="mt-4">
                        <label className="text-sm font-medium text-gray-700">Supplier Reliability: {riskFactors.supplierReliability[0]}%</label>
                        <Slider
                          value={riskFactors.supplierReliability}
                          onValueChange={(value) => setRiskFactors(prev => ({ ...prev, supplierReliability: value }))}
                          max={100}
                          min={10}
                          step={5}
                          className="mt-2"
                          data-testid="slider-supplier-reliability"
                        />
                      </div>
                    )}
                  </div>
                  <Badge variant={scenarios.supplierFailure ? 'default' : 'outline'}>
                    {scenarios.supplierFailure ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Cyber Attack */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={scenarios.cyberAttack}
                        onCheckedChange={() => toggleScenario('cyberAttack')}
                        data-testid="switch-cyber-attack"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">Cyber Security Risk</h4>
                        <p className="text-sm text-gray-600">Ransomware or system breaches affecting operations</p>
                      </div>
                    </div>
                    {scenarios.cyberAttack && (
                      <div className="mt-4">
                        <label className="text-sm font-medium text-gray-700">Security Level: {riskFactors.cyberSecurityLevel[0]}%</label>
                        <Slider
                          value={riskFactors.cyberSecurityLevel}
                          onValueChange={(value) => setRiskFactors(prev => ({ ...prev, cyberSecurityLevel: value }))}
                          max={100}
                          min={30}
                          step={5}
                          className="mt-2"
                          data-testid="slider-cyber-security"
                        />
                      </div>
                    )}
                  </div>
                  <Badge variant={scenarios.cyberAttack ? 'default' : 'outline'}>
                    {scenarios.cyberAttack ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Simulation Results</h3>
            
            {!results ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h4 className="text-lg font-medium">No Simulation Data</h4>
                    <p className="text-sm">Select scenarios and run simulation to see results</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Overall Impact */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Overall Impact Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-600">
                          {results.finalRiskScore.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">Final Risk Score</div>
                        <div className="text-xs text-gray-500">
                          (Base: {results.baseRisk} + Impact: {results.totalRiskIncrease.toFixed(1)})
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Timeline Impact:</span>
                          <span className="font-medium">+{results.timelineImpact} days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Cost Impact:</span>
                          <span className="font-medium">${(results.costImpact / 1000).toFixed(0)}K</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Impact */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Scenario Impact Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {results.impactDetails.map((detail: any, index: number) => (
                        <div key={index} className="border-l-4 border-l-blue-500 pl-3">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-gray-900">{detail.scenario}</h5>
                            <Badge variant={
                              detail.severity === 'high' ? 'destructive' : 
                              detail.severity === 'medium' ? 'secondary' : 
                              'outline'
                            }>
                              {detail.impact}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{detail.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}