import { useState } from 'react';
import MapView from '@/components/MapView';
import LayerControl from '@/components/LayerControl';
import MapControls from '@/components/MapControls';
import TimePlayer from '@/components/TimePlayer';

export default function Index() {
  const [layers, setLayers] = useState({
    buildings: true,
    roads: true,
    traffic: true,
    noise: false,
  });

  const [mapStyle, setMapStyle] = useState<'light' | 'dark' | 'satellite'>('light');
  const [currentTime, setCurrentTime] = useState(new Date('2025-11-21T08:00:00'));
  const [selectedVariable, setSelectedVariable] = useState('vehicles');

  const handleTimeChange = (time: Date) => {
    setCurrentTime(time);
  };

  const handleVariableChange = (variable: string) => {
    setSelectedVariable(variable);
  };

  const minTime = new Date('2025-11-21T08:00:00');
  const maxTime = new Date('2026-02-21T23:45:00');

  const handleLayerToggle = (layer: keyof typeof layers) => {
    setLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  const handleZoomIn = () => {
    // Implement zoom in logic
    console.log('Zoom in');
  };

  const handleZoomOut = () => {
    // Implement zoom out logic
    console.log('Zoom out');
  };

  const handleResetView = () => {
    // Implement reset view logic
    console.log('Reset view');
  };

  const showPlayer = layers.traffic || layers.noise;

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <MapView
        layers={layers}
        mapStyle={mapStyle}
        currentTime={currentTime}
        selectedVariable={selectedVariable}
      />
      
      <LayerControl layers={layers} onLayerToggle={handleLayerToggle} />
      
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        onStyleChange={setMapStyle}
        currentStyle={mapStyle}
      />

      <TimePlayer
        isVisible={showPlayer}
        onTimeChange={handleTimeChange}
        onVariableChange={handleVariableChange}
        minTime={minTime}
        maxTime={maxTime}
      />
    </div>
  );
}
