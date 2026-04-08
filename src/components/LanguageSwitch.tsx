import { LANGUAGE_KEY } from '@/constants.ts';
import { LANGUAGES } from '@/config/languages';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { activateLocale } from '@/i18n';
import { useLingui } from '@lingui/react';
import { AnimatePresence, motion } from 'motion/react';
import { type FC, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';

const LanguageSwitch: FC = () => {
  const { i18n } = useLingui();
  const [currentLanguage, setCurrentLanguage] = useLocalStorage<string>(LANGUAGE_KEY, 'en');
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageClick = (code: string) => {
    setCurrentLanguage(code);
    setOpen(false);
    activateLocale(code).then(() => {
      const lang = LANGUAGES.find((l) => l.code === code)!;
      toast(i18n._('languageSwitched'), {
        icon: <lang.Flag title={lang.title} className="w-5 h-5 rounded-sm border flex-shrink-0 border-neutral-200 dark:border-white/10" />,
      });
    });
  };

  const otherLanguages = LANGUAGES.filter((l) => l.code !== currentLanguage);

  const renderFlag = (code: string) => {
    const lang = LANGUAGES.find((l) => l.code === code)!;
    return <lang.Flag title={lang.title} className="w-full h-full rounded-sm border-2 border-neutral-200 dark:border-white/10" />;
  };

  return (
    <div ref={ref} className="relative">
      {/* Main button */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        className="p-3 flex items-center justify-center transition-colors hover:bg-white/20"
        onClick={() => {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            setDropdownPos({ top: rect.top, right: window.innerWidth - rect.left + 8 });
          }
          setOpen((prev) => !prev);
        }}
        whileHover={{ scale: 1.05 }}
        aria-label="Language switch"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={currentLanguage} initial={{ rotate: -30, opacity: 0, scale: 0.5 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: 30, opacity: 0, scale: 0.5 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }} className="w-6 h-6">
            {renderFlag(currentLanguage)}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, x: 8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.85, x: 8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              style={{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right, originX: 1, originY: 0.5, zIndex: 1001 }}
              className="flex flex-col gap-2 border backdrop-blur-sm rounded-lg shadow-lg p-2 bg-white/40 border-white/40 dark:bg-black/40 dark:border-white/10"
            >
              {otherLanguages.map((lang, i) => (
                <motion.button key={lang.code} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, duration: 0.15 }} whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }} className="w-8 h-8 cursor-pointer overflow-hidden p-1 bg-transparent" onClick={() => handleLanguageClick(lang.code)} aria-label={lang.title}>
                  {renderFlag(lang.code)}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default LanguageSwitch;
