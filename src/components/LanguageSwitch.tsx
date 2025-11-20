import { LANGUAGE_KEY } from '@/constants.ts';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { activateLocale } from '@/i18n';
import { GB, ME, RU } from 'country-flag-icons/react/1x1';
import { motion } from 'motion/react';
import { type FC, Fragment, type ReactNode, useState } from 'react';

interface LanguageSwitchProps {}

const LanguageSwitch: FC<LanguageSwitchProps> = () => {
  const [currentLanguage, setCurrentLanguage] = useLocalStorage<string>(LANGUAGE_KEY, 'en');
  const [open, setOpen] = useState(false);

  const handleLanguageClick = (lang: string) => {
    setCurrentLanguage(lang);
    setOpen(false);
    activateLocale(lang);
  };

  const languages: Record<string, ReactNode> = {
    me: <ME title="Crnogorski" className="border-2 border-neutral-200" onClick={() => handleLanguageClick('me')} />,
    en: <GB title="English" className="border-2 border-neutral-200" onClick={() => handleLanguageClick('en')} />,
    ru: <RU title="Русский" className="border-2 border-neutral-200" onClick={() => handleLanguageClick('ru')} />,
  };

  return (
    <motion.button
      className="absolute w-12 min-h-12 top-32 right-4 z-[1000] flex flex-col gap-3 bg-white text-black hover:bg-gray-50 disabled:bg-gray-100 p-3 rounded-lg shadow-lg transition-all duration-300"
      onClick={() => {
        if (!open) {
          setOpen((prev) => !prev);
        }
      }}
      aria-label="Language switch"
    >
      {open ? (
        <>
          <div className="relative">
            <div className="relative z-2 h-6 w-6">{languages[currentLanguage]}</div>
            <div className="absolute -top-1 -bottom-1 -left-3 -right-3 w-12 h-8 bg-green-500/20 z-1">
              <div className="absolute top-0 left-0 w-1 h-full bg-green-500 z-2"></div>
            </div>
          </div>
          {Array.from(Object.keys(languages)).map((lang) =>
            lang !== currentLanguage ? <Fragment key={lang}>{languages[lang]}</Fragment> : null,
          )}
        </>
      ) : (
        <>{languages[currentLanguage]}</>
      )}
    </motion.button>
  );
};

export default LanguageSwitch;
