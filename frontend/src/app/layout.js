import "./globals.css";
import { Suspense } from 'react';
import { Roboto } from "next/font/google";
import RootLayoutClient from '@/components/layout/RootLayoutClient';

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata = {
  title: "Your App Name",
  description: "Your app description",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" className={roboto.variable}>
      <body className={roboto.className}>
        <Suspense fallback={null}>
          <RootLayoutClient>{children}</RootLayoutClient>
        </Suspense>
      </body>
    </html>
  );
}