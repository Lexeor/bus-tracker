import { LANGUAGE_KEY } from '@/constants.ts';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { activateLocale } from '@/i18n';
import { useThemeStore } from '@/store/themeStore';
import { useLingui } from '@lingui/react';
import { DE, GB, ME, RU } from 'country-flag-icons/react/1x1';
import { AnimatePresence, motion } from 'motion/react';
import { type FC, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const FLAG_COMPONENTS: Record<string, FC<{ title: string; className: string }>> = {
  me: ME,
  en: GB,
  ru: RU,
  de: DE,
};

const FLAG_TITLES: Record<string, string> = {
  me: 'Crnogorski',
  en: 'English',
  ru: 'Русский',
  de: 'Deutsch',
};

const LANGUAGE_ORDER = ['me', 'en', 'ru', 'de'];

const LanguageSwitch: FC = () => {
  const { i18n } = useLingui();
  const { isDark } = useThemeStore();
  const [currentLanguage, setCurrentLanguage] = useLocalStorage<string>(LANGUAGE_KEY, 'en');
  const [open, setOpen] = useState(false);
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

  const handleLanguageClick = (lang: string) => {
    setCurrentLanguage(lang);
    setOpen(false);
    activateLocale(lang).then(() => {
      const Flag = FLAG_COMPONENTS[lang];
      toast(i18n._('languageSwitched'), {
        icon: <Flag title={FLAG_TITLES[lang]} className="w-5 h-5 rounded-sm border border-neutral-200 flex-shrink-0" />,
      });
    });
  };

  const otherLanguages = LANGUAGE_ORDER.filter((l) => l !== currentLanguage);

  const renderFlag = (lang: string) => {
    const Flag = FLAG_COMPONENTS[lang];
    return <Flag title={FLAG_TITLES[lang]} className="w-full h-full rounded-sm border-2 border-neutral-200" />;
  };

  return (
    <div ref={ref} className="relative">
      {/* Main button */}
      <motion.button whileTap={{ scale: 0.88 }} className="p-3 flex items-center justify-center transition-colors hover:bg-white/20" onClick={() => setOpen((prev) => !prev)} whileHover={{ scale: 1.05 }} aria-label="Language switch">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={currentLanguage} initial={{ rotate: -30, opacity: 0, scale: 0.5 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: 30, opacity: 0, scale: 0.5 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }} className="w-6 h-6">
            {renderFlag(currentLanguage)}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      {/* Dropdown panel — floats to the left of the ControlPanel */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.85, x: 8 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.85, x: 8 }} transition={{ type: 'spring', stiffness: 380, damping: 26 }} style={{ originX: 1, originY: 0.5 }} className={`absolute right-full top-0 mr-2 flex flex-col gap-2 border backdrop-blur-sm rounded-lg shadow-lg p-2 ${isDark ? 'bg-black/40 border-white/10' : 'bg-white/40 border-white/40'}`}>
            {otherLanguages.map((lang, i) => (
              <motion.button key={lang} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, duration: 0.15 }} whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }} className="w-8 h-8 cursor-pointer overflow-hidden p-1 bg-transparent" onClick={() => handleLanguageClick(lang)} aria-label={FLAG_TITLES[lang]}>
                {renderFlag(lang)}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitch;
