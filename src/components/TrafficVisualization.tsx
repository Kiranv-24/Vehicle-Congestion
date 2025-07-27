import React, { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, off } from "firebase/database";
import { Card } from "@/components/ui/card";

interface TrafficData {
  vehicle_count: number;
  emergency_lane: number[];
  lane_vehicle_counts: { [key: string]: number };
}

const TrafficVisualization: React.FC = () => {
  const [trafficData, setTrafficData] = useState<TrafficData>({
    vehicle_count: 0,
    emergency_lane: [],
    lane_vehicle_counts: { "1": 0, "2": 0, "3": 0, "4": 0 },
  });
  const [isConnected, setIsConnected] = useState(false);

  // Lane configuration: 1=North, 2=East, 3=South, 4=West
  const laneConfig = {
    "1": {
      name: "",
      color: "#6366f1",
      direction: "vertical",
      side: "top",
    },
    "2": {
      name: "",
      color: "#a855f7",
      direction: "horizontal",
      side: "right",
    },
    "3": {
      name: "",
      color: "#f59e0b",
      direction: "vertical",
      side: "bottom",
    },
    "4": {
      name: "",
      color: "#10b981",
      direction: "horizontal",
      side: "left",
    },
  };

  useEffect(() => {
    const trafficRef = ref(database, "traffic");
    const unsubscribe = onValue(
      trafficRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setTrafficData(data);
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      },
      () => setIsConnected(false)
    );
    return () => off(trafficRef, "value", unsubscribe);
  }, []);

  const renderVehicleDots = (
    laneId: string,
    count: number,
    x: number,
    y: number,
    direction: string,
    side: string
  ) => {
    const dots = [];
    const isEmergency =
      trafficData.emergency_lane?.includes(parseInt(laneId)) || false;
    const dotRadius = 3;
    const spacing = 10;
    for (let i = 0; i < count; i++) {
      let dotX, dotY;
      const isEmergencyVehicle = isEmergency && i === 0; // First vehicle in an emergency lane
      if (direction === "vertical") {
        dotX = x;
        dotY = side === "top" ? y + i * spacing : y - i * spacing;
      } else {
        dotX = side === "left" ? x + i * spacing : x - i * spacing;
        dotY = y;
      }
      dots.push(
        <circle
          key={`${laneId}-${i}`}
          cx={dotX}
          cy={dotY}
          r={isEmergencyVehicle ? dotRadius + 1 : dotRadius}
          fill={
            isEmergencyVehicle
              ? "#ef4444"
              : laneConfig[laneId as keyof typeof laneConfig].color
          }
          stroke={isEmergencyVehicle ? "#dc2626" : "none"}
          strokeWidth={isEmergencyVehicle ? 2 : 0}
          className={isEmergencyVehicle ? "animate-pulse" : ""}
          style={{
            filter: isEmergencyVehicle
              ? "drop-shadow(0 0 8px #ef4444)"
              : `drop-shadow(0 0 4px ${
                  laneConfig[laneId as keyof typeof laneConfig].color
                })`,
          }}
        />
      );
    }
    return dots;
  };

  const renderIntersection = () => {
    const width = 380;
    const height = 380;
    const centerX = width / 2;
    const centerY = height / 2;
    const roadWidth = 38;
    const intersectionSize = 50;
    const laneWidth = 16;
    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="auto"
        className="border border-zinc-700 rounded-lg bg-black max-w-full h-auto"
      >
        {/* Road backgrounds */}
        <rect
          x={centerX - roadWidth / 2}
          y={0}
          width={roadWidth}
          height={height}
          fill="#1e293b"
          rx={3}
        />
        <rect
          x={0}
          y={centerY - roadWidth / 2}
          width={width}
          height={roadWidth}
          fill="#1e293b"
          rx={3}
        />
        {/* Central intersection */}
        <rect
          x={centerX - intersectionSize / 2}
          y={centerY - intersectionSize / 2}
          width={intersectionSize}
          height={intersectionSize}
          fill="#222"
          rx={7}
        />
        {/* Lane dividers */}
        <rect
          x={centerX - 1}
          y={0}
          width={2}
          height={centerY - intersectionSize / 2}
          fill="#64748b"
        />
        <rect
          x={centerX - 1}
          y={centerY + intersectionSize / 2}
          width={2}
          height={centerY - intersectionSize / 2}
          fill="#64748b"
        />
        <rect
          x={0}
          y={centerY - 1}
          width={centerX - intersectionSize / 2}
          height={2}
          fill="#64748b"
        />
        <rect
          x={centerX + intersectionSize / 2}
          y={centerY - 1}
          width={centerX - intersectionSize / 2}
          height={2}
          fill="#64748b"
        />
        {/* Vehicles on lanes */}
        {renderVehicleDots(
          "1",
          trafficData.lane_vehicle_counts["1"] || 0,
          centerX - laneWidth / 2,
          55,
          "vertical",
          "top"
        )}
        {renderVehicleDots(
          "2",
          trafficData.lane_vehicle_counts["2"] || 0,
          width - 55,
          centerY - laneWidth / 2,
          "horizontal",
          "right"
        )}
        {renderVehicleDots(
          "3",
          trafficData.lane_vehicle_counts["3"] || 0,
          centerX + laneWidth / 2,
          height - 55,
          "vertical",
          "bottom"
        )}
        {renderVehicleDots(
          "4",
          trafficData.lane_vehicle_counts["4"] || 0,
          55,
          centerY + laneWidth / 2,
          "horizontal",
          "left"
        )}
        {/* Lane labels */}
        <text
          x={centerX - 60}
          y={28}
          fontSize="11"
          fill="#6366f1"
          fontWeight="bold"
        >
          Road-1
        </text>
        <text
          x={width - 45}
          y={centerY - 20}
          fontSize="11"
          fill="#a855f7"
          fontWeight="bold"
        >
          Road-2
        </text>
        <text
          x={centerX - -23}
          y={height - 10}
          fontSize="11"
          fill="#f59e0b"
          fontWeight="bold"
        >
          Road-3
        </text>
        <text
          x={15}
          y={centerY - -29}
          fontSize="11"
          fill="#10b981"
          fontWeight="bold"
        >
          Road-4
        </text>
      </svg>
    );
  };

  return (
    <div className="w-full min-h-screen bg-black text-white">
      <div className="w-full space-y-4 md:space-y-6 px-2 md:px-0">
        {/* Debug Info (optional, remove for prod) */}
        <div className="text-xs md:text-sm text-gray-400 p-2 bg-black rounded">
          Debug: Component loaded, Firebase connected:{" "}
          {isConnected ? "Yes" : "No"}, Vehicle count:{" "}
          {trafficData.vehicle_count}
        </div>
        {/* Header */}
        <div className="text-center space-y-1 md:space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Smart Traffic Monitor
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-400" : "bg-red-600"
              }`}
            />
            <span className="text-xs md:text-sm text-gray-400">
              {isConnected ? "Connected to Firebase" : "Disconnected"}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
          {/* Main visualization */}
          <div className="lg:col-span-2">
            <Card className="p-4 md:p-6 bg-black border-zinc-700 text-white">
              <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-white">
                Intersection View
              </h2>
              <div className="w-full flex justify-center overflow-x-auto">
                {renderIntersection()}
              </div>
            </Card>
          </div>
          {/* Stats & Legend */}
          <div className="space-y-3 md:space-y-6">
            <Card className="p-4 md:p-6 bg-black border-zinc-700 text-white">
              <h3 className="text-base md:text-lg font-semibold mb-3 text-white">
                Traffic Summary
              </h3>
              <div className="space-y-2 md:space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Vehicles</span>
                  <span className="font-bold text-green-400 text-lg md:text-xl">
                    {trafficData.vehicle_count}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Emergency Lanes</span>
                  <span className="font-bold text-red-400">
                    {trafficData.emergency_lane?.length > 0
                      ? trafficData.emergency_lane.join(", ")
                      : "None"}
                  </span>
                </div>
              </div>
            </Card>
            <Card className="p-4 md:p-6 bg-black border-zinc-700 text-white">
              <h3 className="text-base md:text-lg font-semibold mb-3 text-white">
                Lane Details
              </h3>
              <div className="space-y-2 md:space-y-3">
                {Object.entries(laneConfig).map(([laneId, config]) => {
                  const isEmergency =
                    trafficData.emergency_lane?.includes(parseInt(laneId)) ||
                    false;
                  const count = trafficData.lane_vehicle_counts[laneId] || 0;
                  return (
                    <div
                      key={laneId}
                      className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-zinc-900/60"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                        <span className="font-medium text-white">
                          {config.name} Road-{laneId}
                        </span>
                        {isEmergency && (
                          <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full animate-pulse">
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
            <Card className="p-4 md:p-6 bg-black border-zinc-700 text-white">
              <h3 className="text-base md:text-lg font-semibold mb-3 text-white">
                Legend
              </h3>
              <div className="space-y-1 md:space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-gray-400">Normal Vehicle</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-gray-400">Emergency Vehicle</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-zinc-700 rounded" />
                  <span className="text-gray-400">Road Surface</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficVisualization;
