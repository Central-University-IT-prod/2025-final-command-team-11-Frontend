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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@acme/ui/form";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toast";

import type { TRegister } from "../model/register.types";
import { PasswordInput } from "~/shared/ui/password-input";
import { GetJWTBody } from "~/shared/utils/jwt";
import { useRegister } from "../hooks/use-register";
import { RegisterScheme } from "../model/register.scheme";

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [isPending, startTransition] = useTransition();
  const [registerError, setRegisterError] = useState<string | null>(null);
  const router = useRouter();

  const { register } = useRegister({
    onError: (error) => {
      setRegisterError(error);
      toast.error("Registration failed", {
        description: error,
      });
    },
    onSuccess: (data) => {
      const { role } = GetJWTBody(data.tokens.accessToken);
      if (role === "ADMIN") {
        void router.push("/admin/floor-plans");
      } else {
        void router.push("/client");
      }
    },
  });
  const form = useForm({
    resolver: zodResolver(RegisterScheme),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  function onSubmit(data: TRegister & { acceptTerms?: boolean }) {
    setRegisterError(null);
    startTransition(async () => {
      await register(data, {
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
          Create your account
        </h1>
        <p className="text-center text-sm text-muted-foreground">
          Sign up to start using our platform
        </p>
      </div>

      {registerError && (
        <div className="flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive animate-in fade-in-50 slide-in-from-top-5">
          <AlertCircle className="size-4" />
          <p>{registerError}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="John Doe"
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    disabled={isPending}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="transition-all duration-200 focus:ring-2 focus:ring-ring/20"
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Password should be at least 8 characters and include numbers
                  and letters
                </FormDescription>
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
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
