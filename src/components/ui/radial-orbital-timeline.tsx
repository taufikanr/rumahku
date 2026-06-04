"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Link as LinkIcon, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
}

export default function RadialOrbitalTimeline({
  timelineData,
}: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [centerOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const [radius, setRadius] = useState<number>(160);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
    }
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        if (parseInt(key) !== id) {
          newState[parseInt(key)] = false;
        }
      });

      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);

        const relatedItems = getRelatedItems(id);
        const newPulseEffect: Record<number, boolean> = {};
        relatedItems.forEach((relId) => {
          newPulseEffect[relId] = true;
        });
        setPulseEffect(newPulseEffect);

        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setPulseEffect({});
      }

      return newState;
    });
  };

  // Responsive orbit radius (keeps nodes on-screen on mobile)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const r = Math.max(96, Math.min(200, Math.min(w, h) / 2 - 80));
      setRadius(r);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const centerViewOnNode = (nodeId: number) => {
    if (!nodeRefs.current[nodeId]) return;
    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;
    setRotationAngle(270 - targetAngle);
  };

  // Round to fixed precision so SSR (Node) and client (browser) produce
  // identical strings — Math.cos/sin aren't bit-identical across JS engines,
  // which would otherwise cause a hydration mismatch.
  const round = (n: number, p = 2) => Number(n.toFixed(p));

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radian = (angle * Math.PI) / 180;

    const x = round(radius * Math.cos(radian) + centerOffset.x);
    const y = round(radius * Math.sin(radian) + centerOffset.y);

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = round(
      Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2))),
      3,
    );

    return { x, y, angle, zIndex, opacity };
  };

  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    const relatedItems = getRelatedItems(activeNodeId);
    return relatedItems.includes(itemId);
  };

  const getStatusStyles = (status: TimelineItem["status"]): string => {
    switch (status) {
      case "completed":
        return "text-white bg-emerald-600 border-emerald-400/60";
      case "in-progress":
        return "text-black bg-white border-black/20";
      case "pending":
        return "text-white bg-white/15 border-white/40";
      default:
        return "text-white bg-white/15 border-white/40";
    }
  };

  const getMoscowLabel = (status: TimelineItem["status"]): string => {
    switch (status) {
      case "completed":
        return "MUST-HAVE";
      case "in-progress":
        return "SHOULD-HAVE";
      default:
        return "COULD-HAVE";
    }
  };

  const ringSize = radius * 2;

  return (
    <div
      className="relative flex h-[34rem] w-full items-center justify-center overflow-hidden sm:h-[40rem]"
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className="relative flex h-full w-full max-w-4xl items-center justify-center">
        <div
          className="absolute flex h-full w-full items-center justify-center"
          ref={orbitRef}
          style={{
            perspective: "1000px",
            transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
          }}
        >
          {/* Center hub */}
          <div className="absolute z-10 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 animate-pulse">
            <div className="absolute size-20 animate-ping rounded-full border border-white/20 opacity-70"></div>
            <div
              className="absolute size-24 animate-ping rounded-full border border-white/10 opacity-50"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div className="size-8 rounded-full bg-white/85 backdrop-blur-md"></div>
          </div>

          {/* Orbit ring */}
          <div
            className="absolute rounded-full border border-white/10"
            style={{ width: `${ringSize}px`, height: `${ringSize}px` }}
          ></div>

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon;

            const nodeStyle = {
              transform: `translate(${position.x}px, ${position.y}px)`,
              zIndex: isExpanded ? 200 : position.zIndex,
              opacity: isExpanded ? 1 : position.opacity,
            };

            return (
              <div
                key={item.id}
                ref={(el) => {
                  nodeRefs.current[item.id] = el;
                }}
                className="absolute cursor-pointer transition-all duration-700"
                style={nodeStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                <div
                  className={`absolute rounded-full -inset-1 ${
                    isPulsing ? "animate-pulse duration-1000" : ""
                  }`}
                  style={{
                    background: `radial-gradient(circle, rgba(59,130,246,0.25) 0%, rgba(59,130,246,0) 70%)`,
                    width: `${item.energy * 0.5 + 40}px`,
                    height: `${item.energy * 0.5 + 40}px`,
                    left: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                    top: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                  }}
                ></div>

                <div
                  className={`flex size-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isExpanded
                      ? "scale-150 border-white bg-white text-blue-700 shadow-lg shadow-blue-400/30"
                      : isRelated
                        ? "animate-pulse border-white bg-white/60 text-blue-800"
                        : "border-white/40 bg-neutral-900 text-white"
                  }`}
                >
                  <Icon size={16} />
                </div>

                <div
                  className={`absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold tracking-wide transition-all duration-300 ${
                    isExpanded ? "scale-110 text-white" : "text-white/70"
                  }`}
                >
                  {item.title}
                </div>

                {isExpanded && (
                  <Card className="absolute top-20 left-1/2 w-64 -translate-x-1/2 overflow-visible border-white/20 bg-neutral-900/95 text-white shadow-xl shadow-blue-500/10 backdrop-blur-lg ring-0">
                    <div className="absolute -top-3 left-1/2 h-3 w-px -translate-x-1/2 bg-white/40"></div>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          className={`border px-2 text-[10px] ${getStatusStyles(item.status)}`}
                        >
                          {getMoscowLabel(item.status)}
                        </Badge>
                        <span className="font-mono text-[10px] text-white/50">
                          {item.date}
                        </span>
                      </div>
                      <CardTitle className="mt-2 text-sm text-white">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-white/80">
                      <p>{item.content}</p>

                      <div className="mt-4 border-t border-white/10 pt-3">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="flex items-center text-white/70">
                            <Zap size={10} className="mr-1" />
                            Renter demand
                          </span>
                          <span className="font-mono">{item.energy}%</span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-600"
                            style={{ width: `${item.energy}%` }}
                          ></div>
                        </div>
                      </div>

                      {item.relatedIds.length > 0 && (
                        <div className="mt-4 border-t border-white/10 pt-3">
                          <div className="mb-2 flex items-center">
                            <LinkIcon size={10} className="mr-1 text-white/70" />
                            <h4 className="text-[10px] font-medium tracking-wider text-white/70 uppercase">
                              Related features
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.relatedIds.map((relatedId) => {
                              const relatedItem = timelineData.find(
                                (i) => i.id === relatedId,
                              );
                              return (
                                <Button
                                  key={relatedId}
                                  variant="outline"
                                  size="xs"
                                  className="h-6 border-white/20 bg-transparent px-2 py-0 text-xs text-white/80 hover:bg-white/10 hover:text-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(relatedId);
                                  }}
                                >
                                  {relatedItem?.title}
                                  <ArrowRight size={8} className="ml-1 text-white/60" />
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
