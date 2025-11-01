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
    // Generate mock traffic data for demonstration
    const generateMockTrafficData = () => {
      const features = [];
      const roadSegments = [
        { start: [10.395, 43.720], end: [10.402, 43.718] },
        { start: [10.402, 43.718], end: [10.408, 43.715] },
        { start: [10.408, 43.715], end: [10.415, 43.713] },
        { start: [10.398, 43.722], end: [10.405, 43.720] },
        { start: [10.405, 43.720], end: [10.412, 43.717] },
        { start: [10.395, 43.715], end: [10.402, 43.713] },
        { start: [10.402, 43.713], end: [10.409, 43.711] },
        { start: [10.400, 43.725], end: [10.407, 43.723] },
      ];

      roadSegments.forEach((segment, idx) => {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [segment.start, segment.end]
          },
          properties: {
            id: `road_${idx}`,
            vehicles: Math.floor(Math.random() * 150) + 10,
            speed: Math.random() * 60 + 20,
            speedRelative: Math.random() * 0.8 + 0.2
          }
        });
      });

      return {
        type: 'FeatureCollection',
        features
      };
    };

    // Generate mock buildings
    const generateMockBuildings = () => {
      const features = [];
      const center = [10.4017, 43.7167];
      
      for (let i = 0; i < 50; i++) {
        const offsetLng = (Math.random() - 0.5) * 0.02;
        const offsetLat = (Math.random() - 0.5) * 0.01;
        const lng = center[0] + offsetLng;
        const lat = center[1] + offsetLat;
        const size = 0.0005;
        
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [lng - size, lat - size],
              [lng + size, lat - size],
              [lng + size, lat + size],
              [lng - size, lat + size],
              [lng - size, lat - size]
            ]]
          },
          properties: {
            HEIGHT: Math.floor(Math.random() * 30) + 5,
            POP: Math.floor(Math.random() * 100) + 10
          }
        });
      }

      return {
        type: 'FeatureCollection',
        features
      };
    };

    // Generate mock roads
    const generateMockRoads = () => {
      const features = [];
      const roadSegments = [
        { start: [10.395, 43.720], end: [10.402, 43.718] },
        { start: [10.402, 43.718], end: [10.408, 43.715] },
        { start: [10.408, 43.715], end: [10.415, 43.713] },
        { start: [10.398, 43.722], end: [10.405, 43.720] },
        { start: [10.405, 43.720], end: [10.412, 43.717] },
        { start: [10.395, 43.715], end: [10.402, 43.713] },
        { start: [10.402, 43.713], end: [10.409, 43.711] },
        { start: [10.400, 43.725], end: [10.407, 43.723] },
        { start: [10.407, 43.723], end: [10.414, 43.721] },
        { start: [10.393, 43.718], end: [10.400, 43.716] },
      ];

      roadSegments.forEach((segment, idx) => {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [segment.start, segment.end]
          },
          properties: {
            id: `road_${idx}`
          }
        });
      });

      return {
        type: 'FeatureCollection',
        features
      };
    };

    setBuildingsData(generateMockBuildings());
    setRoadsData(generateMockRoads());
    setTrafficData(generateMockTrafficData());
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
          lineWidthMinPixels: 6,
          getLineColor: (f: any) => {
            const intensity = f.properties.vehicles || 0;
            const normalized = Math.min(intensity / 150, 1);
            // Gradient from blue (low traffic) to orange (medium) to red (high traffic)
            if (normalized < 0.5) {
              // Blue to orange
              const t = normalized * 2;
              return [
                Math.floor(74 + t * (251 - 74)),
                Math.floor(144 + t * (146 - 144)),
                Math.floor(226 + t * (60 - 226)),
                255
              ];
            } else {
              // Orange to red
              const t = (normalized - 0.5) * 2;
              return [
                Math.floor(251 + t * (239 - 251)),
                Math.floor(146 - t * (68 - 146)),
                Math.floor(60 - t * 60),
                255
              ];
            }
          },
          getLineWidth: (f: any) => {
            const intensity = f.properties.vehicles || 0;
            return 3 + (intensity / 150) * 7;
          },
          pickable: true,
          updateTriggers: {
            getLineColor: [currentTime],
            getLineWidth: [currentTime]
          }
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
