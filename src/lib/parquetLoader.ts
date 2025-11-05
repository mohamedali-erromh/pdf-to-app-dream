import { tableFromIPC } from 'apache-arrow';

export async function loadParquetFile(url: string) {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const table = tableFromIPC(arrayBuffer);
    
    // Convert Arrow table to JSON-like structure
    const data = [];
    for (let i = 0; i < table.numRows; i++) {
      const row: any = {};
      for (const field of table.schema.fields) {
        const column = table.getChild(field.name);
        if (column) {
          row[field.name] = column.get(i);
        }
      }
      data.push(row);
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
  const features = data.map((row: any) => {
    // Parse geometry (assuming WKT or coordinates)
    const geometry = parseGeometry(row.geometry || row.GEOMETRY || row.geom);
    
    return {
      type: 'Feature',
      geometry: geometry,
      properties: {
        HEIGHT: row.HEIGHT || row.height || 10,
        POP: row.POP || row.population || 0,
        ...row
      }
    };
  });
  
  return {
    type: 'FeatureCollection',
    features
  };
}

export async function loadRoadsData(url: string) {
  const data = await loadParquetFile(url);
  
  const features = data.map((row: any) => {
    const geometry = parseGeometry(row.geometry || row.GEOMETRY || row.geom);
    
    return {
      type: 'Feature',
      geometry: geometry,
      properties: {
        id: row.id || row.ID,
        ...row
      }
    };
  });
  
  return {
    type: 'FeatureCollection',
    features
  };
}

export async function loadTrafficData(url: string) {
  const data = await loadParquetFile(url);
  
  const features = data.map((row: any) => {
    const geometry = parseGeometry(row.geometry || row.GEOMETRY || row.geom);
    
    return {
      type: 'Feature',
      geometry: geometry,
      properties: {
        id: row.id || row.ID,
        vehicles: row.vehicles || row.VEHICLES || 0,
        speed: row.speed || row.SPEED || 0,
        HW_truck: row.HW_truck || 0,
        LMV_passengers: row.LMV_passengers || 0,
        MHV_deliver: row.MHV_deliver || 0,
        PWA_moped: row.PWA_moped || 0,
        begin: row.begin || row.BEGIN,
        end: row.end || row.END,
        ...row
      }
    };
  });
  
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
    const coordinates = coordStr?.split(',').map(pair => pair.trim().split(' ').map(Number)) || [];
    return {
      type: 'LineString',
      coordinates
    };
  }
  
  if (wkt.startsWith('POLYGON')) {
    const coordStr = wkt.match(/POLYGON\s*\(\(([^)]+)\)\)/)?.[1];
    const coordinates = coordStr?.split(',').map(pair => pair.trim().split(' ').map(Number)) || [];
    return {
      type: 'Polygon',
      coordinates: [coordinates]
    };
  }
  
  if (wkt.startsWith('MULTILINESTRING')) {
    const matches = wkt.matchAll(/\(([^)]+)\)/g);
    const coordinates = Array.from(matches).map(match => 
      match[1].split(',').map(pair => pair.trim().split(' ').map(Number))
    );
    return {
      type: 'MultiLineString',
      coordinates
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
