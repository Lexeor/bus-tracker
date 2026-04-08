import { type FC, type ReactNode } from 'react';

interface ControlPanelProps {
  children: ReactNode;
}

const ControlPanel: FC<ControlPanelProps> = ({ children }) => {
  return (
    <div
      className="absolute z-[1000]"
      style={{
        top: 'max(1rem, env(safe-area-inset-top) + 0.5rem)',
        right: '1rem',
      }}
    >
      <div className="overflow-hidden backdrop-blur-sm rounded-md border shadow-lg transition-colors flex flex-col divide-y bg-white/20 border-white/30 divide-white/30 text-gray-700 dark:bg-black/40 dark:border-white/10 dark:divide-white/10 dark:text-[#e2e2e2]">{children}</div>
    </div>
  );
};

export default ControlPanel;
