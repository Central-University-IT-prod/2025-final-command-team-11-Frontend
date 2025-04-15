import { Card, CardContent } from "@acme/ui/card";

import { LoginForm } from "./login-form";

export function LoginView() {
  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute inset-0 -z-10 bg-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
      </div>

      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
        <Card className="w-full border-none shadow-lg sm:border sm:border-border">
          <CardContent className="p-6 sm:p-8">
            <LoginForm />
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Prod Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
}
