import { GB, ME, RU } from 'country-flag-icons/react/1x1';
import { motion } from 'motion/react';
import { type FC, type ReactNode, useState } from 'react';
import { LANGUAGE_KEY } from '../constants.ts';
import { useLocalStorage } from '../hooks/use-local-storage.ts';

interface LanguageSwitchProps {}

const LanguageSwitch: FC<LanguageSwitchProps> = () => {
  const [currentLanguage, setCurrentLanguage] = useLocalStorage<string>(LANGUAGE_KEY, 'ME');
  const [open, setOpen] = useState(false);

  const handleLanguageClick = (lang: string) => {
    setCurrentLanguage(lang);
    setOpen(false);
  };

  const languages: Record<string, ReactNode> = {
    ME: <ME title="Crnogorski" className="border-2 border-neutral-200" onClick={() => handleLanguageClick('ME')} />,
    EN: <GB title="English" className="border-2 border-neutral-200" onClick={() => handleLanguageClick('EN')} />,
    RU: <RU title="Русский" className="border-2 border-neutral-200" onClick={() => handleLanguageClick('RU')} />,
  };

  return (
    <motion.button
      className="absolute w-12 min-h-12 top-32 right-4 z-[1000] flex flex-col gap-3 bg-white text-black hover:bg-gray-50 disabled:bg-gray-100 p-3 rounded-lg shadow-lg transition-all duration-300"
      onClick={() => {
        if (!open) {
          setOpen((prev) => !prev);
        }
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Language switch"
    >
      {open ? (
        <>
          {Array.from(Object.keys(languages)).map((lang) => (
            <>{languages[lang]}</>
          ))}
        </>
      ) : (
        <>{languages[currentLanguage]}</>
      )}
    </motion.button>
  );
};

export default LanguageSwitch;
