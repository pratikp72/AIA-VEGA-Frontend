import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import ToastProvider from "@/components/providers/ToastProvider";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import LayoutShell from '@/components/layout/LayoutShell';

export const metadata = {
  title: "Your App Name",
  description: "Your app description",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
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