import { $adminFetch } from "@acme/api";

export async function ordersGet(page: number, size: number) {
  return await $adminFetch
    .GET("/orders", {
      params: {
        query: {
          page,
          size,
          // "status": ""
        },
      },
    })
    .then((res) => res.data);
}
