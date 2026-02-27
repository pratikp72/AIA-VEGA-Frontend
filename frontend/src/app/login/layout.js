export default function LoginLayout({ children }) {
  // Only render login page content, no sidebar/header/providers
  return <>{children}</>;
}
