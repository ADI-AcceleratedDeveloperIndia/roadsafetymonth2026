"use client";

import { useState, useRef, useCallback } from "react";
import DraggableItems from "./DraggableItems";

const BASE_DIMENSIONS = { width: 500, height: 500 };
const TARGET_HITBOX = {
  x: 200,
  y: 200,
  width: 200,
  height: 150,
};
const SPEEDOMETER_SIZE = { width: 120, height: 120 };

export default function OverspeedSimulation() {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<[number, number]>([0, 0]);
  const [speedometerPosition, setSpeedometerPosition] = useState<[number, number] | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCorrectedSpeed, setShowCorrectedSpeed] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((e: React.PointerEvent, itemType: string) => {
    if (isCompleted) return;
    e.preventDefault();
    e.stopPropagation();
    setDraggedItem(itemType);

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (canvasRect) {
      const startX = e.clientX - canvasRect.left;
      const startY = e.clientY - canvasRect.top;

      if (!speedometerPosition) {
        setSpeedometerPosition([startX - SPEEDOMETER_SIZE.width / 2, startY - SPEEDOMETER_SIZE.height / 2]);
        setDragOffset([SPEEDOMETER_SIZE.width / 2, SPEEDOMETER_SIZE.height / 2]);
      } else if (speedometerPosition) {
        setDragOffset([
          e.clientX - canvasRect.left - speedometerPosition[0],
          e.clientY - canvasRect.top - speedometerPosition[1],
        ]);
      }
    }
  }, [isCompleted, speedometerPosition]);

  const handleDrag = useCallback((e: React.PointerEvent) => {
    if (!draggedItem || !canvasRef.current || isCompleted) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset[0];
    const y = e.clientY - rect.top - dragOffset[1];
    setSpeedometerPosition([x, y]);
  }, [draggedItem, dragOffset, isCompleted]);

  const handleDragEnd = useCallback(async () => {
    if (!draggedItem || isCompleted) {
      setDraggedItem(null);
      return;
    }

    if (!speedometerPosition) {
      setDraggedItem(null);
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) {
      setDraggedItem(null);
      return;
    }

    const scaleX = rect.width / BASE_DIMENSIONS.width;
    const scaleY = rect.height / BASE_DIMENSIONS.height;

    const speedometerLeft = speedometerPosition[0];
    const speedometerRight = speedometerPosition[0] + SPEEDOMETER_SIZE.width;
    const speedometerTop = speedometerPosition[1];
    const speedometerBottom = speedometerPosition[1] + SPEEDOMETER_SIZE.height;

    const targetLeft = TARGET_HITBOX.x * scaleX;
    const targetRight = (TARGET_HITBOX.x + TARGET_HITBOX.width) * scaleX;
    const targetTop = TARGET_HITBOX.y * scaleY;
    const targetBottom = (TARGET_HITBOX.y + TARGET_HITBOX.height) * scaleY;

    const overlaps = !(speedometerRight < targetLeft || speedometerLeft > targetRight || speedometerBottom < targetTop || speedometerTop > targetBottom);

    // Only accept speedometer item
    if (overlaps && draggedItem === "speedometer") {
      setShowCorrectedSpeed(true);
      setShowSuccess(true);
      setIsCompleted(true);

      try {
        const response = await fetch("/api/sim/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sceneId: "car_overspeed_prototype",
            success: true,
            attempts: 1,
            seconds: 0,
          }),
        });
        const payload = await response.json();
        if (payload?.referenceId) {
          setReferenceId(payload.referenceId);
        }
      } catch {
        // non-blocking logging failure
      }
    }

    setDraggedItem(null);
  }, [draggedItem, isCompleted, speedometerPosition]);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Instructions */}
      <div className="mb-6 text-center">
        <p className="text-gray-700">
          Drag the speedometer from the sidebar onto the scene to fix the violation.
        </p>
      </div>

      <div ref={containerRef} className="flex flex-col lg:flex-row gap-4 items-stretch">
        <div className="flex-1 order-1 lg:order-none w-full">
          <div
            ref={canvasRef}
            className="relative border-2 border-gray-300 rounded-lg bg-white overflow-hidden h-[360px] sm:h-[420px] lg:h-[500px]"
            style={{ backgroundColor: "#ffffff" }}
            onPointerMove={handleDrag}
            onPointerUp={handleDragEnd}
            onPointerLeave={handleDragEnd}
          >
            <div className="absolute inset-0 bg-white" style={{ zIndex: 0 }} />

            {!showCorrectedSpeed ? (
              <img
                src="/media/simulation%20media/overspeed/overspeed.png"
                alt="Overspeed violation"
                className="absolute inset-0 w-full h-full object-contain"
                style={{ zIndex: 1, backgroundColor: "#ffffff" }}
                draggable={false}
              />
            ) : (
              <img
                src="/media/simulation%20media/overspeed/corrected%20speed.png"
                alt="Corrected speed"
                className="absolute inset-0 w-full h-full object-contain"
                style={{ zIndex: 1, backgroundColor: "#ffffff" }}
                draggable={false}
              />
            )}

            {/* Draggable Speedometer - When being dragged */}
            {speedometerPosition && !isCompleted && draggedItem && (
              <div
                className="absolute cursor-move touch-none select-none"
                style={{
                  left: `${speedometerPosition[0]}px`,
                  top: `${speedometerPosition[1]}px`,
                  width: `${SPEEDOMETER_SIZE.width}px`,
                  height: `${SPEEDOMETER_SIZE.height}px`,
                  zIndex: 50,
                  opacity: 1,
                  transform: "scale(1.1)",
                  transition: "none",
                  pointerEvents: "none",
                }}
              >
                <img
                  src={
                    draggedItem === "speedometer"
                      ? "/media/simulation%20media/overspeed/drag%20speedometer.png"
                      : draggedItem === "helmet"
                      ? "/media/simulation%20media/helmet%20wearing/helmet.png"
                      : draggedItem === "discipline"
                      ? "/media/simulation%20media/triple%20riding/discipline.png"
                      : "/media/simulation%20media/drunkndrive/soberman.png"
                  }
                  alt={draggedItem}
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - All Draggable Items */}
        <DraggableItems onDragStart={handleDragStart} isCompleted={isCompleted} correctItemType="speedometer" />
      </div>

      {showSuccess && (
        <div className="mt-6 p-4 bg-green-100 border-2 border-green-400 text-green-800 rounded-lg text-center space-y-2 animate-fade-in">
          <p className="text-lg font-bold">✅ Speed Kills! Always maintain safe speed limits.</p>
          {referenceId && (
            <p className="text-sm text-green-900">
              Reference ID: <span className="font-semibold">{referenceId}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}



