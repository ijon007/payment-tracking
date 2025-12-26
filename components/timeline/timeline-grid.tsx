"use client";

import type { TimelineConfig } from "./timeline-config";

interface TimelineGridProps {
  config: TimelineConfig;
}

export function TimelineGrid({ config }: TimelineGridProps) {
  return (
    <>
      {/* Full-height month separator lines */}
      {config.monthMarkers.map((marker, idx) => (
        <div
          className="pointer-events-none absolute top-0 right-0 left-0 border-border/50 border-l"
          key={`month-line-${idx}`}
          style={{
            left: `${marker.position}px`,
            height: "100%",
          }}
        />
      ))}

      {/* Full-height week separator lines */}
      {config.weekMarkers.map((marker, idx) => (
        <div
          className="pointer-events-none absolute top-0 right-0 left-0 border-border/30 border-l"
          key={`week-line-${idx}`}
          style={{
            left: `${marker.position}px`,
            height: "100%",
          }}
        />
      ))}
    </>
  );
}
