interface DateRange {
  start: Date;
  end: Date;
}

export interface MonthMarker {
  date: Date;
  label: string;
  position: number;
}
export interface WeekMarker {
  date: Date;
  position: number;
}

export interface TimelineConfig {
  timelineWidth: number;
  dateToPixel: (date: Date) => number;
  monthMarkers: MonthMarker[];
  weekMarkers: WeekMarker[];
  todayPosition: number;
  pixelsPerDay: number;
}

export function calculateTimelineConfig(dateRange: DateRange): TimelineConfig {
  const diffTime = dateRange.end.getTime() - dateRange.start.getTime();
  const daysInRange = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Calculate pixels per day to fill available width
  // Use 8px per day for better visibility and to fill width
  const pixelsPerDay = 8;
  const timelineWidth = daysInRange * pixelsPerDay;

  // Convert date to pixel position
  const dateToPixel = (date: Date): number => {
    const diffTime = date.getTime() - dateRange.start.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days * pixelsPerDay;
  };

  // Generate month markers
  const monthMarkers: MonthMarker[] = [];
  const current = new Date(dateRange.start);

  while (current <= dateRange.end) {
    const position = dateToPixel(current);
    monthMarkers.push({
      date: new Date(current),
      label: current.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      position,
    });
    current.setMonth(current.getMonth() + 1);
    current.setDate(1);
  }

  // Generate quarter markers - divide each month into 4 equal parts
  // Each month gets 3 markers at 25%, 50%, 75% (skipping 0% and 100% to avoid month boundaries)
  const weekMarkers: WeekMarker[] = [];
  const currentMonth = new Date(dateRange.start);

  while (currentMonth <= dateRange.end) {
    // Get the first day of the current month
    const monthStart = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const monthEnd = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ); // Last day of month

    // Calculate the number of days in the month
    const daysInMonth = monthEnd.getDate();

    // Calculate quarter positions as fractions of the month
    // We'll position markers at 25%, 50%, 75% through the month
    const quarterPositions = [0.25, 0.5, 0.75];

    quarterPositions.forEach((fraction) => {
      // Calculate the day offset (round to nearest day)
      const dayOffset = Math.round(daysInMonth * fraction);

      // Skip if it would be day 1 or the last day (month boundaries)
      if (dayOffset > 0 && dayOffset < daysInMonth) {
        const quarterDate = new Date(monthStart);
        quarterDate.setDate(quarterDate.getDate() + dayOffset);

        // Only add if within date range
        if (quarterDate >= dateRange.start && quarterDate <= dateRange.end) {
          weekMarkers.push({
            date: new Date(quarterDate),
            position: dateToPixel(quarterDate),
          });
        }
      }
    });

    // Move to next month
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    currentMonth.setDate(1);
  }

  const todayPosition = dateToPixel(new Date());

  return {
    timelineWidth,
    dateToPixel,
    monthMarkers,
    weekMarkers,
    todayPosition,
    pixelsPerDay,
  };
}
