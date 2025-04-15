"use client";

import { useRouter } from "next/navigation";

import type { AuthErrorCode } from "@acme/api";
import type { SignInResponse } from "@acme/api/auth";
import { useSignIn } from "@acme/api/auth";

import type { TLogin } from "../model/login.types";

interface UseLoginProps {
  onSuccess?: (data: SignInResponse) => void;
  onError?: (error: string, errorType?: AuthErrorCode) => void;
  redirect?: boolean;
  redirectTo?: string;
}

export function useLogin({
  onSuccess: globalOnSuccess,
  onError: globalOnError,
}: UseLoginProps = {}) {
  const router = useRouter();
  const { signIn } = useSignIn();

  const handleLogin = async (
    formValues: TLogin,
    options: UseLoginProps = {},
  ) => {
    const {
      redirect = true,
      redirectTo = "/",
      onSuccess: localOnSuccess,
      onError: localOnError,
    } = options;

    try {
      const result = await signIn({
        email: formValues.email,
        password: formValues.password,
      });

      if (result.error) {
        if (localOnError) localOnError(result.error);
        if (globalOnError) globalOnError(result.error, result.errorType);
        return false;
      }

      console.log("Login successful");
      if (localOnSuccess) localOnSuccess(result);
      if (globalOnSuccess) globalOnSuccess(result);

      if (redirect) {
        router.push(redirectTo);
      }
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (localOnError) localOnError(errorMessage);
      if (globalOnError) globalOnError(errorMessage);
      return false;
    }
  };

  return { login: handleLogin };
}
