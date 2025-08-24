import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Cloud } from 'lucide-react';

export default function SecurityEventsPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Supply Chain Vulnerability Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Real-time monitoring and risk assessment</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-sm">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-green-600 font-medium">LIVE</span>
              <span className="text-gray-500">8:37:08 am</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Active Security Event */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>Active Security Event</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-orange-900">Customs Security Tightened at Port Ningbo</h4>
                  <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <div className="font-bold">10 days</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Inspection Rate:</span>
                      <div className="font-bold">25%</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Clearance Time:</span>
                      <div className="font-bold">×1.5</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Confidence:</span>
                      <div className="font-bold">80%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={() => {
                  // Trigger security event functionality here
                  console.log('Triggering security event simulation');
                }}
                className="bg-red-500 hover:bg-red-600 text-white" 
                data-testid="button-trigger-event"
              >
                <Shield className="h-4 w-4 mr-2" />
                Trigger Security Event
              </Button>
              <Button 
                onClick={() => {
                  // Check weather alert functionality here
                  console.log('Checking weather alerts');
                }}
                variant="outline" 
                className="border-blue-500 text-blue-600 hover:bg-blue-50" 
                data-testid="button-check-weather"
              >
                <Cloud className="h-4 w-4 mr-2" />
                Check Weather Alert
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Supply Chain Ripple Effect */}
        <Card>
          <CardHeader>
            <CardTitle>Supply Chain Ripple Effect</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between space-x-8">
              {/* Port Ningbo */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-6 w-6 text-red-500" />
                </div>
                <div className="font-medium text-gray-900">Port Ningbo</div>
                <div className="text-sm text-red-600 font-medium">High Risk</div>
                <div className="text-xs text-gray-500">+3.2 days</div>
              </div>

              <div className="flex-1 relative">
                <div className="absolute top-8 left-0 right-0 border-t-2 border-gray-300"></div>
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                </div>
              </div>

              {/* Ocean Transit */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-500 flex items-center justify-center mx-auto mb-2">
                  <div className="text-orange-500 text-lg">🌊</div>
                </div>
                <div className="font-medium text-gray-900">Ocean Transit</div>
                <div className="text-sm text-orange-600 font-medium">Medium Risk</div>
                <div className="text-xs text-gray-500">+1.8 days</div>
              </div>

              <div className="flex-1 relative">
                <div className="absolute top-8 left-0 right-0 border-t-2 border-gray-300"></div>
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                </div>
              </div>

              {/* Port LA */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-500 flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-6 w-6 text-orange-500" />
                </div>
                <div className="font-medium text-gray-900">Port LA</div>
                <div className="text-sm text-orange-600 font-medium">Medium Risk</div>
                <div className="text-xs text-gray-500">+2.1 days</div>
              </div>

              <div className="flex-1 relative">
                <div className="absolute top-8 left-0 right-0 border-t-2 border-gray-300"></div>
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                </div>
              </div>

              {/* LA DC */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center mx-auto mb-2">
                  <div className="text-green-500 text-lg">🏢</div>
                </div>
                <div className="font-medium text-gray-900">LA DC</div>
                <div className="text-sm text-green-600 font-medium">Low Risk</div>
                <div className="text-xs text-gray-500">+0.3 days</div>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-8 mt-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Low 0-10%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>Medium 10-20%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>High 20%+</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}