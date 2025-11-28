"use client"

import { useMemo, useState, useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePaymentStore } from "@/lib/store"
import type { Payment } from "@/lib/payment-utils"
import { formatCurrency } from "@/lib/payment-utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

type PaymentWithStatus = Payment & {
  status: "paid" | "pending" | "overdue"
  clientName: string
  clientId: string
}

// Color palette for clients - distinct colors for better differentiation
const clientColors = [
  "hsl(217, 91%, 60%)", // Blue
  "hsl(142, 76%, 36%)", // Green
  "hsl(38, 92%, 50%)",  // Orange
  "hsl(340, 82%, 52%)", // Pink
  "hsl(262, 83%, 58%)", // Purple
  "hsl(0, 84%, 60%)",   // Red
  "hsl(199, 89%, 48%)", // Cyan
  "hsl(280, 100%, 70%)", // Light Purple
  "hsl(47, 96%, 53%)",  // Yellow
  "hsl(158, 64%, 52%)", // Teal
]

export default function TimelinePage() {
  const { clients } = usePaymentStore()
  const [mounted, setMounted] = useState(false)

  // Ensure we only render date-dependent content on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Flatten all payments from all clients into a single array
  const allPayments = useMemo(() => {
    if (!mounted) return []

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const payments: PaymentWithStatus[] = []
    
    clients.forEach((client) => {
      client.payments.forEach((payment) => {
        let status: "paid" | "pending" | "overdue"
        if (payment.paidDate) {
          status = "paid"
        } else {
          const dueDate = new Date(payment.dueDate)
          dueDate.setHours(0, 0, 0, 0)
          status = dueDate < today ? "overdue" : "pending"
        }
        payments.push({
          ...payment,
          status,
          clientName: client.name,
          clientId: client.id,
        })
      })
    })

    // Sort by due date
    return payments.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
  }, [clients, mounted])

  // Create client color mapping
  const clientColorMap = useMemo(() => {
    const map = new Map<string, string>()
    clients.forEach((client, index) => {
      map.set(client.id, clientColors[index % clientColors.length])
    })
    return map
  }, [clients])

  // Calculate date range - always 6 months from today
  const dateRange = useMemo(() => {
    if (!mounted) {
      // Return a stable default for SSR
      const defaultStart = new Date()
      defaultStart.setMonth(defaultStart.getMonth() - 1)
      defaultStart.setDate(1)
      const defaultEnd = new Date()
      defaultEnd.setMonth(defaultEnd.getMonth() + 5)
      defaultEnd.setMonth(defaultEnd.getMonth() + 1)
      defaultEnd.setDate(0)
      return { start: defaultStart, end: defaultEnd }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Start 1 month back, end 5 months forward (6 months total)
    const start = new Date(today)
    start.setMonth(start.getMonth() - 1)
    start.setDate(1) // First day of the month
    
    const end = new Date(today)
    end.setMonth(end.getMonth() + 5)
    // Last day of the month
    end.setMonth(end.getMonth() + 1)
    end.setDate(0)

    return { start, end }
  }, [mounted])

  // Calculate timeline dimensions and date-to-pixel conversion
  const timelineConfig = useMemo(() => {
    const diffTime = dateRange.end.getTime() - dateRange.start.getTime()
    const daysInRange = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    // Calculate pixels per day to fill available width
    // Use 8px per day for better visibility and to fill width
    const pixelsPerDay = 8
    const timelineWidth = daysInRange * pixelsPerDay

    // Convert date to pixel position
    const dateToPixel = (date: Date): number => {
      const diffTime = date.getTime() - dateRange.start.getTime()
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return days * pixelsPerDay
    }

    // Generate month markers
    const monthMarkers: { date: Date; label: string; position: number }[] = []
    const current = new Date(dateRange.start)
    
    while (current <= dateRange.end) {
      const position = dateToPixel(current)
      monthMarkers.push({
        date: new Date(current),
        label: current.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        position,
      })
      current.setMonth(current.getMonth() + 1)
      current.setDate(1)
    }

    // Generate quarter markers - divide each month into 4 equal parts
    // Each month gets 3 markers at 25%, 50%, 75% (skipping 0% and 100% to avoid month boundaries)
    const weekMarkers: { date: Date; position: number }[] = []
    const currentMonth = new Date(dateRange.start)
    
    while (currentMonth <= dateRange.end) {
      // Get the first day of the current month
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0) // Last day of month
      
      // Calculate the number of days in the month
      const daysInMonth = monthEnd.getDate()
      
      // Calculate quarter positions as fractions of the month
      // We'll position markers at 25%, 50%, 75% through the month
      const quarterPositions = [0.25, 0.5, 0.75]
      
      quarterPositions.forEach((fraction) => {
        // Calculate the day offset (round to nearest day)
        const dayOffset = Math.round(daysInMonth * fraction)
        
        // Skip if it would be day 1 or the last day (month boundaries)
        if (dayOffset > 0 && dayOffset < daysInMonth) {
          const quarterDate = new Date(monthStart)
          quarterDate.setDate(quarterDate.getDate() + dayOffset)
          
          // Only add if within date range
          if (quarterDate >= dateRange.start && quarterDate <= dateRange.end) {
            weekMarkers.push({
              date: new Date(quarterDate),
              position: dateToPixel(quarterDate),
            })
          }
        }
      })
      
      // Move to next month
      currentMonth.setMonth(currentMonth.getMonth() + 1)
      currentMonth.setDate(1)
    }

    const todayPosition = dateToPixel(new Date())

    return {
      timelineWidth,
      dateToPixel,
      monthMarkers,
      weekMarkers,
      todayPosition,
      pixelsPerDay,
    }
  }, [dateRange])

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] -m-4 overflow-hidden w-[calc(100%+2rem)]">
      {/* Fixed Header */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-border shrink-0">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-xl font-bold">Payment Timeline</h1>
      </div>

      {/* Scrollable Gantt Area */}
      <div className="flex-1 overflow-auto w-full">
        <div className="relative w-full h-full">
          {/* Timeline Header - Fixed when scrolling vertically */}
          <div className="sticky top-0 z-20 bg-background border-b border-border">
            <div className="relative" style={{ width: `${timelineConfig.timelineWidth}px`, minWidth: "100%" }}>
              {/* Month markers */}
              <div className="relative h-8 border-b border-border">
                {timelineConfig.monthMarkers.map((marker, idx) => (
                  <div
                    key={idx}
                    className="absolute top-0 h-full border-l border-border/50 flex items-center px-2 text-xs text-muted-foreground"
                    style={{ left: `${marker.position}px` }}
                  >
                    {marker.label}
                  </div>
                ))}
              </div>
              {/* Week markers */}
              <div className="relative h-6 border-b border-border">
                {timelineConfig.weekMarkers.map((marker, idx) => (
                  <div
                    key={idx}
                    className="absolute top-0 h-full border-l border-border/30"
                    style={{ left: `${marker.position}px` }}
                  />
                ))}
                {/* Month markers (thicker lines) */}
                {timelineConfig.monthMarkers.map((marker, idx) => (
                  <div
                    key={`header-month-${idx}`}
                    className="absolute top-0 h-full border-l border-border/50"
                    style={{ left: `${marker.position}px` }}
                  />
                ))}
                {/* Today indicator */}
                {timelineConfig.todayPosition >= 0 && timelineConfig.todayPosition <= timelineConfig.timelineWidth && (
                  <div
                    className="absolute top-0 h-full w-0.5 bg-primary z-10"
                    style={{ left: `${timelineConfig.todayPosition}px` }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Single Unified Timeline - All Payments */}
          <div 
            className="relative"
            style={{ 
              width: `${timelineConfig.timelineWidth}px`,
              minWidth: "100%",
              minHeight: "calc(100vh - 150px)",
            }}
          >
            {/* Full-height month separator lines */}
            {timelineConfig.monthMarkers.map((marker, idx) => (
              <div
                key={`month-line-${idx}`}
                className="absolute top-0 left-0 right-0 border-l border-border/50 pointer-events-none"
                style={{ 
                  left: `${marker.position}px`,
                  height: "100%",
                }}
              />
            ))}
            
            {/* Full-height week separator lines */}
            {timelineConfig.weekMarkers.map((marker, idx) => (
              <div
                key={`week-line-${idx}`}
                className="absolute top-0 left-0 right-0 border-l border-border/30 pointer-events-none"
                style={{ 
                  left: `${marker.position}px`,
                  height: "100%",
                }}
              />
            ))}
            
            {/* Render all payments on the timeline */}
            {allPayments.map((payment, index) => {
                const position = timelineConfig.dateToPixel(payment.dueDate)
                const barHeight = 24
                
                // Find the next payment from the same client
                const nextPayment = allPayments.find(
                  (p) => 
                    p.clientId === payment.clientId && 
                    p.id !== payment.id &&
                    p.dueDate > payment.dueDate
                )
                
                // Calculate bar width based on time until next payment
                let barWidth: number
                if (nextPayment) {
                  // Extend to the next payment's due date
                  const nextPosition = timelineConfig.dateToPixel(nextPayment.dueDate)
                  barWidth = Math.max(60, nextPosition - position) // Minimum 60px width
                } else {
                  // Last payment for this client - extend 30 days forward or to end of timeline
                  const daysToExtend = 30
                  const extendedWidth = daysToExtend * timelineConfig.pixelsPerDay
                  const maxWidth = timelineConfig.timelineWidth - position
                  barWidth = Math.max(60, Math.min(extendedWidth, maxWidth))
                }
                
                // Stagger payments vertically to fill the height
                // Distribute payments across multiple rows to fill available space
                const totalPayments = allPayments.length
                const maxRows = Math.max(20, Math.ceil(totalPayments / 2)) // At least 20 rows
                const verticalSpacing = 50 // Fixed spacing that fills height well
                const baseTop = 20
                const rowIndex = index % maxRows
                const topOffset = baseTop + rowIndex * verticalSpacing

                // Get client color
                const clientColor = clientColorMap.get(payment.clientId) || clientColors[0]
                
                // Better coloring based on status with improved contrast
                let bgOpacity = 0.7
                let borderOpacity = 1
                let borderWidth = "1.5px"
                let textColor = "text-foreground"
                
                if (payment.status === "paid") {
                  bgOpacity = 0.5
                  borderOpacity = 0.7
                  borderWidth = "1px"
                } else if (payment.status === "overdue") {
                  bgOpacity = 0.85
                  borderOpacity = 1
                  borderWidth = "2px"
                  textColor = "text-foreground"
                }

                return (
                  <Tooltip key={payment.id}>
                    <TooltipTrigger asChild>
                      <div
                        className="absolute rounded-md px-2 flex items-center justify-center text-xs cursor-pointer transition-opacity border shadow-sm"
                        style={{
                          left: `${position}px`,
                          top: `${topOffset}px`,
                          width: `${barWidth}px`,
                          height: `${barHeight}px`,
                          backgroundColor: `color-mix(in srgb, ${clientColor} ${bgOpacity * 100}%, transparent)`,
                          borderColor: `color-mix(in srgb, ${clientColor} ${borderOpacity * 100}%, transparent)`,
                          borderWidth: borderWidth,
                        }}
                      >
                        <span className={`truncate text-[11px] font-semibold ${textColor}`}>
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="bottom" 
                      hideArrow
                      className="w-80 bg-zinc-900 text-foreground border border-zinc-700 shadow-lg"
                    >
                      <div className="space-y-2.5 py-1.5">
                        <div className="font-semibold text-base text-white">{payment.clientName}</div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-400">Amount:</span>
                            <span className="font-medium text-white">{formatCurrency(payment.amount)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-400">Due:</span>
                            <span className="text-white">{payment.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-400">Status:</span>
                            <Badge 
                              variant={
                                payment.status === "paid" ? "default" :
                                payment.status === "pending" ? "secondary" : "destructive"
                              }
                              className="text-xs"
                            >
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <div className="pt-1.5 border-t border-zinc-700">
                          <div className="text-xs text-zinc-400">
                            {payment.type === "retainer" ? "Retainer" : `Installment #${payment.installmentNumber}`}
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </div>
      </div>
    </div>
  )
}
