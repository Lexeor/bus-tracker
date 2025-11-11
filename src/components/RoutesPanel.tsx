import { useLingui } from '@lingui/react';
import { BusFrontIcon, ShipIcon } from 'lucide-react';
import { type Dispatch, type FC, type SetStateAction } from 'react';

interface RoutesPanelProps {
  visibleRoutes: any;
  setVisibleRoutes: Dispatch<SetStateAction<boolean[]>>;
}

const RoutesPanel: FC<RoutesPanelProps> = ({ visibleRoutes, setVisibleRoutes }) => {
  const { i18n } = useLingui();

  return (
    <div
      className="absolute left-0 right-0 flex justify-center px-4 z-[1000] text-black"
      style={{
        bottom: 'max(1rem, env(safe-area-inset-bottom) + 0.5rem)',
      }}
    >
      <div className="bg-white/40 backdrop-blur-sm rounded-sm p-4 pt-2 w-full md:w-auto text-center">
        <h3>{i18n._('busLines')}</h3>
        <div className="flex gap-2 justify-center items-center">
          <BusFrontIcon />
          <button
            onClick={() => setVisibleRoutes((prev: boolean[]) => [!prev[0], false, false, false])}
            className={`px-8 py-2 rounded font-semibold transition-all cursor-pointer ${visibleRoutes[0] ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}
          >
            1
          </button>
          <button
            onClick={() => setVisibleRoutes((prev: boolean[]) => [false, !prev[1], false, false])}
            className={`px-8 py-2 rounded font-semibold transition-all cursor-pointer ${visibleRoutes[1] ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-600'}`}
          >
            2
          </button>
          <ShipIcon />
          <button
            onClick={() => setVisibleRoutes((prev: boolean[]) => [false, false, !prev[2], !prev[3]])}
            className={`px-8 py-2 rounded font-semibold transition-all cursor-pointer ${visibleRoutes[2] ? 'bg-[#0d5e97] text-white' : 'bg-gray-200 text-gray-600'}`}
          >
            3
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoutesPanel;
