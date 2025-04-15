"use client";

import { useRouter } from "next/navigation";

import type { AuthErrorCode, AuthSession } from "@acme/api";
import { useSignUp } from "@acme/api/auth";

import type { TRegister } from "../model/register.types";

interface UseRegisterProps {
  onSuccess?: (session: AuthSession) => void;
  onError?: (error: string, errorType?: AuthErrorCode) => void;
  redirect?: boolean;
  redirectTo?: string;
}

export function useRegister({
  onSuccess: globalOnSuccess,
  onError: globalOnError,
}: UseRegisterProps = {}) {
  const router = useRouter();
  const { signUp } = useSignUp();

  const handleRegister = async (
    formValues: TRegister,
    options: UseRegisterProps = {},
  ) => {
    const {
      redirect = true,
      redirectTo = "/",
      onSuccess: localOnSuccess,
      onError: localOnError,
    } = options;

    try {
      const result = await signUp({
        email: formValues.email,
        password: formValues.password,
        name: formValues.name,
      });

      if (result.error) {
        if (localOnError) localOnError(result.error);
        if (globalOnError) globalOnError(result.error, result.errorType);
        return false;
      }

      if (!result.session) {
        throw new Error("Session is undefined");
      }

      console.log("Registration successful");
      if (localOnSuccess) localOnSuccess(result.session);
      if (globalOnSuccess) globalOnSuccess(result.session);

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

  return { register: handleRegister };
}
