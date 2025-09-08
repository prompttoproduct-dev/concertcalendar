import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { ConcertList } from "@/components/ConcertList";
import { ChevronLeft, ChevronRight, Music, Calendar as CalendarIcon } from "lucide-react";
import { useSearchConcerts } from "@/hooks/useConcerts";
import { cn } from "@/lib/utils";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek
} from "date-fns";

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get concerts for the selected date
  const { data: concerts = [], isLoading } = useSearchConcerts({
    dateRange: {
      start: format(selectedDate, 'yyyy-MM-dd'),
      end: format(selectedDate, 'yyyy-MM-dd')
    }
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth() && date.getFullYear() === currentMonth.getFullYear();
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="h-8 w-8 text-accent" />
            <h1 className="headline text-display text-foreground">
              CitySounds Calendar
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover NYC concerts by date. Click any day to see what's happening.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <div className="xl:col-span-2">
            <div className="bg-gradient-card rounded-xl p-8 border border-border">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateMonth('prev')}
                    className="hover:bg-accent/10"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateMonth('next')}
                    className="hover:bg-accent/10"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-3">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map(day => (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "aspect-square p-2 text-sm rounded-lg transition-smooth hover:bg-accent/10 relative",
                      "flex flex-col items-center justify-center min-h-[60px]",
                      isSameDay(day, selectedDate) && "bg-accent text-accent-foreground shadow-accent-glow",
                      isToday(day) && !isSameDay(day, selectedDate) && "bg-primary/20 text-primary font-bold ring-2 ring-primary/30",
                      !isCurrentMonth(day) && "text-muted-foreground/50 hover:text-muted-foreground",
                      isCurrentMonth(day) && !isSameDay(day, selectedDate) && !isToday(day) && "text-foreground hover:text-accent"
                    )}
                  >
                    <span className="text-base font-medium">
                      {format(day, 'd')}
                    </span>
                    {/* Concert indicator dot */}
                    {isCurrentMonth(day) && (
                      <div className="w-1 h-1 bg-accent rounded-full mt-1 opacity-60" />
                    )}
                  </button>
                ))}
              </div>

              {/* Today indicator */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-accent" />
                    <div>
                      <div className="font-semibold text-foreground">
                        {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {concerts.length} concert{concerts.length !== 1 ? 's' : ''} scheduled
                      </div>
                    </div>
                  </div>
                  {isToday(selectedDate) && (
                    <Badge variant="default" className="bg-accent text-accent-foreground">
                      Today
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Concert Details Section */}
          <div className="xl:col-span-1">
            <div className="bg-gradient-card rounded-xl p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Music className="h-5 w-5 text-accent" />
                {format(selectedDate, 'MMM d')} Concerts
              </h3>

              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2 mb-1" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : concerts.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {concerts.map((concert) => (
                    <div key={concert.id} className="p-4 bg-card/50 rounded-lg border border-border/50 hover:bg-accent/5 transition-smooth">
                      <div className="font-medium text-foreground mb-1">
                        {concert.title || concert.artist}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {concert.venue} • {concert.time || 'Time TBA'}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {concert.price === 0 ? (
                            <Badge variant="default" className="bg-accent text-accent-foreground text-xs">
                              FREE
                            </Badge>
                          ) : (
                            <span className="text-sm font-medium text-foreground">
                              ${concert.price}
                            </span>
                          )}
                        </div>
                        {concert.url && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => window.open(concert.url, '_blank')}
                          >
                            Tickets
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    No concerts scheduled for this date
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Try selecting a different day
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 space-y-3">
              <Button 
                variant="accent" 
                className="w-full"
                onClick={() => window.location.href = '/search?priceRange=free'}
              >
                Find Free Shows
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/search'}
              >
                Browse All Concerts
              </Button>
            </div>
          </div>
        </div>

        {/* Month Overview */}
        <div className="mt-12 bg-gradient-card rounded-xl p-8 border border-border">
          <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
            {format(currentMonth, 'MMMM')} Concert Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-card/30 rounded-lg">
              <div className="text-2xl font-bold text-accent mb-1">12</div>
              <div className="text-sm text-muted-foreground">Free Shows</div>
            </div>
            <div className="p-4 bg-card/30 rounded-lg">
              <div className="text-2xl font-bold text-accent mb-1">45</div>
              <div className="text-sm text-muted-foreground">Total Concerts</div>
            </div>
            <div className="p-4 bg-card/30 rounded-lg">
              <div className="text-2xl font-bold text-accent mb-1">8</div>
              <div className="text-sm text-muted-foreground">Genres</div>
            </div>
            <div className="p-4 bg-card/30 rounded-lg">
              <div className="text-2xl font-bold text-accent mb-1">25</div>
              <div className="text-sm text-muted-foreground">Venues</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;