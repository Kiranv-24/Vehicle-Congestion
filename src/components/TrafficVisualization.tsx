import React, { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Rect, Circle, Text, Group } from 'react-konva';
import { database } from '@/lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import { Card } from '@/components/ui/card';

console.log('TrafficVisualization component loaded');

interface TrafficData {
  vehicle_count: number;
  emergency_lane: number[];
  lane_vehicle_counts: { [key: string]: number };
}

const TrafficVisualization: React.FC = () => {
  console.log('TrafficVisualization rendering...');
  
  const [trafficData, setTrafficData] = useState<TrafficData>({
    vehicle_count: 0,
    emergency_lane: [],
    lane_vehicle_counts: { "1": 0, "2": 0, "3": 0, "4": 0 }
  });
  const [isConnected, setIsConnected] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Lane configuration: 1=North, 2=East, 3=South, 4=West
  const laneConfig = {
    "1": { name: "North", color: "#6366f1", direction: "vertical", side: "top" },
    "2": { name: "East", color: "#a855f7", direction: "horizontal", side: "right" },
    "3": { name: "South", color: "#f59e0b", direction: "vertical", side: "bottom" },
    "4": { name: "West", color: "#10b981", direction: "horizontal", side: "left" }
  };

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const size = Math.min(rect.width, rect.height, 600);
        setDimensions({ width: size, height: size });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Firebase real-time connection
  useEffect(() => {
    console.log('Setting up Firebase connection...');
    const trafficRef = ref(database, 'traffic');
    
    const unsubscribe = onValue(trafficRef, (snapshot) => {
      console.log('Firebase data received:', snapshot.val());
      const data = snapshot.val();
      if (data) {
        setTrafficData(data);
        setIsConnected(true);
        console.log('Traffic data updated:', data);
      } else {
        console.log('No data received from Firebase');
        setIsConnected(false);
      }
    }, (error) => {
      console.error('Firebase connection error:', error);
      setIsConnected(false);
    });

    return () => off(trafficRef, 'value', unsubscribe);
  }, []);

  const renderVehicleDots = (laneId: string, count: number, x: number, y: number, direction: string, side: string) => {
    const dots = [];
    const isEmergency = trafficData.emergency_lane.includes(parseInt(laneId));
    const dotRadius = 4;
    const spacing = 12;

    for (let i = 0; i < count; i++) {
      let dotX, dotY;
      const isEmergencyVehicle = isEmergency && i === 0; // First vehicle is emergency

      if (direction === 'vertical') {
        dotX = x;
        dotY = side === 'top' ? y + (i * spacing) : y - (i * spacing);
      } else {
        dotX = side === 'left' ? x + (i * spacing) : x - (i * spacing);
        dotY = y;
      }

      dots.push(
        <Circle
          key={`${laneId}-${i}`}
          x={dotX}
          y={dotY}
          radius={isEmergencyVehicle ? dotRadius + 1 : dotRadius}
          fill={isEmergencyVehicle ? "#ef4444" : laneConfig[laneId as keyof typeof laneConfig].color}
          stroke={isEmergencyVehicle ? "#dc2626" : undefined}
          strokeWidth={isEmergencyVehicle ? 2 : 0}
          shadowColor={isEmergencyVehicle ? "#ef4444" : laneConfig[laneId as keyof typeof laneConfig].color}
          shadowBlur={isEmergencyVehicle ? 8 : 4}
          shadowOpacity={0.6}
        />
      );
    }

    return dots;
  };

  const renderIntersection = () => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const roadWidth = 60;
    const intersectionSize = 80;
    const laneWidth = 25;

    return (
      <Group>
        {/* Road backgrounds */}
        {/* Vertical road */}
        <Rect
          x={centerX - roadWidth / 2}
          y={0}
          width={roadWidth}
          height={dimensions.height}
          fill="#1e293b"
          cornerRadius={4}
        />
        
        {/* Horizontal road */}
        <Rect
          x={0}
          y={centerY - roadWidth / 2}
          width={dimensions.width}
          height={roadWidth}
          fill="#1e293b"
          cornerRadius={4}
        />

        {/* Central intersection */}
        <Rect
          x={centerX - intersectionSize / 2}
          y={centerY - intersectionSize / 2}
          width={intersectionSize}
          height={intersectionSize}
          fill="#334155"
          cornerRadius={8}
        />

        {/* Lane dividers */}
        {/* Vertical lanes */}
        <Rect
          x={centerX - 1}
          y={0}
          width={2}
          height={centerY - intersectionSize / 2}
          fill="#64748b"
        />
        <Rect
          x={centerX - 1}
          y={centerY + intersectionSize / 2}
          width={2}
          height={centerY - intersectionSize / 2}
        />

        {/* Horizontal lanes */}
        <Rect
          x={0}
          y={centerY - 1}
          width={centerX - intersectionSize / 2}
          height={2}
          fill="#64748b"
        />
        <Rect
          x={centerX + intersectionSize / 2}
          y={centerY - 1}
          width={centerX - intersectionSize / 2}
          height={2}
          fill="#64748b"
        />

        {/* Vehicles on lanes */}
        {/* North Lane (1) */}
        {renderVehicleDots("1", trafficData.lane_vehicle_counts["1"] || 0, centerX - laneWidth/2, 80, "vertical", "top")}
        
        {/* East Lane (2) */}
        {renderVehicleDots("2", trafficData.lane_vehicle_counts["2"] || 0, dimensions.width - 80, centerY - laneWidth/2, "horizontal", "right")}
        
        {/* South Lane (3) */}
        {renderVehicleDots("3", trafficData.lane_vehicle_counts["3"] || 0, centerX + laneWidth/2, dimensions.height - 80, "vertical", "bottom")}
        
        {/* West Lane (4) */}
        {renderVehicleDots("4", trafficData.lane_vehicle_counts["4"] || 0, 80, centerY + laneWidth/2, "horizontal", "left")}

        {/* Lane labels */}
        <Text
          x={centerX - 20}
          y={30}
          text="NORTH"
          fontSize={12}
          fill="#6366f1"
          fontStyle="bold"
        />
        <Text
          x={dimensions.width - 60}
          y={centerY - 40}
          text="EAST"
          fontSize={12}
          fill="#a855f7"
          fontStyle="bold"
        />
        <Text
          x={centerX - 20}
          y={dimensions.height - 20}
          text="SOUTH"
          fontSize={12}
          fill="#f59e0b"
          fontStyle="bold"
        />
        <Text
          x={20}
          y={centerY - 40}
          text="WEST"
          fontSize={12}
          fill="#10b981"
          fontStyle="bold"
        />
      </Group>
    );
  };

  console.log('Rendering TrafficVisualization with data:', trafficData);

  return (
    <div className="w-full space-y-6">
      {/* Debug info */}
      <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
        Debug: Component loaded, Firebase connected: {isConnected ? 'Yes' : 'No'}, 
        Vehicle count: {trafficData.vehicle_count}
      </div>
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Smart Traffic Monitor</h1>
        <div className="flex items-center justify-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-primary' : 'bg-destructive'}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connected to Firebase' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main visualization */}
        <div className="lg:col-span-2">
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-semibold mb-4 text-card-foreground">Intersection View</h2>
            <div ref={containerRef} className="w-full flex justify-center">
              <Stage width={dimensions.width} height={dimensions.height}>
                <Layer>
                  {renderIntersection()}
                </Layer>
              </Stage>
            </div>
          </Card>
        </div>

        {/* Stats and Legend */}
        <div className="space-y-6">
          {/* Total Stats */}
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-4 text-card-foreground">Traffic Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Vehicles</span>
                <span className="font-bold text-primary text-xl">{trafficData.vehicle_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Emergency Lanes</span>
                <span className="font-bold text-destructive">
                  {trafficData.emergency_lane.length > 0 ? trafficData.emergency_lane.join(', ') : 'None'}
                </span>
              </div>
            </div>
          </Card>

          {/* Lane Details */}
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-4 text-card-foreground">Lane Details</h3>
            <div className="space-y-3">
              {Object.entries(laneConfig).map(([laneId, config]) => {
                const isEmergency = trafficData.emergency_lane.includes(parseInt(laneId));
                const count = trafficData.lane_vehicle_counts[laneId] || 0;
                
                return (
                  <div key={laneId} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      <span className="font-medium text-card-foreground">
                        {config.name} (Lane {laneId})
                      </span>
                      {isEmergency && (
                        <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded-full">
                          EMERGENCY
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-lg">{count}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Legend */}
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-4 text-card-foreground">Legend</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-muted-foreground">Normal Vehicle</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span className="text-muted-foreground">Emergency Vehicle</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-secondary rounded" />
                <span className="text-muted-foreground">Road Surface</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrafficVisualization;