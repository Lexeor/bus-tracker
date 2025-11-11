import { type FC, Fragment } from 'react';
import StopMarker from '../components/StopMarker';
import TransportMarker from '../components/TransportMarker';
import type { TransportLine } from '../data';
import type { RouteCoordinates } from '../utils';

interface RouteMarkersProps {
  lines: TransportLine[];
  visibleRoutes: boolean[];
  routeCoordinatesStore: RouteCoordinates;
}

/**
 * Component responsible for rendering all bus and stop markers
 */
const RouteMarkers: FC<RouteMarkersProps> = ({ lines, visibleRoutes, routeCoordinatesStore }) => {
  return (
    <>
      {lines.map((line, index) => (
        <Fragment key={line.id}>
          <TransportMarker line={line} hidden={!visibleRoutes[index]} routeCoordinatesStore={routeCoordinatesStore} />
          {line.stops.map((stop, stopIndex) => (
            <StopMarker key={`${line.id}-${stopIndex}`} stop={stop} line={line} isVisible={visibleRoutes[index]} />
          ))}
        </Fragment>
      ))}
    </>
  );
};

export default RouteMarkers;
