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
  }, []);

  // Generate time-based traffic data that changes with currentTime
  useEffect(() => {
    if (!currentTime) return;

    const generateTimeBasedTraffic = () => {
      const features = [];
      const roadSegments = [
        { start: [10.395, 43.720], end: [10.402, 43.718], baseTraffic: 50 },
        { start: [10.402, 43.718], end: [10.408, 43.715], baseTraffic: 80 },
        { start: [10.408, 43.715], end: [10.415, 43.713], baseTraffic: 120 },
        { start: [10.398, 43.722], end: [10.405, 43.720], baseTraffic: 40 },
        { start: [10.405, 43.720], end: [10.412, 43.717], baseTraffic: 90 },
        { start: [10.395, 43.715], end: [10.402, 43.713], baseTraffic: 60 },
        { start: [10.402, 43.713], end: [10.409, 43.711], baseTraffic: 100 },
        { start: [10.400, 43.725], end: [10.407, 43.723], baseTraffic: 70 },
        { start: [10.407, 43.723], end: [10.414, 43.721], baseTraffic: 110 },
        { start: [10.393, 43.718], end: [10.400, 43.716], baseTraffic: 55 },
      ];

      const hour = currentTime.getHours();
      const minutes = currentTime.getMinutes();
      
      // Simulate traffic patterns: higher during rush hours
      const rushHourMultiplier = 
        (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19) 
          ? 1.8 + Math.sin(minutes / 10) * 0.4
          : 0.6 + Math.sin(minutes / 10) * 0.3;

      roadSegments.forEach((segment, idx) => {
        // Add some randomness and time-based variation
        const timeVariation = Math.sin((hour + minutes / 60) * Math.PI / 12 + idx) * 0.5 + 0.5;
        const vehicles = Math.floor(segment.baseTraffic * rushHourMultiplier * (0.7 + timeVariation * 0.6));
        
        features.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [segment.start, segment.end]
          },
          properties: {
            id: `road_${idx}`,
            vehicles: vehicles,
            speed: 80 - (vehicles / 200) * 40,
            speedRelative: 1 - (vehicles / 300),
            HW_truck: Math.floor(vehicles * 0.15),
            LMV_passengers: Math.floor(vehicles * 0.60),
            MHV_deliver: Math.floor(vehicles * 0.20),
            PWA_moped: Math.floor(vehicles * 0.05),
          }
        });
      });

      return {
        type: 'FeatureCollection',
        features
      };
    };

    setTrafficData(generateTimeBasedTraffic());
  }, [currentTime]);

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
          lineWidthMinPixels: 8,
          getLineColor: (f: any) => {
            const intensity = f.properties[selectedVariable] || f.properties.vehicles || 0;
            const maxVal = selectedVariable === 'vehicles' ? 200 : 
                          selectedVariable === 'speed' ? 100 : 1;
            const normalized = Math.min(intensity / maxVal, 1);
            
            // Gradient: Blue (low) → Green → Orange → Red (high)
            if (normalized < 0.33) {
              // Blue to Green
              const t = normalized * 3;
              return [
                Math.floor(59 + t * (72 - 59)),
                Math.floor(130 + t * (187 - 130)),
                Math.floor(246 - t * (126)),
                255
              ];
            } else if (normalized < 0.66) {
              // Green to Orange
              const t = (normalized - 0.33) * 3;
              return [
                Math.floor(72 + t * (251 - 72)),
                Math.floor(187 - t * (41)),
                Math.floor(120 - t * (60)),
                255
              ];
            } else {
              // Orange to Red
              const t = (normalized - 0.66) * 3;
              return [
                Math.floor(251 - t * (12)),
                Math.floor(146 - t * (78)),
                Math.floor(60 - t * 60),
                255
              ];
            }
          },
          getLineWidth: (f: any) => {
            const intensity = f.properties.vehicles || 0;
            return 4 + (intensity / 200) * 8;
          },
          pickable: true,
          updateTriggers: {
            getLineColor: [selectedVariable, trafficData],
            getLineWidth: [trafficData]
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
