import type { TimelineConfig } from "./timeline-config";

interface TimelineHeaderProps {
  config: TimelineConfig;
}

export function TimelineHeader({ config }: TimelineHeaderProps) {
  return (
    <div className="sticky top-0 z-20 border-border border-b bg-background">
      <div
        className="relative"
        style={{ width: `${config.timelineWidth}px`, minWidth: "100%" }}
      >
        {/* Month markers */}
        <div className="relative h-8 border-border border-b">
          {config.monthMarkers.map((marker, idx) => (
            <div
              className="absolute top-0 flex h-full items-center border-border/50 border-l px-2 text-muted-foreground text-xs"
              key={idx}
              style={{ left: `${marker.position}px` }}
            >
              {marker.label}
            </div>
          ))}
        </div>
        {/* Week markers */}
        <div className="relative h-6 border-border border-b">
          {config.weekMarkers.map((marker, idx) => (
            <div
              className="absolute top-0 h-full border-border/30 border-l"
              key={idx}
              style={{ left: `${marker.position}px` }}
            />
          ))}
          {/* Month markers (thicker lines) */}
          {config.monthMarkers.map((marker, idx) => (
            <div
              className="absolute top-0 h-full border-border/50 border-l"
              key={`header-month-${idx}`}
              style={{ left: `${marker.position}px` }}
            />
          ))}
          {/* Today indicator */}
          {config.todayPosition >= 0 &&
            config.todayPosition <= config.timelineWidth && (
              <div
                className="absolute top-0 z-10 h-full w-px bg-primary"
                style={{ left: `${config.todayPosition}px` }}
              >
                <div className="absolute -top-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-primary" />
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
