import './App.css';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { Toaster } from 'sonner';
import Map from './components/Map';

i18n.activate('en');

function App() {
  return (
    <I18nProvider i18n={i18n}>
      <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#002200', padding: 0 }}>
        <Map />
        <Toaster
          visibleToasts={2}
          position="top-center"
          mobileOffset={{ left: '1rem', right: '4rem', top: '1rem' }}
          toastOptions={{
            classNames: {
              toast: '!bg-white/40 !backdrop-blur-sm !rounded-sm p-3!',
            },
          }}
        />
      </div>
    </I18nProvider>
  );
}

export default App;
