"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Coffee, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@acme/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@acme/ui/form";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toast";

import type { TLogin } from "../model/login.types";
import { PasswordInput } from "~/shared/ui/password-input";
import { GetJWTBody } from "~/shared/utils/jwt";
import { useLogin } from "../hooks/use-login";
import { LoginScheme } from "../model/login.scheme";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);

  const { login } = useLogin({
    onSuccess: (data) => {
      const { role } = GetJWTBody(data.session?.tokens.accessToken ?? "");
      if (role === "ADMIN") {
        router.push("/admin/floor-plans");
      } else {
        router.push("/client");
      }
    },
    onError: (error) => {
      setLoginError(error);
      toast.error("Login failed", {
        description: error,
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(LoginScheme),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: TLogin) {
    setLoginError(null);
    startTransition(async () => {
      await login(data, {
        redirect: false,
      });
    });
  }

  return (
    <div className={`flex flex-col gap-6 ${className ?? ""}`} {...props}>
      <div className="flex flex-col items-center gap-2">
        <a
          href="#"
          className="group flex flex-col items-center gap-2 font-medium transition-opacity hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
            <Coffee className="size-6" />
          </div>
          <span className="sr-only">Prod Inc.</span>
        </a>
        <h1 className="text-center text-2xl font-bold tracking-tight">
          Welcome back
        </h1>
        <p className="text-center text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>

      {loginError && (
        <div className="flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive animate-in fade-in-50 slide-in-from-top-5">
          <AlertCircle className="size-4" />
          <p>{loginError}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="name@example.com"
                    type="email"
                    autoComplete="email"
                    disabled={isPending}
                    className="transition-all duration-200 focus:ring-2 focus:ring-ring/20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput
                    {...field}
                    disabled={isPending}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="transition-all duration-200 focus:ring-2 focus:ring-ring/20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full transition-transform active:scale-95"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </div>
        </form>
      </Form>

      <div className="text-balance text-center text-xs text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <a
          href="#"
          className="underline-offset-4 hover:text-primary hover:underline"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="#"
          className="underline-offset-4 hover:text-primary hover:underline"
        >
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
