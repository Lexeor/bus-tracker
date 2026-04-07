import { useThemeStore } from '@/store/themeStore';
import { Moon, Sun } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { type FC } from 'react';

const DarkModeButton: FC = () => {
  const { isDark, toggleDark } = useThemeStore();

  return (
    <motion.button
      onClick={toggleDark}
      className="p-3 transition-colors hover:bg-white/20"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? 'Switch to light map' : 'Switch to dark map'}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={isDark ? 'dark' : 'light'}
          initial={{ rotate: -30, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 30, opacity: 0, scale: 0.5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className="w-6 h-6 flex items-center justify-center"
        >
          {isDark ? <Sun size={24} /> : <Moon size={24} />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
};

export default DarkModeButton;
