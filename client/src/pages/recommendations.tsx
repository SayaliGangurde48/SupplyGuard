import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plane, Shield, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RecommendationsPage() {
  const [appliedRecommendations, setAppliedRecommendations] = useState<number[]>([]);
  const { toast } = useToast();

  const recommendations = [
    {
      id: 1,
      title: 'Reroute via PUS→LAX',
      description: 'Redirect shipments through alternate port to bypass security delays',
      icon: Plane,
      costImpact: '+4.0%',
      leadTime: '+1.3 days',
      riskReduction: '35%',
      color: 'blue',
      priority: 'High'
    },
    {
      id: 2,
      title: 'Pre-clearance via Priority lane',
      description: 'Implement documentation quality assurance and priority processing',
      icon: Shield,
      costImpact: '+1.5%',
      leadTime: '-2.0 days',
      riskReduction: '25%',
      color: 'green',
      priority: 'Medium'
    },
    {
      id: 3,
      title: 'Partial Air Freight via 15% Critical SKUs',
      description: 'Ship critical inventory via air freight to minimize service disruption',
      icon: Package,
      costImpact: '+12.0%',
      leadTime: '-8.0 days',
      riskReduction: '60%',
      color: 'purple',
      priority: 'Critical'
    }
  ];

  const applyRecommendation = (recId: number, title: string) => {
    if (appliedRecommendations.includes(recId)) {
      setAppliedRecommendations(prev => prev.filter(id => id !== recId));
      toast({
        title: "Recommendation Removed",
        description: `${title} has been removed from your implementation plan`,
      });
    } else {
      setAppliedRecommendations(prev => [...prev, recId]);
      toast({
        title: "Recommendation Applied",
        description: `${title} has been added to your implementation plan`,
      });
    }
  };

  const downloadPlan = () => {
    const appliedRecs = recommendations.filter(rec => appliedRecommendations.includes(rec.id));
    
    if (appliedRecs.length === 0) {
      toast({
        title: "No Recommendations Selected",
        description: "Please apply some recommendations first to generate a plan",
        variant: "destructive"
      });
      return;
    }

    const content = `SUPPLY CHAIN RISK MITIGATION PLAN
=====================================

Generated: ${new Date().toLocaleString()}
Selected Mitigations: ${appliedRecs.length}

${appliedRecs.map((rec, index) => `
${index + 1}. ${rec.title}
   Priority: ${rec.priority}
   Description: ${rec.description}
   Cost Impact: ${rec.costImpact}
   Lead Time Impact: ${rec.leadTime}
   Risk Reduction: ${rec.riskReduction}
   
   Implementation Steps:
   - Review current logistics setup
   - Identify required resources and partnerships
   - Establish timeline for implementation
   - Monitor progress and effectiveness
   
${'-'.repeat(50)}`).join('\n')}

SUMMARY
=======
Total Cost Impact: ${appliedRecs.reduce((sum, rec) => {
  const cost = parseFloat(rec.costImpact.replace('%', '').replace('+', ''));
  return sum + cost;
}, 0).toFixed(1)}%

Total Time Change: ${appliedRecs.reduce((sum, rec) => {
  const time = parseFloat(rec.leadTime.replace(' days', ''));
  return sum + time;
}, 0).toFixed(1)} days

Total Risk Reduction: ${appliedRecs.reduce((sum, rec) => {
  const risk = parseFloat(rec.riskReduction.replace('%', ''));
  return sum + risk;
}, 0).toFixed(0)}%

End of Plan`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `risk-mitigation-plan-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Plan Downloaded",
      description: `Implementation plan with ${appliedRecs.length} recommendations downloaded successfully`,
    });
  };

  const calculateTotals = () => {
    const appliedRecs = recommendations.filter(rec => appliedRecommendations.includes(rec.id));
    
    const totalCost = appliedRecs.reduce((sum, rec) => {
      const cost = parseFloat(rec.costImpact.replace('%', '').replace('+', ''));
      return sum + cost;
    }, 0);

    const totalTime = appliedRecs.reduce((sum, rec) => {
      const time = parseFloat(rec.leadTime.replace(' days', ''));
      return sum + time;
    }, 0);

    const totalRisk = appliedRecs.reduce((sum, rec) => {
      const risk = parseFloat(rec.riskReduction.replace('%', ''));
      return sum + risk;
    }, 0);

    return { totalCost, totalTime, totalRisk };
  };

  const { totalCost, totalTime, totalRisk } = calculateTotals();

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Risk Mitigation Recommendations</h1>
            <p className="text-sm text-gray-500 mt-1">Choose mitigation strategies with clear cost, time, and risk trade-offs</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-sm">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-green-600 font-medium">LIVE</span>
              <span className="text-gray-500">8:39:50 am</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recommendations */}
          <div className="lg:col-span-2 space-y-6">
            {recommendations.map((rec) => {
              const Icon = rec.icon;
              return (
                <Card key={rec.id} className={`border-l-4 ${
                  rec.color === 'blue' ? 'border-l-blue-500' :
                  rec.color === 'green' ? 'border-l-green-500' :
                  'border-l-purple-500'
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          rec.color === 'blue' ? 'bg-blue-100' :
                          rec.color === 'green' ? 'bg-green-100' :
                          'bg-purple-100'
                        }`}>
                          <Icon className={`h-5 w-5 ${
                            rec.color === 'blue' ? 'text-blue-600' :
                            rec.color === 'green' ? 'text-green-600' :
                            'text-purple-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{rec.title}</CardTitle>
                          <p className="text-gray-600 mt-1">{rec.description}</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => applyRecommendation(rec.id, rec.title)}
                        className={`${
                          appliedRecommendations.includes(rec.id) 
                            ? 'bg-gray-600 hover:bg-gray-700' 
                            : rec.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                              rec.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                              'bg-purple-600 hover:bg-purple-700'
                        } text-white`}
                        data-testid={`button-apply-${rec.id}`}
                      >
                        {appliedRecommendations.includes(rec.id) ? 'Remove' : 'Apply'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Cost Impact:</div>
                        <div className={`font-bold ${
                          rec.costImpact.startsWith('+') && rec.costImpact !== '+1.5%' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {rec.costImpact}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Lead Time:</div>
                        <div className={`font-bold ${
                          rec.leadTime.startsWith('+') ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {rec.leadTime}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Risk Reduction:</div>
                        <div className="font-bold text-green-600">{rec.riskReduction}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Implementation Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Implementation Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-sm text-gray-600 mb-2">Selected Mitigations</div>
                  <div className="text-2xl font-bold">{appliedRecommendations.length} selected</div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Cost Impact:</span>
                    <span className={`font-medium ${totalCost > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {totalCost > 0 ? '+' : ''}{totalCost.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Time Change:</span>
                    <span className={`font-medium ${totalTime < 0 ? 'text-green-600' : totalTime > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {totalTime > 0 ? '+' : ''}{totalTime.toFixed(1)} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Risk Reduction:</span>
                    <span className={`font-medium ${totalRisk > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                      {totalRisk.toFixed(0)}%
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={downloadPlan}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-download-plan"
                >
                  Download Plan
                </Button>

                {/* Sample warehouse image */}
                <div className="mt-6">
                  <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Package className="h-8 w-8 mx-auto mb-2" />
                      <div className="text-xs">Warehouse Operations</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}