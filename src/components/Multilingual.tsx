import { AnimatePresence, motion } from 'motion/react';
import { type FC, useEffect, useState } from 'react';

interface MultilingualProps {
  values: string[];
  interval?: number;
  selectedLanguage?: number;
}

const Multilingual: FC<MultilingualProps> = ({ values, interval = 3000, selectedLanguage }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    // Если выбран конкретный язык, не запускаем автопереключение
    if (selectedLanguage !== undefined || values.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % values.length);
    }, interval);

    return () => clearInterval(timer);
  }, [values.length, interval, selectedLanguage]);

  if (values.length === 0) {
    return null;
  }

  // Определяем какой индекс показывать
  const displayIndex: number = selectedLanguage !== undefined ? selectedLanguage : currentIndex;

  // Проверяем валидность индекса
  const safeDisplayIndex: number = displayIndex >= 0 && displayIndex < values.length ? displayIndex : 0;

  return (
    <div className="relative inline-block min-h-[1.2em] w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedLanguage !== undefined ? `selected-${safeDisplayIndex}` : `auto-${safeDisplayIndex}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            duration: 0.5,
            ease: 'easeInOut',
          }}
          className="absolute inset-0"
        >
          {values[safeDisplayIndex]}
        </motion.div>
      </AnimatePresence>
      {/* Invisible element to maintain layout space */}
      <span className="invisible">{values[safeDisplayIndex]}</span>
    </div>
  );
};

export default Multilingual;
