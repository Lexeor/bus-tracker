import './App.css';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { useThemeStore } from '@/store/themeStore';
import { Toaster } from 'sonner';
import Map from './components/Map';

i18n.activate('en');

function App() {
  const { isDark } = useThemeStore();

  return (
    <I18nProvider i18n={i18n}>
      <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#002200', padding: 0 }}>
        <Map />
        <Toaster
          visibleToasts={2}
          position="top-center"
          theme={isDark ? 'dark' : 'light'}
          mobileOffset={{ left: '1rem', right: '4rem', top: '1rem' }}
          toastOptions={{
            classNames: {
              toast: isDark
                ? '!bg-black/50 !backdrop-blur-sm !rounded-sm p-3!'
                : '!bg-white/40 !backdrop-blur-sm !rounded-sm p-3!',
            },
          }}
        />
      </div>
    </I18nProvider>
  );
}

export default App;
