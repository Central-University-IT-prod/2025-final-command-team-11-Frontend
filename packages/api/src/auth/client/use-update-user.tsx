"use client";

import type { AuthErrorCode } from "../errors";
import { $authFetch } from "../../api.client";
import { AuthError } from "../errors";

export type AuthErrorType = AuthErrorCode;

interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  oldPassword?: string;
}

type UpdateUserResponse =
  | { success: true; message: string; error: undefined; errorType: undefined }
  | {
      success: false;
      message: undefined;
      error: string;
      errorType: AuthErrorType;
    };

export function useUpdateUser() {
  const updateUser = async (
    userData: UpdateUserInput,
  ): Promise<UpdateUserResponse> => {
    try {
      const response = await $authFetch.PATCH("/account/edit", {
        body: userData,
      });

      if (response.error) {
        return {
          success: false,
          message: undefined,
          error: response.error.error ?? "Failed to update account",
          errorType: "INVALID_CREDENTIALS",
        };
      }

      return {
        success: true,
        message: "Profile updated successfully",
        error: undefined,
        errorType: undefined,
      };
    } catch (unknownError) {
      let errorMessage = "Unknown error";
      let errorType: AuthErrorType = "NETWORK_ERROR";

      if (unknownError instanceof Error) {
        errorMessage = unknownError.message;

        if (unknownError instanceof AuthError) {
          if (
            typeof unknownError.data === "object" &&
            "code" in unknownError.data
          ) {
            const code = unknownError.data.code;
            if (typeof code === "string") {
              errorType = code;
            }
          }
        }
      }

      return {
        success: false,
        message: undefined,
        error: errorMessage,
        errorType,
      };
    }
  };

  return {
    updateUser,
  };
}
