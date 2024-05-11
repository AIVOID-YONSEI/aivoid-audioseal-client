import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { ChakraProvider } from '@chakra-ui/react';
import Font from './components/font.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <Font />
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </>
);
