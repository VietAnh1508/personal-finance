import { RouterProvider } from 'react-router-dom';
import { ToastProvider } from '@/features/feedback/ToastProvider';
import { appRouter } from '@/router';

function App() {
  return (
    <ToastProvider>
      <RouterProvider router={appRouter} />
    </ToastProvider>
  );
}

export default App;
