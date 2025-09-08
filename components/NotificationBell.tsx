import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell, Settings, X } from 'lucide-react'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'
import { cn } from '@/lib/utils'

interface NotificationBellProps {
  className?: string
}

export const NotificationBell = ({ className }: NotificationBellProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { 
    newConcerts, 
    notificationCount, 
    clearNotifications,
    requestPermissions,
    sendTestNotification 
  } = useRealtimeNotifications()

  const handleClearAll = () => {
    clearNotifications()
    setIsOpen(false)
  }

  const handleEnableNotifications = async () => {
    const granted = await requestPermissions()
    if (granted) {
      await sendTestNotification()
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {notificationCount > 99 ? '99+' : notificationCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEnableNotifications}
              className="text-xs"
            >
              <Settings className="h-3 w-3 mr-1" />
              Enable
            </Button>
            {notificationCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-80">
          {newConcerts.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No new notifications</p>
              <p className="text-xs mt-1">
                You'll be notified when new concerts match your preferences
              </p>
            </div>
          ) : (
            <div className="p-2">
              {newConcerts.map((concert, index) => (
                <div
                  key={`${concert.id}-${index}`}
                  className="p-3 rounded-lg hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {concert.artist}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {concert.venue?.name} • {concert.date}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {concert.price === 'free' ? (
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            FREE
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            ${concert.price}
                          </span>
                        )}
                        {concert.genres.slice(0, 2).map(genre => (
                          <Badge 
                            key={genre} 
                            variant="outline" 
                            className="text-xs px-1 py-0"
                          >
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {newConcerts.length > 0 && (
          <div className="p-3 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => setIsOpen(false)}
            >
              View All Concerts
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}