import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ConcertList } from "@/components/ConcertList";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useConcertsByDate } from "@/hooks/useConcerts";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from "date-fns";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get concerts for the selected date
  const { data: concerts = [], isLoading } = useConcertsByDate(
    format(selectedDate, 'yyyy-MM-dd')
  );

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-6">
        <Breadcrumbs />
        
        <div className="py-8">
          <div className="text-center mb-8">
            <h1 className="text-h1 lg:text-display text-foreground mb-4">
              Concert Calendar
            </h1>
            <p className="text-xl text-muted-foreground">
              Browse concerts by date across NYC
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-card rounded-xl p-6 border border-border">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">
                    {format(currentMonth, 'MMMM yyyy')}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigateMonth('prev')}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigateMonth('next')}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {daysInMonth.map(day => (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "p-2 text-sm rounded-lg transition-smooth hover:bg-accent/10",
                        isSameDay(day, selectedDate) && "bg-accent text-accent-foreground",
                        isToday(day) && !isSameDay(day, selectedDate) && "bg-muted text-foreground font-semibold",
                        !isSameDay(day, selectedDate) && !isToday(day) && "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {format(day, 'd')}
                    </button>
                  ))}
                </div>

                {/* Selected Date Info */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="h-4 w-4 text-accent" />
                    <span className="font-medium text-foreground">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {concerts.length} concert{concerts.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>
            </div>

            {/* Concert Results */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Concerts on {format(selectedDate, 'MMM d, yyyy')}
                </h3>
                {isToday(selectedDate) && (
                  <Badge variant="default" className="mb-4 bg-accent text-accent-foreground">
                    Today
                  </Badge>
                )}
              </div>

              <ConcertList
                concerts={concerts}
                isLoading={isLoading}
                emptyMessage={`No concerts scheduled for ${format(selectedDate, 'MMMM d, yyyy')}. Try selecting a different date.`}
                className="grid-cols-1 md:grid-cols-2"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;