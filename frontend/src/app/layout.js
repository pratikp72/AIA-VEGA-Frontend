import "./globals.css";
import { Roboto } from "next/font/google";
import ReduxProvider from "@/components/providers/ReduxProvider";
import ToastProvider from "@/components/providers/ToastProvider";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import LayoutShell from '@/components/layout/LayoutShell';

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
        <ErrorBoundary>
          <ReduxProvider>
            <LayoutShell>{children}</LayoutShell>
            <ToastProvider />
          </ReduxProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}