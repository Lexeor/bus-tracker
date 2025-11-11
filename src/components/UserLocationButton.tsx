import { motion } from 'motion/react';
import { type FC } from 'react';

interface UserLocationButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

const UserLocationButton: FC<UserLocationButtonProps> = ({ onClick, isLoading }) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={isLoading}
      className="absolute z-[1000] bg-white hover:bg-gray-50 disabled:bg-gray-100 p-3 rounded-lg shadow-lg transition-all"
      style={{
        top: 'max(1rem, env(safe-area-inset-top) + 0.5rem)',
        right: '1rem',
      }}
      title="Show my location"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Show my location"
    >
      {isLoading ? (
        <div
          className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
          role="status"
          aria-label="Loading location"
        />
      ) : (
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )}
    </motion.button>
  );
};

export default UserLocationButton;
