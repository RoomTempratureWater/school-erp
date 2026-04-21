"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { format } from "date-fns"

export type CalendarEvent = {
  id: string
  title: string
  date: string // ISO string
}

interface EventCalendarProps {
  events: CalendarEvent[]
  onAddEvent: (event: CalendarEvent) => void
  onRemoveEvent?: (id: string) => void
}

export function EventCalendar({ events, onAddEvent, onRemoveEvent }: EventCalendarProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
  const [newTitle, setNewTitle] = React.useState("")

  const eventsForSelectedDate = selectedDate
    ? events.filter(
        (e) => format(new Date(e.date), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
      )
    : []

  const handleAddEvent = () => {
    if (!selectedDate || !newTitle.trim()) return
    onAddEvent({
      id: uuidv4(),
      title: newTitle.trim(),
      date: selectedDate.toISOString(),
    })
    setNewTitle("")
  }

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        className="w-full border rounded-xl"
      />

      {/* Events list for selected date */}
      {selectedDate && (
        <div className="mt-4 pt-4 border-t">
          <h2 className="text-sm font-semibold tracking-tight mb-2">
            Events on {format(selectedDate, "PPP")}
          </h2>

          <div className="space-y-2 mt-2">
            {eventsForSelectedDate.length === 0 && (
              <p className="text-xs text-muted-foreground italic mb-2">No events scheduled.</p>
            )}
            {eventsForSelectedDate.map((event) => (
              <div key={event.id} className="flex justify-between items-center bg-slate-50 border rounded-md p-2">
                <span className="text-xs font-semibold text-slate-700">{event.title}</span>
                {onRemoveEvent && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 hover:bg-red-100"
                    onClick={() => onRemoveEvent(event.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Add new event */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
            <Input
              placeholder="New event title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-8 text-xs"
            />
            <Button size="sm" className="h-8 text-xs shrink-0" onClick={handleAddEvent}>Add</Button>
          </div>
        </div>
      )}
    </div>
  )
}
