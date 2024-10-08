import { Lato } from 'next/font/google'

import "./css/globals.css";
import { VideoPlayerProvider } from "./components/VideoPlayer/VideoPlayerProvider";
import { Page } from "./components/layout/Page";
import { VideoPlayerWrapper } from "./components/layout/VideoPlayerWrapper";
import { Suspense } from 'react';
import type { Metadata } from 'next'

const lato = Lato({
  weight: ['100', '300','400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Codetube :: Youtube UI Clone',
}

interface Props {
  children: React.ReactNode;
}

export default function RootLayout ({ children }: Readonly<Props>) {
  return (
    <html lang="en">
      <body className={`${lato.className}`}>
        <VideoPlayerProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <VideoPlayerWrapper>
              <Page>
                {children}
              </Page>
            </VideoPlayerWrapper>
          </Suspense>
        </VideoPlayerProvider>
      
      </body>
    </html>
  );
}
