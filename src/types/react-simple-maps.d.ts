declare module 'react-simple-maps' {
  // Exportations principales
  export const ComposableMap: React.FC<any>;
  export const Geographies: React.FC<any>;
  export const Geography: React.FC<any>;
  export const Marker: React.FC<any>;
  export const Graticule: React.FC<any>;
  export const Line: React.FC<any>;
  export const Sphere: React.FC<any>;
  export const ZoomableGroup: React.FC<any>;

  // Types génériques
  export type ProjectionFunction = (coordinates: [number, number]) => [number, number];
  export type ProjectionConfig = Record<string, any>;
} 