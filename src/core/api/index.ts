import { isDev } from "../config";

export async function apiCaller(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  options: RequestInit = {},
) {
  if (isDev) {
    console.info("REQUEST: ", url);
  }

  return fetch(url, { method, ...options })
    .then((response) => response)
    .catch((error) => {
      if (isDev) {
        console.error(`${error}`);
      }
      return error;
    });
}
