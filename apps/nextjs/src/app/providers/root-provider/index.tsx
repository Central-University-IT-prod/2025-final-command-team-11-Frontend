import type { ReactNode } from "react";

import { APIReactProvider } from "../api-provider/react";
import { AuthProvider } from "../auth-provider";

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <AuthProvider>
        <APIReactProvider>{children}</APIReactProvider>
      </AuthProvider>
    </>
  );
}
