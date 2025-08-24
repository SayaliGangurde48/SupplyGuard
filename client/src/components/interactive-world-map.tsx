import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Activity, AlertTriangle } from 'lucide-react';
import worldMapImage from '@assets/WhatsApp Image 2025-08-24 at 08.42.30_24dcea35_1756006216962.jpg';

interface NetworkNode {
  id: string;
  name: string;
  x: number;
  y: number;
  status: 'active' | 'warning' | 'critical';
  connections: number;
  region: string;
}

export default function InteractiveWorldMap() {
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [activeConnections, setActiveConnections] = useState<string[]>([]);

  // Key supply chain nodes based on the network image
  const networkNodes: NetworkNode[] = [
    { id: 'us-west', name: 'Los Angeles Port', x: 15, y: 45, status: 'active', connections: 12, region: 'North America' },
    { id: 'us-east', name: 'New York Port', x: 25, y: 40, status: 'active', connections: 8, region: 'North America' },
    { id: 'europe', name: 'Rotterdam Port', x: 52, y: 30, status: 'warning', connections: 15, region: 'Europe' },
    { id: 'uk', name: 'London Gateway', x: 50, y: 32, status: 'active', connections: 6, region: 'Europe' },
    { id: 'asia-east', name: 'Shanghai Port', x: 78, y: 42, status: 'critical', connections: 20, region: 'Asia Pacific' },
    { id: 'asia-se', name: 'Singapore Port', x: 75, y: 55, status: 'active', connections: 14, region: 'Asia Pacific' },
    { id: 'india', name: 'Mumbai Port', x: 70, y: 50, status: 'warning', connections: 9, region: 'Asia Pacific' },
    { id: 'middle-east', name: 'Dubai Port', x: 62, y: 48, status: 'active', connections: 11, region: 'Middle East' },
    { id: 'africa', name: 'Cape Town Port', x: 55, y: 70, status: 'active', connections: 5, region: 'Africa' },
    { id: 'brazil', name: 'Santos Port', x: 35, y: 68, status: 'active', connections: 7, region: 'South America' },
  ];

  const handleNodeClick = (node: NetworkNode) => {
    setHoveredNode(node);
    // Simulate showing connections
    const connectedNodes = networkNodes
      .filter(n => n.id !== node.id)
      .slice(0, node.connections)
      .map(n => n.id);
    setActiveConnections(connectedNodes);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-400';
      case 'warning': return 'bg-yellow-400';
      case 'critical': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'secondary';
    }
  };

  useEffect(() => {
    // Auto-animate connections every 3 seconds
    const interval = setInterval(() => {
      const randomNode = networkNodes[Math.floor(Math.random() * networkNodes.length)];
      setActiveConnections([randomNode.id]);
      setTimeout(() => setActiveConnections([]), 2000);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="h-[500px] bg-gray-900 border-gray-700 overflow-hidden">
      <CardHeader className="pb-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-white">
            <Activity className="h-5 w-5 text-blue-400" />
            <span>Global Supply Chain Network</span>
          </CardTitle>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400">Active: {networkNodes.filter(n => n.status === 'active').length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-yellow-400">Warning: {networkNodes.filter(n => n.status === 'warning').length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-red-400">Critical: {networkNodes.filter(n => n.status === 'critical').length}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative h-full">
        {/* World Map Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
          style={{ 
            backgroundImage: `url(${worldMapImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Network Nodes */}
          {networkNodes.map((node) => (
            <div
              key={node.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                activeConnections.includes(node.id) ? 'scale-150 z-20' : 'hover:scale-125 z-10'
              }`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onClick={() => handleNodeClick(node)}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Node Pulse Effect */}
              <div className={`absolute inset-0 ${getStatusColor(node.status)} rounded-full animate-ping opacity-20`}></div>
              
              {/* Main Node */}
              <div className={`relative h-4 w-4 ${getStatusColor(node.status)} rounded-full shadow-lg border-2 border-white`}>
                {/* Connection indicator */}
                {activeConnections.includes(node.id) && (
                  <div className="absolute -inset-2 border-2 border-blue-400 rounded-full animate-pulse"></div>
                )}
              </div>
              
              {/* Node Label */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                {node.name}
              </div>
            </div>
          ))}

          {/* Connection Lines - Animated */}
          {activeConnections.length > 0 && hoveredNode && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {networkNodes
                .filter(node => activeConnections.includes(node.id))
                .map((targetNode, index) => {
                  if (!hoveredNode) return null;
                  
                  const startX = (hoveredNode.x / 100) * 100;
                  const startY = (hoveredNode.y / 100) * 100;
                  const endX = (targetNode.x / 100) * 100;
                  const endY = (targetNode.y / 100) * 100;
                  
                  return (
                    <line
                      key={`connection-${index}`}
                      x1={`${startX}%`}
                      y1={`${startY}%`}
                      x2={`${endX}%`}
                      y2={`${endY}%`}
                      stroke="rgba(59, 130, 246, 0.6)"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      className="animate-pulse"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        values="0;10"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </line>
                  );
                })}
            </svg>
          )}
        </div>

        {/* Node Information Panel */}
        {hoveredNode && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-90 border border-gray-600 rounded-lg p-4 text-white min-w-64 z-30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">{hoveredNode.name}</h3>
              <Badge variant={getStatusBadgeVariant(hoveredNode.status)}>
                {hoveredNode.status.toUpperCase()}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Region:</span>
                <span>{hoveredNode.region}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Active Connections:</span>
                <span className="text-blue-400">{hoveredNode.connections}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Network Status:</span>
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 ${getStatusColor(hoveredNode.status)} rounded-full`}></div>
                  <span>{hoveredNode.status === 'active' ? 'Operational' : hoveredNode.status === 'warning' ? 'Minor Issues' : 'Service Disrupted'}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-600">
              <p className="text-xs text-gray-400">
                Click node to view connections • Hover for details
              </p>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-90 border border-gray-600 rounded-lg p-3 text-white">
          <h4 className="font-semibold text-sm mb-2 flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            Network Legend
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-400 rounded-full"></div>
              <span>Active Ports</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
              <span>Minor Delays</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-red-400 rounded-full"></div>
              <span>Major Disruptions</span>
            </div>
          </div>
        </div>

        {/* Real-time Activity Indicator */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-90 border border-gray-600 rounded-lg px-3 py-2 text-white">
          <div className="flex items-center space-x-2 text-sm">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live Network Monitor</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}