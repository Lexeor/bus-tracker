import StopMarker from '@/components/StopMarker';
import TransportMarker from '@/components/TransportMarker';
import type { TransportLine } from '@/data';
import { getActiveStops, type RouteCoordinates, type Stop } from '@/utils';
import { type FC, Fragment, useMemo } from 'react';

interface RouteMarkersProps {
  lines: TransportLine[];
  visibleRoutes: boolean[];
  routeCoordinatesStore: RouteCoordinates;
  onLineActivate: (lineIndex: number) => void;
}

/**
 * Component responsible for rendering all bus and stop markers.
 *
 * For stops shared between routes, the popup will show departures from every
 * route that passes through that position, not just the currently visible one.
 */
const RouteMarkers: FC<RouteMarkersProps> = ({ lines, visibleRoutes, routeCoordinatesStore, onLineActivate }) => {
  // Pre-compute: for each physical position (lat,lng) → all (stop, line) pairs.
  // Within a single line a stop can repeat (e.g. igalo is both first and last
  // stop of Line 1); we keep only the first occurrence per line.
  const stopsByPosition = useMemo(() => {
    const map = new Map<string, Array<{ stop: Stop; line: TransportLine }>>();
    lines.forEach((line) => {
      const seenInLine = new Set<string>();
      getActiveStops(line).forEach((stop) => {
        const key = `${stop.lat},${stop.lng}`;
        if (seenInLine.has(key)) return;
        seenInLine.add(key);
        const entries = map.get(key) ?? [];
        entries.push({ stop, line });
        map.set(key, entries);
      });
    });
    return map;
  }, [lines]);

  return (
    <>
      {lines.map((line, index) => (
        <Fragment key={line.id}>
          <TransportMarker line={line} lineIndex={index} hidden={!visibleRoutes[index]} routeCoordinatesStore={routeCoordinatesStore} onLineActivate={onLineActivate} />
          {getActiveStops(line).map((stop, stopIndex) => {
            const key = `${stop.lat},${stop.lng}`;
            const allEntries = stopsByPosition.get(key) ?? [];
            const otherEntries = allEntries.filter((e) => e.line.id !== line.id);
            return (
              <StopMarker
                key={`${line.id}-${stopIndex}`}
                stop={stop}
                line={line}
                isVisible={visibleRoutes[index]}
                otherEntries={otherEntries}
              />
            );
          })}
        </Fragment>
      ))}
    </>
  );
};

export default RouteMarkers;
