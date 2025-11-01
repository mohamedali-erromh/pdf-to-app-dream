import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface LayerControlProps {
  layers: {
    buildings: boolean;
    roads: boolean;
    traffic: boolean;
    noise: boolean;
  };
  onLayerToggle: (layer: keyof LayerControlProps['layers']) => void;
}

export default function LayerControl({ layers, onLayerToggle }: LayerControlProps) {
  return (
    <Card className="absolute top-4 left-4 p-4 bg-card/95 backdrop-blur-sm shadow-lg">
      <h3 className="font-semibold mb-3 text-foreground">Livelli</h3>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="buildings"
            checked={layers.buildings}
            onCheckedChange={() => onLayerToggle('buildings')}
          />
          <Label
            htmlFor="buildings"
            className="text-sm font-normal cursor-pointer text-foreground"
          >
            Edifici
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="roads"
            checked={layers.roads}
            onCheckedChange={() => onLayerToggle('roads')}
          />
          <Label
            htmlFor="roads"
            className="text-sm font-normal cursor-pointer text-foreground"
          >
            Rete stradale
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="traffic"
            checked={layers.traffic}
            onCheckedChange={() => onLayerToggle('traffic')}
          />
          <Label
            htmlFor="traffic"
            className="text-sm font-normal cursor-pointer text-foreground"
          >
            Traffico
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="noise"
            checked={layers.noise}
            onCheckedChange={() => onLayerToggle('noise')}
          />
          <Label
            htmlFor="noise"
            className="text-sm font-normal cursor-pointer text-foreground"
          >
            Rumore
          </Label>
        </div>
      </div>
    </Card>
  );
}
