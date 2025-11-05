import { readParquet } from 'parquet-wasm';

export async function loadParquetFile(url: string) {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Read Parquet file using parquet-wasm
    const table: any = readParquet(uint8Array);
    
    // Convert Arrow Table to array of objects
    const data: any[] = [];
    const numRows = table.numRows;
    const numColumns = table.numCols;
    
    // Get column names from schema
    const columnNames: string[] = [];
    for (let j = 0; j < numColumns; j++) {
      const field = table.schema.field(j);
      columnNames.push(field.name);
    }
    
    // Extract data row by row
    for (let i = 0; i < numRows; i++) {
      const row: any = {};
      for (let j = 0; j < numColumns; j++) {
        const column = table.getChildAt(j);
        if (column) {
          row[columnNames[j]] = column.get(i);
        }
      }
      data.push(row);
    }
    
    console.log('Loaded', data.length, 'rows from', url);
    if (data.length > 0) {
      console.log('Sample row:', data[0]);
      console.log('Available fields:', Object.keys(data[0]));
    }
    
    return data;
  } catch (error) {
    console.error('Error loading Parquet file:', error);
    throw error;
  }
}

export async function loadBuildingsData(url: string) {
  const data = await loadParquetFile(url);
  
  // Convert to GeoJSON
  const features = data
    .map((row: any) => {
      // Parse geometry from various possible field names
      const geomField = row.geometry || row.GEOMETRY || row.geom || row.GEOM || row.wkt || row.WKT;
      const geometry = parseGeometry(geomField);
      
      if (!geometry) {
        console.warn('No valid geometry found for building row:', row);
        return null;
      }
      
      return {
        type: 'Feature',
        geometry: geometry,
        properties: {
          HEIGHT: row.HEIGHT || row.height || row.h || 10,
          POP: row.POP || row.population || row.pop || 0,
          id: row.id || row.ID,
          ...row
        }
      };
    })
    .filter((f: any) => f !== null);
  
  console.log('Buildings features created:', features.length);
  
  return {
    type: 'FeatureCollection',
    features
  };
}

export async function loadRoadsData(url: string) {
  const data = await loadParquetFile(url);
  
  const features = data
    .map((row: any) => {
      const geomField = row.geometry || row.GEOMETRY || row.geom || row.GEOM || row.wkt || row.WKT;
      const geometry = parseGeometry(geomField);
      
      if (!geometry) {
        console.warn('No valid geometry found for road row:', row);
        return null;
      }
      
      return {
        type: 'Feature',
        geometry: geometry,
        properties: {
          id: row.id || row.ID,
          ...row
        }
      };
    })
    .filter((f: any) => f !== null);
  
  console.log('Roads features created:', features.length);
  
  return {
    type: 'FeatureCollection',
    features
  };
}

export async function loadTrafficData(url: string) {
  const data = await loadParquetFile(url);
  
  const features = data
    .map((row: any) => {
      const geomField = row.geometry || row.GEOMETRY || row.geom || row.GEOM || row.wkt || row.WKT;
      const geometry = parseGeometry(geomField);
      
      if (!geometry) {
        console.warn('No valid geometry found for traffic row:', row);
        return null;
      }
      
      return {
        type: 'Feature',
        geometry: geometry,
        properties: {
          id: row.id || row.ID,
          vehicles: row.vehicles || row.VEHICLES || row.Vehicles || 0,
          speed: row.speed || row.SPEED || row.Speed || 0,
          HW_truck: row.HW_truck || row.hw_truck || 0,
          LMV_passengers: row.LMV_passengers || row.lmv_passengers || 0,
          MHV_deliver: row.MHV_deliver || row.mhv_deliver || 0,
          PWA_moped: row.PWA_moped || row.pwa_moped || 0,
          begin: row.begin || row.BEGIN || row.Begin,
          end: row.end || row.END || row.End,
          ...row
        }
      };
    })
    .filter((f: any) => f !== null);
  
  console.log('Traffic features created:', features.length);
  
  return {
    type: 'FeatureCollection',
    features
  };
}

function parseGeometry(geom: any): any {
  if (!geom) return null;
  
  // If already a GeoJSON geometry
  if (typeof geom === 'object' && geom.type) {
    return geom;
  }
  
  // If it's a WKT string
  if (typeof geom === 'string') {
    return parseWKT(geom);
  }
  
  // If it's binary data
  if (geom instanceof Uint8Array) {
    return parseWKB(geom);
  }
  
  return null;
}

function parseWKT(wkt: string): any {
  // Simple WKT parser for common geometries
  wkt = wkt.trim();
  
  if (wkt.startsWith('POINT')) {
    const coords = wkt.match(/POINT\s*\(([^)]+)\)/)?.[1].split(' ').map(Number);
    return {
      type: 'Point',
      coordinates: coords || [0, 0]
    };
  }
  
  if (wkt.startsWith('LINESTRING')) {
    const coordStr = wkt.match(/LINESTRING\s*\(([^)]+)\)/)?.[1];
    const coordinates = coordStr?.split(',').map(pair => pair.trim().split(/\s+/).map(Number)) || [];
    return {
      type: 'LineString',
      coordinates
    };
  }
  
  if (wkt.startsWith('POLYGON')) {
    // Handle nested parentheses for polygon rings
    const ringsMatch = wkt.match(/POLYGON\s*\((.+)\)$/);
    if (!ringsMatch) return null;
    
    const rings = [];
    let depth = 0;
    let currentRing = '';
    
    for (const char of ringsMatch[1]) {
      if (char === '(') {
        depth++;
        if (depth > 1) currentRing += char;
      } else if (char === ')') {
        depth--;
        if (depth === 0) {
          if (currentRing) {
            const coords = currentRing.split(',').map(pair => pair.trim().split(/\s+/).map(Number));
            rings.push(coords);
            currentRing = '';
          }
        } else {
          currentRing += char;
        }
      } else if (depth > 0) {
        currentRing += char;
      }
    }
    
    return {
      type: 'Polygon',
      coordinates: rings
    };
  }
  
  if (wkt.startsWith('MULTILINESTRING')) {
    const matches = Array.from(wkt.matchAll(/\(([^()]+)\)/g));
    const coordinates = matches.map(match => 
      match[1].split(',').map(pair => pair.trim().split(/\s+/).map(Number))
    );
    return {
      type: 'MultiLineString',
      coordinates
    };
  }
  
  if (wkt.startsWith('MULTIPOLYGON')) {
    // Simple MULTIPOLYGON parser
    const polygonsMatch = wkt.match(/MULTIPOLYGON\s*\((.+)\)$/);
    if (!polygonsMatch) return null;
    
    const polygons = [];
    let depth = 0;
    let currentPolygon = '';
    
    for (const char of polygonsMatch[1]) {
      if (char === '(') {
        depth++;
        currentPolygon += char;
      } else if (char === ')') {
        depth--;
        currentPolygon += char;
        if (depth === 0) {
          if (currentPolygon.trim()) {
            const polyWkt = 'POLYGON' + currentPolygon.trim();
            const poly = parseWKT(polyWkt);
            if (poly) polygons.push(poly.coordinates);
            currentPolygon = '';
          }
        }
      } else if (depth > 0 || char !== ',') {
        currentPolygon += char;
      }
    }
    
    return {
      type: 'MultiPolygon',
      coordinates: polygons
    };
  }
  
  return null;
}

function parseWKB(wkb: Uint8Array): any {
  // WKB parsing would require a more complex implementation
  // For now, return null and handle in the data loading
  console.warn('WKB parsing not implemented');
  return null;
}
