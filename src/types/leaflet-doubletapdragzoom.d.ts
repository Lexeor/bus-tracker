export {};

declare module 'leaflet-doubletapdrag' {}
declare module 'leaflet-doubletapdragzoom' {}

declare module 'leaflet' {
  interface MapOptions {
    doubleTapDragZoom?: boolean | 'center';
    doubleTapDragZoomOptions?: { reverse?: boolean };
  }
}
