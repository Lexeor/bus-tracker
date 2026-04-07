import { useLingui } from '@lingui/react';
import { Locate, LocateFixed } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { type FC } from 'react';
import { toast } from 'sonner';

interface UserLocationButtonProps {
  onClick: () => void;
  isLoading: boolean;
  isActive: boolean;
}

const UserLocationButton: FC<UserLocationButtonProps> = ({ onClick, isLoading, isActive }) => {
  const { i18n } = useLingui();

  const handleClick = () => {
    onClick();
    if (!isLoading) {
      const enabling = !isActive;
      toast(i18n._(enabling ? 'locationEnabled' : 'locationDisabled'), {
        icon: enabling ? <LocateFixed size={18} /> : <Locate size={18} />,
      });
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={isLoading}
      className={`p-3 transition-colors ${isActive ? 'text-blue-500 hover:bg-blue-500/20' : 'hover:bg-white/20 disabled:opacity-40'}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isActive ? 'Stop tracking location' : 'Show my location'}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={isLoading ? 'loading' : isActive ? 'active' : 'inactive'}
          initial={{ rotate: -30, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 30, opacity: 0, scale: 0.5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className="w-6 h-6 flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" role="status" aria-label="Loading location" />
          ) : isActive ? (
            <LocateFixed size={24} />
          ) : (
            <Locate size={24} />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
};

export default UserLocationButton;
