import { RouterProvider } from 'react-router-dom';
import { ToastProvider } from '@/features/feedback/ToastProvider';
import { PwaInstallPrompt } from '@/features/pwa/PwaInstallPrompt';
import { appRouter } from '@/router';

function App() {
  return (
    <ToastProvider>
      <RouterProvider router={appRouter} />
      <PwaInstallPrompt />
    </ToastProvider>
  );
}

export default App;
