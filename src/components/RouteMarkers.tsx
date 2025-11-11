import { type FC, Fragment } from 'react';
import BusMarker from '../components/BusMarker';
import StopMarker from '../components/StopMarker';
import type { BusLine } from '../data';
import type { RouteCoordinates } from '../utils';

interface RouteMarkersProps {
  lines: BusLine[];
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
          <BusMarker line={line} hidden={!visibleRoutes[index]} routeCoordinatesStore={routeCoordinatesStore} />
          {line.stops.map((stop, stopIndex) => (
            <StopMarker key={`${line.id}-${stopIndex}`} stop={stop} line={line} isVisible={visibleRoutes[index]} />
          ))}
        </Fragment>
      ))}
    </>
  );
};

export default RouteMarkers;
