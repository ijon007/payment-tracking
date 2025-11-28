"use client"

import { useState, useMemo, useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { MonthCalendar, type CalendarEvent } from "@/components/month-calendar"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { usePaymentStore } from "@/lib/store"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"

export default function CalendarPage() {
  const { clients, contracts, getClient } = usePaymentStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Get current month and year
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Collect all events
  const events = useMemo(() => {
    if (!mounted) return []

    const allEvents: CalendarEvent[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Payment due dates (only unpaid)
    clients.forEach((client) => {
      client.payments.forEach((payment) => {
        if (!payment.paidDate) {
          const dueDate = new Date(payment.dueDate)
          dueDate.setHours(0, 0, 0, 0)
          
          allEvents.push({
            id: payment.id,
            type: "payment",
            date: dueDate,
            clientName: client.name,
            clientId: client.id,
            amount: payment.amount,
            paymentId: payment.id,
          })
        }
      })
    })

    // Contract start dates
    contracts.forEach((contract) => {
      const client = getClient(contract.clientId)
      if (client) {
        const startDate = new Date(contract.startDate)
        startDate.setHours(0, 0, 0, 0)
        
        allEvents.push({
          id: `contract-start-${contract.id}`,
          type: "contract-start",
          date: startDate,
          clientName: client.name,
          clientId: contract.clientId,
          contractNumber: contract.contractNumber,
          contractId: contract.id,
        })
      }
    })

    // Contract expiration dates
    contracts.forEach((contract) => {
      const client = getClient(contract.clientId)
      if (client) {
        const endDate = new Date(contract.endDate)
        endDate.setHours(0, 0, 0, 0)
        
        allEvents.push({
          id: `contract-expiration-${contract.id}`,
          type: "contract-expiration",
          date: endDate,
          clientName: client.name,
          clientId: contract.clientId,
          contractNumber: contract.contractNumber,
          contractId: contract.id,
        })
      }
    })

    // Project completion dates
    contracts.forEach((contract) => {
      if (contract.projectCompletionDate) {
        const client = getClient(contract.clientId)
        if (client) {
          const completionDate = new Date(contract.projectCompletionDate)
          completionDate.setHours(0, 0, 0, 0)
          
          allEvents.push({
            id: `project-completion-${contract.id}`,
            type: "project-completion",
            date: completionDate,
            clientName: client.name,
            clientId: contract.clientId,
            contractNumber: contract.contractNumber,
            contractId: contract.id,
          })
        }
      }
    })

    return allEvents
  }, [clients, contracts, getClient, mounted])

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() - 1)
      return newDate
    })
  }

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + 1)
      return newDate
    })
  }

  // Navigate to selected date
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date)
    }
  }

  return (
    <div className="flex flex-col h-full -m-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-xl font-bold">Calendar</h1>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[200px] justify-start">
                <CalendarIcon className="mr-2 size-4" />
                {format(currentDate, "MMMM yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="center" className="w-auto p-0">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={setCurrentDate}
                initialFocus
                className="[--cell-size:2rem]"
                required
                classNames={{
                  today: "bg-red-800 text-white rounded-md data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground",
                }}
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 py-4">
        <div className="h-full w-full">
          <MonthCalendar
            year={currentYear}
            month={currentMonth}
            events={events}
          />
        </div>
      </div>
    </div>
  )
}

