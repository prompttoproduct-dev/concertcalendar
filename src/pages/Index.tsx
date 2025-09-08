import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { ChevronLeft, ChevronRight, Music, Calendar as CalendarIcon, MapPin, Clock } from "lucide-react";
import { useConcertsByDate, useUpcomingConcerts } from "@/hooks/useConcerts";
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
  const { data: selectedDateConcerts = [], isLoading: isLoadingSelected } = useConcertsByDate(
    format(selectedDate, 'yyyy-MM-dd')
  );

  // Get upcoming concerts for overview
  const { data: upcomingConcerts = [] } = useUpcomingConcerts(5);

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
          <div className="flex items-center justify-center gap-3 mb-6">
            <Music className="h-10 w-10 text-accent" />
            <h1 className="headline text-display text-foreground">
              NYC Concert Calendar
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover live music across New York City. Click any date to see what's happening.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Calendar */}
          <div className="xl:col-span-3">
            <div className="bg-gradient-card rounded-xl p-8 border border-border">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-foreground">
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
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-4">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.slice(0, 3)}</span>
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
                      "aspect-square p-3 text-sm rounded-xl transition-smooth hover:bg-accent/10 relative",
                      "flex flex-col items-center justify-center min-h-[80px] group",
                      isSameDay(day, selectedDate) && "bg-accent text-accent-foreground shadow-accent-glow ring-2 ring-accent/30",
                      isToday(day) && !isSameDay(day, selectedDate) && "bg-primary/20 text-primary font-bold ring-2 ring-primary/30",
                      !isCurrentMonth(day) && "text-muted-foreground/30 hover:text-muted-foreground/60",
                      isCurrentMonth(day) && !isSameDay(day, selectedDate) && !isToday(day) && "text-foreground hover:text-accent hover:bg-accent/5"
                    )}
                  >
                    <span className="text-lg font-semibold mb-1">
                      {format(day, 'd')}
                    </span>
                    {/* Concert indicator */}
                    {isCurrentMonth(day) && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-accent/60 rounded-full group-hover:bg-accent transition-colors" />
                        <span className="text-xs text-muted-foreground group-hover:text-accent">
                          2
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Selected Date Info */}
            <div className="bg-gradient-card rounded-xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <CalendarIcon className="h-6 w-6 text-accent" />
                <div>
                  <div className="font-bold text-foreground">
                    {format(selectedDate, 'MMM d')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(selectedDate, 'EEEE')}
                  </div>
                </div>
                {isToday(selectedDate) && (
                  <Badge variant="default" className="bg-accent text-accent-foreground ml-auto">
                    Today
                  </Badge>
                )}
              </div>

              {/* Concerts for Selected Date */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground text-sm">
                  Concerts ({selectedDateConcerts.length})
                </h3>
                
                {isLoadingSelected ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : selectedDateConcerts.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedDateConcerts.map((concert) => (
                      <div key={concert.id} className="p-3 bg-card/50 rounded-lg border border-border/50 hover:bg-accent/5 transition-smooth">
                        <div className="font-medium text-foreground text-sm mb-1">
                          {concert.artist}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3" />
                          <span>{concert.venue}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {concert.time && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{concert.time}</span>
                              </div>
                            )}
                            <span className="text-sm font-medium text-accent">
                              ${concert.price}
                            </span>
                          </div>
                          {concert.ticketUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-6 px-2"
                              onClick={() => window.open(concert.ticketUrl, '_blank')}
                            >
                              Tickets
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Music className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No concerts scheduled
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Concerts */}
            <div className="bg-gradient-card rounded-xl p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Music className="h-5 w-5 text-accent" />
                Coming Up
              </h3>
              
              <div className="space-y-3">
                {upcomingConcerts.slice(0, 3).map((concert) => (
                  <div key={concert.id} className="p-3 bg-card/30 rounded-lg border border-border/30">
                    <div className="font-medium text-foreground text-sm mb-1">
                      {concert.artist}
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">
                      {concert.venue}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(concert.date), 'MMM d')}
                      </span>
                      <span className="text-xs font-medium text-accent">
                        ${concert.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => window.location.href = '/search'}
              >
                View All Concerts
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-card rounded-xl p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-4">This Month</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Concerts</span>
                  <span className="font-bold text-accent">{upcomingConcerts.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Free Shows</span>
                  <span className="font-bold text-accent">
                    {upcomingConcerts.filter(c => c.price === 0).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Venues</span>
                  <span className="font-bold text-accent">
                    {new Set(upcomingConcerts.map(c => c.venue)).size}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;