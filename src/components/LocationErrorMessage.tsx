import { AnimatePresence, motion } from 'motion/react';
import { type FC, useEffect } from 'react';

interface LocationErrorMessageProps {
  error: string | null;
  onDismiss?: () => void;
  autoDismissDelay?: number;
}

const LocationErrorMessage: FC<LocationErrorMessageProps> = ({ error, onDismiss, autoDismissDelay = 5000 }) => {
  useEffect(() => {
    if (error && onDismiss && autoDismissDelay > 0) {
      const timer = setTimeout(onDismiss, autoDismissDelay);
      return () => clearTimeout(timer);
    }
  }, [error, onDismiss, autoDismissDelay]);

  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute z-[1000] bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg max-w-xs right-4"
          style={{
            top: 'max(5rem, env(safe-area-inset-top) + 4.5rem)',
          }}
          role="alert"
        >
          <div className="flex items-center gap-2">
            <span>{error}</span>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="ml-2 hover:text-red-200 transition-colors"
                aria-label="Dismiss error"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LocationErrorMessage;
