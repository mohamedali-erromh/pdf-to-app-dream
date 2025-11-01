import { useState, useEffect, useMemo, useRef } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import type { MapViewState } from '@deck.gl/core';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  const mapStyleUrl = useMemo(() => {
    switch (mapStyle) {
      case 'dark':
        return 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      default:
        return 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
    }
  }, [mapStyle]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyleUrl,
      center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
      zoom: INITIAL_VIEW_STATE.zoom - 1,
      pitch: 0,
      bearing: 0,
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (map.current) {
      map.current.setStyle(mapStyleUrl);
    }
  }, [mapStyleUrl]);

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
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none">
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
          layers={deckLayers}
          onViewStateChange={({ viewState }: any) => {
            setViewState(viewState);
            if (map.current) {
              map.current.jumpTo({
                center: [viewState.longitude, viewState.latitude],
                zoom: viewState.zoom - 1,
                bearing: viewState.bearing,
                pitch: viewState.pitch,
              });
            }
          }}
          style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'all' }}
        />
      </div>
    </div>
  );
}
