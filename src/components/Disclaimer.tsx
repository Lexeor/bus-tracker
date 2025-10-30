import { CircleQuestionMarkIcon, XIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { type FC, useEffect } from 'react';
import { DISCLAIMER_STORAGE_KEY } from '../constants.ts';
import { useLocalStorage } from '../hooks/use-local-storage';

interface DisclaimerProps {}

const Disclaimer: FC<DisclaimerProps> = () => {
  const [disclaimerSeen, setDisclaimerSeen] = useLocalStorage<boolean>(DISCLAIMER_STORAGE_KEY, false);
  const [show, setShow] = useLocalStorage<boolean>('disclaimer_show', false);

  useEffect(() => {
    if (!disclaimerSeen) {
      setShow(true);
    }
  }, [disclaimerSeen, setShow]);

  const handleClose = (): void => {
    setDisclaimerSeen(true);
    setShow(false);
  };

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
            className="absolute top-32 left-4 right-4 bottom-32 z-[999] rounded-lg transition-all"
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
            <div className="max-w-[600px] bg-white/80 p-3 rounded-lg shadow-lg backdrop-blur-sm mx-auto text-black">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-center! w-full">⚠️ Važna informacija ⚠️</h2>
                <button
                  onClick={handleClose}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Затворити"
                >
                  <XIcon />
                </button>
              </div>
              <p className="font-semibold text-lg"></p>
              <p>Ovaj projekat je lični razvoj i nalazi se u fazi Proof of Concept.</p>
              <br />
              <p>
                <strong>Obratite pažnju:</strong> pozicija vozila na mapi se izračunava na osnovu statičkog reda vožnje
                i nije povezana sa realnom GPS pozicijom autobusa na ruti.
              </p>
              <br />
              <p className="text-gray-600">Koristite informacije samo u informativne svrhe.</p>
              <p className="text-red-500 font-bold">Ako nešto ne radi - osvježite stranicu 🔄</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Disclaimer;
