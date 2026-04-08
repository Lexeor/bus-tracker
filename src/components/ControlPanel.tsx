import { useThemeStore } from '@/store/themeStore';
import { type FC, type ReactNode } from 'react';

interface ControlPanelProps {
  children: ReactNode;
}

const ControlPanel: FC<ControlPanelProps> = ({ children }) => {
  const { isDark } = useThemeStore();

  return (
    <div
      className="absolute z-[1000]"
      style={{
        top: 'max(1rem, env(safe-area-inset-top) + 0.5rem)',
        right: '1rem',
      }}
    >
      <div className={`overflow-hidden backdrop-blur-sm rounded-md border shadow-lg transition-colors flex flex-col divide-y ${isDark ? 'bg-black/40 border-white/10 divide-white/10 text-[#e2e2e2]' : 'bg-white/20 border-white/30 divide-white/30 text-gray-700'}`}>{children}</div>
    </div>
  );
};

export default ControlPanel;
