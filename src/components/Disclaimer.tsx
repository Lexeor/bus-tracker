import { useLingui } from '@lingui/react';
import { GB, ME, RU } from 'country-flag-icons/react/3x2';
import { CircleQuestionMarkIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { type FC, useEffect } from 'react';
import Multilingual from '../components/Multilingual';
import {
  DISCLAIMER_STORAGE_KEY,
  FIRST_LANGUAGE_SELECTED_STORAGE_KEY,
  SHOW_DISCLAIMER_STORAGE_KEY,
} from '../constants.ts';
import { useLocalStorage } from '../hooks/use-local-storage';
import { activateLocale } from '../i18n.ts';

interface DisclaimerProps {}

const Disclaimer: FC<DisclaimerProps> = () => {
  const { i18n } = useLingui();

  const [disclaimerSeen, setDisclaimerSeen] = useLocalStorage<boolean>(DISCLAIMER_STORAGE_KEY, false);
  const [firstLanguageSelected, setFirstLanguageSelected] = useLocalStorage<boolean>(
    FIRST_LANGUAGE_SELECTED_STORAGE_KEY,
    false,
  );
  const [show, setShow] = useLocalStorage<boolean>(SHOW_DISCLAIMER_STORAGE_KEY, false);

  useEffect(() => {
    if (!disclaimerSeen) {
      setShow(true);
    }
  }, [disclaimerSeen, setShow]);

  const handleToggle = (): void => {
    setShow((prev: boolean) => !prev);
  };

  return (
    <>
      <motion.button
        className="absolute w-12 h-12 top-18 right-4 z-[1000] bg-white text-black hover:bg-gray-50 disabled:bg-gray-100 p-3 rounded-lg shadow-lg transition-all"
        onClick={handleToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Информация"
      >
        <CircleQuestionMarkIcon />
      </motion.button>

      <AnimatePresence>
        {show && (
          <motion.div
            className="absolute top-32 left-4 right-4 bottom-32 z-[1001] rounded-lg transition-all"
            initial={{
              opacity: 0,
              scale: 0,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0,
            }}
            transition={{
              duration: 0.2,
            }}
          >
            {firstLanguageSelected ? (
              <div className="max-w-[600px] bg-white/80 p-6 rounded-lg shadow-lg backdrop-blur-sm mx-auto text-neutral-600 flex flex-col gap-2">
                <p>
                  <strong>{i18n._('warning')}:</strong> {i18n._('locationWarning')}
                </p>
                <p className="text-gray-600">{i18n._('information')}</p>
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
              </div>
            ) : (
              <div className="max-w-[600px] bg-white/80 p-6 rounded-lg shadow-lg backdrop-blur-sm mx-auto text-neutral-600">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-center! w-full">
                    <Multilingual values={['Dobro došli!', 'Welcome!', 'Добро пожаловать!']} />
                  </h2>
                </div>
                {/*<p>Ovaj projekat je lični razvoj i nalazi se u fazi Proof of Concept.</p>*/}
                <div className="text-center">
                  <Multilingual
                    values={[
                      'Izaberite jezik interfejsa',
                      'Please select interface language',
                      'Выберите язык интерфейса',
                    ]}
                  />
                </div>
                <div className="flex flex-row gap-4 items-center justify-center my-2">
                  <button
                    className="p-0 rounded bg-transparent"
                    onClick={() => {
                      setFirstLanguageSelected(true);
                      activateLocale('me');
                    }}
                  >
                    <ME className="w-12 border-3 border-neutral-100 hover:border-neutral-200 active:border-green-700/40 transition-colors duration-300" />
                  </button>
                  <button
                    className="p-0 rounded bg-transparent"
                    onClick={() => {
                      setFirstLanguageSelected(true);
                      activateLocale('en');
                    }}
                  >
                    <GB className="w-12 border-3 border-neutral-100 hover:border-neutral-200 active:border-green-700/40 transition-colors duration-300" />
                  </button>
                  <button
                    className="p-0 rounded bg-transparent"
                    onClick={() => {
                      setFirstLanguageSelected(true);
                      activateLocale('ru');
                    }}
                  >
                    <RU className="w-12 border-3 border-neutral-100 hover:border-neutral-200 active:border-green-700/40 transition-colors duration-300" />
                  </button>
                </div>
                <div className="text-center text-sm ">
                  <Multilingual
                    values={[
                      'Možete uvijek promijenit ovu postavku kasnije',
                      'You can always change this setting later',
                      'Вы сможете изменить это позже',
                    ]}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Disclaimer;
