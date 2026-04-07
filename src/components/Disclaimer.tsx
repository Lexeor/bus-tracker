import Multilingual from '@/components/Multilingual';
import { DISCLAIMER_STORAGE_KEY, FIRST_LANGUAGE_SELECTED_STORAGE_KEY, SHOW_DISCLAIMER_STORAGE_KEY } from '@/constants.ts';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { activateLocale } from '@/i18n.ts';
import { useLingui } from '@lingui/react';
import { GB, ME, RU } from 'country-flag-icons/react/3x2';
import { CircleQuestionMarkIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useThemeStore } from '@/store/themeStore';
import { type FC, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface DisclaimerProps {}

const Disclaimer: FC<DisclaimerProps> = () => {
  const { i18n } = useLingui();
  const { isDark } = useThemeStore();

  const [disclaimerSeen, setDisclaimerSeen] = useLocalStorage<boolean>(DISCLAIMER_STORAGE_KEY, false);
  const [firstLanguageSelected, setFirstLanguageSelected] = useLocalStorage<boolean>(FIRST_LANGUAGE_SELECTED_STORAGE_KEY, false);
  const [show, setShow] = useLocalStorage<boolean>(SHOW_DISCLAIMER_STORAGE_KEY, false);

  useEffect(() => {
    if (!disclaimerSeen) {
      setShow(true);
    }
  }, [disclaimerSeen, setShow]);

  const handleToggle = (): void => {
    setShow((prev: boolean) => !prev);
  };

  const modal = (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {firstLanguageSelected ? (
            <motion.div
              className={`w-full max-w-lg p-6 rounded-lg shadow-lg backdrop-blur-sm flex flex-col gap-2 ${isDark ? 'bg-black/60 text-gray-200' : 'bg-white/80 text-neutral-600'}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p>
                <strong>{i18n._('warning')}:</strong> {i18n._('locationWarning')}
              </p>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{i18n._('information')}</p>
              <p className="text-red-500 font-bold">{i18n._('refreshPage')} 🔄</p>
              <button
                type="button"
                className="px-4 py-1 rounded-sm bg-blue-500 text-white min-w-24"
                onClick={() => {
                  setShow(false);
                  setDisclaimerSeen(true);
                }}
              >
                Ok
              </button>
            </motion.div>
          ) : (
            <motion.div
              className={`w-full max-w-sm p-6 rounded-lg shadow-lg backdrop-blur-sm flex flex-col gap-2 items-center ${isDark ? 'bg-black/60 text-gray-200' : 'bg-white/80 text-neutral-600'}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-center w-full mb-2">
                <Multilingual values={['Dobro došli!', 'Welcome!', 'Добро пожаловать!']} />
              </h2>
              <div className="text-center w-full">
                <Multilingual values={['Izaberite jezik interfejsa', 'Please select interface language', 'Выберите язык интерфейса']} />
              </div>
              <div className="flex flex-row gap-4 items-center justify-center my-2">
                <button
                  className="p-0 rounded bg-transparent"
                  onClick={() => { setFirstLanguageSelected(true); activateLocale('me'); }}
                >
                  <ME className="w-12 border-3 border-neutral-100 hover:border-neutral-200 active:border-green-700/40 transition-colors duration-300" />
                </button>
                <button
                  className="p-0 rounded bg-transparent"
                  onClick={() => { setFirstLanguageSelected(true); activateLocale('en'); }}
                >
                  <GB className="w-12 border-3 border-neutral-100 hover:border-neutral-200 active:border-green-700/40 transition-colors duration-300" />
                </button>
                <button
                  className="p-0 rounded bg-transparent"
                  onClick={() => { setFirstLanguageSelected(true); activateLocale('ru'); }}
                >
                  <RU className="w-12 border-3 border-neutral-100 hover:border-neutral-200 active:border-green-700/40 transition-colors duration-300" />
                </button>
              </div>
              <div className="text-center text-sm w-full">
                <Multilingual values={['Možete uvijek promijenit ovu postavku kasnije', 'You can always change this setting later', 'Вы сможете изменить это позже']} />
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <motion.button
        className="p-3 transition-all hover:bg-white/20"
        onClick={handleToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Информация"
      >
        <CircleQuestionMarkIcon />
      </motion.button>

      {createPortal(modal, document.body)}
    </>
  );
};

export default Disclaimer;
