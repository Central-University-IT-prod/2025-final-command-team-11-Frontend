import { $authFetch } from "@acme/api";

import type { TAccount } from "~/entities/account/model/account.types";

export async function usersGet(page: number, size: number) {
  return await $authFetch
    .GET("/account/all", {
      params: {
        query: {
          page,
          size,
        },
      },
    })
    .then(
      (res) => res.data as unknown as { accounts: TAccount[]; count: number },
    );
}
