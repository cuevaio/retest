import { NextAuthProvider } from "./next-auth";
import { ThemeProvider } from "./theme-provider";
import { TRPCReactQueryProvider } from "./trpc-react-query-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthProvider>
      <ThemeProvider>
        <TRPCReactQueryProvider>{children}</TRPCReactQueryProvider>
      </ThemeProvider>
    </NextAuthProvider>
  );
}
