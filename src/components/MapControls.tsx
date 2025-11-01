import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Compass, Plus, Minus, Map as MapIcon } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onStyleChange: (style: 'light' | 'dark' | 'satellite') => void;
  currentStyle: 'light' | 'dark' | 'satellite';
}

export default function MapControls({
  onZoomIn,
  onZoomOut,
  onResetView,
  onStyleChange,
  currentStyle,
}: MapControlsProps) {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <Card className="p-1 bg-card/95 backdrop-blur-sm shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={onResetView}
          className="w-10 h-10"
          title="Reset view"
        >
          <Compass className="h-5 w-5" />
        </Button>
      </Card>
      
      <Card className="p-1 bg-card/95 backdrop-blur-sm shadow-lg">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-10 h-10">
              <MapIcon className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onStyleChange('light')}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStyleChange('dark')}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStyleChange('satellite')}>
              Satellite
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>

      <Card className="p-1 bg-card/95 backdrop-blur-sm shadow-lg flex flex-col">
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomIn}
          className="w-10 h-10"
        >
          <Plus className="h-5 w-5" />
        </Button>
        <div className="h-px bg-border mx-2" />
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomOut}
          className="w-10 h-10"
        >
          <Minus className="h-5 w-5" />
        </Button>
      </Card>
    </div>
  );
}
