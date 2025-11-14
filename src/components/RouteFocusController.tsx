import type { TransportLine } from '@/data.ts';
import { useRouteFocus } from '@/hooks/useRouteFocus';
import { type FC } from 'react';

interface RouteFocusControllerProps {
  focusedLine: TransportLine | null;
}

const RouteFocusController: FC<RouteFocusControllerProps> = ({ focusedLine }) => {
  useRouteFocus({ line: focusedLine });

  return null;
};

export default RouteFocusController;
