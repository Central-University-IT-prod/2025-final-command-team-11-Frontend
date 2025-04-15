import { $adminFetch, $authFetch } from "@acme/api";

export async function uploadPhotoApi(id: string, passport: File) {
  return await $adminFetch.POST("/verification/{id}/set", {
    params: {
      path: {
        id,
      },
    },
    body: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      passport: passport as any,
    },
    bodySerializer: (body) => {
      const formData = new FormData();
      formData.set("passport", body?.passport ?? "");
      return formData;
    },
  });
}

export async function getUser(id: string) {
  return await $authFetch
    .GET("/account/{id}", {
      params: {
        path: {
          id: id,
        },
      },
    })
    .then((res) => {
      if (res.response.status != 200) {
        throw new Error();
      }
      return res.data;
    });
}

export async function checkUserAccess(id: string) {
  return await $adminFetch
    .GET("/booking/{id}/access", {
      params: {
        path: {
          id: id,
        },
      },
    })
    .then((res) => res.data);
}

export async function checkUserVerify(id: string) {
  return await $adminFetch
    .GET("/verification/{id}/check", {
      params: {
        path: {
          id: id,
        },
      },
    })
    .then((res) => res.data);
}
