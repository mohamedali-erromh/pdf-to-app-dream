import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface TimePlayerProps {
  isVisible: boolean;
  onTimeChange: (time: Date) => void;
  onVariableChange: (variable: string) => void;
  minTime: Date;
  maxTime: Date;
}

export default function TimePlayer({
  isVisible,
  onTimeChange,
  onVariableChange,
  minTime,
  maxTime,
}: TimePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentValue, setCurrentValue] = useState(0);
  const [selectedVariable, setSelectedVariable] = useState('vehicles');
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentValue((prev) => {
          const next = prev + 1;
          if (next > 100) {
            setIsPlaying(false);
            return 100;
          }
          return next;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  if (!isVisible) return null;

  const currentDate = new Date(
    minTime.getTime() + ((maxTime.getTime() - minTime.getTime()) * currentValue) / 100
  );

  return (
    <Card className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl p-4 bg-[hsl(var(--player-bg))]/95 backdrop-blur-sm shadow-xl">
      <div className="flex items-center gap-4">
        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-accent hover:bg-accent/80"
            onClick={() => setCurrentValue(Math.max(0, currentValue - 10))}
          >
            <SkipBack className="h-5 w-5 text-accent-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-accent hover:bg-accent/80"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6 text-accent-foreground" />
            ) : (
              <Play className="h-6 w-6 text-accent-foreground" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-accent hover:bg-accent/80"
            onClick={() => setCurrentValue(Math.min(100, currentValue + 10))}
          >
            <SkipForward className="h-5 w-5 text-accent-foreground" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {formatDate(minTime)} – {formatTime(minTime)}
            </span>
            <div className="px-4 py-2 bg-card/80 rounded-lg">
              <div className="text-accent-foreground font-semibold">
                {formatDate(currentDate)}
              </div>
              <div className="text-accent-foreground text-xs">
                {formatTime(currentDate)}
              </div>
            </div>
            <span>
              {formatDate(maxTime)} – {formatTime(maxTime)}
            </span>
          </div>
          <Slider
            value={[currentValue]}
            onValueChange={(value) => setCurrentValue(value[0])}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* Variable Selector */}
        <Select value={selectedVariable} onValueChange={setSelectedVariable}>
          <SelectTrigger className="w-[180px] bg-card/80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vehicles">Vehicles</SelectItem>
            <SelectItem value="speed">Speed</SelectItem>
            <SelectItem value="speedRelative">Speed Relative</SelectItem>
            <SelectItem value="HW_truck">HW Truck</SelectItem>
            <SelectItem value="LMV_passengers">LMV Passengers</SelectItem>
            <SelectItem value="MHV_deliver">MHV Deliver</SelectItem>
            <SelectItem value="PWA_moped">PWA Moped</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Color Bar */}
      <div className="mt-4 flex items-center gap-4">
        <div className="flex-1 h-3 rounded-full bg-gradient-to-r from-primary via-accent to-destructive" />
        <div className="flex gap-8 text-sm text-muted-foreground">
          <span>Min val</span>
          <span>Max val</span>
        </div>
      </div>
    </Card>
  );
}
