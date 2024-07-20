'use client';

import { ReactNode } from 'react';
import Providers from '#/app/providers';
import { ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import '#/app/fonts.css';
import '#/app/globals.css';
import 'react-toastify/dist/ReactToastify.min.css';

const queryClient = new QueryClient();

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <html lang='en' className='font-normal font-satoshi antialiased' suppressHydrationWarning>
        <head>
          <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
          <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
          <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
          <link rel='manifest' href='/manifest.webmanifest' />
          <link rel='mask-icon' href='/safari-pinned-tab.svg' color='#222fe6' />
          <meta name='msapplication-TileColor' content='#000000' />
          <meta name='theme-color' content='#ffffff' />
          <meta name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' />
        </head>
        <body>
          <Providers>
            <ToastContainer
              position='bottom-center'
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              draggable
              pauseOnHover
              theme='colored'
            />
            {children}
          </Providers>
        </body>
      </html>
    </QueryClientProvider>
  );
};

export default RootLayout;
