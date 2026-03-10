import "./globals.css";
import { Roboto } from "next/font/google";
import RootLayoutClient from '@/components/layout/RootLayoutClient';
import { icons } from "lucide-react";


const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata = {
  title: "Information Management Portal",
  description: "Information Management Portal for AIA and Vega.",
  icons: {
    icon: "/aia-favicon.png",
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" className={roboto.variable}>
      <body className={roboto.className}>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}