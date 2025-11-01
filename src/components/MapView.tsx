import { useState, useEffect, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import type { MapViewState } from '@deck.gl/core';

interface MapViewProps {
  layers: {
    buildings: boolean;
    roads: boolean;
    traffic: boolean;
    noise: boolean;
  };
  mapStyle: 'light' | 'dark' | 'satellite';
  currentTime?: Date;
  selectedVariable?: string;
}

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: 10.4017,
  latitude: 43.7167,
  zoom: 14,
  pitch: 45,
  bearing: 0,
  maxZoom: 20,
  minZoom: 0,
  maxPitch: 85,
  minPitch: 0
};

export default function MapView({ layers, mapStyle, currentTime, selectedVariable }: MapViewProps) {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [buildingsData, setBuildingsData] = useState<any>(null);
  const [roadsData, setRoadsData] = useState<any>(null);
  const [trafficData, setTrafficData] = useState<any>(null);

  const mapStyleUrl = useMemo(() => {
    switch (mapStyle) {
      case 'dark':
        return 'mapbox://styles/mapbox/dark-v11';
      case 'satellite':
        return 'mapbox://styles/mapbox/satellite-streets-v12';
      default:
        return 'mapbox://styles/mapbox/light-v11';
    }
  }, [mapStyle]);

  useEffect(() => {
    // Load GeoJSON data - placeholder for now
    // In production, this would load and parse the parquet files
    const mockBuildings = {
      type: 'FeatureCollection',
      features: []
    };
    setBuildingsData(mockBuildings);
  }, []);

  const deckLayers = useMemo(() => {
    const result = [];

    if (layers.buildings && buildingsData) {
      result.push(
        new GeoJsonLayer({
          id: 'buildings',
          data: buildingsData,
          extruded: true,
          wireframe: true,
          getElevation: (f: any) => f.properties.HEIGHT || 10,
          getFillColor: [74, 144, 226, 200],
          getLineColor: [255, 255, 255, 50],
          pickable: true,
        })
      );
    }

    if (layers.roads && roadsData) {
      result.push(
        new GeoJsonLayer({
          id: 'roads',
          data: roadsData,
          stroked: true,
          filled: false,
          lineWidthMinPixels: 2,
          getLineColor: [72, 187, 120, 255],
          getLineWidth: 3,
          pickable: true,
        })
      );
    }

    if (layers.traffic && trafficData) {
      result.push(
        new GeoJsonLayer({
          id: 'traffic',
          data: trafficData,
          stroked: true,
          filled: false,
          lineWidthMinPixels: 4,
          getLineColor: (f: any) => {
            const intensity = f.properties.vehicles || 0;
            const normalized = Math.min(intensity / 100, 1);
            return [
              74 + normalized * 181,
              144 - normalized * 69,
              226 - normalized * 166,
              255
            ];
          },
          getLineWidth: 5,
          pickable: true,
        })
      );
    }

    return result;
  }, [layers, buildingsData, roadsData, trafficData]);

  return (
    <div className="w-full h-full">
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={deckLayers}
        onViewStateChange={({ viewState }: any) => setViewState(viewState)}
        style={{ position: 'relative', width: '100%', height: '100%' }}
      >
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#e5e7eb'
          }}
        />
      </DeckGL>
    </div>
  );
}
